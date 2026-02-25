import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST — создать или обновить прогресс онбординга
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id, session_id, current_step, max_step, answers, completed, skipped } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id is required' }, { status: 400 });
    }

    // Если есть session_id — обновляем существующую сессию
    if (session_id) {
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          current_step,
          max_step,
          answers,
          completed: completed || false,
          skipped: skipped || false,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', session_id);

      if (error) throw error;

      return NextResponse.json({ success: true, session_id });
    }

    // Иначе — создаём новую сессию
    const { data, error } = await supabase
      .from('onboarding_progress')
      .insert({
        telegram_id,
        current_step: current_step || 0,
        max_step: max_step || 0,
        answers: answers || {},
        completed: completed || false,
        skipped: skipped || false,
      })
      .select('session_id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session_id: data.session_id });
  } catch (error: any) {
    console.error('Onboarding progress error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
