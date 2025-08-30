import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - получить материал по ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const materialId = params.id;

    if (!materialId) {
      return NextResponse.json(
        { success: false, message: 'Material ID is required' },
        { status: 400 }
      );
    }

    const { data: material, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Материал не найден
        return NextResponse.json(
          { success: false, message: 'Material not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch material' },
      { status: 500 }
    );
  }
} 