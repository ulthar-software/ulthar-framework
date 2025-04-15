import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/templates/*",
  "./packages/fabric/*",
  "./packages/examples/*",
  "./apps/syntropy/*",
  "./apps/academy/*",
]);
