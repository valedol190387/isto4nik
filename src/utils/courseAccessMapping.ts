/**
 * Маппинг между старыми section.id (остаются в UI) и новыми ключами БД
 */

// Маппинг: section.id → database_key
export const SECTION_TO_DB_KEY_MAP: Record<string, string> = {
  // Основные курсы
  course_flat_belly: 'stomach',
  course_anti_swelling: 'swelling', 
  course_bloom: 'blossom',
  
  // Дополнительные разделы
  useful: 'flexibility',      // Рельеф и гибкость
  workouts: 'face',          // Для лица
  guides: 'foot',            // Стопы
  motivation: 'bodyflow',    // BodyFlow
  nutrition: 'posture'       // Осанка
};

// Обратный маппинг: database_key → section.id
export const DB_KEY_TO_SECTION_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_TO_DB_KEY_MAP).map(([sectionId, dbKey]) => [dbKey, sectionId])
);

/**
 * Конвертирует section.id в ключ БД
 */
export function sectionIdToDbKey(sectionId: string): string {
  return SECTION_TO_DB_KEY_MAP[sectionId] || sectionId;
}

/**
 * Конвертирует ключ БД в section.id
 */
export function dbKeyToSectionId(dbKey: string): string {
  return DB_KEY_TO_SECTION_MAP[dbKey] || dbKey;
}

/**
 * Проверяет доступ к разделу по section.id, используя данные из БД
 */
export function hasAccessToSection(
  courseAccess: Record<string, boolean> | null, 
  sectionId: string
): boolean {
  if (!courseAccess) return false;
  
  // Конвертируем section.id в ключ БД для проверки
  const dbKey = sectionIdToDbKey(sectionId);
  return courseAccess[dbKey] === true;
}