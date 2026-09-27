-- Добавление поля temporal_status для классификации событий по времени
-- past_event: событие уже произошло
-- future_event: событие запланировано на будущее
-- ongoing: процесс/тренд в процессе
-- static_fact: вневременной факт

ALTER TABLE items ADD COLUMN temporal_status TEXT DEFAULT 'static_fact';
ALTER TABLE items ADD COLUMN event_date TEXT;

CREATE INDEX IF NOT EXISTS idx_items_temporal ON items(temporal_status);
