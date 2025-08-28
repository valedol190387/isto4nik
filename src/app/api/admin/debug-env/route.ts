import { NextRequest, NextResponse } from 'next/server';

// ВРЕМЕННЫЙ API для отладки переменных окружения
// УДАЛИТЬ ПОСЛЕ РЕШЕНИЯ ПРОБЛЕМЫ!
export async function GET(request: NextRequest) {
  try {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    return NextResponse.json({
      hasUsername: !!ADMIN_USERNAME,
      hasPassword: !!ADMIN_PASSWORD,
      usernameLength: ADMIN_USERNAME?.length || 0,
      passwordLength: ADMIN_PASSWORD?.length || 0,
      usernameFirst3: ADMIN_USERNAME?.substring(0, 3) || 'undefined',
      passwordFirst3: ADMIN_PASSWORD?.substring(0, 3) || 'undefined',
      // НЕ выводим полные значения из соображений безопасности
      env: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Error checking env vars:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
