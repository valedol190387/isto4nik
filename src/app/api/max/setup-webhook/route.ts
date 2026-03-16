import { setupWebhook, getBotInfo } from '@/lib/max-bot-api';
import { NextResponse } from 'next/server';

// POST /api/max/setup-webhook
// Регистрирует вебхук для Max бота. Вызвать один раз при настройке.
export async function POST(request: Request) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

    if (!appUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL or VERCEL_URL not set' },
        { status: 500 }
      );
    }

    const webhookUrl = `https://${appUrl.replace(/^https?:\/\//, '')}/api/max/webhook`;

    // Проверяем что бот работает
    const botInfo = await getBotInfo();
    console.log(`[MAX BOT] Setting up webhook for bot: ${botInfo.first_name} (${botInfo.user_id})`);

    // Регистрируем вебхук
    const result = await setupWebhook(webhookUrl, [
      'bot_started',
      'user_added',
    ]);

    console.log(`[MAX BOT] Webhook registered: ${webhookUrl}`);

    return NextResponse.json({
      success: true,
      bot: {
        user_id: botInfo.user_id,
        name: botInfo.first_name,
        username: botInfo.username,
      },
      webhook_url: webhookUrl,
      update_types: ['bot_started', 'user_added'],
      result,
    });
  } catch (error) {
    console.error('[MAX BOT] Setup webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
