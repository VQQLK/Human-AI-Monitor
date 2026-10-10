import { describe, it, expect } from "vitest";
import { computeGapIndex } from "../src/services/gap-computation";
import { mulberry32 } from "../src/services/bayesian-gap";

// Mock Env: DB returns a fixed list of items regardless of SQL.
function createMockEnv(items: any[] = []) {
  return {
    DB: {
      prepare: (_sql: string) => ({
        bind: (..._args: any[]) => ({
          all: async () => ({ results: items }),
        }),
      }),
    },
  } as any;
}

const RANGE = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };

describe("computeGapIndex (Bayesian)", () => {
  // ----------------------------------------------------------------
  // 1. Empty DB -> all axes are prior Beta(0.5, 0.5), means are 0.5
  // ----------------------------------------------------------------
  it("empty DB: priors -> aiScore=0.5, humanScore=0.5, gap≈0", async () => {
    const env = createMockEnv([]);
    const r = await computeGapIndex(env, RANGE, mulberry32(1));
    expect(r.aiScore).toBeCloseTo(0.5, 2);
    expect(r.humanScore).toBeCloseTo(0.5, 2);
    expect(Math.abs(r.gap)).toBeLessThan(0.02);
    expect(r.interpretation).toBe("Inconclusive");
    expect(r.method).toBe("bayesian");
    expect(r.sampleSize).toBe(0);
  });

  // ----------------------------------------------------------------
  // 2. Single (yes, up) signal on smd
  //    alpha = 0.5 + 0.8 * 1.0 = 1.3, beta = 0.5
  //    posterior mean = 1.3 / 1.8 ≈ 0.7222
  // ----------------------------------------------------------------
  it("smd (yes, up, rel=0.8): axis level = 1.3/1.8", async () => {
    const env = createMockEnv([
      { axes: '["smd"]', relevance: 0.8, shift: "yes", direction: "up" },
    ]);
    const r = await computeGapIndex(env, RANGE, mulberry32(2));
    expect(r.axisLevels["smd"]).toBeCloseTo(1.3 / 1.8, 4);
    expect(r.axisLevels["itq"]).toBe(0.5);
    expect(r.axisLevels["h1_agency"]).toBe(0.5);
    expect(r.sampleSize).toBe(1);
  });

  // ----------------------------------------------------------------
  // 3. Human signal
  // ----------------------------------------------------------------
  it("h1_agency (yes, up, rel=0.7): axis level = 1.2/1.7", async () => {
    const env = createMockEnv([
      { axes: '["h1_agency"]', relevance: 0.7, shift: "yes", direction: "up" },
    ]);
    const r = await computeGapIndex(env, RANGE, mulberry32(3));
    expect(r.axisLevels["h1_agency"]).toBeCloseTo(1.2 / 1.7, 4);
    expect(r.axisLevels["smd"]).toBe(0.5);
  });

  // ----------------------------------------------------------------
  // 4. AI + Human, with (no, stable) = zero voice
  // ----------------------------------------------------------------
  it("AI (yes, up), Human (no, stable, v=0)", async () => {
    const env = createMockEnv([
      { axes: '["smd"]', relevance: 0.9, shift: "yes", direction: "up" },
      { axes: '["h1_agency"]', relevance: 0.5, shift: "no", direction: "stable" },
    ]);
    const r = await computeGapIndex(env, RANGE, mulberry32(4));
    expect(r.axisLevels["smd"]).toBeCloseTo(1.4 / 1.9, 4);
    expect(r.axisLevels["h1_agency"]).toBe(0.5);
  });

  // ----------------------------------------------------------------
  // 5. Invalid axes are skipped, sampleSize counts only valid (item, axis) pairs
  // ----------------------------------------------------------------
  it("invalid JSON and null axes are skipped", async () => {
    const env = createMockEnv([
      { axes: '["smd"]', relevance: 0.8, shift: "yes", direction: "up" },
      { axes: "invalid json", relevance: 0.9, shift: "yes", direction: "up" },
      { axes: null, relevance: 0.7, shift: "yes", direction: "up" },
    ]);
    const r = await computeGapIndex(env, RANGE, mulberry32(5));
    expect(r.axisLevels["smd"]).toBeCloseTo(1.3 / 1.8, 4);
    expect(r.sampleSize).toBe(1);
  });

  // ----------------------------------------------------------------
  // 6. Coarse-bucket interpretation tests
  // ----------------------------------------------------------------

  it("strong AI positive, strong Human negative → significantly ahead", async () => {
    const items: any[] = [];
    // 4 signals per AI axis, each voice = +1.0
    // alpha = 0.5 + 4 = 4.5, beta = 0.5, mean = 4.5/5 = 0.9
    for (const axis of ["smd", "itq", "agg", "cycle_velocity", "verification", "hexad"]) {
      for (let k = 0; k < 4; k++) {
        items.push({ axes: `["${axis}"]`, relevance: 1.0, shift: "yes", direction: "up" });
      }
    }
    // 4 signals per Human axis, each voice = -1.0
    // alpha = 0.5, beta = 4.5, mean = 0.5/5 = 0.1
    for (const axis of ["h1_agency", "h2_sovereignty", "h3_wellbeing", "h4_equity", "h5_meaning", "h6_democracy"]) {
      for (let k = 0; k < 4; k++) {
        items.push({ axes: `["${axis}"]`, relevance: 1.0, shift: "yes", direction: "down" });
      }
    }
    const env = createMockEnv(items);
    const r = await computeGapIndex(env, RANGE, mulberry32(6));
    expect(r.gap).toBeLessThan(-0.3);
    expect(r.interpretation).toBe("AI is ahead");
    expect(r.statisticallySignificant).toBe(true);
  });

  it("symmetric: identical AI and Human signals → gap ≈ 0", async () => {
    const items: any[] = [];
    for (const axis of ["smd", "itq", "agg", "cycle_velocity", "verification", "hexad"]) {
      items.push({ axes: `["${axis}"]`, relevance: 0.5, shift: "yes", direction: "up" });
    }
    for (const axis of ["h1_agency", "h2_sovereignty", "h3_wellbeing", "h4_equity", "h5_meaning", "h6_democracy"]) {
      items.push({ axes: `["${axis}"]`, relevance: 0.5, shift: "yes", direction: "up" });
    }
    const env = createMockEnv(items);
    const r = await computeGapIndex(env, RANGE, mulberry32(7));
    expect(Math.abs(r.gap)).toBeLessThan(0.05);
    expect(r.interpretation).toBe("Inconclusive");
    expect(r.statisticallySignificant).toBe(false);
  });

  // ----------------------------------------------------------------
  // 7. No clamp — axis level is always strictly inside (0, 1)
  // ----------------------------------------------------------------
  it("axis level is strictly in (0, 1) — no clamp needed", async () => {
    const env = createMockEnv([
      { axes: '["smd"]', relevance: 1.0, shift: "yes", direction: "up" },
    ]);
    const r = await computeGapIndex(env, RANGE, mulberry32(8));
    expect(r.axisLevels["smd"]).toBeGreaterThan(0);
    expect(r.axisLevels["smd"]).toBeLessThan(1);
    expect(r.axisLevels["smd"]).toBeCloseTo(0.75, 4);
  });

  // ----------------------------------------------------------------
  // 8. Uncertain shift contributes no voice -> posterior stays prior
  // ----------------------------------------------------------------
  it("uncertain shift → no contribution", async () => {
    const env = createMockEnv([
      { axes: '["smd"]', relevance: 0.8, shift: "uncertain", direction: "uncertain" },
    ]);
    const r = await computeGapIndex(env, RANGE, mulberry32(9));
    expect(r.axisLevels["smd"]).toBe(0.5);
    expect(r.sampleSize).toBe(1);
  });

  // ----------------------------------------------------------------
  // 9. CI95 bounds are populated and enclose the mean
  // ----------------------------------------------------------------
  it("gap CI95 bounds enclose the mean", async () => {
    const env = createMockEnv([
      { axes: '["smd"]', relevance: 0.8, shift: "yes", direction: "up" },
    ]);
    const r = await computeGapIndex(env, RANGE, mulberry32(10));
    expect(r.gapCi95[0]).toBeLessThan(r.gapCi95[1]);
    expect(r.gapCi95[0]).toBeLessThanOrEqual(r.gapMean);
    expect(r.gapCi95[1]).toBeGreaterThanOrEqual(r.gapMean);
  });

  // ----------------------------------------------------------------
  // 10. Determinism — same seed gives same result
  // ----------------------------------------------------------------
  it("deterministic with the same seed", async () => {
    const items = [{ axes: '["smd"]', relevance: 0.8, shift: "yes", direction: "up" }];
    const env = createMockEnv(items);
    const a = await computeGapIndex(env, RANGE, mulberry32(42));
    const b = await computeGapIndex(env, RANGE, mulberry32(42));
    expect(a.gapMean).toBe(b.gapMean);
    expect(a.gapCi95).toEqual(b.gapCi95);
  });
});
