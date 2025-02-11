import esbuild from "esbuild";
import { rm } from "node:fs/promises";
import { defaultPlugins, type WeaverBuildOptions } from "./build-options.js";
import { transformRoutes } from "./plugins/pages.js";

export async function build(opts: WeaverBuildOptions) {
  try {
    await rm("dist", { recursive: true, force: true });
  } catch {
    //do nothing
  }

  await esbuild.build({
    plugins: [...defaultPlugins(opts)],
    define: {
      WEAVER_MODE: `"prod"`,
    },
    entryPoints: [
      "./src/index.html",
      "./src/app.js",
      ...Object.values(transformRoutes(opts.routes)),
    ],
    bundle: true,
    minify: true,
    treeShaking: true,
    outdir: "dist",
    format: "esm",
    splitting: true,
    sourcemap: true,
    target: "esnext",
  });
}
