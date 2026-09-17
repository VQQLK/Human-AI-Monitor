-- ============================================================
-- Human–AI Monitor — начальная схема базы данных (D1)
-- Миграция: 0001_initial_schema
-- Дата: 17 сентября 2026
-- ============================================================
-- Cloudflare D1 (SQLite) — serverless SQL.
-- Применение:
--   Локально: npx wrangler d1 migrations apply human-ai-monitor-db 
--local
--   Прод:     npx wrangler d1 migrations apply human-ai-monitor-db 
--remote
-- ============================================================

-- ============================================================
-- Таблица 1: items — классифицированные сигналы
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
    hash          TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    summary       TEXT,
    url           TEXT NOT NULL,
    source        TEXT NOT NULL,
    date          TEXT NOT NULL,
    lang          TEXT DEFAULT 'en',
    axes          TEXT,              -- JSON-массив осей
    relevance     REAL DEFAULT 0.0,  -- 0.0–1.0
    shift         TEXT DEFAULT 'неопределённо',
    direction     TEXT DEFAULT 'неопределённо',
    reasoning     TEXT,
    collected_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_date       ON items(date);
CREATE INDEX IF NOT EXISTS idx_items_source     ON items(source);
CREATE INDEX IF NOT EXISTS idx_items_shift      ON items(shift);
CREATE INDEX IF NOT EXISTS idx_items_relevance  ON items(relevance);

-- ============================================================
-- Таблица 2: protocols — метаданные еженедельных протоколов
-- ============================================================
CREATE TABLE IF NOT EXISTS protocols (
    week_start    TEXT PRIMARY KEY,     -- YYYY-MM-DD
    week_end      TEXT NOT NULL,        -- YYYY-MM-DD
    ai_score      REAL,
    human_score   REAL,
    gap_index     REAL,
    items_count   INTEGER DEFAULT 0,
    shifts_count  INTEGER DEFAULT 0,
    path          TEXT,
    generated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_protocols_week_end ON protocols(week_end);

-- ============================================================
-- Таблица 3: gap_history — динамика Gap Index
-- ============================================================
CREATE TABLE IF NOT EXISTS gap_history (
    week_start    TEXT PRIMARY KEY,
    ai_score      REAL,
    human_score   REAL,
    gap           REAL,
    interpretation TEXT,
    recorded_at   TEXT NOT NULL
);

-- ============================================================
-- Таблица 4: index_history — значения 12 осей по датам
-- ============================================================
CREATE TABLE IF NOT EXISTS index_history (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    axis          TEXT NOT NULL,
    level         REAL NOT NULL,
    date          TEXT NOT NULL,
    note          TEXT,
    recorded_at   TEXT NOT NULL,
    UNIQUE(axis, date)
);

CREATE INDEX IF NOT EXISTS idx_index_history_axis ON index_history(axis);
CREATE INDEX IF NOT EXISTS idx_index_history_date ON index_history(date);

-- ============================================================
-- Начальные данные: протокол 7–17.09.2026
-- ============================================================
INSERT OR IGNORE INTO protocols
    (week_start, week_end, ai_score, human_score, gap_index, items_count, 
shifts_count, path, generated_at)
VALUES
    ('2026-09-07', '2026-09-17', 0.44, 0.57, -0.13, 15, 0,
     'data/protocols/2026-09-07_2026-09-17.md',
     '2026-09-17T21:51:00Z');

INSERT OR IGNORE INTO gap_history
    (week_start, ai_score, human_score, gap, interpretation, recorded_at)
VALUES
    ('2026-09-07', 0.44, 0.57, -0.13, 'Симметричное развитие', 
'2026-09-17T21:51:00Z');

-- ============================================================
-- Начальные значения уровней 12 осей на 17.09.2026
-- ============================================================
INSERT OR IGNORE INTO index_history (axis, level, date, note, recorded_at) 
VALUES
    ('smd',           0.30, '2026-09-17', 'L1–L2 большинство; L3 у Astra', 
'2026-09-17T21:51:00Z'),
    ('itq',           0.25, '2026-09-17', 'Compute Plateau', 
'2026-09-17T21:51:00Z'),
    ('agg',           0.20, '2026-09-17', 'Цели заданы промптом', 
'2026-09-17T21:51:00Z'),
    ('cycle_velocity',0.40, '2026-09-17', '~4 мес. doubling', 
'2026-09-17T21:51:00Z'),
    ('verification',  0.35, '2026-09-17', 'Человек — последний слой', 
'2026-09-17T21:51:00Z'),
    ('hexad',         0.05, '2026-09-17', 'Не развёрнут', 
'2026-09-17T21:51:00Z'),
    ('h1_agency',     0.55, '2026-09-17', 'Стабильно', 
'2026-09-17T21:51:00Z'),
    ('h2_sovereignty',0.50, '2026-09-17', 'Признаки эрозии', 
'2026-09-17T21:51:00Z'),
    ('h3_wellbeing',  0.45, '2026-09-17', 'Рост одиночества', 
'2026-09-17T21:51:00Z'),
    ('h4_equity',     0.40, '2026-09-17', 'Compute divide растёт', 
'2026-09-17T21:51:00Z'),
    ('h5_meaning',    0.50, '2026-09-17', 'Стабильно; признаки эрозии', 
'2026-09-17T21:51:00Z'),
    ('h6_democracy',  0.45, '2026-09-17', 'Снижение доверия', 
'2026-09-17T21:51:00Z');
