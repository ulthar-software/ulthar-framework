import type esbuild from "esbuild";
import type { RoutesDefinition } from "../routing/route-path.js";
import { htmlPlugin } from "./plugins/html.js";
import { pagesPlugin } from "./plugins/pages.js";
import { postcssPlugin, type TailwindTheme } from "./plugins/postcss.js";

export interface WeaverBuildOptions {
  tailwindTheme: TailwindTheme;
  routes: RoutesDefinition;
}

export type { TailwindTheme } from "./plugins/postcss.js";

export const defaultPlugins = (opts: WeaverBuildOptions) =>
  [
    postcssPlugin(opts.tailwindTheme),
    htmlPlugin,
    pagesPlugin(opts.routes),
  ] satisfies esbuild.Plugin[];
