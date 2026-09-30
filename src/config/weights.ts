// ============================================================
// Weights for Bayesian Gap Index calculation
// ============================================================
// See docs/methodology.md §3.2
//
// Weights are expert estimates (see methodology.md §6 "Limitations").
// They represent the relative importance of each axis in the aggregate
// AI_score and Human_score. Sum of weights MUST equal 1.0.
//
// Mathematical basis:
//   In the Bayesian formulation, each axis has a Beta posterior
//   distribution. The aggregate score is a WEIGHTED sum of Monte Carlo
//   samples from these posteriors:
//
//     AI_score = Σ(w_i * sample_i),  where Σ(w_i) = 1
//
//   This is mathematically equivalent to taking a weighted mean of
//   the posterior distributions, which is valid because the weighted
//   sum of Beta-distributed random variables is well-defined.
// ============================================================

export const AI_WEIGHTS: Record<string, number> = {
  smd: 0.20,
  itq: 0.15,
  agg: 0.15,
  cycle_velocity: 0.20,
  verification: 0.20,
  hexad: 0.10,
};

export const HUMAN_WEIGHTS: Record<string, number> = {
  h1_agency: 0.20,
  h2_sovereignty: 0.15,
  h3_wellbeing: 0.20,
  h4_equity: 0.15,
  h5_meaning: 0.15,
  h6_democracy: 0.15,
};

// ----- Validation at module load time ------------------------
function validateWeights(name: string, weights: Record<string, number>): void {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(
      `${name} weights sum to ${sum.toFixed(4)}, expected 1.0. ` +
      `Fix src/config/weights.ts so that weights are normalized.`
    );
  }
  for (const [axis, w] of Object.entries(weights)) {
    if (w <= 0 || w >= 1) {
      throw new Error(
        `${name} weight for '${axis}' is ${w}, must be in (0, 1).`
      );
    }
  }
}

validateWeights('AI_WEIGHTS', AI_WEIGHTS);
validateWeights('HUMAN_WEIGHTS', HUMAN_WEIGHTS);
