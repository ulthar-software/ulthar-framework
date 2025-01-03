import { defaultPlugins } from "@fabric/weaver/builder";
import * as esbuild from "esbuild";

export const opts = {
  plugins: [...defaultPlugins],
  entryPoints: ["src/app.ts"],
  bundle: true,
  minify: true,
  outdir: "dist",
} as const satisfies esbuild.BuildOptions;
