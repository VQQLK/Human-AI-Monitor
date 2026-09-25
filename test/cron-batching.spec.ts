import { describe, expect, it } from "vitest";
import { CRON_BATCH_CONFIG } from "../src/index";
import { SOURCES } from "../src/config/sources";

// Guards against silent source-list drift (audit finding: offsets/limit must
// be re-checked whenever a source is added or removed — see scheduled()).
describe("cron batching invariants", () => {
    const batches = Object.entries(CRON_BATCH_CONFIG);

    it("covers every enabled source exactly once", () => {
        const planned = batches.reduce((sum, [, b]) => sum + b.limit, 0);
        expect(planned).toBe(SOURCES.length);
    });

    it("offsets are contiguous and start at 0 (no gaps, no overlaps)", () => {
        const sorted = [...batches].sort((a, b) => a[1].batch - b[1].batch);
        expect(sorted[0][1].offset).toBe(0);
        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1][1];
            expect(sorted[i][1].offset).toBe(prev.offset + prev.limit);
        }
    });

    it("batch numbers are 1..N without gaps", () => {
        const nums = batches.map(([, b]) => b.batch).sort((a, b) => a - b);
        expect(nums).toEqual(nums.map((_, i) => i + 1));
    });

    it("subrequest budget per batch stays under the 50-request limit", () => {
        for (const [, b] of batches) {
            expect(b.limit * b.maxPerSource * 2).toBeLessThanOrEqual(50);
        }
    });
});
