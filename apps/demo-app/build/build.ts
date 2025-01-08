import { build } from "esbuild";
import opts from "../config.ts";

try {
  Deno.removeSync("dist", { recursive: true });
} catch {}

await build(opts);
