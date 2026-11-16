import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: "./wrangler.jsonc",
      },
      // Отключаем remote bindings в тестах — используем только локальные
      remoteBindings: false,
    }),
  ],
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'backups/**'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 3000, // 3 секунды вместо 10
    globalTeardown: ["./test/global-teardown.ts"],
  },
});
