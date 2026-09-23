-- Migration 0008: Add multilingual content columns to protocols table
--
-- Phase 3: Multilingual protocols
-- Three languages: English (content), Russian (content_ru), Chinese (content_zh)
--
-- Design decision: columns in protocols table (Variant A) instead of
-- separate translations table (Variant B).
-- Rationale:
--   - Only 3 languages planned (en, ru, zh)
--   - Simpler queries (no JOIN)
--   - Atomic INSERT (all languages in one statement)
--   - No orphaned translations risk
--   - If 10+ languages needed later, migration to Variant B is trivial
--
-- NULL means "translation not yet generated" (normal for interim protocols
-- or during the gap between English generation and translation).

ALTER TABLE protocols ADD COLUMN content_ru TEXT;
ALTER TABLE protocols ADD COLUMN content_zh TEXT;
