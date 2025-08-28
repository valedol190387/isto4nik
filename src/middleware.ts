import { NextRequest, NextResponse } from 'next/server';

// Защищенные маршруты
const PROTECTED_ROUTES = ['/calendar', '/favorites'];

// Функция для получения telegram_id из заголовков
function getTelegramIdFromHeaders(request: NextRequest): string | null {
  // В реальном Telegram WebApp, данные передаются через специальные заголовки
  const initData = request.headers.get('x-telegram-init-data');
  const userId = request.headers.get('x-telegram-user-id');
  
  if (userId) {
    return userId;
  }
  
  // Fallback - пытаемся извлечь из параметров URL (для разработки)
  const url = new URL(request.url);
  const telegramId = url.searchParams.get('telegram_id');
  
  return telegramId;
}

// Проверка статуса подписки на сервере
async function checkSubscriptionStatus(telegramId: string): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/users?telegram_id=${telegramId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    
    if (response.ok) {
      const userData = await response.json();
      return userData?.status === 'Активна';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // ВРЕМЕННО ОТКЛЮЧАЕМ MIDDLEWARE - проверка подписки на стороне компонентов
  // Telegram WebApp не передает telegram_id через заголовки
  return NextResponse.next();
}

export const config = {
  matcher: ['/calendar/:path*', '/favorites/:path*']
}; 