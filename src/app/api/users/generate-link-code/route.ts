import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/users/generate-link-code?telegramId=123
// Возвращает linking_code пользователя (генерирует если нет)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }

    // Получаем текущий linking_code
    const { data: user, error } = await supabase
      .from('users')
      .select('linking_code')
      .eq('telegram_id', parseInt(telegramId))
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Если код уже есть — возвращаем
    if (user.linking_code) {
      return NextResponse.json({ linking_code: user.linking_code });
    }

    // Если нет — генерируем
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ linking_code: crypto.randomUUID() })
      .eq('telegram_id', parseInt(telegramId))
      .select('linking_code')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    return NextResponse.json({ linking_code: updated.linking_code });
  } catch (error) {
    console.error('Error generating link code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
