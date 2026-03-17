import { removeChatMember } from '@/lib/max-bot-api';
import { NextResponse } from 'next/server';

/**
 * POST /api/max/unban
 * Разбанивает пользователя во всех каналах MAX_CHANNEL_IDS
 * Body: { max_user_id: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { max_user_id } = body;

    if (!max_user_id) {
      return NextResponse.json({ error: 'max_user_id is required' }, { status: 400 });
    }

    const channelIdsStr = process.env.MAX_CHANNEL_IDS || '';
    const channelIds = channelIdsStr
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));

    if (channelIds.length === 0) {
      return NextResponse.json({ error: 'No channels configured' }, { status: 500 });
    }

    const results: { chatId: number; success: boolean; error?: string }[] = [];

    for (const chatId of channelIds) {
      try {
        // block=false — разбан, не кик
        await removeChatMember(chatId, Number(max_user_id), false);
        results.push({ chatId, success: true });
      } catch (e: any) {
        results.push({ chatId, success: false, error: e.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[MAX UNBAN] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
