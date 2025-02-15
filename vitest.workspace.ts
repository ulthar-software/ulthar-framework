import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/templates/lib/vitest.config.ts",
  "./packages/templates/domain/vitest.config.ts",
  "./packages/fabric/weaver/vitest.config.ts",
  "./packages/fabric/testing/vitest.config.ts",
  "./packages/fabric/sqlite-store/vitest.config.ts",
  "./packages/fabric/core/vitest.config.ts",
  "./packages/examples/weaver-example/vitest.config.ts",
  "./apps/syntropy/domain/vitest.config.ts",
  "./apps/syntropy/api/vitest.config.ts",
]);
