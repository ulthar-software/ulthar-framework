import esbuild from "esbuild";
import opts from "../config.ts";

const ctx = await esbuild.context(opts);

await ctx.watch({});

const { host, port } = await ctx.serve({
  servedir: opts.outdir,
  host: "localhost",
  port: 8080,
});

console.log(`Serving at http://${host}:${port}`);
