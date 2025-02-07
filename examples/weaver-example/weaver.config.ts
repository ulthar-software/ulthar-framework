import { WeaverBuildOptions } from "@fabric/weaver/builder";
import routes from "./src/routes.ts";

export default {
  tailwindTheme: {
    extend: {},
  },
  routes,
} as const satisfies WeaverBuildOptions;
