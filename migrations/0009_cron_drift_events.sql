-- Таблица событий дрифта крон-батчей.
-- Заполняется, если статические числа в CRON_BATCH_CONFIG
-- перестают соответствовать SOURCES.length (см. дрифт-гард в
-- CRON_BATCH_CONFIG / scheduled handler).
CREATE TABLE IF NOT EXISTS cron_drift_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cron_expr TEXT NOT NULL,          -- cron expression, где обнаружен дрифт
    expected_offset INTEGER,           -- ожидаемый offset по конфигу
    computed_offset INTEGER,           -- фактически вычисленный offset
    expected_limit INTEGER,            -- ожидаемый limit по конфигу
    computed_limit INTEGER,            -- фактически вычисленный limit
    sources_count INTEGER NOT NULL,    -- количество источников на момент дрифта
    detected_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT                      -- дополнительные данные (опционально)
);

CREATE INDEX IF NOT EXISTS idx_cron_drift_detected_at ON cron_drift_events(detected_at);
