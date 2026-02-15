import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { parseUtmParams } from '@/lib/utm';

/**
 * Специальный endpoint для автоматической регистрации пользователей
 * с правильной обработкой UTM меток (не перезаписывает для существующих)
 * Поддерживает Telegram и Max messenger
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      telegram_id,
      max_id,
      platform = 'telegram',
      name_from_ml,
      username,
      start_param,
    } = body;

    if (!telegram_id && !max_id) {
      return NextResponse.json({ error: 'Telegram ID or Max ID is required' }, { status: 400 });
    }

    // Проверяем существует ли пользователь
    let existingUser = null;
    let checkError = null;

    if (platform === 'max' && max_id) {
      // Ищем по max_id
      const result = await supabase
        .from('users')
        .select('id, telegram_id, max_id, platform, name_from_ml, utm_1, utm_2, utm_3, utm_4, utm_5')
        .eq('max_id', parseInt(max_id))
        .maybeSingle();
      existingUser = result.data;
      checkError = result.error;
    } else if (telegram_id) {
      // Ищем по telegram_id
      const result = await supabase
        .from('users')
        .select('id, telegram_id, max_id, platform, name_from_ml, utm_1, utm_2, utm_3, utm_4, utm_5')
        .eq('telegram_id', parseInt(telegram_id))
        .maybeSingle();
      existingUser = result.data;
      checkError = result.error;
    }

    if (checkError) {
      return NextResponse.json({
        error: 'Failed to check user existence'
      }, { status: 500 });
    }

    if (existingUser) {
      // Если пользователь пришёл из Max, но у него ещё нет max_id — привязываем
      if (platform === 'max' && max_id && !existingUser.max_id && existingUser.telegram_id) {
        await supabase
          .from('users')
          .update({ max_id: parseInt(max_id) })
          .eq('id', existingUser.id);
      }

      return NextResponse.json({
        success: true,
        isNewUser: false,
        user: existingUser,
        message: 'User already exists, UTM params preserved'
      });
    }

    // Создаем нового пользователя с UTM метками
    const utmParams = parseUtmParams(start_param || null);

    const newUserData: Record<string, any> = {
      name_from_ml: name_from_ml || 'Новый пользователь',
      username: username || null,
      reg_date: new Date().toISOString(),
      status: 'Новый пользователь',
      platform: platform,
      utm_1: utmParams.utm_1,
      utm_2: utmParams.utm_2,
      utm_3: utmParams.utm_3,
      utm_4: utmParams.utm_4,
      utm_5: utmParams.utm_5,
    };

    if (platform === 'max' && max_id) {
      const maxIdInt = parseInt(max_id);
      newUserData.max_id = maxIdInt;
      // Сохраняем max_id также в telegram_id чтобы все связанные таблицы
      // (favorites, payments, view_logs) работали без изменений
      newUserData.telegram_id = maxIdInt;
    } else {
      newUserData.telegram_id = parseInt(telegram_id);
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([newUserData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError.message);
      return NextResponse.json({
        error: 'Failed to create user',
        details: createError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isNewUser: true,
      user: newUser,
      message: 'User created successfully with UTM params'
    }, { status: 201 });

  } catch (error) {
    console.error('Auto-register error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
