import esbuild from "esbuild";
import { rmdirSync } from "node:fs";
import { defaultPlugins, WeaverBuildOptions } from "./build-options.ts";
import { transformRoutes } from "./plugins/pages.ts";

export async function build(opts: WeaverBuildOptions) {
  try {
    rmdirSync("dist", { recursive: true });
  } catch {
    //do nothing
  }

  await esbuild.build({
    plugins: [
      ...defaultPlugins(
        opts,
      ),
    ],
    define: {
      "WEAVER_MODE": `"prod"`,
    },
    entryPoints: [
      "src/index.html",
      "src/app.ts",
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
