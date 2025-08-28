import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Получаем данные авторизации из переменных окружения
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

    // Добавляем логирование для отладки (временно)
    console.log('Admin auth attempt:', {
      receivedUsername: username,
      expectedUsername: ADMIN_USERNAME,
      receivedPasswordLength: password?.length,
      expectedPasswordLength: ADMIN_PASSWORD?.length,
      usernameMatch: username === ADMIN_USERNAME,
      passwordMatch: password === ADMIN_PASSWORD
    });

    // Проверяем учетные данные
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: 'Авторизация успешна'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неверный логин или пароль' 
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Error in admin auth:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка сервера' 
      },
      { status: 500 }
    );
  }
}
