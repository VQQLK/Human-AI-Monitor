-- Migration: Fix duplicate week entries caused by Sunday→Monday naming change
--
-- Background (September 22, 2026):
-- - Before commit 1dac276: getWeekRange() returned Sunday as `start`
--   (protocol identifier). For week 14-20 Sep, `start` was "2026-09-20".
-- - After commit 1dac276 and 6ff8a37: scheme changed to Monday-based.
--   For the same week, `start` became "2026-09-14" (Monday).
--
-- Root cause of duplicates:
-- index_history has UNIQUE(axis, date), not UNIQUE(axis, week_identity).
-- Because the same week got two different `date` values under the two
-- schemes, INSERT OR REPLACE treated them as distinct rows — so the
-- same smd=0.6473 value appeared twice, under two different keys.
--
-- Additionally, before the /generate guard (commit 6ff8a37), a manual
-- call to /generate?week=0 wrote incomplete data for the still-open
-- week 21-27 Sep (h1_agency=0, hexad=0 — artifact of only 55 items
-- collected vs ~120 for a full week).
--
-- Resolution:
-- - DELETE rows using the obsolete Sunday-based identifier (2026-09-20)
-- - DELETE rows for the still-open week (2026-09-21 Monday + 2026-09-27 Sunday)
-- - DELETE incomplete gap_history entry for still-open week
--
-- Canonical scheme (going forward):
-- - week_start = Monday of the week (ISO 8601)
-- - Cron: Monday 06:00-06:45 UTC, always calls generateAndSaveProtocol(env, 1)
-- - /generate: refuses offset<1 with HTTP 400
-- - generateAndSaveProtocol() itself: throws if offsetWeeks<1

-- Index history: remove Sunday-scheme duplicate of week 14-20 Sep
DELETE FROM index_history WHERE date = '2026-09-20';

-- Index history: remove still-open week (both Monday and Sunday identifiers)
DELETE FROM index_history WHERE date IN ('2026-09-21', '2026-09-27');

-- Gap history: remove incomplete entry for still-open week
DELETE FROM gap_history WHERE week_start = '2026-09-21';
