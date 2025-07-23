import { Logger } from "/src/logger";
import { env } from "vscode";
import { globIterate } from "glob";

const logger = new Logger("file.ts");

/**
 * Searches and returns the file path.
 *
 * @async
 * @param {string} globPattern The glob pattern to search for.
 * @returns {Promise<string>} The path to the file.
 * @throws {Error} If no valid files were found.
 */
export async function locateFile(globPattern: string): Promise<string> {
  for await (const path of globIterate(globPattern, {
    absolute: true,
    cwd: env.appRoot,
    nodir: true,
    stat: true,
  })) {
    logger.info(`For glob: ${globPattern}, found path: ${path}`);
    return path;
  }

  throw new Error("No files matched the glob pattern.");
}
