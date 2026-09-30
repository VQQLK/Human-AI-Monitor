// ============================================================
// Bayesian Gap Index — pure math module
// ============================================================
// No DB, no env. Deterministic given an injectable rng.
//
// Implements (see docs/bayesian_framework.md §3):
//   1. Beta posterior for each axis level (§3.2)
//   2. Voice table pi(sigma, d) (§3.4)
//   3. Monte Carlo sampling of the Gap distribution (§3.3)
//   4. Two-sided significance test: CI95 does NOT contain 0
//   5. Stability: CI95 lies within a single interpretation band
// ============================================================

// ----- Voice table pi(sigma, d) in [-1, +1] -----------------
// From bayesian_framework.md §3.4.
export const PI_TABLE: Record<string, Record<string, number>> = {
  yes:       { up: +1.0, stable: +0.5, down: -1.0, uncertain: +0.5 },
  no:        { up: +0.3, stable:  0.0, down: -0.3, uncertain:  0.0 },
  uncertain: { up:  0.0, stable:  0.0, down:  0.0, uncertain:  0.0 },
};

// ----- Jeffreys prior (non-informative) ---------------------
export const ALPHA_0 = 0.5;
export const BETA_0 = 0.5;

// ----- Default Monte Carlo size -----------------------------
export const DEFAULT_MC_SAMPLES = 10000;

// ----- Signal shape -----------------------------------------
export interface Signal {
  relevance: number;   // [0, 1]
  shift: string;       // 'yes' | 'no' | 'uncertain' (+ legacy Russian)
  direction: string;   // 'up' | 'down' | 'stable' | 'uncertain' (+ legacy)
}

export interface BetaParams {
  alpha: number;
  beta: number;
}

// ----- Legacy key normalization ------------------------------
// Old rows may use Russian markers; migrated by 0006 but be safe.
function normalizeShift(s: string): string {
  if (s === '\u0434\u0430') return 'yes';            // да
  if (s === '\u043d\u0435\u0442') return 'no';       // нет
  if (s === '\u043d\u0435\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u043e') return 'uncertain';
  return s;
}
function normalizeDirection(d: string): string {
  if (d === '\u0440\u043e\u0441\u0442') return 'up';        // рост
  if (d === '\u043f\u0430\u0434\u0435\u043d\u0438\u0435') return 'down'; // падение
  if (d === '\u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e') return 'stable';
  if (d === '\u043d\u0435\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u043e') return 'uncertain';
  return d;
}

