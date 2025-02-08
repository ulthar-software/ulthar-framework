import type { Plugin } from "esbuild";

export const htmlPlugin = {
  name: "html",
  setup(build) {
    build.onLoad({ filter: /\.html$/, namespace: "file" }, async (args) => {
      const contents = await Deno.readTextFile(args.path);

      return {
        contents: contents.replaceAll(".ts", ".js"),
        loader: "copy",
      };
    });
  },
} as Plugin;
