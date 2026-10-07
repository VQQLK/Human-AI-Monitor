-- ============================================================
-- Migration 0013: daily_snapshots table
-- ============================================================
-- Stores one row per calendar day of protocol generation.
-- Enables daily trajectory visualization, complementing the
-- weekly FINAL points in gap_history.
--
-- Uniqueness: PK = snapshot_date (UTC date).
-- INSERT OR REPLACE upserts — idempotent on repeated runs.
--
-- Written by generateInterimProtocol (is_interim = 1, Tue-Sun)
-- and generateAndSaveProtocol (is_interim = 0, Mon FINAL).
-- Code change lands in the same commit as this migration.
--
-- Rollback: DROP TABLE daily_snapshots;
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_snapshots (
    snapshot_date  TEXT PRIMARY KEY,
    week_start     TEXT NOT NULL,
    week_end       TEXT NOT NULL,
    ai_score       REAL,
    human_score    REAL,
    gap            REAL,
    gap_ci95_low   REAL,
    gap_ci95_high  REAL,
    gap_std        REAL,
    sample_size    INTEGER,
    is_interim     INTEGER NOT NULL DEFAULT 1,
    method         TEXT DEFAULT 'bayesian',
    recorded_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_snapshots_week
    ON daily_snapshots(week_start);
