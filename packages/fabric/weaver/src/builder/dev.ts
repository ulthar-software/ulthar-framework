/* eslint-disable @typescript-eslint/no-non-null-assertion */
import esbuild, { type BuildOptions } from "esbuild";
import { rmdirSync } from "node:fs";
import { defaultPlugins, type WeaverBuildOptions } from "./build-options.js";
import { transformRoutes } from "./plugins/pages.js";

export async function dev(opts: WeaverBuildOptions) {
  try {
    rmdirSync("dist", { recursive: true });
  } catch {
    //do nothing
  }

  const config: BuildOptions = {
    plugins: [...defaultPlugins(opts)],
    define: {
      WEAVER_MODE: `"dev"`,
    },
    entryPoints: [
      "src/index.html",
      "src/app.js",
      ...Object.values(transformRoutes(opts.routes)),
    ],
    bundle: true,
    minify: false,
    treeShaking: true,
    outdir: "dist",
    format: "esm",
    splitting: true,
    sourcemap: true,
    target: "esnext",
  };

  const ctx = await esbuild.context(config);

  await ctx.watch();

  const port = 8080;

  await ctx.serve({
    servedir: config.outdir!,
    host: "localhost",
    port,
  });

  console.log(`Serving at http://localhost:${port}`);
}
