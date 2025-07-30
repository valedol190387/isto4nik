'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type React from 'react';
import {
  initData,
  miniApp,
  viewport,
  viewportContentSafeAreaInsetTop,
  viewportContentSafeAreaInsetBottom,
  viewportContentSafeAreaInsetLeft,
  viewportContentSafeAreaInsetRight,
  viewportSafeAreaInsetTop,
  viewportSafeAreaInsetBottom,
  viewportSafeAreaInsetLeft,
  viewportSafeAreaInsetRight,
  useLaunchParams,
  useSignal,
} from '@telegram-apps/sdk-react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useDidMount } from '@/hooks/useDidMount';
import { setLocale } from '@/core/i18n/locale';
import TelegramStickyApp from '@/components/TelegramStickyApp';
import { checkAndCreateUser } from '@/lib/userRegistration';
import { extractTelegramData, isValidTelegramUser } from '@/lib/utm';
import { AdminRoot } from './AdminRoot';

import './styles.css';

// Функция проверки мобильной платформы
function isMobilePlatform() {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    const platform = (window as any).Telegram.WebApp.platform;
    return platform === 'ios' || platform === 'android' || platform === 'mobile_web';
  }
  
  // Резервный способ через user agent
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }
  
  return false;
}

function RootInner({ children }: { children: any }) {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const initDataUser = useSignal(initData.user);
  
  // Safe Area значения
  const safeAreaTop = useSignal(viewportSafeAreaInsetTop);
  const safeAreaBottom = useSignal(viewportSafeAreaInsetBottom);
  const safeAreaLeft = useSignal(viewportSafeAreaInsetLeft);
  const safeAreaRight = useSignal(viewportSafeAreaInsetRight);
  const contentSafeAreaTop = useSignal(viewportContentSafeAreaInsetTop);
  const contentSafeAreaBottom = useSignal(viewportContentSafeAreaInsetBottom);
  const contentSafeAreaLeft = useSignal(viewportContentSafeAreaInsetLeft);
  const contentSafeAreaRight = useSignal(viewportContentSafeAreaInsetRight);

  // Set the user locale.
  useEffect(() => {
    initDataUser && setLocale(initDataUser.language_code);
  }, [initDataUser]);

  // Настройка цветов и fullscreen режима
  useEffect(() => {
    const initTelegramFeatures = async () => {
      try {
        // Сначала устанавливаем цвета
        if (miniApp.setHeaderColor.isAvailable()) {
          miniApp.setHeaderColor('#EDEDEA');
        }
        if (miniApp.setBackgroundColor.isAvailable()) {
          miniApp.setBackgroundColor('#EDEDEA');
        }

        // Настройка fullscreen (отдельно от init.ts)
        const setupFullscreen = async () => {
          try {
            // На мобильных устройствах сразу включаем fullscreen без expand
            if (isMobilePlatform() && viewport.requestFullscreen?.isAvailable()) {
              await viewport.requestFullscreen();
            } else {
              // На десктопе только expand
              if (viewport.expand.isAvailable()) {
                viewport.expand();
              }
            }
          } catch (error) {
            console.error('Ошибка при настройке fullscreen:', error);
            // Если fullscreen не сработал, делаем fallback на expand
            if (viewport.expand.isAvailable()) {
              viewport.expand();
            }
          }
        };

        // Запускаем fullscreen сразу
        setupFullscreen();

        // Уведомляем о готовности
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.ready();
        }
      } catch (error) {
        console.error('Ошибка при инициализации TMA features:', error);
      }
    };

    initTelegramFeatures();
  }, []);

  // UTM tracking и автоматическая регистрация пользователей
  useEffect(() => {
    const handleUserRegistration = async () => {
      try {
        console.log('🚀 Checking for user auto-registration...');
        
        // Пробуем получить данные пользователя из Telegram SDK
        if (initDataUser && isValidTelegramUser(initDataUser)) {
          console.log('✅ Got user from Telegram SDK:', initDataUser.id);
          
          // Получаем start_param для UTM меток
          const startParam = lp.tgWebAppStartParam || null;
          console.log('🏷️ Start param:', startParam);
          
          // Выполняем автоматическую регистрацию/обновление пользователя
          await checkAndCreateUser(initDataUser, startParam);
          return;
        }

        // Fallback: пробуем получить данные из WebApp напрямую
        const { user, startParam } = extractTelegramData();
        if (isValidTelegramUser(user)) {
          console.log('✅ Got user from WebApp fallback:', user.id);
          await checkAndCreateUser(user, startParam);
          return;
        }

        console.log('ℹ️ No valid user data found for auto-registration');
      } catch (error) {
        console.error('❌ Error during user auto-registration:', error);
      }
    };

    // Запускаем регистрацию с небольшой задержкой, чтобы Telegram успел инициализироваться
    const timer = setTimeout(handleUserRegistration, 1000);
    return () => clearTimeout(timer);
  }, [initDataUser, lp.tgWebAppStartParam]);

  // Устанавливаем Safe Area отступы: комбинируем системные safe area + content safe area от Telegram
  useEffect(() => {
    const root = document.documentElement;
    
    const topTotal = (safeAreaTop || 0) + (contentSafeAreaTop || 0);
    const bottomTotal = (safeAreaBottom || 0) + (contentSafeAreaBottom || 0);
    const leftTotal = (safeAreaLeft || 0) + (contentSafeAreaLeft || 0);
    const rightTotal = (safeAreaRight || 0) + (contentSafeAreaRight || 0);
    
    root.style.setProperty('--safe-area-inset-top', `${topTotal}px`);
    root.style.setProperty('--safe-area-inset-bottom', `${bottomTotal}px`);
    root.style.setProperty('--safe-area-inset-left', `${leftTotal}px`);
    root.style.setProperty('--safe-area-inset-right', `${rightTotal}px`);
  }, [safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight, contentSafeAreaTop, contentSafeAreaBottom, contentSafeAreaLeft, contentSafeAreaRight]);

  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <TelegramStickyApp>
        <AppRoot
          appearance={isDark ? 'dark' : 'light'}
          platform={
            ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'
          }
        >
          {children}
        </AppRoot>
      </TelegramStickyApp>
    </TonConnectUIProvider>
  );
}

/**
 * Главный Root компонент с условным рендерингом
 * Для админки (/admin/*) - используем упрощенную версию без Telegram SDK
 * Для пользовательской части - полная версия с Telegram
 */
export function Root({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const didMount = useDidMount();

  // Для админки используем упрощенную версию без Telegram SDK
  if (pathname.startsWith('/admin')) {
    return <AdminRoot>{children}</AdminRoot>;
  }

  // Для пользовательской части используем полную версию с Telegram
  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner>{children}</RootInner>
    </ErrorBoundary>
  ) : (
    <div className="root__loading">Loading</div>
  );
}
