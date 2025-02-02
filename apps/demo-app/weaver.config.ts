import { WeaverBuildOptions } from "../../packages/fabric/weaver/builder/build-options.ts";
import routes from "./src/routes.ts";

export default {
  tailwindTheme: {
    extend: {},
  },
  routes,
} as const satisfies WeaverBuildOptions;
