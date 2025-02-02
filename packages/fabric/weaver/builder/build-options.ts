import esbuild from "esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.1";
import { RoutesDefinition } from "../routing/route-path.ts";
import { htmlPlugin } from "./plugins/html.ts";
import { pagesPlugin } from "./plugins/pages.ts";
import { postcssPlugin, TailwindTheme } from "./plugins/postcss.ts";

export interface WeaverBuildOptions {
  tailwindTheme: TailwindTheme;
  routes: RoutesDefinition;
}

export type { TailwindTheme } from "./plugins/postcss.ts";

export const defaultPlugins = (opts: WeaverBuildOptions) => ([
  postcssPlugin(opts.tailwindTheme),
  htmlPlugin,
  pagesPlugin(opts.routes),
  ...denoPlugins(),
] satisfies esbuild.Plugin[]);
