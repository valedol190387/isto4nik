import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - получить материал по ID или UUID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const materialIdentifier = params.id;

    if (!materialIdentifier) {
      return NextResponse.json(
        { success: false, message: 'Material ID or UUID is required' },
        { status: 400 }
      );
    }

    // Определяем, что пришло - UUID или числовой ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(materialIdentifier);

    // Выбираем поле для поиска
    const searchField = isUuid ? 'share_uuid' : 'id';
    
    const { data: material, error } = await supabase
      .from('materials')
      .select('*')
      .eq(searchField, materialIdentifier)
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