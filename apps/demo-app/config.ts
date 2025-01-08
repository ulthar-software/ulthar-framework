import { defaultPlugins } from "@fabric/weaver/builder";
import { BuildOptions } from "esbuild";

const DEBUG = false;

export default {
  plugins: [...defaultPlugins({
    tailwindTheme: {
      extend: {},
    },
  })],
  entryPoints: ["src/index.html", "src/app.ts"],
  bundle: true,
  minify: !DEBUG,
  treeShaking: true,
  outdir: "dist",
  format: "esm",
  splitting: true,
  sourcemap: true,
  target: "esnext",
} as const satisfies BuildOptions;