// ----- Deterministic PRNG for tests --------------------------
// mulberry32: fast, well-distributed, reproducible from a seed.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----- Crypto-based RNG for production ----------------------
export function cryptoRng(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

// ----- Deterministic seed from a string ----------------------
// FNV-1a hash. Used in production so that a given week_start
// always produces the same Monte Carlo run (bit-for-bit reproducible).
export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ----- Gamma sampler (Marsaglia-Tsang with boost) ------------
// For alpha < 1 use the boost identity:
//   Gamma(alpha) = Gamma(alpha + 1) * U^(1/alpha),  U ~ Uniform(0,1)
// For alpha >= 1, Marsaglia-Tsang rejection sampling.
export function sampleGamma(alpha: number, rng: () => number): number {
  if (alpha < 1) {
    const u = Math.max(rng(), Number.MIN_VALUE);
    return sampleGamma(alpha + 1, rng) * Math.pow(u, 1 / alpha);
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (let iter = 0; iter < 1000; iter++) {
    let x: number;
    let v: number;
    do {
      const u1 = Math.max(rng(), Number.MIN_VALUE);
      const u2 = rng();
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
  // Rejection loop did not converge within 1000 iterations.
  // Probability under correct implementation: ~0.
  return d;
}

// ----- Beta sampler (two Gammas) -----------------------------
export function sampleBeta(a: number, b: number, rng: () => number): number {
  const x = sampleGamma(a, rng);
  const y = sampleGamma(b, rng);
  const s = x + y;
  return s > 0 ? x / s : 0.5;
}

// ----- Posterior Beta params from signals for one axis -------
// alpha = alpha_0 + sum(v_s^+),  beta = beta_0 + sum(v_s^-)
// where v_s = r_s * pi(sigma_s, d_s).
export function betaParamsFromSignals(signals: Signal[]): BetaParams {
  let alpha = ALPHA_0;
  let beta = BETA_0;
  for (const s of signals) {
    const shift = normalizeShift(s.shift);
    const direction = normalizeDirection(s.direction);
    const pi = (PI_TABLE[shift] && PI_TABLE[shift][direction]) ?? 0;
    const rel = typeof s.relevance === 'number' && !isNaN(s.relevance) ? s.relevance : 0.5;
    const v = rel * pi;
    if (v > 0) alpha += v;
    else if (v < 0) beta += -v;
  }
  return { alpha, beta };
}

// ----- Exact posterior mean = alpha / (alpha + beta) ---------
export function betaMean(p: BetaParams): number {
  return p.alpha / (p.alpha + p.beta);
}

// ----- Exact posterior variance ------------------------------
export function betaVariance(p: BetaParams): number {
  const s = p.alpha + p.beta;
  return (p.alpha * p.beta) / (s * s * (s + 1));
}

// ----- Monte Carlo sampling for AI, Human, and Gap -----------
export interface MCRun {
  aiSamples: number[];
  humanSamples: number[];
  gapSamples: number[];
}

export function sampleGapDistribution(
  aiParams: BetaParams[],
  humanParams: BetaParams[],
  M: number,
  rng: () => number,
  aiWeights?: number[],
  humanWeights?: number[]
): MCRun {
  const nAI = aiParams.length;
  const nH = humanParams.length;

  // Weights are optional for backward compatibility.
  // If not provided, fall back to equal weights (uniform mean).
  // When provided, weights MUST be normalized (sum to 1.0).
  const wAI = aiWeights ?? aiParams.map(() => 1 / nAI);
  const wH = humanWeights ?? humanParams.map(() => 1 / nH);

  // Defensive normalization: guard against non-normalized input.
  const sumAI = wAI.reduce((a, b) => a + b, 0);
  const sumH = wH.reduce((a, b) => a + b, 0);

  const aiSamples = new Array<number>(M);
  const humanSamples = new Array<number>(M);
  const gapSamples = new Array<number>(M);

  for (let k = 0; k < M; k++) {
    let ai = 0;
    for (let i = 0; i < nAI; i++) {
      ai += wAI[i] * sampleBeta(aiParams[i].alpha, aiParams[i].beta, rng);
    }
    ai /= sumAI;

    let human = 0;
    for (let j = 0; j < nH; j++) {
      human += wH[j] * sampleBeta(humanParams[j].alpha, humanParams[j].beta, rng);
    }
    human /= sumH;

    aiSamples[k] = ai;
    humanSamples[k] = human;
    gapSamples[k] = ai - human;
  }
  return { aiSamples, humanSamples, gapSamples };
}

// ----- Summary of a sample -----------------------------------
export interface Summary {
  mean: number;
  std: number;
  ci95Low: number;
  ci95High: number;
}

// Empirical equal-tailed 95% CI from Monte Carlo samples.
// Uses empirical quantiles (not normal approximation) because
// Beta(0.5, 0.5) is U-shaped and normal-approx would be wrong.
export function summarize(samples: number[]): Summary {
  const n = samples.length;
  if (n === 0) return { mean: 0, std: 0, ci95Low: 0, ci95High: 0 };
  let s = 0;
  for (let i = 0; i < n; i++) s += samples[i];
  const mean = s / n;
  let sq = 0;
  for (let i = 0; i < n; i++) {
    const d = samples[i] - mean;
    sq += d * d;
  }
  const std = Math.sqrt(sq / n);
  const sorted = samples.slice().sort((a, b) => a - b);
  const loIdx = Math.floor(0.025 * n);
  const hiIdx = Math.min(n - 1, Math.floor(0.975 * n));
  return { mean, std, ci95Low: sorted[loIdx], ci95High: sorted[hiIdx] };
}

// ----- Interpretation band -----------------------------------
// Matches methodology.md §3.3 boundaries:
//   G < -0.3 -> significant Humanity
//   -0.3 <= G < -0.1 -> moderate Humanity
//   -0.1 <= G <= 0.1 -> symmetric
//   0.1 < G <= 0.3 -> moderate AI
//   G > 0.3 -> significant AI
export function interpretGap(mean: number): string {
  if (mean < -0.3) return 'Humanity is significantly ahead';
  if (mean < -0.1) return 'Humanity is ahead';
  if (mean > 0.3) return 'AI is significantly ahead';
  if (mean > 0.1) return 'AI is ahead';
  return 'Symmetric development';
}

// ----- Stability of interpretation ---------------------------
// "stable"   = both endpoints of CI95 fall in the same band
// "unstable" = CI95 crosses a band boundary
export function classifyStability(ci95Low: number, ci95High: number): 'stable' | 'unstable' {
  return interpretGap(ci95Low) === interpretGap(ci95High) ? 'stable' : 'unstable';
}

// ----- Two-sided significance --------------------------------
// CI95 does NOT contain zero.
export function isSignificant(ci95Low: number, ci95High: number): boolean {
  return ci95Low > 0 || ci95High < 0;
}
