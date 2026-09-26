// Конфигурация специально для измерения покрытия.
// Отдельный конфиг нужен потому, что @vitest/coverage-v8 использует
// node:inspector/promises, который не реализован в workerd
// (Cloudflare Workers runtime, куда запускает тесты @cloudflare/vitest-plugin).
//
// Здесь тесты запускаются в обычном Node.js без Cloudflare плагина.
// Файл test/index.spec.ts исключён, так как требует облачное окружение
// (импортирует env/SELF из 'cloudflare:test').

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 10000,
    include: [
      "test/cheat-detector.spec.ts",
      "test/classifier.spec.ts",
      "test/cron-batching.spec.ts",
      "test/gap-computation.spec.ts",
      "test/generate-protocol.spec.ts",
      "test/parser.spec.ts",
      "test/translation.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/config/generated/**"],
    },
  },
});
