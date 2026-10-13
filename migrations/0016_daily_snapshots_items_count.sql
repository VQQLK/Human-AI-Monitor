-- ============================================================
-- Migration 0016: daily_snapshots.items_count (cumulative)
-- ============================================================
--
-- Adds items_count to daily_snapshots — cumulative items up to
-- snapshot_date, so each daily point shows the count that was
-- actually available at that moment.
--
-- Previously /daily-snapshots endpoint used LEFT JOIN protocols p
-- ON ds.week_start = p.week_start, which showed the week-total for
-- every daily point ("items=335" even on day 1 of the week).
-- Misleading for readers — items appeared flat while sample_size
-- (which is per-snapshot) grew day by day.
--
-- Semantics ("honest observer"):
--   items_count(snapshot) = COUNT(items)
--     WHERE date >= week_start
--       AND date <= MIN(snapshot_date, week_end)
--       AND temporal_status != 'stale_forecast'
--       AND NOT (future_event with event_date < snapshot_date)
--
-- Mirrors countItemsUpTo() in src/index.ts (added same commit).
--
-- Rollback: ALTER TABLE daily_snapshots DROP COLUMN items_count;
-- ============================================================

ALTER TABLE daily_snapshots ADD COLUMN items_count INTEGER;

UPDATE daily_snapshots
SET items_count = (
    SELECT COUNT(*) FROM items
    WHERE date >= daily_snapshots.week_start
      AND date <= MIN(daily_snapshots.snapshot_date, daily_snapshots.week_end)
      AND (temporal_status IS NULL OR temporal_status != 'stale_forecast')
      AND NOT (
          temporal_status = 'future_event'
          AND event_date IS NOT NULL
          AND event_date < daily_snapshots.snapshot_date
      )
);
