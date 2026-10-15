-- Migration 0017: add topic_relevance to items
--
-- `relevance` (existing) = weight in Gap Index (RSI-axis match, computed by LLM).
-- `topic_relevance` (new) = overall significance as AI signal.
--   Used by /voices filter and /items API.
--   Does NOT affect Gap Index (computeGapIndex ignores this column).
--
-- Rollback: ALTER TABLE items DROP COLUMN topic_relevance;

ALTER TABLE items ADD COLUMN topic_relevance REAL;
