import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Получить избранные материалы пользователя с пагинацией
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Получаем массив избранных материалов пользователя
    const { data: userFavorites, error: favError } = await supabase
      .from('user_favorites')
      .select('favorite_materials')
      .eq('telegram_id', parseInt(telegramId))
      .single();

    if (favError) {
      // Если записи нет - возвращаем пустой массив
      if (favError.code === 'PGRST116') {
        return NextResponse.json([]);
      }
      throw favError;
    }

    const materialIds = userFavorites?.favorite_materials || [];
    
    if (materialIds.length === 0) {
      return NextResponse.json([]);
    }

    // Применяем пагинацию к списку ID
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedIds = materialIds.slice(startIndex, endIndex);

    if (paginatedIds.length === 0) {
      return NextResponse.json([]);
    }

    // Получаем полную информацию о материалах (только активные)
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select(`
        id,
        title,
        description,
        url,
        section_key,
        tags,
        display_order,
        is_embedded_video,
        video_embed_code,
        pic_url,
        created_at
      `)
      .in('id', paginatedIds)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (materialsError) {
      throw materialsError;
    }

    return NextResponse.json(materials || []);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
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

    const telegramIdInt = parseInt(telegramId);
    const materialIdInt = parseInt(materialId);

    // Проверяем существует ли запись пользователя
    const { data: existing, error: selectError } = await supabase
      .from('user_favorites')
      .select('favorite_materials')
      .eq('telegram_id', telegramIdInt)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    let currentFavorites = existing?.favorite_materials || [];
    
    // Проверяем что материал не добавлен уже
    if (currentFavorites.includes(materialIdInt)) {
      return NextResponse.json({ error: 'Material already in favorites' }, { status: 409 });
    }

    // Добавляем новый материал в массив
    const updatedFavorites = [...currentFavorites, materialIdInt];

    if (existing) {
      // Обновляем существующую запись
      const { error: updateError } = await supabase
        .from('user_favorites')
        .update({ 
          favorite_materials: updatedFavorites,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', telegramIdInt);

      if (updateError) throw updateError;
    } else {
      // Создаем новую запись
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          telegram_id: telegramIdInt,
          favorite_materials: updatedFavorites,
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 });
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

    const telegramIdInt = parseInt(telegramId);
    const materialIdInt = parseInt(materialId);

    // Получаем текущий список избранного
    const { data: existing, error: selectError } = await supabase
      .from('user_favorites')
      .select('favorite_materials')
      .eq('telegram_id', telegramIdInt)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User favorites not found' }, { status: 404 });
      }
      throw selectError;
    }

    const currentFavorites = existing.favorite_materials || [];
    
    // Удаляем материал из массива
    const updatedFavorites = currentFavorites.filter((id: number) => id !== materialIdInt);

    // Обновляем запись
    const { error: updateError } = await supabase
      .from('user_favorites')
      .update({ 
        favorite_materials: updatedFavorites,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', telegramIdInt);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 });
  }
} 