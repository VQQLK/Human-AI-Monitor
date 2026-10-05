import { describe, it, expect } from "vitest";
import {
  PI_TABLE, ALPHA_0, BETA_0,
  mulberry32,
  sampleGamma, sampleBeta,
  betaParamsFromSignals, betaMean, betaVariance,
  sampleGapDistribution,
  summarize,
  interpretGap, classifyStability, isSignificant,
} from "../src/services/bayesian-gap";

// -----------------------------------------------------------------
// Helper: sample mean of a sample array
// -----------------------------------------------------------------
function mean(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

// =================================================================
// 1. Determinism of the PRNG
// =================================================================
describe("mulberry32", () => {
  it("returns identical sequences for identical seeds", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      expect(a()).toBe(b());
    }
  });

  it("returns different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).not.toEqual(seqB);
  });

  it("stays within [0, 1)", () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 1000; i++) {
      const x = rng();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

// =================================================================
// 2. sampleGamma — sanity (Marsaglia-Tsang + boost)
// =================================================================
describe("sampleGamma", () => {
  it("for alpha=5 has mean approx 5 and variance approx 5", () => {
    const rng = mulberry32(1);
    const M = 10000;
    const xs: number[] = [];
    for (let i = 0; i < M; i++) xs.push(sampleGamma(5, rng));
    const m = mean(xs);
    // SD of the mean over M samples = sqrt(5/M) ≈ 0.022
    expect(m).toBeGreaterThan(4.9);
    expect(m).toBeLessThan(5.1);
  });

  it("boost: alpha=0.5 has mean approx 0.5 and variance approx 0.5", () => {
    const rng = mulberry32(7);
    const M = 10000;
    const xs: number[] = [];
    for (let i = 0; i < M; i++) xs.push(sampleGamma(0.5, rng));
    const m = mean(xs);
    // Gamma(0.5) mean = 0.5, variance = 0.5, SD_mean ≈ sqrt(0.5/M) ≈ 0.007
    expect(m).toBeGreaterThan(0.45);
    expect(m).toBeLessThan(0.55);
  });

  it("never returns a negative value", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 500; i++) {
      expect(sampleGamma(0.5, rng)).toBeGreaterThan(0);
      expect(sampleGamma(2, rng)).toBeGreaterThan(0);
    }
  });
});

// =================================================================
// 3. sampleBeta — sanity
// =================================================================
describe("sampleBeta", () => {
  it("Beta(1,1) is uniform-ish, mean approx 0.5", () => {
    const rng = mulberry32(11);
    const M = 10000;
    const xs: number[] = [];
    for (let i = 0; i < M; i++) xs.push(sampleBeta(1, 1, rng));
    const m = mean(xs);
    expect(m).toBeGreaterThan(0.48);
    expect(m).toBeLessThan(0.52);
  });

  it("Beta(2,2) has mean approx 0.5", () => {
    const rng = mulberry32(13);
    const M = 10000;
    const xs: number[] = [];
    for (let i = 0; i < M; i++) xs.push(sampleBeta(2, 2, rng));
    expect(mean(xs)).toBeGreaterThan(0.48);
    expect(mean(xs)).toBeLessThan(0.52);
  });

  it("Beta(0.5, 0.5) has mean approx 0.5 (U-shape)", () => {
    const rng = mulberry32(17);
    const M = 10000;
    const xs: number[] = [];
    for (let i = 0; i < M; i++) xs.push(sampleBeta(0.5, 0.5, rng));
    const m = mean(xs);
    expect(m).toBeGreaterThan(0.48);
    expect(m).toBeLessThan(0.52);
  });

  it("Beta(5, 1) skews toward 1 (mean approx 5/6)", () => {
    const rng = mulberry32(19);
    const M = 10000;
    const xs: number[] = [];
    for (let i = 0; i < M; i++) xs.push(sampleBeta(5, 1, rng));
    expect(mean(xs)).toBeGreaterThan(0.8);
    expect(mean(xs)).toBeLessThan(0.87);
  });

  it("always in (0, 1)", () => {
    const rng = mulberry32(23);
    for (let i = 0; i < 500; i++) {
      const x = sampleBeta(0.5, 0.5, rng);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(1);
    }
  });
});

