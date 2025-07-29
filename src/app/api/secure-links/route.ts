import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Секретные ссылки (только для пользователей с активной подпиской)
const SECURE_LINKS = {
  chat: process.env.TELEGRAM_CHAT_LINK || 'https://t.me/c/2770943577/3/564',
  course_flat_belly: process.env.TELEGRAM_COURSE_FLAT_BELLY_LINK || 'https://t.me/c/2770943577/3/564',
  course_anti_swelling: process.env.TELEGRAM_COURSE_ANTI_SWELLING_LINK || 'https://t.me/c/2770943577/3/564',
};

// Проверка статуса подписки
async function checkSubscriptionStatus(telegramId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('status')
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      console.error('Error checking subscription:', error);
      return false;
    }

    return data?.status === 'Активна';
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('telegram_id');
  const linkType = searchParams.get('type'); // 'chat', 'course_flat_belly', 'course_anti_swelling'

  // Проверяем обязательные параметры
  if (!telegramId || !linkType) {
    return NextResponse.json(
      { error: 'Missing telegram_id or type parameter' },
      { status: 400 }
    );
  }

  // Проверяем что тип ссылки существует
  if (!(linkType in SECURE_LINKS)) {
    return NextResponse.json(
      { error: 'Invalid link type' },
      { status: 400 }
    );
  }

  // Проверяем статус подписки
  const hasActiveSubscription = await checkSubscriptionStatus(telegramId);

  if (!hasActiveSubscription) {
    return NextResponse.json(
      { error: 'Active subscription required' },
      { status: 403 }
    );
  }

  // Возвращаем защищенную ссылку
  return NextResponse.json({
    link: SECURE_LINKS[linkType as keyof typeof SECURE_LINKS],
    expires_at: Date.now() + 30000, // Ссылка действительна 30 секунд
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 