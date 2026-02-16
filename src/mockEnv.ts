import { mockTelegramEnv, isTMA, emitEvent } from '@telegram-apps/sdk-react';

/**
 * Проверяет, запущено ли приложение внутри Max messenger
 * Max создаёт window.WebApp (без window.Telegram)
 */
function isMaxApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !(window as any).Telegram?.WebApp && !!(window as any).WebApp?.initData;
}

/**
 * Проверяет, есть ли признаки Telegram в URL (hash или query)
 */
function hasTelegramParams(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash;
  const search = window.location.search;
  return hash.includes('tgWebAppPlatform') || search.includes('tgWebAppPlatform');
}

/**
 * Ждёт появления Max SDK (window.WebApp) с таймаутом
 */
function waitForMaxSdk(timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    // Уже есть
    if (isMaxApp()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (isMaxApp()) {
        clearInterval(interval);
        resolve(true);
        return;
      }
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 50);
  });
}

/**
 * Мокает Telegram-окружение данными из Max WebApp
 * Это позволяет Telegram SDK работать внутри Max без изменений
 */
function mockTelegramFromMax(): void {
  const maxWebApp = (window as any).WebApp;
  if (!maxWebApp) return;

  const user = maxWebApp.initDataUnsafe?.user;
  const themeParams = {
    accent_text_color: '#6ab2f2',
    bg_color: '#EDEDEA',
    button_color: '#5288c1',
    button_text_color: '#ffffff',
    destructive_text_color: '#ec3942',
    header_bg_color: '#EDEDEA',
    hint_color: '#708499',
    link_color: '#6ab3f3',
    secondary_bg_color: '#EDEDEA',
    section_bg_color: '#EDEDEA',
    section_header_text_color: '#6ab3f3',
    subtitle_text_color: '#708499',
    text_color: '#f5f5f5',
  } as const;
  const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

  // Формируем initData из Max данных
  const initDataParams = new URLSearchParams([
    ['auth_date', (maxWebApp.initDataUnsafe?.auth_date || (new Date().getTime() / 1000 | 0)).toString()],
    ['hash', maxWebApp.initDataUnsafe?.hash || 'max-hash'],
    ['signature', 'max-signature'],
    ['user', JSON.stringify(user || { id: 0, first_name: 'Max User' })],
  ]);

  if (maxWebApp.initDataUnsafe?.start_param) {
    initDataParams.set('start_param', maxWebApp.initDataUnsafe.start_param);
  }

  mockTelegramEnv({
    onEvent(e) {
      if (e[0] === 'web_app_request_theme') {
        return emitEvent('theme_changed', { theme_params: themeParams });
      }
      if (e[0] === 'web_app_request_viewport') {
        return emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (e[0] === 'web_app_request_content_safe_area') {
        return emitEvent('content_safe_area_changed', noInsets);
      }
      if (e[0] === 'web_app_request_safe_area') {
        return emitEvent('safe_area_changed', noInsets);
      }
    },
    launchParams: new URLSearchParams([
      ['tgWebAppThemeParams', JSON.stringify(themeParams)],
      ['tgWebAppData', initDataParams.toString()],
      ['tgWebAppVersion', '8.4'],
      ['tgWebAppPlatform', maxWebApp.platform || 'android'],
    ]),
  });

  console.info('✅ Max messenger detected — Telegram SDK mocked with Max data');
}

/**
 * Мокает Telegram-окружение с фоллбэк-данными.
 * Используется когда приложение открыто НЕ из Telegram (Max или другой источник).
 * Контент всё равно защищён замками подписки — мок нужен только чтобы SDK не падал.
 */
function mockFallback(): void {
  const themeParams = {
    accent_text_color: '#6ab2f2',
    bg_color: '#EDEDEA',
    button_color: '#5288c1',
    button_text_color: '#ffffff',
    destructive_text_color: '#ec3942',
    header_bg_color: '#EDEDEA',
    hint_color: '#708499',
    link_color: '#6ab3f3',
    secondary_bg_color: '#EDEDEA',
    section_bg_color: '#EDEDEA',
    section_header_text_color: '#6ab3f3',
    subtitle_text_color: '#708499',
    text_color: '#f5f5f5',
  } as const;
  const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

  mockTelegramEnv({
    onEvent(e) {
      if (e[0] === 'web_app_request_theme') {
        return emitEvent('theme_changed', { theme_params: themeParams });
      }
      if (e[0] === 'web_app_request_viewport') {
        return emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (e[0] === 'web_app_request_content_safe_area') {
        return emitEvent('content_safe_area_changed', noInsets);
      }
      if (e[0] === 'web_app_request_safe_area') {
        return emitEvent('safe_area_changed', noInsets);
      }
    },
    launchParams: new URLSearchParams([
      ['tgWebAppThemeParams', JSON.stringify(themeParams)],
      ['tgWebAppData', new URLSearchParams([
        ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
        ['hash', 'fallback-hash'],
        ['signature', 'fallback-signature'],
        ['user', JSON.stringify({ id: 0, first_name: 'Guest' })],
      ]).toString()],
      ['tgWebAppVersion', '8.4'],
      ['tgWebAppPlatform', 'android'],
    ]),
  });

  console.info('ℹ️ Non-Telegram environment — SDK mocked with fallback data');
}

export async function mockEnv(): Promise<void> {
  // 1. Уже в Max — мокаем данными из Max
  if (isMaxApp()) {
    mockTelegramFromMax();
    return;
  }

  // 2. В Telegram — ничего не делаем, SDK работает нативно
  // hasTelegramParams() проверяет URL (первый запуск)
  // isTMA('complete') проверяет ВСЕ источники: URL, performance entries, localStorage
  // (важно для перезагрузки страницы — URL-параметры теряются, но данные в localStorage остаются)
  if (hasTelegramParams()) {
    return;
  }

  const isTelegramApp = await isTMA('complete');
  if (isTelegramApp) {
    return;
  }

  // 3. Нет Telegram-параметров — ждём Max SDK
  const maxReady = await waitForMaxSdk(1500);
  if (maxReady) {
    mockTelegramFromMax();
    return;
  }

  // 4. Ни Telegram, ни Max — мокаем с фоллбэком чтобы приложение не падало
  mockFallback();
}
