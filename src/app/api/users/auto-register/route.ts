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

    console.log('🔍 Auto-registration request for telegram_id:', telegram_id);

    // 1. Проверяем существует ли пользователь
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
    
    const newUserData = {
      telegram_id: parseInt(telegram_id),
      name_from_ml: name_from_ml || 'Новый пользователь',
      username: username || null,
      status: 'Новый пользователь',
      testing: false,
      
      // Основные поля (будут заполняться при покупках)
      salebot_id: null,
      mail: null,
      phone: null,
      clubtarif: null,
      next_payment_date: null,
      forma_opl: null,
      metka: 'auto_registered',
      periodtarif: null,
      srok: null,
      start_sub_club: null,
      subscr_id: null,
      sum: null,
      delete_club: false,
      first_monthdate: null,
      sub_club_stop: null,
      amo_lead_id: null,
      amo_client_id: null,
      istochnik: null,
      forma_oplaty: null,
      
      // UTM метки из start_param
      utm_1: utmParams.utm_1,
      utm_2: utmParams.utm_2,
      utm_3: utmParams.utm_3,
      utm_4: utmParams.utm_4,
      utm_5: utmParams.utm_5,
      
      // Дефолтные доступы к курсам (НОВЫЕ КЛЮЧИ!)
      course_access: {
        stomach: true,        // course_flat_belly - всегда открыт
        swelling: false,      // course_anti_swelling
        blossom: false,       // course_bloom  
        flexibility: false,   // useful (Рельеф и гибкость)
        face: false,          // workouts (Для лица)
        foot: false,          // guides (Стопы)
        bodyflow: false,      // motivation (BodyFlow)
        posture: false        // nutrition (Осанка)
      },
      
      // Дополнительные данные если переданы
      ...otherData
    };

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([newUserData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating new user:', createError);
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: createError.message 
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