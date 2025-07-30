import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - получить все материалы для админки
export async function GET() {
  try {
    const { data: materials, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

// POST - создать новый материал
export async function POST(request: Request) {
  try {
    const materialData = await request.json();
    
    // Добавляем временные метки
    materialData.created_at = new Date().toISOString();
    materialData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('materials')
      .insert([materialData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, material: data[0] });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create material' },
      { status: 500 }
    );
  }
}

// PUT - обновить материал
export async function PUT(request: Request) {
  try {
    const materialData = await request.json();
    const { id } = materialData;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Добавляем временную метку обновления
    materialData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('materials')
      .update(materialData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, material: data[0] });
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update material' },
      { status: 500 }
    );
  }
}

// DELETE - удалить материал
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Material ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete material' },
      { status: 500 }
    );
  }
} 