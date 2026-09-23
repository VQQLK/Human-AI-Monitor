-- Migration 0007: Add is_interim column to protocols table
-- 
-- Architecture v2: two protocols per week
-- - Monday 13:45 UTC: FINAL protocol for previous week (is_interim = 0)
-- - Friday 13:45 UTC: INTERIM protocol for current week (is_interim = 1)

ALTER TABLE protocols ADD COLUMN is_interim INTEGER NOT NULL DEFAULT 0;
UPDATE protocols SET is_interim = 0 WHERE is_interim IS NULL;
