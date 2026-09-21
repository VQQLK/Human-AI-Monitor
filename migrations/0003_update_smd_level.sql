-- Migration: Update SMD level from 0.30 to 0.45
-- Reason: Anthropic reached AL4 (26% AI-led tasks, >90% AL3 collaboration)
-- Reference: Anthropic R&D Automation Index (September 2026)
-- Note: First system with sustained L4; threshold remains "≥2 systems"
-- Related: CHANGELOG [0.9.4] "Current SMD level: 0.30 → 0.45"

UPDATE index_history
SET
    level = 0.45,
    note = 'L1–L3 распространено; Anthropic достиг устойчивого AL4 (26% AI-led, >90% AL3). Первый sustained L4.',
    recorded_at = CURRENT_TIMESTAMP
WHERE axis = 'smd'
  AND date = '2026-09-17';

-- Verify the update
-- SELECT axis, level, date, note, recorded_at FROM index_history WHERE axis = 'smd';