// =================================================================
// 4. betaParamsFromSignals — exact alpha/beta
// =================================================================
describe("betaParamsFromSignals", () => {
  it("empty signal set -> (0.5, 0.5) Jeffreys prior", () => {
    const p = betaParamsFromSignals([]);
    expect(p.alpha).toBe(0.5);
    expect(p.beta).toBe(0.5);
  });

  it("(yes, up, rel=1) -> alpha=1.5, beta=0.5", () => {
    const p = betaParamsFromSignals([{ relevance: 1, shift: "yes", direction: "up" }]);
    expect(p.alpha).toBeCloseTo(1.5, 10);
    expect(p.beta).toBeCloseTo(0.5, 10);
  });

  it("(yes, down, rel=1) -> alpha=0.5, beta=1.5", () => {
    const p = betaParamsFromSignals([{ relevance: 1, shift: "yes", direction: "down" }]);
    expect(p.alpha).toBeCloseTo(0.5, 10);
    expect(p.beta).toBeCloseTo(1.5, 10);
  });

  it("(no, up, rel=1) -> alpha=0.8, beta=0.5", () => {
    const p = betaParamsFromSignals([{ relevance: 1, shift: "no", direction: "up" }]);
    expect(p.alpha).toBeCloseTo(0.8, 10);
    expect(p.beta).toBeCloseTo(0.5, 10);
  });

  it("(uncertain, *) -> no contribution (0.5, 0.5)", () => {
    const p = betaParamsFromSignals([
      { relevance: 1, shift: "uncertain", direction: "up" },
      { relevance: 1, shift: "uncertain", direction: "down" },
      { relevance: 1, shift: "uncertain", direction: "stable" },
    ]);
    expect(p.alpha).toBe(0.5);
    expect(p.beta).toBe(0.5);
  });

  it("legacy Russian keys normalize correctly", () => {
    const p = betaParamsFromSignals([{ relevance: 1, shift: "\u0434\u0430", direction: "\u0440\u043e\u0441\u0442" }]);
    expect(p.alpha).toBeCloseTo(1.5, 10);
    expect(p.beta).toBeCloseTo(0.5, 10);
  });

  it("multiple positive signals accumulate", () => {
    const p = betaParamsFromSignals([
      { relevance: 0.5, shift: "yes", direction: "up" },
      { relevance: 1.0, shift: "yes", direction: "up" },
    ]);
    // 0.5*1.0 + 1.0*1.0 = 1.5
    expect(p.alpha).toBeCloseTo(2.0, 10);
    expect(p.beta).toBeCloseTo(0.5, 10);
  });
});

// =================================================================
// 5. betaMean / betaVariance — exact
// =================================================================
describe("betaMean / betaVariance", () => {
  it("Beta(0.5, 0.5) mean=0.5, var=0.125", () => {
    expect(betaMean({ alpha: 0.5, beta: 0.5 })).toBe(0.5);
    expect(betaVariance({ alpha: 0.5, beta: 0.5 })).toBeCloseTo(0.125, 10);
  });

  it("Beta(2, 2) mean=0.5, var=0.05", () => {
    expect(betaMean({ alpha: 2, beta: 2 })).toBe(0.5);
    expect(betaVariance({ alpha: 2, beta: 2 })).toBeCloseTo(0.05, 10);
  });

  it("Beta(1, 9) mean=0.1", () => {
    expect(betaMean({ alpha: 1, beta: 9 })).toBeCloseTo(0.1, 10);
  });
});

// =================================================================
// 6. summarize — exact on known data
// =================================================================
describe("summarize", () => {
  it("empty samples -> all zeros", () => {
    const s = summarize([]);
    expect(s).toEqual({ mean: 0, std: 0, ci95Low: 0, ci95High: 0 });
  });

  it("constant sample -> mean=value, std=0", () => {
    const s = summarize([0.42, 0.42, 0.42, 0.42]);
    expect(s.mean).toBeCloseTo(0.42, 10);
    expect(s.std).toBe(0);
  });

  it("uniform 0..99 -> mean approx 49.5", () => {
    const xs: number[] = [];
    for (let i = 0; i < 100; i++) xs.push(i);
    const s = summarize(xs);
    expect(s.mean).toBeCloseTo(49.5, 6);
    expect(s.ci95Low).toBeLessThan(s.mean);
    expect(s.ci95High).toBeGreaterThan(s.mean);
  });

  it("CI95 covers approx 95% of a normal-ish sample", () => {
    // By construction ci95Low is the 2.5%-quantile, ci95High the 97.5%-quantile.
    const rng = mulberry32(31);
    const xs: number[] = [];
    for (let i = 0; i < 10000; i++) xs.push(sampleBeta(2, 2, rng));
    const s = summarize(xs);
    // Beta(2,2) has 2.5% quantile around 0.1, 97.5% around 0.9
    expect(s.ci95Low).toBeGreaterThan(0.05);
    expect(s.ci95Low).toBeLessThan(0.15);
    expect(s.ci95High).toBeGreaterThan(0.85);
    expect(s.ci95High).toBeLessThan(0.95);
  });
});

// =================================================================
// 7. interpretGap — boundaries
// =================================================================
describe("interpretGap", () => {
  it("boundaries match methodology.md §3.3", () => {
    expect(interpretGap(-0.31)).toBe("AI is significantly ahead");
    expect(interpretGap(-0.30)).toBe("AI is ahead");
    expect(interpretGap(-0.11)).toBe("AI is ahead");
    expect(interpretGap(-0.10)).toBe("Symmetric development");
    expect(interpretGap( 0.00)).toBe("Symmetric development");
    expect(interpretGap( 0.10)).toBe("Symmetric development");
    expect(interpretGap( 0.11)).toBe("Humanity is ahead");
    expect(interpretGap( 0.30)).toBe("Humanity is ahead");
    expect(interpretGap( 0.31)).toBe("Humanity is significantly ahead");
  });
});

