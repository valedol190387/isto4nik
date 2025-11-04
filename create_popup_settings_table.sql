-- Создание таблицы для настроек попапа
CREATE TABLE IF NOT EXISTS popup_settings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  price_text VARCHAR(255) NOT NULL,
  button_text VARCHAR(100) NOT NULL,
  button_link TEXT NOT NULL,
  image_url TEXT NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'once', 'always', 'disabled')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вставка дефолтных данных (текущий попап)
INSERT INTO popup_settings (title, subtitle, price_text, button_text, button_link, image_url, frequency, is_active)
VALUES (
  'Онлайн-обучение методу «Терапия Души»',
  '28-30 ноября',
  'Получите инструменты для работы с психикой человека',
  'Подробнее',
  'https://terebenin.com/terapiya_dushi?utm_source=zk_istochnik&utm_medium=app_banner&utm_campaign=price_03/11',
  '/images/Popup.webp',
  'daily',
  true
);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_popup_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER popup_settings_updated_at
  BEFORE UPDATE ON popup_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_popup_settings_updated_at();

-- Комментарии к полям
COMMENT ON TABLE popup_settings IS 'Настройки попапа для главной страницы';
COMMENT ON COLUMN popup_settings.title IS 'Заголовок попапа';
COMMENT ON COLUMN popup_settings.subtitle IS 'Подзаголовок (например, даты события)';
COMMENT ON COLUMN popup_settings.price_text IS 'Триггерный текст (например, информация о скидке)';
COMMENT ON COLUMN popup_settings.button_text IS 'Текст на кнопке';
COMMENT ON COLUMN popup_settings.button_link IS 'Ссылка на которую ведет кнопка';
COMMENT ON COLUMN popup_settings.image_url IS 'URL изображения попапа';
COMMENT ON COLUMN popup_settings.frequency IS 'Частота показа: daily (раз в день), once (один раз за все время), always (всегда), disabled (отключен)';
COMMENT ON COLUMN popup_settings.is_active IS 'Активен ли попап';
