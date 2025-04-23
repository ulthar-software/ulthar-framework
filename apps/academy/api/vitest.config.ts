import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    coverage: {
      exclude: ["**/index.ts", ...coverageConfigDefaults.exclude],
    },
  },
});
