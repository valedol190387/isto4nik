/**
 * Deep linking для Telegram Mini Apps
 * Отдельный модуль, не трогает существующую UTM систему
 */

import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

export interface DeepLinkResult {
  isDeepLink: boolean;
  type?: 'materials' | 'onboarding' | 'newonboarding';
  materialId?: string;
}

/**
 * Проверяем, является ли startapp параметр deep link'ом на материал
 * Поддерживаемые форматы: 
 * - "materials_UUID" (новый безопасный формат)
 * - "materials_UUID_utm1_utm2" (с UTM метками)
 * - "materials_64" (старый формат для обратной совместимости)
 */
export function checkDeepLink(startParam: string | null): DeepLinkResult {
  if (!startParam) {
    return { isDeepLink: false };
  }
  
  // Онбординг
  if (startParam === 'onboarding') {
    return { isDeepLink: true, type: 'onboarding' };
  }

  // Новый онбординг (воронка start-guide) — с возможными UTM после newonboarding_
  if (startParam === 'newonboarding' || startParam.startsWith('newonboarding_')) {
    return { isDeepLink: true, type: 'newonboarding' };
  }

  const params = startParam.split('_');

  if (params[0] === 'materials' && params[1]) {
    // Проверяем UUID формат (8-4-4-4-12)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Или числовой ID (для обратной совместимости)
    const numericRegex = /^\d+$/;
    
    if (uuidRegex.test(params[1]) || numericRegex.test(params[1])) {
      return {
        isDeepLink: true,
        type: 'materials',
        materialId: params[1]
      };
    }
  }
  
  return { isDeepLink: false };
}

/**
 * Парсинг UTM параметров из startapp
 * Поддерживает форматы:
 * - "utm1_utm2_utm3_utm4_utm5" 
 * - "materials_UUID_utm1_utm2_utm3_utm4_utm5"
 * - "materials_64_utm1_utm2_utm3_utm4_utm5" (старый формат)
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
  
  // Если это deep link, UTM начинается после префикса
  // materials_UUID_utm1_utm2... → skip 2
  // newonboarding_utm1_utm2... → skip 1
  // onboarding_utm1_utm2... → skip 1
  let utmStartIndex = 0;
  if (params[0] === 'materials' && params[1]) {
    utmStartIndex = 2;
  } else if (params[0] === 'newonboarding' || params[0] === 'onboarding') {
    utmStartIndex = 1;
  }
  
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
 * Получение startapp параметра из Telegram WebApp SDK или Max SDK
 */
export function getStartParam(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // 1. Telegram SDK — retrieveLaunchParams
  try {
    const launchParams = retrieveLaunchParams();
    if (launchParams.tgWebAppStartParam) {
      return launchParams.tgWebAppStartParam;
    }
  } catch (error) {
    // SDK не инициализирован — пробуем fallback
  }

  // 2. Fallback — Max SDK или Telegram WebApp напрямую
  try {
    const webApp = (window as any).WebApp || (window as any).Telegram?.WebApp;
    return webApp?.initDataUnsafe?.start_param || null;
  } catch {
    return null;
  }
}

// УДАЛЕНО: дублирующаяся функция createMaterialShareLink
// Используйте функцию из @/lib/adminLinks вместо этой
