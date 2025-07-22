import { stat } from "node:fs/promises";
import { Logger } from "@src/logger";
import { env } from "vscode";

import { glob } from "glob";

const logger = new Logger("workbench.ts");

/**
 * Searches and returns the file path.
 *
 * @async
 * @param {string} globPattern The glob pattern to search for.
 * @returns {Promise<string>} The path to the file.
 * @throws {Error} If no valid files were found.
 */
export async function locateFile(globPattern: string): Promise<string> {
  logger.info(`Started locating file with glob pattern: ${globPattern}`);

  const entries: string[] = await glob(globPattern, {
    cwd: env.appRoot,
    nodir: true,
  });

  if (entries.length === 0) {
    throw new Error("No files matched the glob pattern.");
  }

  const result = await Promise.any(
    entries.map(async (entry) => {
      try {
        await stat(entry); // Ensure we have permmissions to access file.
        logger.info(`Finished locating file, file path: ${entry}`);
        return entry;
      } catch (error: unknown) {
        const safeError: NodeJS.ErrnoException = error as NodeJS.ErrnoException;
        logger.warn(`Path ${entry} failed validation, error: ${safeError.message}`);
        throw safeError; // Propegate error so promise fails.
      }
    }),
  );

  return result;
}
