import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';

    // Получаем все сессии онбординга
    let query = supabase
      .from('onboarding_progress')
      .select('*')
      .order('created_at', { ascending: false });

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59');
    }

    const { data: sessions, error } = await query;
    if (error) throw error;

    // Собираем уникальные telegram_id
    const telegramIds = [...new Set((sessions || []).map(s => s.telegram_id))];

    // Получаем данные юзеров (UTM, username, status)
    let users: any[] = [];
    if (telegramIds.length > 0) {
      const { data, error: usersError } = await supabase
        .from('users')
        .select('telegram_id, username, name_from_ml, status, utm_1, utm_2, utm_3, utm_4, utm_5, created_at')
        .in('telegram_id', telegramIds);

      if (usersError) throw usersError;
      users = data || [];
    }

    const usersMap = new Map(users.map(u => [Number(u.telegram_id), u]));

    // Собираем ответ
    const rows = (sessions || []).map(s => {
      const user = usersMap.get(Number(s.telegram_id));
      return {
        ...s,
        username: user?.username || null,
        name_from_ml: user?.name_from_ml || null,
        user_status: user?.status || null,
        utm_1: user?.utm_1 || null,
        utm_2: user?.utm_2 || null,
        utm_3: user?.utm_3 || null,
        utm_4: user?.utm_4 || null,
        utm_5: user?.utm_5 || null,
        user_created_at: user?.created_at || null,
      };
    });

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Onboarding report error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
