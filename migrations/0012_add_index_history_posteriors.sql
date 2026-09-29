-- ============================================================
-- Migration 0012: Bayesian posterior columns for index_history
-- ============================================================
-- Prior to this migration, index_history stored only a point estimate
-- (column `level`) per axis. The full Beta posterior — α, β, its
-- uncertainty (CI-95, std) — was computed inside computeGapIndex(),
-- used to sample the Gap distribution, then discarded before storage.
--
-- bayesian_framework.md §3.2 declares the axis level as a latent
-- quantity with a posterior distribution. This migration makes that
-- declaration true in storage: /axes-history now returns the full
-- posterior per axis (mean + CI-95 + std + α + β + sample size),
-- giving the same treatment the Gap already has in gap_history.
--
-- Per-axis CI/std is computed on the server (empirical quantiles from
-- Monte Carlo, same method as gap_summary), not deferred to clients.
-- This matches the project principle: the server computes, the client
-- reads — no per-consumer re-derivation of uncertainty.
--
-- Existing rows (pre-v2.0): NULL in all new columns. That is
-- intentional and honest — those were point estimates without a
-- posterior. /axes-history returns NULLs verbatim.
-- ============================================================

ALTER TABLE index_history ADD COLUMN level_ci95_low REAL;
ALTER TABLE index_history ADD COLUMN level_ci95_high REAL;
ALTER TABLE index_history ADD COLUMN level_std REAL;
ALTER TABLE index_history ADD COLUMN alpha REAL;
ALTER TABLE index_history ADD COLUMN beta REAL;
ALTER TABLE index_history ADD COLUMN sample_size INTEGER;
