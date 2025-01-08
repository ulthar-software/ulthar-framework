import { Plugin } from "esbuild";

export const htmlPlugin = {
  name: "html",
  setup(build) {
    build.onLoad({ filter: /\.html$/, namespace: "file" }, async (args) => {
      const decoder = new TextDecoder("utf-8");
      const contents = await Deno.readFile(args.path);

      return {
        contents: decoder.decode(contents).replaceAll(".ts", ".js"),
        loader: "copy",
      };
    });
  },
} as Plugin;
