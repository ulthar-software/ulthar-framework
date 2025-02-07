import autoprefixer from "autoprefixer";
import type { Plugin } from "esbuild";
import postcss from "npm:postcss";
import tailwindcss, { Config } from "tailwindcss";

export type TailwindTheme = tailwindcss.Config["theme"];

export const postcssPlugin = (theme: TailwindTheme) => ({
  name: "postcss",
  setup: (build) => {
    const tailwindPlugin = tailwindcss({
      content: [
        "./index.html",
        "./src/**/*.ts",
      ],
      plugins: [],
      theme,
    } as Config);

    build.onLoad({ filter: /\.css$/, namespace: "file" }, async (args) => {
      const decoder = new TextDecoder("utf-8");
      const contents = await Deno.readFile(args.path);

      const result = await postcss([tailwindPlugin, autoprefixer]).process(
        decoder.decode(contents),
        {
          from: args.path,
        },
      );
      return {
        contents: result.css,
        loader: "css",
      };
    });
  },
} as Plugin);
