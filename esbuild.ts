/*
 * This file is part of vscode-fluent-design.
 *
 * vscode-fluent-design is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vscode-fluent-design is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with vscode-fluent-design. If not, see <https://www.gnu.org/licenses/>.
 */

import { rm } from "node:fs/promises";
import * as esbuild from "esbuild";
import { getContexts } from "/esbuild.config";

const production: boolean = process.argv.includes("--production");
const watch: boolean = process.argv.includes("--watch");

const contexts: esbuild.BuildOptions[] = getContexts(production);

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
  await rm("./dist", { recursive: true }).catch((error: unknown) => {
    const safeError: NodeJS.ErrnoException = error as NodeJS.ErrnoException;
    if (safeError.code === "ENOENT") {
      return;
    }
    console.error(error);
    process.exit(1);
  });

  if (watch) {
    // Build contexts
    const results = await Promise.allSettled(contexts.map((opts) => esbuild.context(opts)));

    // Filter out fulfilled contexts and report errors
    const fulfilled = results.filter((r): r is PromiseFulfilledResult<esbuild.BuildContext> => r.status === "fulfilled");
    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");

    if (rejected.length > 0) {
      console.error("Some build contexts failed to initialize:");
      rejected.forEach((r) => {
        console.error(r.reason);
      });
      process.exit(1);
    }

    const buildContexts = fulfilled.map((r) => r.value);

    await Promise.allSettled(buildContexts.map((ctx) => ctx.watch()));

    const cleanup = async (): Promise<void> => {
      await Promise.allSettled(buildContexts.map((ctx) => ctx.dispose()));
      process.exit(0);
    };

    process.on("SIGINT", () => void cleanup());
    process.on("SIGTERM", () => void cleanup());
  } else {
    // Build
    const results = await Promise.allSettled(contexts.map((opts) => esbuild.build(opts)));

    // Report errors
    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");

    if (rejected.length > 0) {
      console.error("Some contexts failed to build:");
      rejected.forEach((r) => {
        console.error(r.reason);
      });
      process.exit(1);
    }
  }
}

buildAll().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
