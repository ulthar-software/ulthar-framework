/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import type { Plugin } from "esbuild";
import fs from "node:fs/promises";
import postcss from "postcss";
import type { Config as TailwindConfig } from "tailwindcss";

export type TailwindTheme = TailwindConfig["theme"];

export const postcssPlugin = (theme: TailwindTheme) =>
  ({
    name: "postcss",
    setup: (build) => {
      const tailwindPlugin = tailwindcss({
        content: ["./index.html", "./src/**/*.js"],
        plugins: [],
        theme,
      } as any);

      build.onLoad({ filter: /\.css$/, namespace: "file" }, async (args) => {
        const contents = await fs.readFile(args.path, "utf-8");

        const result = await postcss([
          tailwindPlugin as postcss.Plugin,
          autoprefixer,
        ]).process(contents, {
          from: args.path,
        });
        return {
          contents: result.css,
          loader: "css",
        };
      });
    },
  }) as Plugin;
