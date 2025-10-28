import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionKey = searchParams.get('section');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '0'); // 0 = без лимита (обратная совместимость)
    const offset = parseInt(searchParams.get('offset') || '0');

    // Для мини-курсов (section_key = 'materials') сортируем по возрастанию,
    // для остальных разделов - по убыванию (новые сначала)
    const isAscending = sectionKey === 'materials';

    let query = supabase
      .from('materials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: isAscending });

    // Фильтрация по разделу
    if (sectionKey) {
      query = query.eq('section_key', sectionKey);
    }

    // Фильтрация по тегу
    if (tag) {
      query = query.contains('tags', `["${tag}"]`);
    }

    // Пагинация (только если указан limit > 0)
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: materials, error } = await query;

    if (error) {
      console.error('Error fetching materials:', error);
      return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
    }

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, url, section_key, tags } = body;

    if (!title || !url || !section_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: material, error } = await supabase
      .from('materials')
      .insert([{
        title,
        description,
        url,
        section_key,
        tags: tags || []
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating material:', error);
      return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
    }

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 