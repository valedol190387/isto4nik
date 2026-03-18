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

    // Подтягиваем имена пользователей из таблицы users по max_id
    const logs = data || [];
    const maxIds = [...new Set(logs.map(l => l.max_user_id).filter(Boolean))];

    let userNames: Record<number, string> = {};
    if (maxIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('max_id, name_from_ml, username')
        .in('max_id', maxIds);

      if (users) {
        for (const u of users) {
          userNames[u.max_id] = u.name_from_ml || u.username || '';
        }
      }
    }

    // Добавляем имя к каждому логу
    const logsWithNames = logs.map(log => ({
      ...log,
      user_name: log.max_user_id ? (userNames[log.max_user_id] || null) : null,
    }));

    return NextResponse.json({
      count: logsWithNames.length,
      logs: logsWithNames,
    });
  } catch (error) {
    console.error('[MAX BOT] Logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
