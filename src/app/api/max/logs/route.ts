import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/max/logs?limit=50&event_type=user_kicked&max_user_id=123
// Просмотр логов Max бота
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const eventType = searchParams.get('event_type');
    const maxUserId = searchParams.get('max_user_id');

    let query = supabase
      .from('max_bot_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 200));

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (maxUserId) {
      query = query.eq('max_user_id', parseInt(maxUserId, 10));
    }

    const { data, error } = await query;

    if (error) {
      console.error('[MAX BOT] Error fetching logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    return NextResponse.json({
      count: data?.length || 0,
      logs: data || [],
    });
  } catch (error) {
    console.error('[MAX BOT] Logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
