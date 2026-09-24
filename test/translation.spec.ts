import { describe, it, expect, vi } from "vitest";
import { translateProtocolMarkdown, translateReasoningBatch } from "../src/services/translation";

describe("translateProtocolMarkdown", () => {
	it("returns English text on AI failure (fallback)", async () => {
		const mockEnv = {
			AI: {
				run: vi.fn().mockRejectedValue(new Error("AI service unavailable")),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const englishMarkdown = "# Protocol\n\nThis is a test protocol.";
		const result = await translateProtocolMarkdown(mockEnv, englishMarkdown, "ru");

		// Fallback: возвращает английский текст при ошибке
		expect(result).toBe(englishMarkdown);
	});

	it("returns translated text on success", async () => {
		const mockEnv = {
			AI: {
				run: vi.fn().mockResolvedValue({
					response: "# Протокол\n\nЭто тестовый протокол.",
				}),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const englishMarkdown = "# Protocol\n\nThis is a test protocol.";
		const result = await translateProtocolMarkdown(mockEnv, englishMarkdown, "ru");

		expect(result).toBe("# Протокол\n\nЭто тестовый протокол.");
		expect(mockEnv.AI.run).toHaveBeenCalled();
	});

	it("preserves technical axis names in translation", async () => {
		const mockEnv = {
			AI: {
				run: vi.fn().mockResolvedValue({
					response: "# Протокол\n\nОси: smd, itq, h1_agency остались без изменений.",
				}),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const englishMarkdown = "# Protocol\n\nAxes: smd, itq, h1_agency should remain unchanged.";
		const result = await translateProtocolMarkdown(mockEnv, englishMarkdown, "ru");

		// Проверяем, что технические термины сохранились
		expect(result).toContain("smd");
		expect(result).toContain("itq");
		expect(result).toContain("h1_agency");
	});
});

describe("translateReasoningBatch", () => {
	it("returns empty array for empty input", async () => {
		const mockEnv = {
			AI: {
				run: vi.fn(),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const result = await translateReasoningBatch(mockEnv, [], "ru");
		expect(result).toEqual([]);
		expect(mockEnv.AI.run).not.toHaveBeenCalled();
	});

	it("translates batch of reasoning items", async () => {
		const mockEnv = {
			AI: {
				run: vi.fn().mockResolvedValue({
					response: "[1] Первый перевод\n\n[2] Второй перевод",
				}),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const items = [
			{ hash: "abc123", reasoning: "First reasoning" },
			{ hash: "def456", reasoning: "Second reasoning" },
		];

		const result = await translateReasoningBatch(mockEnv, items, "ru");

		expect(result).toHaveLength(2);
		expect(result[0].hash).toBe("abc123");
		expect(result[0].translated).toBe("Первый перевод");
		expect(result[1].hash).toBe("def456");
		expect(result[1].translated).toBe("Второй перевод");
	});

	it("falls back to English on AI failure", async () => {
		const mockEnv = {
			AI: {
				run: vi.fn().mockRejectedValue(new Error("AI service unavailable")),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const items = [
			{ hash: "abc123", reasoning: "First reasoning" },
			{ hash: "def456", reasoning: "Second reasoning" },
		];

		const result = await translateReasoningBatch(mockEnv, items, "ru");

		// Fallback: возвращает оригинальный английский текст
		expect(result).toHaveLength(2);
		expect(result[0].translated).toBe("First reasoning");
		expect(result[1].translated).toBe("Second reasoning");
	});

	it("batches items by 10 to minimize LLM calls", async () => {
		const mockEnv = {
			AI: {
				run: vi.fn().mockResolvedValue({
					response: "[1] T1\n\n[2] T2\n\n[3] T3\n\n[4] T4\n\n[5] T5\n\n[6] T6\n\n[7] T7\n\n[8] T8\n\n[9] T9\n\n[10] T10",
				}),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		// Создаём 15 items (должно быть 2 batch: 10 + 5)
		const items = Array.from({ length: 15 }, (_, i) => ({
			hash: `hash${i}`,
			reasoning: `Reasoning ${i}`,
		}));

		const result = await translateReasoningBatch(mockEnv, items, "ru");

		// AI должен быть вызван 2 раза (10 items + 5 items)
		expect(mockEnv.AI.run).toHaveBeenCalledTimes(2);
		expect(result).toHaveLength(15);
	});
});
