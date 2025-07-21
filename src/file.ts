/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { Stats } from "node:fs";
import { glob, stat } from "node:fs/promises";
import type { LoggerType } from "@src/logger";
import { Logger } from "@src/logger";
import { env } from "vscode";

const logger: LoggerType = new Logger("workbench.ts");

/**
 * Tests the provded path for whether it's a valid file that is accessible.
 *
 * @async
 * @param {string} filePath The path to test.
 * @returns {Promise<void>}
 * @throws {NodeJS.ErrnoException} If the path is invalid (failed to stat, is a directory, etc).
 */
async function validatePath(filePath: string): Promise<void> {
  const statResult: Stats = await stat(filePath);
  if (statResult.isDirectory()) {
    // Throw NodeJS.ErrnoException with all parameters.
    const err: NodeJS.ErrnoException = Object.assign(
      new Error(`Path: ${filePath} is a directory`),
      {
        code: "EISDIR",
        path: filePath,
        syscall: "stat",
        name: "Error",
      },
    );

    throw err;
  }
}

/**
 * Searches and returns the workbench html file path.
 *
 * @async
 * @returns {Promise<string>} The path to the workbench file.
 * @throws {AggregateError} If all workbench file path canidates were invalid.
 */
export async function locateFile(globPattern: string): Promise<string> {
  logger.info(`Started locating file with glob pattern: ${globPattern}`);

  for await (const entry of glob(globPattern, { cwd: env.appRoot })) {
    try {
      await validatePath(entry);
      logger.info(`Finished locating file, file path: ${entry}`);
      return entry;
    } catch (error: unknown) {
      const safeError: NodeJS.ErrnoException = error as NodeJS.ErrnoException;
      logger.warn(`Path ${entry} failed validation, error: ${safeError}`);
    }
  }

  throw new Error("Failed to glob file.");
}

export const workbenchGlob = "out/vs/code/{electron-browser,electron-sandbox}/workbench/{workbench.html,workbench.esm.html}";