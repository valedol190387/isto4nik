import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - получить все FAQ для админки
export async function GET() {
  try {
    const { data: faqItems, error } = await supabase
      .from('faq')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, faq: faqItems });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQ' },
      { status: 500 }
    );
  }
}

// POST - создать новый FAQ
export async function POST(request: Request) {
  try {
    const faqData = await request.json();
    
    // Добавляем временные метки
    faqData.created_at = new Date().toISOString();
    faqData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('faq')
      .insert([faqData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, faq: data[0] });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

// PUT - обновить FAQ
export async function PUT(request: Request) {
  try {
    const faqData = await request.json();
    const { id } = faqData;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    // Добавляем временную метку обновления
    faqData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('faq')
      .update(faqData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, faq: data[0] });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE - удалить FAQ
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    // Удаляем FAQ из БД
    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}