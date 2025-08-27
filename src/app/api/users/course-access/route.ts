import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API для получения доступов пользователя к разделам курсов
 * GET /api/users/course-access?telegram_id=123456789
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegram_id');

    if (!telegramId) {
      return NextResponse.json({ 
        error: 'Telegram ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 Getting course access for telegram_id:', telegramId);

    // Получаем доступы пользователя к курсам
    const { data: user, error } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('telegram_id', parseInt(telegramId))
      .single();

    if (error) {
      console.error('❌ Error fetching user course access:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch course access' 
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Дефолтные доступы если поле не заполнено
    const defaultAccess = {
      stomach: true,        // course_flat_belly
      swelling: false,      // course_anti_swelling
      blossom: false,       // course_bloom
      flexibility: false,   // useful
      face: false,          // workouts
      foot: false,          // guides
      bodyflow: false,      // motivation
      posture: false        // nutrition
    };

    const courseAccess = defaultAccess;

    console.log('✅ Course access found:', {
      telegram_id: user.telegram_id,
      access: courseAccess
    });

    return NextResponse.json({
      success: true,
      telegram_id: user.telegram_id,
      course_access: courseAccess
    });

  } catch (error) {
    console.error('❌ Unexpected error in course-access API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * API для обновления доступов пользователя к курсам (для админки)
 * PUT /api/users/course-access
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id, course_access } = body;

    if (!telegram_id || !course_access) {
      return NextResponse.json({ 
        error: 'Telegram ID and course_access are required' 
      }, { status: 400 });
    }

    console.log('🔧 Updating course access for telegram_id:', telegram_id);

    // TODO: Обновление доступов пока не реализовано в новой БД
    // Проверяем что пользователь существует
    const { data: user, error } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('telegram_id', parseInt(telegram_id))
      .single();

    if (error) {
      console.error('❌ Error updating course access:', error);
      return NextResponse.json({ 
        error: 'Failed to update course access' 
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('✅ Course access updated (mock):', {
      telegram_id: user.telegram_id,
      new_access: course_access
    });

    return NextResponse.json({
      success: true,
      telegram_id: user.telegram_id,
      course_access: course_access,
      message: 'Course access updated successfully (mock)'
    });

  } catch (error) {
    console.error('❌ Unexpected error updating course access:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}