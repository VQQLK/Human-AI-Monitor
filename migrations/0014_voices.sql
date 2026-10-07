-- ============================================================
-- Migration 0014: voices table for automatic quote extraction
-- ============================================================
-- Stores quotes from curated speakers (see config/voices.yaml).
-- Populated automatically by Worker when items match criteria:
-- - relevance >= 0.8
-- - axes includes geopolitics OR h2_sovereignty
-- - speaker name in title/summary OR source in sources list
--
-- Uniqueness: UNIQUE(item_hash) prevents duplicate quotes.
-- Translations (quote_ru, quote_zh) added by translate-protocols workflow.
--
-- Rollback: DROP TABLE voices;
-- ============================================================

CREATE TABLE IF NOT EXISTS voices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_hash TEXT NOT NULL,
    speaker TEXT NOT NULL,
    affiliation TEXT,
    category TEXT NOT NULL,
    quote TEXT NOT NULL,
    quote_ru TEXT,
    quote_zh TEXT,
    date TEXT NOT NULL,
    source TEXT NOT NULL,
    relevance REAL NOT NULL,
    axes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(item_hash)
);

CREATE INDEX IF NOT EXISTS idx_voices_date ON voices(date);
CREATE INDEX IF NOT EXISTS idx_voices_category ON voices(category);
