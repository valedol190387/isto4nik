-- Миграция: добавление поддержки Max messenger
-- Добавляем поле max_id для идентификации пользователей из Max
-- Добавляем поле platform для определения откуда пришёл пользователь

-- Поле max_id — ID пользователя в Max messenger (nullable, т.к. не все из Max)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS max_id bigint NULL;

-- Поле platform — откуда пришёл пользователь (telegram / max)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'telegram';

-- Уникальный индекс на max_id (только для ненулевых значений)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_max_id
ON public.users (max_id)
WHERE max_id IS NOT NULL;

-- Индекс для быстрого поиска по платформе
CREATE INDEX IF NOT EXISTS idx_users_platform
ON public.users (platform);
