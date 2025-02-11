import type { WeaverBuildOptions } from "@fabric/weaver/builder";
import routes from "./src/routes.js";

export default {
  tailwindTheme: {
    extend: {},
  },
  routes,
} as const satisfies WeaverBuildOptions;
