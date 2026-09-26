import { describe, expect, it } from "vitest";
import { BATCH_MAX_SOURCES, computeBatches } from "../src/index";
import { SOURCES } from "../src/config/sources";

// Dynamic batching: offsets/limits computed from SOURCES.length at runtime.
// Property tests hold for EVERY N up to capacity — source changes cannot
// silently break coverage.
describe("dynamic cron batching invariants", () => {
    const N_RANGE = Array.from({ length: BATCH_MAX_SOURCES + 1 }, (_, i) => i);

    it("N = SOURCES.length: covers every enabled source exactly once", () => {
        const total = Object.values(computeBatches(SOURCES.length))
            .reduce((s, b) => s + b.limit, 0);
        expect(total).toBe(SOURCES.length);
    });

    it("every N in 0..capacity: offsets contiguous from 0, total = N", () => {
        for (const n of N_RANGE) {
            const entries = Object.values(computeBatches(n))
                .sort((a, b) => a.batch - b.batch);
            let cursor = 0;
            for (const b of entries) {
                expect(b.offset).toBe(cursor);
                cursor += b.limit;
            }
            expect(cursor).toBe(n);
        }
    });

    it("every N in 0..capacity: subrequest budget holds per batch", () => {
        for (const n of N_RANGE) {
            for (const b of Object.values(computeBatches(n))) {
                expect(b.limit * b.maxPerSource * 2).toBeLessThanOrEqual(50);
            }
        }
    });

    it("batch numbers are 1..5 without gaps for every N", () => {
        for (const n of N_RANGE) {
            const nums = Object.values(computeBatches(n))
                .map((b) => b.batch).sort((a, b) => a - b);
            expect(nums).toEqual([1, 2, 3, 4, 5]);
        }
    });

    it("N > capacity throws loudly (no silent partial coverage)", () => {
        expect(() => computeBatches(BATCH_MAX_SOURCES + 1)).toThrow(/capacity/);
    });

    it("regression anchor: N = 41 distributes exactly [8, 8, 8, 8, 9]", () => {
        const limits = Object.values(computeBatches(41))
            .sort((a, b) => a.batch - b.batch).map((b) => b.limit);
        expect(limits).toEqual([8, 8, 8, 8, 9]);
    });
});
