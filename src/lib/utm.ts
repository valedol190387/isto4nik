/**
 * Утилиты для работы с UTM метками из Telegram start_param
 */

export interface UtmParams {
  utm_1: string | null;
  utm_2: string | null;
  utm_3: string | null;
  utm_4: string | null;
  utm_5: string | null;
}

export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

/**
 * Парсинг UTM параметров из start_param
 * start_param формат: "utm1_utm2_utm3_utm4_utm5"
 * Пример: "instagram_story_january_promo_variant1"
 */
export function parseUtmParams(startParam: string | null): UtmParams {
  if (!startParam) {
    return {
      utm_1: 'auto_registration',
      utm_2: null,
      utm_3: null,
      utm_4: null,
      utm_5: null
    };
  }

  console.log('🏷️ Parsing UTM params from start_param:', startParam);
  
  // Разделяем по "_" и берем максимум 5 параметров
  const params = startParam.split('_').slice(0, 5);
  
  const result: UtmParams = {
    utm_1: params[0] || null,
    utm_2: params[1] || null,
    utm_3: params[2] || null,
    utm_4: params[3] || null,
    utm_5: params[4] || null
  };
  
  console.log('✅ Parsed UTM params:', result);
  return result;
}

/**
 * Извлечение данных пользователя из Telegram WebApp
 */
export function extractTelegramData(): {
  user: TelegramUserData | null;
  startParam: string | null;
} {
  if (typeof window === 'undefined') {
    return { user: null, startParam: null };
  }

  try {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      console.log('❌ No Telegram WebApp object detected');
      return { user: null, startParam: null };
    }

    const user = tg.initDataUnsafe?.user;
    const startParam = tg.initDataUnsafe?.start_param;

    console.log('📱 Telegram data extracted:', {
      userId: user?.id,
      firstName: user?.first_name,
      startParam,
      hasInitData: !!tg.initData
    });

    return {
      user: user || null,
      startParam: startParam || null
    };
  } catch (error) {
    console.error('❌ Error extracting Telegram data:', error);
    return { user: null, startParam: null };
  }
}

/**
 * Проверка валидности Telegram пользователя
 */
export function isValidTelegramUser(user: any): user is TelegramUserData {
  return user && 
         typeof user.id === 'number' && 
         user.id > 0 && 
         typeof user.first_name === 'string' && 
         user.first_name.length > 0;
}

/**
 * Форматирование полного имени пользователя
 */
export function formatUserName(user: TelegramUserData): string {
  return `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`.trim();
} 