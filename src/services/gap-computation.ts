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
import { AI_WEIGHTS, HUMAN_WEIGHTS } from '../config/weights';
import {
  Signal,
  BetaParams,
  betaParamsFromSignals,
  normalizeShift,
  betaMean,
  sampleBeta,
  sampleGapDistribution,
  summarize,
  interpretGap,
  isSignificant,
  DEFAULT_MC_SAMPLES,
  cryptoRng,
  ALPHA_0,
  BETA_0,
  PI_VERSION,
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
  method: 'bayesian';

  // Instrument passport: how THIS week's aggregate was actually computed
  // (audit 2026-11-16 §7). Persisted to gap_history.instrument (JSON).
  instrument: {
    axesDeclared: number;
    axesInAggregate: { ai: number; human: number };
    axesAtPrior: string[];
    axesExcludedUnregistered: string[];
    effectiveVotes: { ai: number; human: number };
    signalUtilization: number;
    filters: { autonomyAxes: string[]; autonomyRule: string };
    piVersion: string;
  };
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
  // Autonomy axes: voice only when the threshold is empirically confirmed (shift=yes).
  // Without shift=yes, the improvement is exogenous (human-driven), not self-modification.
  const AUTONOMY_AXES = new Set(["smd", "agg", "verification"]);
  const UNREGISTERED_AXES = new Set(["agg", "hexad"]);  // family content unfixed — exclude from aggregation
  const posteriors: { [axis: string]: BetaParams } = {};
  for (const a of allAxes) {
    let signalsForAxis = buckets[a] || [];
    if (AUTONOMY_AXES.has(a)) {
      signalsForAxis = signalsForAxis.filter(s => normalizeShift(s.shift) === "yes");
    }
    if (UNREGISTERED_AXES.has(a)) {
      // agg/hexad: content unfixed — exclude from aggregation (no posterior)
      continue;
    }
    posteriors[a] = betaParamsFromSignals(signalsForAxis);
  }

  // 4. Exact posterior means (point estimates, no clamp needed — always in (0,1))
  const axisLevels: { [axis: string]: number } = {};
  for (const a of allAxes) {
    if (UNREGISTERED_AXES.has(a)) continue;  // agg/hexad: not registered
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
    if (UNREGISTERED_AXES.has(a)) continue;  // agg/hexad: not registered
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

  // 5. Monte Carlo sampling of the Gap distribution (WEIGHTED).
  // Weights from src/config/weights.ts are applied to each axis.
  // This matches the documented formula: G = Σ(w_i * a_i) − Σ(w_j * h_j)
  // agg/hexad: exclude from aggregation, renormalize weights over registered axes
  // Prune (audit 2026-11-16, variant (г)): an axis with ZERO net evidence
  // (alpha and beta still exactly at the Jeffreys prior) does not participate
  // in the aggregate; weights renormalize over informed axes only — the same
  // mechanism as UNREGISTERED_AXES, but evidence-driven instead of name-based.
  // Rationale: a prior-only axis at level 0.5 silently drags the side score
  // toward 0.5 (week 2026-11-09: +0.168 of the +0.172 Gap came from smd and
  // verification sitting at prior).
  // Criterion is exact-zero, not a threshold: betaParamsFromSignals adds v
  // only when v != 0, so alpha/beta stay exactly ALPHA_0/BETA_0 iff every
  // signal contributed v = 0 (or was filtered out). No arbitrary cutoff.
  const isInformed = (a: string): boolean => {
    const p = posteriors[a];
    return p.alpha > ALPHA_0 || p.beta > BETA_0;
  };
  const registeredAiAxes = AI_AXES.filter(a => !UNREGISTERED_AXES.has(a) && isInformed(a));
  const registeredHumanAxes = HUMAN_AXES.filter(a => !UNREGISTERED_AXES.has(a) && isInformed(a));
  const axesAtPrior = [...AI_AXES, ...HUMAN_AXES].filter(a => !UNREGISTERED_AXES.has(a) && !isInformed(a));
  // Guard: a side with NO informed axes falls back to the prior itself
  // (level 0.5) instead of dividing by zero; the passport flags it via
  // axesInAggregate == 0.
  const PRIOR_PARAMS: BetaParams = { alpha: ALPHA_0, beta: BETA_0 };
  const sumAiWeights = registeredAiAxes.reduce((s, a) => s + AI_WEIGHTS[a], 0);
  const sumHumanWeights = registeredHumanAxes.reduce((s, a) => s + HUMAN_WEIGHTS[a], 0);
  const aiParams = registeredAiAxes.length ? registeredAiAxes.map(a => posteriors[a]) : [PRIOR_PARAMS];
  const humanParams = registeredHumanAxes.length ? registeredHumanAxes.map(a => posteriors[a]) : [PRIOR_PARAMS];
  const aiWeights = registeredAiAxes.length ? registeredAiAxes.map(a => AI_WEIGHTS[a] / sumAiWeights) : [1];
  const humanWeights = registeredHumanAxes.length ? registeredHumanAxes.map(a => HUMAN_WEIGHTS[a] / sumHumanWeights) : [1];
  const run = sampleGapDistribution(aiParams, humanParams, mcSamples, rng, aiWeights, humanWeights);

  const aiSummary = summarize(run.aiSamples);
  const humanSummary = summarize(run.humanSamples);
  const gapSummary = summarize(run.gapSamples);

  // 5b. Instrument passport (audit 2026-11-16 §7): publish HOW the aggregate
  // was computed, so the Gap is never read without its machinery.
  const netVotes = (a: string): number => {
    const p = posteriors[a];
    return (p.alpha - ALPHA_0) + (p.beta - BETA_0);
  };
  const aiNetVotes = registeredAiAxes.reduce((s, a) => s + netVotes(a), 0);
  const humanNetVotes = registeredHumanAxes.reduce((s, a) => s + netVotes(a), 0);

  // 6. Interpretation and significance
  const interpretation = interpretGap(gapSummary.mean);
  const significant = isSignificant(gapSummary.ci95Low, gapSummary.ci95High);

  // 7. Return — old fields first for readability, then Bayesian extensions
  return {
    // Stored at 4 decimals so Gap = Human − AI holds at display precision (3).
    aiScore: round4(aiSummary.mean),
    humanScore: round4(humanSummary.mean),
    gap: round4(gapSummary.mean),
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
    method: 'bayesian',
    instrument: {
      axesDeclared: AI_AXES.length + HUMAN_AXES.length + META_AXES.length,
      axesInAggregate: { ai: registeredAiAxes.length, human: registeredHumanAxes.length },
      axesAtPrior,
      axesExcludedUnregistered: [...UNREGISTERED_AXES],
      effectiveVotes: { ai: round4(aiNetVotes), human: round4(humanNetVotes) },
      signalUtilization: sampleSize > 0 ? round4((aiNetVotes + humanNetVotes) / sampleSize) : 0,
      filters: {
        autonomyAxes: [...AUTONOMY_AXES],
        autonomyRule: 'AI-side autonomy axes: only signals with shift=yes vote',
      },
      piVersion: PI_VERSION,
    },
  };
}
