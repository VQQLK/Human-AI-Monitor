-- Migration: Translate internal markers (shift, direction) from Russian to English
--
-- Background (September 22, 2026):
-- The classifier prompts originally instructed the LLM to return Russian values
-- for shift ("да"/"нет"/"неопределённо") and direction ("рост"/"падение"/"стабильно"/"неопределённо").
-- The code has been updated to expect English values ("yes"/"no"/"uncertain",
-- "up"/"down"/"stable"/"uncertain"). This migration updates all existing
-- records in the items table to match the new schema.
--
-- Without this migration, all items classified before this change would have
-- Russian shift/direction markers, while new items would have English ones —
-- causing inconsistency in SQL queries, aggregation, and protocol generation.
--
-- Note: reasoning column is NOT migrated here — it requires re-classification
-- via /collect endpoint (done separately in next step for week 2026-09-14).

-- Translate shift values
UPDATE items SET shift = 'yes' WHERE shift = 'да';
UPDATE items SET shift = 'no' WHERE shift = 'нет';
UPDATE items SET shift = 'uncertain' WHERE shift = 'неопределённо';

-- Translate direction values
UPDATE items SET direction = 'up' WHERE direction = 'рост';
UPDATE items SET direction = 'down' WHERE direction = 'падение';
UPDATE items SET direction = 'stable' WHERE direction = 'стабильно';
UPDATE items SET direction = 'uncertain' WHERE direction = 'неопределённо';
