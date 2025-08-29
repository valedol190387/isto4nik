import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { parseUtmParams } from '@/lib/utm';

/**
 * Специальный endpoint для автоматической регистрации пользователей
 * с правильной обработкой UTM меток (не перезаписывает для существующих)
 */
export async function POST(request: Request) {
  try {
    console.log('🔄 AUTO-REGISTER API CALLED - VERSION: 2024-08-29-v2 🔄');
    console.log('🔄 Auto-register API called');
    const body = await request.json();
    console.log('📦 Request body:', body);
    
    const { 
      telegram_id, 
      name_from_ml, 
      username, 
      start_param,
      ...otherData 
    } = body;
    
    console.log('📋 Parsed data:', { telegram_id, name_from_ml, username, start_param });

    if (!telegram_id) {
      console.log('❌ No telegram_id provided');
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    console.log('🔍 Auto-registration request for telegram_id:', telegram_id);

    // 1. Проверяем существует ли пользователь
    console.log('👀 Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, telegram_id, name_from_ml, utm_1, utm_2, utm_3, utm_4, utm_5')
      .eq('telegram_id', parseInt(telegram_id))
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking user existence:', checkError);
      return NextResponse.json({ 
        error: 'Failed to check user existence' 
      }, { status: 500 });
    }

    if (existingUser) {
      // 🚫 СУЩЕСТВУЮЩИЙ ПОЛЬЗОВАТЕЛЬ - НЕ ТРОГАЕМ UTM МЕТКИ
      console.log('👤 User already exists, preserving UTM params:', {
        telegram_id: existingUser.telegram_id,
        name: existingUser.name_from_ml,
        existing_utm: {
          utm_1: existingUser.utm_1,
          utm_2: existingUser.utm_2,
          utm_3: existingUser.utm_3,
          utm_4: existingUser.utm_4,
          utm_5: existingUser.utm_5
        }
      });

      return NextResponse.json({
        success: true,
        isNewUser: false,
        user: existingUser,
        message: 'User already exists, UTM params preserved'
      });
    }

    // 2. НОВЫЙ ПОЛЬЗОВАТЕЛЬ - создаем с UTM метками
    console.log('🆕 Creating new user with UTM params from start_param:', start_param);
    
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
      console.error('❌ Error creating new user:', createError);
      console.error('📋 Full error object:', JSON.stringify(createError, null, 2));
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: createError.message,
        code: createError.code
      }, { status: 500 });
    }

    console.log('✅ Successfully created new user:', {
      telegram_id: newUser.telegram_id,
      name: newUser.name_from_ml,
      utm_params: {
        utm_1: newUser.utm_1,
        utm_2: newUser.utm_2,
        utm_3: newUser.utm_3,
        utm_4: newUser.utm_4,
        utm_5: newUser.utm_5
      }
    });

    return NextResponse.json({
      success: true,
      isNewUser: true,
      user: newUser,
      message: 'User created successfully with UTM params'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Unexpected error in auto-register:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 