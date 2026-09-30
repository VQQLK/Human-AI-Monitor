import { describe, it, expect } from "vitest";
import { AI_WEIGHTS, HUMAN_WEIGHTS } from "../src/config/weights";
import {
  mulberry32,
  sampleGapDistribution,
  type BetaParams,
} from "../src/services/bayesian-gap";

function mean(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

// =================================================================
// 1. Weight configuration validation
// =================================================================
describe("weights configuration", () => {
  it("AI weights sum to 1.0", () => {
    const sum = Object.values(AI_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
  });

  it("Human weights sum to 1.0", () => {
    const sum = Object.values(HUMAN_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
  });

  it("all weights are in (0, 1)", () => {
    for (const w of Object.values(AI_WEIGHTS)) {
      expect(w).toBeGreaterThan(0);
      expect(w).toBeLessThan(1);
    }
    for (const w of Object.values(HUMAN_WEIGHTS)) {
      expect(w).toBeGreaterThan(0);
      expect(w).toBeLessThan(1);
    }
  });

  it("AI weights match methodology.md §3.2", () => {
    expect(AI_WEIGHTS.smd).toBeCloseTo(0.20);
    expect(AI_WEIGHTS.itq).toBeCloseTo(0.15);
    expect(AI_WEIGHTS.agg).toBeCloseTo(0.15);
    expect(AI_WEIGHTS.cycle_velocity).toBeCloseTo(0.20);
    expect(AI_WEIGHTS.verification).toBeCloseTo(0.20);
    expect(AI_WEIGHTS.hexad).toBeCloseTo(0.10);
  });

  it("Human weights match methodology.md §3.2", () => {
    expect(HUMAN_WEIGHTS.h1_agency).toBeCloseTo(0.20);
    expect(HUMAN_WEIGHTS.h2_sovereignty).toBeCloseTo(0.15);
    expect(HUMAN_WEIGHTS.h3_wellbeing).toBeCloseTo(0.20);
    expect(HUMAN_WEIGHTS.h4_equity).toBeCloseTo(0.15);
    expect(HUMAN_WEIGHTS.h5_meaning).toBeCloseTo(0.15);
    expect(HUMAN_WEIGHTS.h6_democracy).toBeCloseTo(0.15);
  });

  it("covers exactly the 6 AI axes", () => {
    expect(Object.keys(AI_WEIGHTS).sort()).toEqual(
      ["agg", "cycle_velocity", "hexad", "itq", "smd", "verification"].sort()
    );
  });

  it("covers exactly the 6 Human axes", () => {
    expect(Object.keys(HUMAN_WEIGHTS).sort()).toEqual(
      ["h1_agency", "h2_sovereignty", "h3_wellbeing", "h4_equity", "h5_meaning", "h6_democracy"].sort()
    );
  });
});

// =================================================================
// 2. Weighted Monte Carlo sampling
// =================================================================
describe("sampleGapDistribution with weights", () => {
  it("equal weights produce same result as no weights (backward compat)", () => {
    const M = 1000;
    const aiParams: BetaParams[] = [{ alpha: 2, beta: 2 }, { alpha: 3, beta: 1 }];
    const humanParams: BetaParams[] = [{ alpha: 1, beta: 3 }];

    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);

    const run1 = sampleGapDistribution(aiParams, humanParams, M, rng1);
    const run2 = sampleGapDistribution(aiParams, humanParams, M, rng2, [0.5, 0.5], [1.0]);

    // Детерминированность: одинаковый seed → одинаковые сэмплы
    expect(run1.aiSamples[0]).toBe(run2.aiSamples[0]);
    expect(run1.humanSamples[0]).toBe(run2.humanSamples[0]);
    expect(run1.gapSamples[0]).toBe(run2.gapSamples[0]);
  });

  it("weights shift the mean toward the heavier axis", () => {
    const M = 20000;
    // Первая ось: mean ≈ 0.9, вторая ось: mean ≈ 0.1
    const aiParams: BetaParams[] = [
      { alpha: 9, beta: 1 },   // posterior mean ≈ 0.9
      { alpha: 1, beta: 9 },   // posterior mean ≈ 0.1
    ];
    const humanParams: BetaParams[] = [{ alpha: 1, beta: 1 }]; // mean = 0.5

    // Веса: первая ось имеет больший вес
    const run = sampleGapDistribution(
      aiParams, humanParams, M, mulberry32(99),
      [0.8, 0.2], [1.0]
    );

    // Ожидаем: ai ≈ 0.8 * 0.9 + 0.2 * 0.1 = 0.74
    const aiMean = mean(run.aiSamples);
    expect(aiMean).toBeGreaterThan(0.70);
    expect(aiMean).toBeLessThan(0.78);

    // С равными весами было бы ≈ 0.5
    const runEqual = sampleGapDistribution(
      aiParams, humanParams, M, mulberry32(99),
      [0.5, 0.5], [1.0]
    );
    const aiMeanEqual = mean(runEqual.aiSamples);
    expect(aiMeanEqual).toBeGreaterThan(0.45);
    expect(aiMeanEqual).toBeLessThan(0.55);
  });

  it("weights matching documentation produce correct weighted mean", () => {
    const M = 30000;
    // Все оси имеют разный posterior
    const aiParams: BetaParams[] = [
      { alpha: 5, beta: 5 },  // mean = 0.5
      { alpha: 5, beta: 5 },
      { alpha: 5, beta: 5 },
      { alpha: 5, beta: 5 },
      { alpha: 5, beta: 5 },
      { alpha: 5, beta: 5 },
    ];
    const humanParams: BetaParams[] = Array(6).fill({ alpha: 5, beta: 5 });

    const weightsAI = Object.values(AI_WEIGHTS);
    const weightsH = Object.values(HUMAN_WEIGHTS);

    const run = sampleGapDistribution(
      aiParams, humanParams, M, mulberry32(123),
      weightsAI, weightsH
    );

    // Все оси одинаковые → взвешенное среднее = 0.5
    const aiMean = mean(run.aiSamples);
    const humanMean = mean(run.humanSamples);
    expect(aiMean).toBeGreaterThan(0.48);
    expect(aiMean).toBeLessThan(0.52);
    expect(humanMean).toBeGreaterThan(0.48);
    expect(humanMean).toBeLessThan(0.52);
  });

  it("deterministic with same seed and weights", () => {
    const M = 500;
    const aiParams: BetaParams[] = [{ alpha: 2, beta: 2 }];
    const humanParams: BetaParams[] = [{ alpha: 2, beta: 2 }];
    const w = [1.0];

    const run1 = sampleGapDistribution(aiParams, humanParams, M, mulberry32(7), w, w);
    const run2 = sampleGapDistribution(aiParams, humanParams, M, mulberry32(7), w, w);

    for (let i = 0; i < M; i++) {
      expect(run1.gapSamples[i]).toBe(run2.gapSamples[i]);
    }
  });

  it("unnormalized weights are auto-normalized", () => {
    const M = 500;
    const aiParams: BetaParams[] = [{ alpha: 2, beta: 2 }, { alpha: 2, beta: 2 }];
    const humanParams: BetaParams[] = [{ alpha: 2, beta: 2 }];

    // Веса не нормированы (сумма = 2), но функция должна их нормировать
    const run = sampleGapDistribution(
      aiParams, humanParams, M, mulberry32(5),
      [1.0, 1.0], [2.0]
    );

    const aiMean = mean(run.aiSamples);
    expect(aiMean).toBeGreaterThan(0.4);
    expect(aiMean).toBeLessThan(0.6);
  });
});
