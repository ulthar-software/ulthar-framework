import type { Plugin } from "esbuild";
import fs from "node:fs/promises";

export const htmlPlugin = {
  name: "html",
  setup(build) {
    build.onLoad({ filter: /\.html$/, namespace: "file" }, async (args) => {
      const contents = await fs.readFile(args.path, "utf-8");

      return {
        contents: contents.replaceAll(".js", ".js"),
        loader: "copy",
      };
    });
  },
} as Plugin;
