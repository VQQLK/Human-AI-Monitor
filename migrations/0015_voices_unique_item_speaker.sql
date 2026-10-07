-- ============================================================
-- Migration 0015: voices UNIQUE(item_hash, speaker)
-- ============================================================
-- Previous UNIQUE(item_hash) allowed only one quote per item.
-- When multiple curated speakers appeared in the same item
-- (e.g. "Inside Zuckerberg, Huang's push..."), only the first
-- match was saved. New UNIQUE allows one quote per (item, speaker).
--
-- Context: 2026-10-07, fixed word-boundary extraction + multi-speaker.
--
-- Rollback: revert to 0014 schema (UNIQUE(item_hash) only).
-- ============================================================

DROP TABLE IF EXISTS voices;

CREATE TABLE voices (
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
    UNIQUE(item_hash, speaker)
);

CREATE INDEX IF NOT EXISTS idx_voices_date ON voices(date);
CREATE INDEX IF NOT EXISTS idx_voices_category ON voices(category);
