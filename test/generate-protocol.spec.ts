import { describe, it, expect, vi } from "vitest";

// Импортируем функцию напрямую (нужно экспортировать из index.ts)
// Для теста используем динамический импорт
describe("generateAndSaveProtocol", () => {
	it("throws error for offsetWeeks=0 (still-open week)", async () => {
		// Мок-Env с минимальной функциональностью
		const mockEnv = {
			DB: {
				prepare: vi.fn().mockReturnValue({
					bind: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue({ n: 0 }),
						all: vi.fn().mockResolvedValue({ results: [] }),
						run: vi.fn().mockResolvedValue(undefined),
					}),
				}),
			},
			AI: {
				run: vi.fn().mockResolvedValue({
					response: "Mocked AI response",
				}),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		// Импортируем функцию динамически
		const { generateAndSaveProtocol } = await import("../src/index");

		// Попытка вызвать с offsetWeeks=0 должна выбросить ошибку
		await expect(generateAndSaveProtocol(mockEnv, 0)).rejects.toThrow(
			"Refusing to generate protocol for still-open week"
		);
	});

	it("throws error for negative offsetWeeks", async () => {
		const mockEnv = {
			DB: {
				prepare: vi.fn().mockReturnValue({
					bind: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue({ n: 0 }),
						all: vi.fn().mockResolvedValue({ results: [] }),
						run: vi.fn().mockResolvedValue(undefined),
					}),
				}),
			},
			AI: {
				run: vi.fn().mockResolvedValue({
					response: "Mocked AI response",
				}),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const { generateAndSaveProtocol } = await import("../src/index");

		await expect(generateAndSaveProtocol(mockEnv, -1)).rejects.toThrow(
			"Refusing to generate protocol for still-open week"
		);
	});

	it("does not throw for offsetWeeks=1 (previous closed week)", async () => {
		const mockEnv = {
			DB: {
				prepare: vi.fn().mockReturnValue({
					bind: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue({ n: 5 }),
						all: vi.fn().mockResolvedValue({ 
							results: [
								{ axes: '["smd"]', relevance: 0.8, shift: "да", direction: "рост" }
							] 
						}),
						run: vi.fn().mockResolvedValue(undefined),
					}),
				}),
			},
			AI: {
				run: vi.fn().mockResolvedValue({
					response: "Mocked protocol content",
				}),
			},
			CLASSIFIER_MODEL: "@cf/qwen/qwen3-30b-a3b-fp8",
		} as any;

		const { generateAndSaveProtocol } = await import("../src/index");

		// Не должно выбросить ошибку (может вернуть результат или другую ошибку, но не guard)
		try {
			await generateAndSaveProtocol(mockEnv, 1);
		} catch (error: any) {
			// Если ошибка есть, она НЕ должна быть guard ошибкой
			expect(error.message).not.toContain("still-open week");
		}
	});
});
