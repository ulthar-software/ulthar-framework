/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { resolve } from "node:path";
import { argv } from "node:process";
import { pathToFileURL } from "node:url";
import "tsx";
import type { WeaverBuildOptions } from "./builder/build-options.js";
import { build } from "./builder/build.js";
import { dev } from "./builder/dev.js";

const opts = (await import(pathToFileURL(resolve("./weaver.config.ts")).href))
  .default as WeaverBuildOptions;

const command = argv[2];

switch (command) {
  case "dev": {
    await dev(opts);
    break;
  }
  case "build": {
    await build(opts);
    break;
  }
  default: {
    console.error(`Unknown command ${command}`);
    break;
  }
}
