'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { checkAndCreateUser } from '@/lib/userRegistration';
import { extractTelegramData, isValidTelegramUser } from '@/lib/utm';

interface UserAutoRegistrationProps {
  children: React.ReactNode;
}

/**
 * Компонент для автоматической проверки и регистрации пользователей
 * при первом запуске Telegram Mini App
 * 
 * Исключения:
 * - Админские страницы (/admin/*) пропускаются
 * - localhost для разработки с тестовыми данными
 */
export default function UserAutoRegistration({ children }: UserAutoRegistrationProps) {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Проверка доступа...');
  const pathname = usePathname();

  // Проверяем, является ли текущая страница админской
  const isAdminPage = pathname && pathname.startsWith('/admin');

  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('🚀 Initializing user auto-registration...');
        
        // 🔓 ИСКЛЮЧЕНИЕ ДЛЯ АДМИНКИ: Если это админская страница - пропускаем проверку Telegram
        if (isAdminPage) {
          console.log('🔓 Admin page detected - skipping Telegram check');
          setTelegramId('admin');
          setIsChecking(false);
          return;
        }
        
        // 🛠️ РАЗРАБОТКА: localhost с тестовыми данными
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          const urlParams = new URLSearchParams(window.location.search);
          const testTelegramId = urlParams.get('telegram_id');
          const testStartParam = urlParams.get('start_param');
          
          if (testTelegramId && /^\d+$/.test(testTelegramId)) {
            console.log('🛠️ localhost: Using telegram_id from URL:', testTelegramId);
            setTelegramId(testTelegramId);
            
            // Создаем тестового пользователя с данными из URL
            const testUser = {
              id: parseInt(testTelegramId),
              first_name: `Тестовый пользователь`,
              last_name: `ID: ${testTelegramId}`,
              username: `test_user_${testTelegramId}`
            };
            
            await checkAndCreateUser(testUser, testStartParam || undefined);
          } else {
            // Используем дефолтного пользователя для разработки
            console.log('🛠️ localhost: Using default test user (123456789)');
            setTelegramId('123456789');
            
            const defaultUser = {
              id: 123456789,
              first_name: 'Test',
              last_name: 'User', 
              username: 'test_user'
            };
            
            await checkAndCreateUser(defaultUser, testStartParam || undefined);
          }
          setIsChecking(false);
          return;
        }
        
        // 🎯 PRODUCTION: Работа с реальным Telegram WebApp
        let attempts = 0;
        const maxAttempts = 20; // Максимум 2 секунды ожидания (20 * 100ms)
        
        const checkTelegramWebApp = async (): Promise<boolean> => {
          attempts++;
          console.log(`🔄 Attempt ${attempts}/${maxAttempts}: Checking Telegram WebApp...`);
          
          // Проверяем наличие Telegram WebApp
          if (!(window as any).Telegram?.WebApp) {
            console.log(`❌ Attempt ${attempts}: No Telegram WebApp object detected`);
            return false;
          }
          
          const tg = (window as any).Telegram.WebApp;
          
          // Вызываем ready() на первой попытке
          if (attempts === 1) {
            console.log('📱 Calling Telegram.WebApp.ready()');
            tg.ready();
            tg.expand(); // Также расширяем приложение
          }
          
          // Извлекаем данные пользователя
          const { user, startParam } = extractTelegramData();
          
          console.log(`📊 Attempt ${attempts} WebApp data:`, { 
            version: (tg as any).version,
            platform: (tg as any).platform,
            user: user ? { id: user.id, first_name: user.first_name } : null,
            startParam,
            hasInitData: !!tg.initData
          });
          
          // Проверяем валидность пользователя
          if (isValidTelegramUser(user)) {
            console.log('✅ SUCCESS: Got valid telegram_id from Telegram WebApp:', user.id);
            setTelegramId(user.id.toString());
            
            // Выполняем авторегистрацию
            await checkAndCreateUser(user, startParam);
            return true;
          } else {
            console.log(`⏳ Attempt ${attempts}: WebApp ready but user data not available yet`);
            return false;
          }
        };
        
        // Повторяем попытки с интервалом 100ms
        const attemptWithRetry = async () => {
          // Обновляем сообщение загрузки
          if (attempts <= 5) {
            setLoadingMessage('Инициализация Telegram...');
          } else if (attempts <= 10) {
            setLoadingMessage('Ожидание данных пользователя...');
          } else {
            setLoadingMessage('Завершение подключения...');
          }
          
          const success = await checkTelegramWebApp();
          
          if (success) {
            setLoadingMessage('Успешно подключено!');
            setTimeout(() => setIsChecking(false), 300); // Небольшая задержка для показа успеха
            return;
          }
          
          if (attempts < maxAttempts) {
            setTimeout(attemptWithRetry, 100);
          } else {
            console.log('❌ production: Max attempts reached - no valid Telegram user found');
            setTelegramId(null);
            setIsChecking(false);
          }
        };
        
        // Начинаем проверку с небольшой задержки
        setTimeout(attemptWithRetry, 50);
        
      } catch (error) {
        console.error('❌ Error during user initialization:', error);
        setTelegramId(null);
        setIsChecking(false);
      }
    };

    initializeUser();
  }, [isAdminPage]);

  // Показываем лоадер во время проверки
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'var(--font-montserrat)'
      }}>
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Ayuna Beauty</h3>
          <p className="text-gray-600 text-sm mb-4">{loadingMessage}</p>
          <div className="text-xs text-gray-500">
            Подождите, идет подключение к Telegram...
          </div>
        </div>
      </div>
    );
  }

  // Если не удалось получить telegram_id - блокируем доступ
  if (!telegramId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ 
        background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
        fontFamily: 'var(--font-montserrat)'
      }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.655-.377 2.655-1.377 2.655-.896 0-1.615-.896-2.487-1.616l-3.677-2.512c-.896-.616-1.536-1.232-.64-2.128l4.573-4.573c.896-.896.448-1.344-.448-.448l-5.697 3.677c-1.232.774-1.232.774-2.128.448l-1.536-.448c-.896-.224-.896-1.344.896-2.016l11.2-4.125c.896-.336 1.792.224 1.472 2.24z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚫 Доступ запрещен
          </h2>
          <p className="text-gray-600 mb-6">
            Для продолжения работы приложения, вы должны запустить его в Telegram. 
            Перезапустите приложение если это ошибка.
          </p>
          <div className="rounded-lg p-4 border border-gray-200 bg-white/50">
            <p className="text-sm text-gray-500">
              Ayuna Beauty работает только как Telegram Mini App
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Доступ разрешен - рендерим приложение
  console.log('✅ User auto-registration completed, access granted for telegram_id:', telegramId);
  return <>{children}</>;
} 