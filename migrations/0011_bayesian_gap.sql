-- ============================================================
-- Migration 0011: Bayesian Gap Index columns
-- ============================================================
-- Adds CI-95 bounds, std, sample size, significance flag,
-- stability, and method marker to gap_history.
--
-- Existing rows (legacy) get method='point_estimate' (default).
-- New rows from computeGapIndex() get method='bayesian'.
--
-- Note: INSERT OR REPLACE (used in index.ts) will overwrite the
-- legacy row for any re-computed week. This is intentional
-- (see project decision 2026-09-28).
-- ============================================================

ALTER TABLE gap_history ADD COLUMN gap_ci95_low REAL;
ALTER TABLE gap_history ADD COLUMN gap_ci95_high REAL;
ALTER TABLE gap_history ADD COLUMN gap_std REAL;
ALTER TABLE gap_history ADD COLUMN ai_score_ci95_low REAL;
ALTER TABLE gap_history ADD COLUMN ai_score_ci95_high REAL;
ALTER TABLE gap_history ADD COLUMN human_score_ci95_low REAL;
ALTER TABLE gap_history ADD COLUMN human_score_ci95_high REAL;
ALTER TABLE gap_history ADD COLUMN sample_size INTEGER;
ALTER TABLE gap_history ADD COLUMN statistically_significant INTEGER DEFAULT 0;
ALTER TABLE gap_history ADD COLUMN stability TEXT;
ALTER TABLE gap_history ADD COLUMN method TEXT DEFAULT 'point_estimate';
