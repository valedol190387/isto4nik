import { supabase } from '@/lib/supabase';
import { removeChatMember, sendMessage } from '@/lib/max-bot-api';
import { NextResponse } from 'next/server';

/**
 * POST /api/max/kick
 * Внешний webhook для кика пользователя из Max каналов при окончании подписки.
 *
 * Body: { telegram_id: number }
 * Header: Authorization: Bearer <MAX_KICK_SECRET>
 *
 * Логика:
 * 1. Находит пользователя по telegram_id
 * 2. Обновляет статус подписки
 * 3. Кикает из всех каналов (MAX_CHANNEL_IDS)
 * 4. Отправляет сообщение пользователю
 */
export async function POST(request: Request) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const secret = process.env.MAX_KICK_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { telegram_id } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id is required' }, { status: 400 });
    }

    // Находим пользователя
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, telegram_id, max_id, status, clubtarif, next_payment_date, sub_club_stop')
      .eq('telegram_id', Number(telegram_id))
      .single();

    if (findError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.max_id) {
      return NextResponse.json({
        success: true,
        message: 'User has no max_id, nothing to kick',
        kicked: false
      });
    }

    // Получаем список каналов из env
    const channelIdsStr = process.env.MAX_CHANNEL_IDS || '';
    const channelIds = channelIdsStr
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));

    if (channelIds.length === 0) {
      console.error('[MAX KICK] MAX_CHANNEL_IDS not configured');
      return NextResponse.json({ error: 'No channels configured' }, { status: 500 });
    }

    // Кикаем из всех каналов
    const results: { chatId: number; success: boolean; error?: string }[] = [];

    for (const chatId of channelIds) {
      try {
        await removeChatMember(chatId, user.max_id);
        results.push({ chatId, success: true });
      } catch (e: any) {
        // Может быть 404 если пользователя нет в канале — это ок
        console.log(`[MAX KICK] Could not remove max_id=${user.max_id} from chat ${chatId}: ${e.message}`);
        results.push({ chatId, success: false, error: e.message });
      }
    }

    // Отправляем сообщение пользователю
    try {
      const statusText = user.status || 'Неактивна';
      let dateInfo = '';
      if (user.sub_club_stop) {
        const date = new Date(user.sub_club_stop).toLocaleDateString('ru-RU', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        dateInfo = `\nПодписка закончилась: ${date}`;
      }

      await sendMessage({
        userId: user.max_id,
        text: `❌ Ваша подписка завершена. Доступ в каналы закрыт.\n\n🔴 Подписка: ${statusText}${dateInfo}\n\nДля возобновления доступа оформите подписку и вступите в канал снова.`,
      });
    } catch (e) {
      console.log(`[MAX KICK] Could not send message to max_id=${user.max_id}`);
    }

    // Логируем
    try {
      await supabase.from('max_bot_logs').insert({
        event_type: 'subscription_expired_kick',
        max_user_id: user.max_id,
        telegram_id: user.telegram_id,
        chat_id: null,
        details: {
          channels_kicked: results,
          status: user.status,
        },
      });
    } catch (e) {
      console.error('[MAX KICK] Failed to write log:', e);
    }

    console.log(`[MAX KICK] Kicked max_id=${user.max_id} (tg=${user.telegram_id}) from ${results.filter(r => r.success).length}/${channelIds.length} channels`);

    return NextResponse.json({
      success: true,
      kicked: true,
      max_id: user.max_id,
      results,
    });
  } catch (error) {
    console.error('[MAX KICK] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
