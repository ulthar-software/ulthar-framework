import esbuild from "esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.1";
import { htmlPlugin } from "./html.ts";
import { postcssPlugin, TailwindTheme } from "./postcss.ts";

export interface BuildOptions {
  tailwindTheme: TailwindTheme;
}

export type { TailwindTheme } from "./postcss.ts";

export const defaultPlugins = (opts: TailwindTheme) => ([
  postcssPlugin(opts),
  htmlPlugin,
  ...denoPlugins(),
] satisfies esbuild.Plugin[]);
