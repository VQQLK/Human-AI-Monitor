-- ============================================================
-- Migration 0018: instrument passport for gap_history
-- ============================================================
-- Stores the JSON instrument passport produced by computeGapIndex()
-- (axesDeclared, axesInAggregate, axesAtPrior, effectiveVotes,
-- signalUtilization, filters, piVersion). NULL for legacy rows.
--
-- Deploy order: apply THIS migration BEFORE deploying code that writes
-- instrument (INSERT with an unknown column would fail otherwise).
--
-- Note on migrations 0017: two files share the 0017 prefix
-- (0017_cycle_lock.sql, 0017_topic_relevance.sql). wrangler applies
-- them lexicographically, so the order is defined; 0018 is numbered
-- above both as a marker (audit 2026-11-16 §6).
-- ============================================================

ALTER TABLE gap_history ADD COLUMN instrument TEXT;
