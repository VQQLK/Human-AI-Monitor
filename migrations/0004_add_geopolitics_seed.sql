-- Migration: Add missing geopolitics seed entry for 2026-09-17
-- Reason: Original migration 0001 did not include geopolitics in index_history seed
-- This ensures all 13 axes have historical baseline values

INSERT OR REPLACE INTO index_history (axis, level, date, note, recorded_at)
VALUES ('geopolitics', 0.3, '2026-09-17', 'Seed значение: геополитическое влияние ИИ на старте мониторинга', '2026-09-17T21:51:00Z');
