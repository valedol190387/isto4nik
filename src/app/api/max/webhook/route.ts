import { supabase } from '@/lib/supabase';
import { removeChatMember, sendMessage } from '@/lib/max-bot-api';
import { NextResponse } from 'next/server';

// POST /api/max/webhook
// Обрабатывает входящие события от Max Bot API
export async function POST(request: Request) {
  try {
    const update = await request.json();
    const updateType = update.update_type;

    console.log(`[MAX BOT] Received update: ${updateType}`, JSON.stringify(update).slice(0, 500));

    // Логируем ВСЕ входящие события (raw)
    const userId = update.user?.user_id || update.message?.sender?.user_id || null;
    const chatId = update.chat_id || update.message?.recipient?.chat_id || null;
    await logEvent(
      `raw:${updateType || 'unknown'}`,
      userId,
      null,
      chatId,
      { raw: update }
    );

    switch (updateType) {
      case 'bot_started':
        await handleBotStarted(update);
        break;
      case 'user_added':
        await handleUserAdded(update);
        break;
      case 'message_created':
        await handleMessageCreated(update);
        break;
      case 'bot_added':
      case 'bot_removed':
      case 'user_removed':
      case 'bot_stopped':
      case 'message_callback':
        // Логируется выше как raw, доп. обработка не нужна
        break;
      default:
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MAX BOT] Webhook error:', error);
    // Всегда возвращаем 200, иначе Max будет ретраить
    return NextResponse.json({ success: false });
  }
}

/**
 * bot_started — пользователь запустил бота с параметром perebros_{telegramId}
 * Сохраняем связку telegram_id ↔ max_id
 */
