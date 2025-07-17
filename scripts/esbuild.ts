/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins */
/** biome-ignore-all lint/suspicious/noConsole: This is not shipped code, this tool is only used to bundle. */

import { rm } from "node:fs/promises";
import process from "node:process";
import type { BuildContext, BuildOptions } from "esbuild";
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
    external: ["vscode"],
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
  // Clean build directory.
  try {
    await rm("./dist", { recursive: true });
  } catch (error: unknown) {
    const safeError = error as NodeJS.ErrnoException;
    console.error(safeError);
  }

  // Build contexts
  let ctxs: BuildContext<BuildOptions>[] = [];
  try {
    ctxs = await Promise.all(
      contexts.map((opts) => context(opts)),
    );
  } catch (error: unknown) {
    console.error(error);
  }

  // Run builds
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
    await Promise.allSettled(
      ctxs.map(async (ctx) => {
        await ctx.rebuild();
        await ctx.dispose();
      }),
    );
  }
}

buildAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
