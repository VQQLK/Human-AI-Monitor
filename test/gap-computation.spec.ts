import { describe, it, expect } from "vitest";
import { computeGapIndex } from "../src/services/gap-computation";

// Мок-Env с настраиваемой БД
function createMockEnv(items: any[] = []) {
	return {
		DB: {
			prepare: (sql: string) => ({
				bind: (...args: any[]) => ({
					all: async () => ({ results: items }),
				}),
			}),
		},
	} as any;
}

describe("computeGapIndex", () => {
	it("returns zero scores for empty database", async () => {
		const env = createMockEnv([]);
		const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
		
		const result = await computeGapIndex(env, range);
		
		expect(result.aiScore).toBe(0);
		expect(result.humanScore).toBe(0);
		expect(result.gap).toBe(0);
		expect(result.interpretation).toBe("Symmetric development");
	});

	it("computes AI score from AI axes", async () => {
		const items = [
			{ axes: '["smd"]', relevance: 0.8, shift: "yes", direction: "up" },
			{ axes: '["itq"]', relevance: 0.9, shift: "no", direction: "stable" },
		];
		const env = createMockEnv(items);
		const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
		
		const result = await computeGapIndex(env, range);
		
		// smd: 0.8 * 1.5 * 1.2 = 1.44 → clamped to 1
		// itq: 0.9 * 0.5 * 1.0 = 0.45
		// avg AI: (1 + 0.45 + 0 + 0 + 0 + 0 + 0) / 7 = 0.207... → rounds to 0.21
		expect(result.aiScore).toBeCloseTo(0.21, 2);
		expect(result.humanScore).toBe(0);
		expect(result.gap).toBeCloseTo(0.21, 2);
		expect(result.interpretation).toBe("AI is ahead");
	});

	it("computes Human score from Human axes", async () => {
		const items = [
			{ axes: '["h1_agency"]', relevance: 0.7, shift: "yes", direction: "up" },
			{ axes: '["h6_democracy"]', relevance: 0.6, shift: "uncertain", direction: "down" },
		];
		const env = createMockEnv(items);
		const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
		
		const result = await computeGapIndex(env, range);
		
		// h1_agency: 0.7 * 1.5 * 1.2 = 1.26 → clamped to 1
		// h6_democracy: 0.6 * 1.0 * 0.8 = 0.48
		// avg Human: (1 + 0 + 0 + 0 + 0 + 0.48) / 6 = 0.246... → rounds to 0.25
		expect(result.aiScore).toBe(0);
		expect(result.humanScore).toBeCloseTo(0.25, 2);
		expect(result.gap).toBeCloseTo(-0.25, 2);
		expect(result.interpretation).toBe("Humanity is ahead");
	});

	it("computes gap when both AI and Human have scores", async () => {
		const items = [
			{ axes: '["smd", "itq"]', relevance: 0.9, shift: "yes", direction: "up" },
			{ axes: '["h1_agency"]', relevance: 0.5, shift: "no", direction: "stable" },
		];
		const env = createMockEnv(items);
		const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
		
		const result = await computeGapIndex(env, range);
		
		// smd: 0.9 * 1.5 * 1.2 = 1.62 → clamped to 1
		// itq: 0.9 * 1.5 * 1.2 = 1.62 → clamped to 1
		// avg AI: (1 + 1 + 0 + 0 + 0 + 0 + 0) / 7 = 0.2857...
		// h1_agency: 0.5 * 0.5 * 1.0 = 0.25
		// avg Human: (0.25 + 0 + 0 + 0 + 0 + 0) / 6 = 0.0416...
		// gap: 0.2857... - 0.0416... = 0.244... → rounds to 0.24
		expect(result.aiScore).toBeCloseTo(0.29, 2);
		expect(result.humanScore).toBeCloseTo(0.04, 2);
		expect(result.gap).toBeCloseTo(0.24, 2);
	});

	it("skips items with invalid JSON in axes", async () => {
		const items = [
			{ axes: '["smd"]', relevance: 0.8, shift: "yes", direction: "up" },
			{ axes: "invalid json", relevance: 0.9, shift: "yes", direction: "up" },
			{ axes: null, relevance: 0.7, shift: "yes", direction: "up" },
		];
		const env = createMockEnv(items);
		const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
		
		const result = await computeGapIndex(env, range);
		
		// Only first item should be processed
		// smd: 0.8 * 1.5 * 1.2 = 1.44 → clamped to 1
		// avg AI: (1 + 0 + 0 + 0 + 0 + 0 + 0) / 7 = 0.142... → rounds to 0.14
		expect(result.aiScore).toBeCloseTo(0.14, 2);
	});

	it("returns correct interpretation for all gap ranges", async () => {
		// Тестируем интерпретацию через прямое управление gap
		const testCases = [
			{ aiTarget: 0.8, humanTarget: 0.2, expectedInterpretation: "AI is significantly ahead" },
			{ aiTarget: 0.6, humanTarget: 0.4, expectedInterpretation: "AI is ahead" },
			{ aiTarget: 0.5, humanTarget: 0.5, expectedInterpretation: "Symmetric development" },
			{ aiTarget: 0.4, humanTarget: 0.6, expectedInterpretation: "Humanity is ahead" },
			{ aiTarget: 0.2, humanTarget: 0.8, expectedInterpretation: "Humanity is significantly ahead" },
		];

		for (const { aiTarget, humanTarget, expectedInterpretation } of testCases) {
			// Создаём items для получения нужных scores
			// Используем все оси для точного контроля
			const items = [];
			
			// Добавляем AI сигналы
			for (const axis of ['smd', 'itq', 'agg', 'cycle_velocity', 'verification', 'hexad', 'geopolitics']) {
				items.push({
					axes: `["${axis}"]`,
					relevance: aiTarget,
					shift: "uncertain",
					direction: "stable"
				});
			}
			
			// Добавляем Human сигналы
			for (const axis of ['h1_agency', 'h2_sovereignty', 'h3_wellbeing', 'h4_equity', 'h5_meaning', 'h6_democracy']) {
				items.push({
					axes: `["${axis}"]`,
					relevance: humanTarget,
					shift: "uncertain",
					direction: "stable"
				});
			}
			
			const env = createMockEnv(items);
			const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
			
			const result = await computeGapIndex(env, range);
			
			expect(result.interpretation).toBe(expectedInterpretation);
		}
	});

	it("clamps axis levels to [0, 1] range", async () => {
		const items = [
			{ axes: '["smd"]', relevance: 0.9, shift: "yes", direction: "up" },
		];
		const env = createMockEnv(items);
		const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
		
		const result = await computeGapIndex(env, range);
		
		// smd: 0.9 * 1.5 * 1.2 = 1.62 → should be clamped to 1
		expect(result.axisLevels["smd"]).toBe(1);
	});

	it("handles missing shift and direction with defaults", async () => {
		const items = [
			{ axes: '["smd"]', relevance: 0.8, shift: "uncertain", direction: "uncertain" },
		];
		const env = createMockEnv(items);
		const range = { filterStart: "2026-09-01", filterEnd: "2026-09-30" };
		
		const result = await computeGapIndex(env, range);
		
		// smd: 0.8 * 1.0 * 1.0 = 0.8 (defaults to 1.0 for unknown values)
		expect(result.axisLevels["smd"]).toBeCloseTo(0.8, 2);
	});
});
