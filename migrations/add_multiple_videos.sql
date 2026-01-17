-- Migration: Add support for multiple videos per material
-- Date: 2025-01-17

-- Добавляем колонку videos для хранения массива видео
-- Структура: [{"title": "Название", "embed_code": "<div>...</div>"}]
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

-- Мигрируем существующие данные из video_embed_code в videos
-- Только для записей где video_embed_code не пустой
UPDATE materials
SET videos = jsonb_build_array(
    jsonb_build_object(
        'title', '',
        'embed_code', video_embed_code
    )
)
WHERE video_embed_code IS NOT NULL
  AND video_embed_code != ''
  AND (videos IS NULL OR videos = '[]'::jsonb);

-- Комментарий к колонке
COMMENT ON COLUMN materials.videos IS 'Массив видео: [{title: string, embed_code: string}]';
