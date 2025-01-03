import type * as esbuild from "esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.1";
import * as path from "node:path";

export const defaultPlugins = [
  {
    name: "skip css",
    setup: (build) => {
      build.onResolve({ filter: /\.css$/, namespace: "file" }, (args) => {
        return {
          path: path.resolve(args.resolveDir, args.path),
        };
      });
      build.onLoad({ filter: /\.css$/, namespace: "file" }, (args) => {
        const contents = Deno.readFileSync(args.path);
        return {
          contents: contents,
          loader: "css",
        };
      });
      // build.onResolve({ filter: /.*/, namespace: "data" }, (args) => {
      // return args.kind !== "url-token" ? undefined : { external: true };
      // });
    },
  },
  ...denoPlugins(),
] satisfies esbuild.Plugin[];
