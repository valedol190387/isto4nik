/**
 * Утилиты для создания ссылок на материалы в админке
 * Используется для быстрого шаринга ссылок на конкретные материалы
 */

const BOT_USERNAME = 'Ploskiy_zhivot_s_Ayunoy_bot';

/**
 * Создание прямой ссылки на материал (без UTM меток)
 */
export function createMaterialShareLink(materialId: string | number): string {
  return `https://t.me/${BOT_USERNAME}/app?startapp=materials_${materialId}`;
}

/**
 * Создание ссылки на материал с UTM метками
 */
export function createMaterialLinkWithUtm(
  materialId: string | number,
  utmSource: string,
  utmMedium?: string,
  utmCampaign?: string
): string {
  const utmParts = [utmSource, utmMedium, utmCampaign].filter(Boolean);
  const utmString = utmParts.length > 0 ? `_${utmParts.join('_')}` : '';
  
  return `https://t.me/${BOT_USERNAME}/app?startapp=materials_${materialId}${utmString}`;
}

/**
 * Копирование ссылки в буфер обмена
 */
export async function copyLinkToClipboard(link: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  // Fallback для старых браузеров
  try {
    const textArea = document.createElement('textarea');
    textArea.value = link;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
}

// Примеры использования:
export const linkExamples = {
  // Простая ссылка на материал
  simple: createMaterialShareLink(64),
  // https://t.me/Ploskiy_zhivot_s_Ayunoy_bot/app?startapp=materials_64
  
  // Ссылка с UTM метками
  withUtm: createMaterialLinkWithUtm(64, 'admin_share', 'manual', 'december2024'),
  // https://t.me/Ploskiy_zhivot_s_Ayunoy_bot/app?startapp=materials_64_admin_share_manual_december2024
};
