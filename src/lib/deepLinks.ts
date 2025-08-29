/**
 * Deep linking для Telegram Mini Apps
 * Отдельный модуль, не трогает существующую UTM систему
 */

import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

export interface DeepLinkResult {
  isDeepLink: boolean;
  type?: 'materials';
  materialId?: string;
}

/**
 * Проверяем, является ли startapp параметр deep link'ом на материал
 * Формат: "materials_64" или "materials_64_utm1_utm2"
 */
export function checkDeepLink(startParam: string | null): DeepLinkResult {
  if (!startParam) {
    return { isDeepLink: false };
  }
  
  const params = startParam.split('_');
  
  // Проверяем формат: "materials_64"
  if (params[0] === 'materials' && params[1] && /^\d+$/.test(params[1])) {
    return {
      isDeepLink: true,
      type: 'materials',
      materialId: params[1]
    };
  }
  
  return { isDeepLink: false };
}

/**
 * Парсинг UTM параметров из startapp
 * Поддерживает форматы:
 * - "utm1_utm2_utm3_utm4_utm5" 
 * - "materials_64_utm1_utm2_utm3_utm4_utm5"
 */
export function parseUtmFromStartParam(startParam: string | null): {
  utm_1?: string;
  utm_2?: string;
  utm_3?: string;
  utm_4?: string;
  utm_5?: string;
} {
  if (!startParam) {
    return {};
  }
  
  const params = startParam.split('_');
  
  // Если это deep link на материал, UTM начинается с 3-го параметра
  const utmStartIndex = params[0] === 'materials' && params[1] ? 2 : 0;
  
  const utmParams: any = {};
  
  // Парсим до 5 UTM параметров
  for (let i = 0; i < 5; i++) {
    const param = params[utmStartIndex + i];
    if (param && param.trim()) {
      utmParams[`utm_${i + 1}`] = param;
    }
  }
  
  return utmParams;
}

/**
 * Получение startapp параметра из Telegram WebApp SDK
 */
export function getStartParam(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Используем retrieveLaunchParams из @telegram-apps/sdk-react
    const launchParams = retrieveLaunchParams();
    const startParam = launchParams.tgWebAppStartParam;
    return startParam || null;
  } catch (error) {
    // Fallback на старый метод
    try {
      const tg = (window as any).Telegram?.WebApp;
      const fallbackParam = tg?.initDataUnsafe?.start_param;
      return fallbackParam || null;
    } catch (fallbackError) {
      return null;
    }
  }
}

/**
 * Создание ссылки на материал для шaring
 * Формат: https://t.me/botname/app?startapp=materials_64
 */
export function createMaterialShareLink(materialId: string | number): string {
  const BOT_USERNAME = 'istochnik_clubbot';
  return `https://t.me/${BOT_USERNAME}/app?startapp=materials_${materialId}`;
}
