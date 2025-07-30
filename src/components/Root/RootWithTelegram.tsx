'use client';

import { useEffect } from 'react';
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

  // Устанавливаем локаль на основании данных пользователя
  useEffect(() => {
    const locale = initDataUser?.language_code === 'ru' ? 'ru' : 'en';
    setLocale(locale);
  }, [initDataUser]);

  // Получаем сигналы Safe Area
  const safeAreaTop = useSignal(viewportSafeAreaInsetTop);
  const safeAreaBottom = useSignal(viewportSafeAreaInsetBottom);
  const safeAreaLeft = useSignal(viewportSafeAreaInsetLeft);
  const safeAreaRight = useSignal(viewportSafeAreaInsetRight);

  const contentSafeAreaTop = useSignal(viewportContentSafeAreaInsetTop);
  const contentSafeAreaBottom = useSignal(viewportContentSafeAreaInsetBottom);
  const contentSafeAreaLeft = useSignal(viewportContentSafeAreaInsetLeft);
  const contentSafeAreaRight = useSignal(viewportContentSafeAreaInsetRight);

  // Инициализация функций TMA
  useEffect(() => {
    const initTelegramFeatures = async () => {
      try {
        const setupFullscreen = () => {
          try {
            if (viewport && !viewport.state().isExpanded) {
              viewport.expand();
            }
          } catch (error) {
            console.error('Ошибка при разворачивании viewport:', error);
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

export function RootWithTelegram({ children }: { children: React.ReactNode }) {
  const didMount = useDidMount();

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner>{children}</RootInner>
    </ErrorBoundary>
  ) : (
    <div className="root-loading">Loading...</div>
  );
} 