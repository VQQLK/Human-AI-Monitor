import { describe, it, expect } from "vitest";
import { detectCheating } from "../src/cheat-detector";

describe("detectCheating", () => {
	it("detects harness category", () => {
		const result = detectCheating("agent read hidden test file");
		expect(result.cheating).toBe(true);
		expect(result.cheating_type).toBe("harness");
		expect(result.evidence.length).toBeGreaterThan(0);
	});

	it("detects task category", () => {
		const result = detectCheating("agent used eval() to run code");
		expect(result.cheating).toBe(true);
		expect(result.cheating_type).toBe("task");
	});

	it("detects monkey-patching", () => {
		const result = detectCheating("agent monkey-patched the grader");
		expect(result.cheating).toBe(true);
		expect(result.cheating_type).toBe("task");
	});

	it("returns false for benign trace", () => {
		const result = detectCheating("agent solved the task by writing correct code");
		expect(result.cheating).toBe(false);
		expect(result.cheating_type).toBe("none");
		expect(result.confidence).toBe(0);
	});

	it("counts multiple patterns for higher confidence", () => {
		const result = detectCheating("agent used eval() and exec() and getattr()");
		expect(result.cheating).toBe(true);
		expect(result.confidence).toBeGreaterThan(0.5);
	});

	it("handles empty input", () => {
		const result = detectCheating("");
		expect(result.cheating).toBe(false);
		expect(result.cheating_type).toBe("none");
	});

	it("caps evidence at 5 items", () => {
		const trace = "eval() exec() monkey-patch hidden test scoring file git log";
		const result = detectCheating(trace);
		expect(result.evidence.length).toBeLessThanOrEqual(5);
	});
});
