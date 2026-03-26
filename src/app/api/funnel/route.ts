import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET — загрузить прогресс воронки по telegram_id
export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegram_id');
    if (!telegramId) {
      return NextResponse.json({ success: true, data: null });
    }

    const { data, error } = await supabase
      .from('funnel_progress')
      .select('videos_watched, screens_visited, current_screen, completed')
      .eq('telegram_id', telegramId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return NextResponse.json({ success: true, data: data || null });
  } catch (error: any) {
    console.error('Funnel progress GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — создать или обновить прогресс воронки (одна запись на юзера)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id, current_screen, screens_visited, videos_watched, completed } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id is required' }, { status: 400 });
    }

    // Отклоняем фейковые/mock ID
    const FAKE_IDS = [0, 123456789, 987654321, 555666777];
    if (FAKE_IDS.includes(Number(telegram_id))) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 403 });
    }

    // Вычисляем max_screen — самый «глубокий» экран
    const screenOrder = ['screen-1', 'screen-2', 'screen-3'];
    const allScreens: string[] = screens_visited || [];

    // Для категорий и about — добавляем в порядок
    const getScreenWeight = (s: string): number => {
      const idx = screenOrder.indexOf(s);
      if (idx >= 0) return idx;
      if (s.startsWith('category-')) return 10;
      if (s === 'about') return 20;
      return 0;
    };

    const maxScreen = allScreens.reduce((max, s) => {
      return getScreenWeight(s) > getScreenWeight(max) ? s : max;
    }, current_screen || 'screen-1');

    const videosArr: string[] = videos_watched || [];

    const { data, error } = await supabase
      .from('funnel_progress')
      .upsert(
        {
          telegram_id,
          current_screen: current_screen || 'screen-1',
          max_screen: maxScreen,
          screens_visited: allScreens,
          videos_watched: videosArr,
          videos_watched_count: videosArr.length,
          completed: completed || false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'telegram_id' }
      )
      .select('session_id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session_id: data.session_id });
  } catch (error: any) {
    console.error('Funnel progress error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
