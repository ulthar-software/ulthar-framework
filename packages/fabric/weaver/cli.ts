import { argv, cwd } from "node:process";
import { WeaverBuildOptions } from "./builder/build-options.ts";
import { build } from "./builder/build.ts";
import { dev } from "./builder/dev.ts";

const opts: WeaverBuildOptions = (await import(
  "file://" + cwd() + "/weaver.config.ts"
)).default;

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
