// ============================================================
// Gap Index — Bayesian formulation
// ============================================================
// See docs/methodology.md §3 and docs/bayesian_framework.md §3.
//
// This module is a thin data-layer over src/services/bayesian-gap.ts:
//   - fetch items from D1
//   - bucket by axis
//   - compute posterior Beta(α, β) per axis
//   - Monte Carlo sampling of the Gap distribution
//
// Backward-compatible: `aiScore`, `humanScore`, `gap`, `interpretation`,
// `axisLevels` are still returned. New fields add uncertainty info.
// ============================================================

import { AI_AXES, HUMAN_AXES, META_AXES } from '../config/axes';
import {
  Signal,
  BetaParams,
  betaParamsFromSignals,
  betaMean,
  sampleBeta,
  sampleGapDistribution,
  summarize,
  interpretGap,
  classifyStability,
  isSignificant,
  DEFAULT_MC_SAMPLES,
  cryptoRng,
} from './bayesian-gap';

// ----- Result type ------------------------------------------
export interface GapResult {
  // Backward-compatible (rounded to 2 decimals, as before)
  aiScore: number;
  humanScore: number;
  gap: number;
  interpretation: string;
  axisLevels: { [axis: string]: number };

  // Full Bayesian information
  axisPosteriors: { [axis: string]: BetaParams };
  axisSummaries: {
    [axis: string]: {
      mean: number;
      std: number;
      ci95Low: number;
      ci95High: number;
      alpha: number;
      beta: number;
      sampleSize: number;
    };
  };
  aiScoreCi95: [number, number];
  humanScoreCi95: [number, number];
  gapMean: number;
  gapCi95: [number, number];
  gapStd: number;
  sampleSize: number;
  statisticallySignificant: boolean;
  stability: 'stable' | 'unstable';
  method: 'bayesian';
}

// ----- Helpers ----------------------------------------------
function round2(x: number): number { return Math.round(x * 100) / 100; }
function round4(x: number): number { return Math.round(x * 10000) / 10000; }

// ----- Main entry point -------------------------------------
export async function computeGapIndex(
  env: Env,
  range: { filterStart: string; filterEnd: string },
  rng: () => number = cryptoRng,
  mcSamples: number = DEFAULT_MC_SAMPLES,
): Promise<GapResult> {
  // 1. Fetch signals from D1
  const items = await env.DB.prepare(
    "SELECT axes, relevance, shift, direction FROM items WHERE date >= ? AND date <= ?"
  ).bind(range.filterStart, range.filterEnd).all();

  // 2. Bucket by axis. Sample size = total (item, axis) pairs.
  const buckets: { [axis: string]: Signal[] } = {};
  let sampleSize = 0;
  for (const it of items.results as any[]) {
    if (!it.axes) continue;
    let axes: string[];
    try { axes = JSON.parse(it.axes); } catch { continue; }
    if (!Array.isArray(axes)) continue;
    const s: Signal = {
      relevance: typeof it.relevance === 'number' ? it.relevance : 0.5,
      shift: String(it.shift ?? 'uncertain'),
      direction: String(it.direction ?? 'uncertain'),
    };
    for (const a of axes) {
      (buckets[a] ??= []).push(s);
      sampleSize++;
    }
  }

  // 3. Posterior Beta(α, β) per axis (all AI + HUMAN + META)
  const allAxes: string[] = [...AI_AXES, ...HUMAN_AXES, ...META_AXES];
  const posteriors: { [axis: string]: BetaParams } = {};
  for (const a of allAxes) {
    posteriors[a] = betaParamsFromSignals(buckets[a] || []);
  }

  // 4. Exact posterior means (point estimates, no clamp needed — always in (0,1))
  const axisLevels: { [axis: string]: number } = {};
  for (const a of allAxes) {
    axisLevels[a] = betaMean(posteriors[a]);
  }

  // 4b. Per-axis posterior summary (mean, std, CI95 via Monte Carlo).
  // Uses the same summarize() as the Gap, so uncertainty quantification
  // is consistent across axes and Gap. Per-axis sample size = number of
  // signals assigned to that axis (item × axis pairs).
  const axisSummaries: {
    [axis: string]: {
      mean: number; std: number; ci95Low: number; ci95High: number;
      alpha: number; beta: number; sampleSize: number;
    };
  } = {};
  for (const a of allAxes) {
    const p = posteriors[a];
    const samples: number[] = new Array(mcSamples);
    for (let i = 0; i < mcSamples; i++) samples[i] = sampleBeta(p.alpha, p.beta, rng);
    const sum = summarize(samples);
    axisSummaries[a] = {
      mean: sum.mean,
      std: sum.std,
      ci95Low: sum.ci95Low,
      ci95High: sum.ci95High,
      alpha: p.alpha,
      beta: p.beta,
      sampleSize: (buckets[a] || []).length,
    };
  }

  // 5. Monte Carlo sampling of the Gap distribution
  const aiParams = AI_AXES.map(a => posteriors[a]);
  const humanParams = HUMAN_AXES.map(a => posteriors[a]);
  const run = sampleGapDistribution(aiParams, humanParams, mcSamples, rng);

  const aiSummary = summarize(run.aiSamples);
  const humanSummary = summarize(run.humanSamples);
  const gapSummary = summarize(run.gapSamples);

  // 6. Interpretation, stability, two-sided significance
  const interpretation = interpretGap(gapSummary.mean);
  const stability = classifyStability(gapSummary.ci95Low, gapSummary.ci95High);
  const significant = isSignificant(gapSummary.ci95Low, gapSummary.ci95High);

  // 7. Return — old fields first for readability, then Bayesian extensions
  return {
    // Backward-compatible (2-decimal rounding, same as before)
    aiScore: round2(aiSummary.mean),
    humanScore: round2(humanSummary.mean),
    gap: round2(gapSummary.mean),
    interpretation,
    axisLevels,

    // Bayesian extensions
    axisPosteriors: posteriors,
    axisSummaries,
    aiScoreCi95: [round4(aiSummary.ci95Low), round4(aiSummary.ci95High)],
    humanScoreCi95: [round4(humanSummary.ci95Low), round4(humanSummary.ci95High)],
    gapMean: round4(gapSummary.mean),
    gapCi95: [round4(gapSummary.ci95Low), round4(gapSummary.ci95High)],
    gapStd: round4(gapSummary.std),
    sampleSize,
    statisticallySignificant: significant,
    stability,
    method: 'bayesian',
  };
}
