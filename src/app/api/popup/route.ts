import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - получить активный попап для отображения пользователям
export async function GET() {
  try {
    const { data: popup, error } = await supabase
      .from('popup_settings')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Если попап не найден, возвращаем null
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: true, popup: null });
      }
      throw error;
    }

    return NextResponse.json({ success: true, popup });
  } catch (error) {
    console.error('Error fetching popup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch popup' },
      { status: 500 }
    );
  }
}
