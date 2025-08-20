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
  
  console.log('🔗 Checking deep link:', startParam);
  
  const params = startParam.split('_');
  
  // Проверяем формат: "materials_64"
  if (params[0] === 'materials' && params[1] && /^\d+$/.test(params[1])) {
    console.log('✅ Deep link detected - material:', params[1]);
    
    return {
      isDeepLink: true,
      type: 'materials',
      materialId: params[1]
    };
  }
  
  console.log('📝 Not a deep link, regular UTM');
  return { isDeepLink: false };
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
    
    console.log('📱 Got tgWebAppStartParam:', startParam);
    return startParam || null;
  } catch (error) {
    console.error('❌ Error getting start_param:', error);
    
    // Fallback на старый метод
    try {
      const tg = (window as any).Telegram?.WebApp;
      const fallbackParam = tg?.initDataUnsafe?.start_param;
      console.log('🔄 Fallback start_param:', fallbackParam);
      return fallbackParam || null;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      return null;
    }
  }
}

/**
 * Создание ссылки на материал для шaring
 * Формат: https://t.me/botname/app?startapp=materials_64
 */
export function createMaterialShareLink(materialId: string | number): string {
  const BOT_USERNAME = 'Ploskiy_zhivot_s_Ayunoy_bot';
  return `https://t.me/${BOT_USERNAME}/app?startapp=materials_${materialId}`;
}
