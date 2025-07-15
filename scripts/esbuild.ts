import process from "node:process";
import type { BuildOptions } from "esbuild";
import { context } from "esbuild";

const production: boolean = process.argv.includes("--production");
const watch: boolean = process.argv.includes("--watch");

const contexts: BuildOptions[] = [
  {
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    outdir: "./dist",
    outbase: "./src",
    external: ["vscode", "sharp"],
    logLevel: "info",
    minify: production,
    sourcemap: !production,
  },
  {
    entryPoints: ["src/css/*.css", "src/js/*.js"],
    bundle: true,
    platform: "browser",
    format: "iife",
    outdir: "./dist",
    outbase: "./src",
    external: ["dummy"], // CSS uses it as a placeholder, esbuild tries to resolve it.
    logLevel: "info",
    minify: production,
    sourcemap: !production,
  },
];

/**
 * Builds all the esbuild contexts in the `contexts` array simultaneously.
 *
 * In normal mode, it performs a one-time build and exits.
 * In watch mode (`--watch`), it rebuilds anyime a source file is modified until stopped.
 * Use the production flag (`--production`) to enable more optimizations.
 *
 * @returns {Promise<void>} A promise that resolves when the build is complete or the user exits watch mode.
 */
async function buildAll(): Promise<void> {
  const ctxs = await Promise.all(contexts.map((opts) => context(opts)));

  if (watch) {
    await Promise.all(ctxs.map((ctx) => ctx.watch()));

    // Handle graceful shutdown
    const cleanup = async (): Promise<void> => {
      await Promise.all(ctxs.map((ctx) => ctx.dispose()));
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } else {
    await Promise.all(
      ctxs.map(async (ctx) => {
        await ctx.rebuild();
        await ctx.dispose();
      }),
    );
  }
}

buildAll().catch((error) => {
  // biome-ignore lint/suspicious/noConsole: This is not shipped code, this tool is only used to bundle.
  console.error(error);
  process.exit(1);
});
