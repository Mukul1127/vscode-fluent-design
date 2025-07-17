/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { PathLike, Stats } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import type { LoggerType } from "@src/logger";
import { Logger } from "@src/logger";
import { env } from "vscode";

const logger: LoggerType = new Logger("workbench.ts");

/**
 * Tests the provded workbench path for whether it's a valid path that this we can access.
 *
 * @async
 * @param {string} candidatePath The path to test.
 * @returns {Promise<void>}
 * @throws {NodeJS.ErrnoException} If the path is invalid (failed to stat, directory, etc).
 */
async function validateCandidatePath(candidatePath: string): Promise<void> {
  const statResult: Stats = await stat(candidatePath);
  if (statResult.isDirectory()) {
    // Throw NodeJS.ErrnoException with all parameters.
    const err: NodeJS.ErrnoException = Object.assign(
      new Error(`Path: ${candidatePath} is a directory`),
      {
        code: "EISDIR",
        path: candidatePath,
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
 * @returns {Promise<PathLike>} The path to the workbench file.
 * @throws {AggregateError} If all workbench file path canidates were invalid.
 */
export async function locateWorkbench(): Promise<PathLike> {
  // Technically we could use PathLike in the implementation but this makes the logic easier for no side effects.

  logger.info("Started locating workbench file.");

  const basePath: string = path.join(env.appRoot, "out", "vs", "code");

  const candidateWorkbenchDirectories: string[] = [
    path.join("electron-sandbox", "workbench"), // pre-v1.102 path
    path.join("electron-browser", "workbench"), // post-v1.102 path
  ];

  const candidateHtmlFiles: string[] = [
    "workbench.html", // VSCode
    "workbench.esm.html", // VSCode ESM
    "workbench-dev.html", // VSCode dev
  ];

  // Get list of candidate paths.
  const candidatePaths: string[] = candidateWorkbenchDirectories.flatMap(
    (dir: string) =>
      candidateHtmlFiles.map((file: string) => path.join(basePath, dir, file)),
  );

  logger.debug(`Candidate paths: ${candidatePaths}`);

  // Make array of Promises that ensures path is correct before returning path, throwing otherwise.
  const candidatePromises: Promise<string>[] = candidatePaths.map(
    async (candidatePath: string) => {
      try {
        await validateCandidatePath(candidatePath);
      } catch (error: unknown) {
        const safeError = error as NodeJS.ErrnoException; // validateCandidatePath() *should* only throw NodeJS.ErrnoException.
        logger.warn(
          `Path ${candidatePath} failed validation, error: ${safeError}`,
        );
        throw safeError; // Let error continue so this promise rejects.
      }

      return candidatePath;
    },
  );

  // Run all promises at once and return the first promise that succeeds.
  const result: string = await Promise.any(candidatePromises);

  logger.info(`Workbench path: ${result}`);

  logger.info("Finished locating workbench file.");

  return result;
}
