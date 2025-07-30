-- Миграция: добавление полей для встроенного видео в таблицу materials
-- Дата: 2025-01-30

-- Добавляем поле is_embedded_video (галочка "встроенное видео")
ALTER TABLE materials 
ADD COLUMN is_embedded_video BOOLEAN NOT NULL DEFAULT FALSE;

-- Добавляем поле video_embed_code (код для вставки видео из Kinescope)
ALTER TABLE materials 
ADD COLUMN video_embed_code TEXT NULL;

-- Добавляем комментарии для документации
COMMENT ON COLUMN materials.is_embedded_video IS 'Флаг указывающий что материал содержит встроенное видео вместо внешней ссылки';
COMMENT ON COLUMN materials.video_embed_code IS 'HTML код для встраивания видео из сервиса Kinescope';

-- Проверяем результат
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'materials' 
AND column_name IN ('is_embedded_video', 'video_embed_code'); 