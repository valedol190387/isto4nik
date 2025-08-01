import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Публичный API для получения активных FAQ
 * GET /api/faq
 */
export async function GET() {
  try {
    const { data: faqItems, error } = await supabase
      .from('faq')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: faqItems || []
    });

  } catch (error) {
    console.error('Unexpected error in FAQ API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}