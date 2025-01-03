import { build } from "esbuild";
import { opts } from "./config.ts";
const result = await build(opts);

console.log(result);
