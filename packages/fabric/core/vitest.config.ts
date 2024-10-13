import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["dist/**", "vitest.config.ts", "**/index.ts", "**/*.spec.ts"],
    },
    passWithNoTests: true,
  },
});
