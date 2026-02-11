-- Таблица для логирования просмотров материалов и запуска видео
-- Создана 2026-02-11

CREATE TABLE IF NOT EXISTS public.material_view_logs (
  id bigserial PRIMARY KEY,
  telegram_id bigint NOT NULL,
  material_id bigint NOT NULL,
  material_title text,            -- название материала (денормализовано для удобства)
  video_index integer,            -- индекс видео в массиве videos (для event_type = 'video_view')
  video_title text,               -- название видео (для удобства выборок)
  event_type text NOT NULL CHECK (event_type IN ('lesson_open', 'video_view')),
  username text,                  -- telegram username пользователя
  utm_1 text,                    -- UTM-метки из таблицы users
  utm_2 text,
  utm_3 text,
  utm_4 text,
  utm_5 text,
  created_at timestamptz DEFAULT now()
);

-- Индексы для быстрых выборок
CREATE INDEX idx_mvl_telegram_id ON public.material_view_logs(telegram_id);
CREATE INDEX idx_mvl_material_id ON public.material_view_logs(material_id);
CREATE INDEX idx_mvl_event_type ON public.material_view_logs(event_type);
CREATE INDEX idx_mvl_created_at ON public.material_view_logs(created_at);

COMMENT ON TABLE public.material_view_logs IS 'Логи просмотров материалов и видео пользователями';

-- RLS
ALTER TABLE public.material_view_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all" ON public.material_view_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for all" ON public.material_view_logs
  FOR SELECT USING (true);