async function handleBotStarted(update: any) {
  const maxUserId: number = update.user?.user_id;
  const payload: string | undefined = update.payload;

  if (!maxUserId) {
    await logEvent('error', null, null, null, { message: 'bot_started without user_id', raw: update });
    return;
  }

  await logEvent('bot_started', maxUserId, null, null, { payload });

  // Извлекаем telegram_id из параметра perebros_{telegramId}
  if (!payload || !payload.startsWith('perebros_')) {
    // Бот запущен без параметра привязки — просто логируем
    await sendMessage({
      userId: maxUserId,
      text: 'Привет! Для привязки аккаунта используйте ссылку из Telegram-бота.',
    });
    return;
  }

  const telegramIdStr = payload.replace('perebros_', '');
  const telegramId = parseInt(telegramIdStr, 10);

  if (isNaN(telegramId) || telegramId <= 0) {
    await logEvent('error', maxUserId, null, null, {
      message: `Invalid telegram_id in payload: ${payload}`,
    });
    await sendMessage({
      userId: maxUserId,
      text: 'Ошибка: неверная ссылка привязки. Попробуйте получить новую ссылку в Telegram-боте.',
    });
    return;
  }

  // Ищем пользователя по telegram_id
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, telegram_id, max_id, status')
    .eq('telegram_id', telegramId)
    .single();

  if (findError || !user) {
    await logEvent('error', maxUserId, telegramId, null, {
      message: `User not found by telegram_id=${telegramId}`,
      error: findError?.message,
    });
    await sendMessage({
      userId: maxUserId,
      text: 'Пользователь с таким Telegram ID не найден. Убедитесь, что вы зарегистрированы в нашем боте.',
    });
    return;
  }

  // Если уже привязан к этому юзеру — ок
  if (user.max_id === maxUserId) {
    await logEvent('link_already_exists', maxUserId, telegramId, null, { user_id: user.id });
    await sendMessage({
      userId: maxUserId,
      text: '✅ Ваш аккаунт уже привязан! Можете вступать в канал.',
    });
    return;
  }

  // Проверяем не привязан ли этот max_id к другому аккаунту
  const { data: existing } = await supabase
    .from('users')
    .select('id, telegram_id, platform')
    .eq('max_id', maxUserId)
    .single();

  if (existing && existing.id !== user.id) {
    const isPhantom = existing.telegram_id === maxUserId && existing.platform === 'max';

    if (isPhantom) {
      // Удаляем фантома (авто-регистрация из Max)
      await supabase.from('user_favorites').delete().eq('telegram_id', existing.telegram_id);
      await supabase.from('material_view_logs').delete().eq('telegram_id', existing.telegram_id);
      await supabase.from('users').delete().eq('id', existing.id);
      await logEvent('phantom_deleted', maxUserId, telegramId, null, { phantom_id: existing.id });
    } else {
      await logEvent('error', maxUserId, telegramId, null, {
        message: 'max_id already linked to another non-phantom user',
        existing_user_id: existing.id,
      });
      await sendMessage({
        userId: maxUserId,
        text: 'Этот Max-аккаунт уже привязан к другому пользователю. Обратитесь в поддержку.',
      });
      return;
    }
  }

  // Привязываем max_id к пользователю
  const { error: updateError } = await supabase
    .from('users')
    .update({ max_id: maxUserId, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updateError) {
    await logEvent('error', maxUserId, telegramId, null, {
      message: 'Failed to update max_id',
      error: updateError.message,
    });
    await sendMessage({
      userId: maxUserId,
      text: 'Произошла ошибка при привязке аккаунта. Попробуйте позже.',
    });
    return;
  }

  await logEvent('link_saved', maxUserId, telegramId, null, {
    user_id: user.id,
    status: user.status,
  });

  console.log(`[MAX BOT] Linked max_id=${maxUserId} to telegram_id=${telegramId}`);

  await sendMessage({
    userId: maxUserId,
    text: '✅ Аккаунт успешно привязан! Теперь вы можете вступить в канал.',
  });
}

/**
 * user_added — пользователь вступил в канал/группу
 * Проверяем подписку и кикаем если нет доступа
 */
async function handleUserAdded(update: any) {
  const addedUserId: number = update.user?.user_id;
  const chatId: number = update.chat_id;
  const isBot: boolean = update.user?.is_bot;

  if (!addedUserId || !chatId) {
    await logEvent('error', null, null, null, { message: 'user_added without user_id or chat_id', raw: update });
    return;
  }

  // Не проверяем ботов
  if (isBot) {
    await logEvent('user_added', addedUserId, null, chatId, { skipped: true, reason: 'is_bot' });
    return;
  }

  await logEvent('user_added', addedUserId, null, chatId, {});

  // Ищем пользователя по max_id
  const { data: user, error } = await supabase
    .from('users')
    .select('id, telegram_id, max_id, status')
    .eq('max_id', addedUserId)
    .single();

  if (error || !user) {
    // Нет в нашей БД — кикаем
    console.log(`[MAX BOT] Unknown user max_id=${addedUserId} in chat ${chatId}, kicking`);

    // Сообщение может не дойти если юзер не запускал бота — не страшно
    try {
      await sendMessage({
        userId: addedUserId,
        text: '❌ Ваш аккаунт не привязан. Для доступа в канал сначала активируйте бота через ссылку из Telegram.',
      });
    } catch (e) {
      console.log(`[MAX BOT] Could not send message to ${addedUserId} (probably never started bot)`);
    }

    await removeChatMember(chatId, addedUserId);
    await logEvent('user_kicked', addedUserId, null, chatId, { reason: 'not_in_db' });
    return;
  }

  // Проверяем подписку
  if (user.status !== 'Активна') {
    console.log(`[MAX BOT] User max_id=${addedUserId} (tg=${user.telegram_id}) has no active subscription, kicking from chat ${chatId}`);

    try {
      await sendMessage({
        userId: addedUserId,
        text: '❌ У вас нет активной подписки. Доступ в канал закрыт. Оформите подписку и попробуйте снова.',
      });
    } catch (e) {
      console.log(`[MAX BOT] Could not send message to ${addedUserId} (probably never started bot)`);
    }

    await removeChatMember(chatId, addedUserId);
    await logEvent('user_kicked', addedUserId, user.telegram_id, chatId, {
      reason: 'no_active_subscription',
      status: user.status,
    });
    return;
  }

  // Всё ок — подписка активна
  console.log(`[MAX BOT] User max_id=${addedUserId} (tg=${user.telegram_id}) granted access to chat ${chatId}`);
  await logEvent('access_granted', addedUserId, user.telegram_id, chatId, {
    status: user.status,
  });
}

/**
 * message_created — пользователь написал боту
 */
async function handleMessageCreated(update: any) {
  const senderId: number = update.message?.sender?.user_id;
  const text: string = update.message?.body?.text || '';

  if (!senderId) return;

  await logEvent('message_created', senderId, null, null, {
    text: text.slice(0, 500),
    sender_name: update.message?.sender?.first_name,
  });
}

/**
 * Логирование события в таблицу max_bot_logs
 */
async function logEvent(
  eventType: string,
  maxUserId: number | null,
  telegramId: number | null,
  chatId: number | null,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('max_bot_logs').insert({
      event_type: eventType,
      max_user_id: maxUserId,
      telegram_id: telegramId,
      chat_id: chatId,
      details,
    });
  } catch (e) {
    console.error('[MAX BOT] Failed to write log:', e);
  }
}
