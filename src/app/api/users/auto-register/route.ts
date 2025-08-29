import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { parseUtmParams } from '@/lib/utm';

/**
 * Специальный endpoint для автоматической регистрации пользователей
 * с правильной обработкой UTM меток (не перезаписывает для существующих)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      telegram_id, 
      name_from_ml, 
      username, 
      start_param,
      ...otherData 
    } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Проверяем существует ли пользователь
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, telegram_id, name_from_ml, utm_1, utm_2, utm_3, utm_4, utm_5')
      .eq('telegram_id', parseInt(telegram_id))
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ 
        error: 'Failed to check user existence' 
      }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({
        success: true,
        isNewUser: false,
        user: existingUser,
        message: 'User already exists, UTM params preserved'
      });
    }

    // Создаем нового пользователя с UTM метками
    
    const utmParams = parseUtmParams(start_param || null);
    
    // ТОЛЬКО реальные поля из таблицы users
    const newUserData = {
      telegram_id: parseInt(telegram_id),
      name_from_ml: name_from_ml || 'Новый пользователь',
      username: username || null,
      reg_date: new Date().toISOString(), // обязательная дата регистрации
      status: 'Новый пользователь',
      
      // UTM метки из start_param
      utm_1: utmParams.utm_1,
      utm_2: utmParams.utm_2,
      utm_3: utmParams.utm_3,
      utm_4: utmParams.utm_4,
      utm_5: utmParams.utm_5
    };

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