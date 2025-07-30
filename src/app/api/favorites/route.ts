import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Получить избранные материалы пользователя
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Получаем избранные материалы с полной информацией
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        material_id,
        materials (
          id,
          title,
          description,
          url,
          section_key,
          tags,
          display_order,
          is_embedded_video,
          video_embed_code,
          created_at
        )
      `)
      .eq('telegram_id', parseInt(telegramId))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    // Извлекаем материалы из результата
    const materials = favorites?.map(fav => fav.materials).filter(Boolean) || [];

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Добавить материал в избранное
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telegramId, materialId } = body;

    if (!telegramId || !materialId) {
      return NextResponse.json({ error: 'Telegram ID and Material ID are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{
        telegram_id: parseInt(telegramId),
        material_id: materialId
      }])
      .select()
      .single();

    if (error) {
      // Если материал уже в избранном, возвращаем 409
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Material already in favorites' }, { status: 409 });
      }
      console.error('Error adding to favorites:', error);
      return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Удалить материал из избранного
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const materialId = searchParams.get('materialId');

    if (!telegramId || !materialId) {
      return NextResponse.json({ error: 'Telegram ID and Material ID are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('telegram_id', parseInt(telegramId))
      .eq('material_id', parseInt(materialId));

    if (error) {
      console.error('Error removing from favorites:', error);
      return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 