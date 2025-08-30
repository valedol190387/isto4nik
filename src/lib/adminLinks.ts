/**
 * Утилиты для создания ссылок на материалы в админке
 * Используется для быстрого шаринга ссылок на конкретные материалы
 */

const BOT_USERNAME = 'istochnik_clubbot';

/**
 * Создание прямой ссылки на материал (без UTM меток)
 * @param materialUuid - UUID материала для безопасного доступа
 */
export function createMaterialShareLink(materialUuid: string): string {
  return `https://t.me/${BOT_USERNAME}/app?startapp=materials_${materialUuid}`;
}

/**
 * Создание ссылки на материал с UTM метками
 * @param materialUuid - UUID материала для безопасного доступа
 */
export function createMaterialLinkWithUtm(
  materialUuid: string,
  utmSource: string,
  utmMedium?: string,
  utmCampaign?: string
): string {
  const utmParts = [utmSource, utmMedium, utmCampaign].filter(Boolean);
  const utmString = utmParts.length > 0 ? `_${utmParts.join('_')}` : '';
  
  return `https://t.me/${BOT_USERNAME}/app?startapp=materials_${materialUuid}${utmString}`;
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
  simple: createMaterialShareLink('550e8400-e29b-41d4-a716-446655440000'),
  // https://t.me/istochnik_clubbot/app?startapp=materials_550e8400-e29b-41d4-a716-446655440000
  
  // Ссылка с UTM метками
  withUtm: createMaterialLinkWithUtm('550e8400-e29b-41d4-a716-446655440000', 'admin_share', 'manual', 'december2024'),
  // https://t.me/istochnik_clubbot/app?startapp=materials_550e8400-e29b-41d4-a716-446655440000_admin_share_manual_december2024
};
