/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { PathLike } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import type { LoggerType } from "./logger.ts";
import { Logger } from "./logger.ts";

const _logger: LoggerType = new Logger("patch.ts");

const fluentDesignPatchTag = "<!-- Fluent Design Patched -->";

/**
 * Patches the workbench HTML file to inject Fluent Design CSS and JavaScript.
 *
 * @async
 * @param {PathLike} workbenchPath - The path to the workbench HTML file.
 * @returns {Promise<void>} A promise that resolves when the patching completed.
 * @throws {NodeJS.ErrnoException} Throws if an error reading or writing the file occured.
 */
export async function patch(workbenchPath: PathLike): Promise<void> {
  const html = await readFile(workbenchPath, { encoding: "utf-8" });

  // Pave way for real implementation.

  // Tag file
  html.replace("<html>", `<html>${fluentDesignPatchTag}`);

  await writeFile(workbenchPath, html, { encoding: "utf-8" });
}

/**
 * Checks the specified workbench file to see if the Fluent Design Patch is installed.
 *
 * @async
 * @param {PathLike} workbenchPath The path to the workbench file to check.
 * @returns {Promise<boolean>} A promise that resolves true if the patch is installed and false otherwise.
 */
export async function isPatchInstalled(
  workbenchPath: PathLike,
): Promise<boolean> {
  const fileContents = await readFile(workbenchPath, { encoding: "utf-8" });
  return fileContents.includes(fluentDesignPatchTag);
}
