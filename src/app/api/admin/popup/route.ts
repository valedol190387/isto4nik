import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - получить все попапы для админки
export async function GET() {
  try {
    const { data: popups, error } = await supabase
      .from('popup_settings')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, popups });
  } catch (error) {
    console.error('Error fetching popups:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch popups' },
      { status: 500 }
    );
  }
}

// POST - создать новый попап
export async function POST(request: Request) {
  try {
    const popupData = await request.json();

    // Если новый попап активен, деактивируем все остальные
    if (popupData.is_active) {
      const { error: deactivateError } = await supabase
        .from('popup_settings')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        throw deactivateError;
      }
    }

    // Добавляем временные метки
    popupData.created_at = new Date().toISOString();
    popupData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('popup_settings')
      .insert([popupData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, popup: data[0] });
  } catch (error) {
    console.error('Error creating popup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create popup' },
      { status: 500 }
    );
  }
}

// PUT - обновить попап
export async function PUT(request: Request) {
  try {
    const popupData = await request.json();
    const { id } = popupData;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Popup ID is required' },
        { status: 400 }
      );
    }

    // Если попап активируется, деактивируем все остальные
    if (popupData.is_active) {
      const { error: deactivateError } = await supabase
        .from('popup_settings')
        .update({ is_active: false })
        .eq('is_active', true)
        .neq('id', id); // Не трогаем текущий попап

      if (deactivateError) {
        throw deactivateError;
      }
    }

    // Добавляем временную метку обновления
    popupData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('popup_settings')
      .update(popupData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, popup: data[0] });
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update popup' },
      { status: 500 }
    );
  }
}

// DELETE - удалить попап
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Popup ID is required' },
        { status: 400 }
      );
    }

    // Удаляем попап из БД
    const { error } = await supabase
      .from('popup_settings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete popup' },
      { status: 500 }
    );
  }
}
