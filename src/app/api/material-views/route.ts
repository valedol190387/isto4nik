import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telegram_id, material_id, video_index, video_title, event_type } = body;

    if (!telegram_id || !material_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['lesson_open', 'video_view'].includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 });
    }

    const { error } = await supabase
      .from('material_view_logs')
      .insert([{
        telegram_id: Number(telegram_id),
        material_id: Number(material_id),
        video_index: video_index != null ? Number(video_index) : null,
        video_title: video_title || null,
        event_type,
      }]);

    if (error) {
      console.error('Error logging material view:', error);
      return NextResponse.json({ error: 'Failed to log view' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('material_id');
    const eventType = searchParams.get('event_type');
    const telegramId = searchParams.get('telegram_id');

    let query = supabase
      .from('material_view_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (materialId) {
      query = query.eq('material_id', Number(materialId));
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (telegramId) {
      query = query.eq('telegram_id', Number(telegramId));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching material views:', error);
      return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
