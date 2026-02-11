import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const materialId = searchParams.get('material_id');

    let query = supabase
      .from('material_view_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00`);
    }

    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59`);
    }

    if (materialId) {
      query = query.eq('material_id', Number(materialId));
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching view logs:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Получаем список всех материалов для фильтра
    const { data: materials } = await supabase
      .from('materials')
      .select('id, title')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      data: {
        logs: logs || [],
        materials: materials || [],
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
