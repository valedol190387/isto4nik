CREATE TABLE max_bot_logs (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  max_user_id bigint,
  telegram_id bigint,
  chat_id bigint,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_max_bot_logs_created ON max_bot_logs(created_at DESC);
CREATE INDEX idx_max_bot_logs_event ON max_bot_logs(event_type);
