/**
 * Утилита для определения платформы (Telegram / Max / unknown)
 * и получения данных пользователя из соответствующего мессенджера
 */

export type MessengerPlatform = 'telegram' | 'max' | 'unknown';

interface MessengerUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface MessengerData {
  platform: MessengerPlatform;
  user: MessengerUser | null;
  startParam: string | null;
  initData: string | null;
  devicePlatform: string | null;
}

/**
 * Определяет текущую платформу: Telegram, Max или unknown
 */
export function getPlatform(): MessengerPlatform {
  if (typeof window === 'undefined') return 'unknown';

  // Max — проверяем window.WebApp (нативный Max SDK) ПЕРВЫМ
  // Важно: mockTelegramEnv() создаёт window.Telegram.WebApp,
  // но window.WebApp (без namespace Telegram) существует ТОЛЬКО в Max
  if ((window as any).WebApp?.initData) {
    return 'max';
  }

  // Telegram — проверяем window.Telegram.WebApp
  if ((window as any).Telegram?.WebApp) {
    return 'telegram';
  }

  return 'unknown';
}

/**
 * Проверяет, запущено ли приложение внутри мессенджера (Telegram или Max)
 */
export function isInMessenger(): boolean {
  return getPlatform() !== 'unknown';
}

/**
 * Получает объект WebApp текущей платформы
 */
export function getWebApp(): any | null {
  if (typeof window === 'undefined') return null;

  const platform = getPlatform();

  if (platform === 'telegram') {
    return (window as any).Telegram?.WebApp || null;
  }

  if (platform === 'max') {
    return (window as any).WebApp || null;
  }

  return null;
}

/**
 * Получает ID пользователя из текущего мессенджера
 */
export function getMessengerId(): string | null {
  if (typeof window === 'undefined') return null;

  const platform = getPlatform();

  if (platform === 'telegram') {
    const tg = (window as any).Telegram?.WebApp;
    const id = tg?.initDataUnsafe?.user?.id;
    return id ? id.toString() : null;
  }

  if (platform === 'max') {
    const max = (window as any).WebApp;
    const id = max?.initDataUnsafe?.user?.id;
    return id ? id.toString() : null;
  }

  return null;
}

/**
 * Получает полные данные из мессенджера
 */
export function getMessengerData(): MessengerData {
  const platform = getPlatform();
  const webApp = getWebApp();

  if (!webApp) {
    return {
      platform: 'unknown',
      user: null,
      startParam: null,
      initData: null,
      devicePlatform: null,
    };
  }

  const rawUser = webApp.initDataUnsafe?.user;
  const user: MessengerUser | null = rawUser
    ? {
        id: rawUser.id?.toString() || '',
        first_name: rawUser.first_name,
        last_name: rawUser.last_name,
        username: rawUser.username,
        language_code: rawUser.language_code,
        photo_url: rawUser.photo_url,
      }
    : null;

  return {
    platform,
    user,
    startParam: webApp.initDataUnsafe?.start_param || null,
    initData: webApp.initData || null,
    devicePlatform: webApp.platform || null,
  };
}

/**
 * Вызывает ready() на текущей платформе
 */
export function messengerReady(): void {
  getWebApp()?.ready?.();
}

/**
 * Вызывает expand() на текущей платформе
 */
export function messengerExpand(): void {
  const webApp = getWebApp();
  webApp?.expand?.();
}

/**
 * Вызывает close() на текущей платформе
 */
export function messengerClose(): void {
  getWebApp()?.close?.();
}
