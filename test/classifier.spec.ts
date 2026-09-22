import { describe, it, expect } from "vitest";
import { parseAIResponse, validateParsed } from "../src/index";

describe("parseAIResponse", () => {
	it("parses OpenAI-style response", () => {
		const response = {
			choices: [{ message: { content: '{"axes":["itq"],"relevance":0.8}' } }],
		};
		expect(parseAIResponse(response)).toEqual({ axes: ["itq"], relevance: 0.8 });
	});

	it("parses response with markdown wrapper", () => {
		const response = {
			choices: [{ message: { content: '```json\n{"axes":["smd"]}\n```' } }],
		};
		expect(parseAIResponse(response)).toEqual({ axes: ["smd"] });
	});

	it("returns null for empty response", () => {
		expect(parseAIResponse(null)).toBeNull();
		expect(parseAIResponse({})).toBeNull();
	});

	it("returns null for invalid JSON", () => {
		const response = {
			choices: [{ message: { content: "not a json" } }],
		};
		expect(parseAIResponse(response)).toBeNull();
	});
});

describe("validateParsed", () => {
	it("limits axes to 3 items", () => {
		const result = validateParsed({ axes: ["a", "b", "c", "d", "e"] });
		expect(result.axes).toHaveLength(3);
	});

	it("normalizes relevance to 0-1 range", () => {
		expect(validateParsed({ relevance: 1.5 }).relevance).toBe(1);
		expect(validateParsed({ relevance: -0.5 }).relevance).toBe(0);
		expect(validateParsed({ relevance: "0.8" }).relevance).toBe(0.8);
	});

	it("defaults relevance to 0.5 if invalid", () => {
		expect(validateParsed({ relevance: "abc" }).relevance).toBe(0.5);
		expect(validateParsed({}).relevance).toBe(0.5);
	});

	it("sets shift to uncertain if relevance < 0.3", () => {
		const result = validateParsed({ relevance: 0.2, shift: "yes" });
		expect(result.shift).toBe("uncertain");
	});

	it("downgrades shift=yes to no if relevance < 0.5", () => {
		const result = validateParsed({ relevance: 0.4, shift: "yes" });
		expect(result.shift).toBe("no");
	});

	it("keeps shift=yes if relevance >= 0.5", () => {
		const result = validateParsed({ relevance: 0.8, shift: "yes" });
		expect(result.shift).toBe("yes");
	});

	it("normalizes invalid shift to uncertain", () => {
		expect(validateParsed({ shift: "maybe" }).shift).toBe("uncertain");
	});

	it("normalizes invalid direction", () => {
		expect(validateParsed({ direction: "maybe" }).direction).toBe("uncertain");
	});

	it("keeps valid direction", () => {
		expect(validateParsed({ direction: "up" }).direction).toBe("up");
		expect(validateParsed({ direction: "down" }).direction).toBe("down");
	});

	it("handles null input", () => {
		expect(validateParsed(null)).toBeNull();
	});

	it("handles empty object", () => {
		const result = validateParsed({});
		expect(result.axes).toEqual([]);
		expect(result.relevance).toBe(0.5);
		expect(result.shift).toBe("uncertain");
		expect(result.direction).toBe("uncertain");
	});
});
