import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionKey = searchParams.get('section');
    const tag = searchParams.get('tag');

    let query = supabase
      .from('materials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Фильтрация по разделу
    if (sectionKey) {
      query = query.eq('section_key', sectionKey);
    }

    // Фильтрация по тегу
    if (tag) {
      query = query.contains('tags', `["${tag}"]`);
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