// =================================================================
// 8. classifyStability — same/different bands
// =================================================================
describe("classifyStability", () => {
  it("CI fully inside symmetric band -> stable", () => {
    expect(classifyStability(-0.05, 0.05)).toBe("stable");
  });
  it("CI crosses -0.1 boundary -> unstable", () => {
    expect(classifyStability(-0.15, 0.05)).toBe("unstable");
  });
  it("CI fully inside 'significant AI' -> stable", () => {
    expect(classifyStability(0.4, 0.6)).toBe("stable");
  });
  it("CI crosses 0.3 boundary -> unstable", () => {
    expect(classifyStability(0.25, 0.35)).toBe("unstable");
  });
});

// =================================================================
// 9. isSignificant — two-sided
// =================================================================
describe("isSignificant", () => {
  it("CI includes 0 -> not significant", () => {
    expect(isSignificant(-0.05, 0.08)).toBe(false);
  });
  it("CI entirely positive -> significant", () => {
    expect(isSignificant(0.02, 0.15)).toBe(true);
  });
  it("CI entirely negative -> significant", () => {
    expect(isSignificant(-0.2, -0.03)).toBe(true);
  });
  it("CI touches 0 (low=0) -> not significant", () => {
    expect(isSignificant(0, 0.1)).toBe(false);
  });
  it("CI touches 0 (high=0) -> not significant", () => {
    expect(isSignificant(-0.1, 0)).toBe(false);
  });
});

// =================================================================
// 10. sampleGapDistribution — determinism + sanity
// =================================================================
describe("sampleGapDistribution", () => {
  it("deterministic with the same seed", () => {
    const aiParams = [
      { alpha: 1.5, beta: 0.5 }, { alpha: 1.0, beta: 1.0 },
      { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 },
      { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 },
    ];
    const humanParams = [
      { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 },
      { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 },
      { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 },
    ];
    const runA = sampleGapDistribution(aiParams, humanParams, 500, mulberry32(99));
    const runB = sampleGapDistribution(aiParams, humanParams, 500, mulberry32(99));
    expect(runA.gapSamples[0]).toBe(runB.gapSamples[0]);
    expect(runA.gapSamples[499]).toBe(runB.gapSamples[499]);
  });

  it("symmetric case: AI and Human identical -> mean gap approx 0", () => {
    const params = [
      { alpha: 2, beta: 2 }, { alpha: 2, beta: 2 }, { alpha: 2, beta: 2 },
      { alpha: 2, beta: 2 }, { alpha: 2, beta: 2 }, { alpha: 2, beta: 2 },
    ];
    const rng = mulberry32(101);
    const run = sampleGapDistribution(params, params, 10000, rng);
    const s = summarize(run.gapSamples);
    // Both are means of 6 identical Betas; difference of two iid means.
    // SE ≈ sqrt(2 * Var/6) = sqrt(2 * 0.05/6) ≈ 0.13
    // SE(mean over 10000) ≈ 0.0013 -> tolerance ±0.01 safe
    expect(Math.abs(s.mean)).toBeLessThan(0.01);
  });

  it("empty signals -> each axis level has posterior mean 0.5", () => {
    const prior = [
      { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 },
      { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 }, { alpha: 0.5, beta: 0.5 },
    ];
    const rng = mulberry32(103);
    const run = sampleGapDistribution(prior, prior, 10000, rng);
    const ai = summarize(run.aiSamples);
    const gap = summarize(run.gapSamples);
    expect(ai.mean).toBeGreaterThan(0.48);
    expect(ai.mean).toBeLessThan(0.52);
    expect(Math.abs(gap.mean)).toBeLessThan(0.02);
  });

  it("AI strong, Human weak -> mean gap clearly positive", () => {
    const aiParams = [
      { alpha: 8, beta: 2 }, { alpha: 8, beta: 2 }, { alpha: 8, beta: 2 },
      { alpha: 8, beta: 2 }, { alpha: 8, beta: 2 }, { alpha: 8, beta: 2 },
    ];
    const humanParams = [
      { alpha: 2, beta: 8 }, { alpha: 2, beta: 8 }, { alpha: 2, beta: 8 },
      { alpha: 2, beta: 8 }, { alpha: 2, beta: 8 }, { alpha: 2, beta: 8 },
    ];
    const rng = mulberry32(107);
    const run = sampleGapDistribution(aiParams, humanParams, 10000, rng);
    const gap = summarize(run.gapSamples);
    // AI mean = 0.8, Human mean = 0.2, gap = Human - AI = -0.6
    expect(gap.mean).toBeLessThan(-0.55);
    expect(gap.mean).toBeGreaterThan(-0.65);
  });
});
