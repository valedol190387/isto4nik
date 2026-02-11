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

    // Подтягиваем название материала
    let materialTitle: string | null = null;
    const { data: materialData } = await supabase
      .from('materials')
      .select('title')
      .eq('id', Number(material_id))
      .single();
    if (materialData) {
      materialTitle = materialData.title;
    }

    // Подтягиваем UTM-метки и username пользователя
    let username: string | null = null;
    let utm1: string | null = null;
    let utm2: string | null = null;
    let utm3: string | null = null;
    let utm4: string | null = null;
    let utm5: string | null = null;

    const { data: userData } = await supabase
      .from('users')
      .select('username, utm_1, utm_2, utm_3, utm_4, utm_5')
      .eq('telegram_id', Number(telegram_id))
      .single();

    if (userData) {
      username = userData.username || null;
      utm1 = userData.utm_1 || null;
      utm2 = userData.utm_2 || null;
      utm3 = userData.utm_3 || null;
      utm4 = userData.utm_4 || null;
      utm5 = userData.utm_5 || null;
    }

    const { error } = await supabase
      .from('material_view_logs')
      .insert([{
        telegram_id: Number(telegram_id),
        material_id: Number(material_id),
        material_title: materialTitle,
        video_index: video_index != null ? Number(video_index) : null,
        video_title: video_title || null,
        event_type,
        username,
        utm_1: utm1,
        utm_2: utm2,
        utm_3: utm3,
        utm_4: utm4,
        utm_5: utm5,
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
