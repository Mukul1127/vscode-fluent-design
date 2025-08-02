import { Logger } from "/src/logger";
import { env } from "vscode";
import { glob } from "glob";

const logger = new Logger().prefix("file.ts");

/**
 * Searches and returns the file path.
 *
 * @async
 * @param {string} globPattern The glob pattern to search for.
 * @returns {Promise<string>} The path to the file.
 * @throws {NodeJS.ErrnoException} If no valid files were found.
 */
export async function locateFile(globPattern: string): Promise<string> {
  const prefixedLogger = logger.prefix("locateFile()");

  const [match] = await glob(globPattern, {
    absolute: true,
    cwd: env.appRoot,
    nodir: true,
    stat: true,
  });

  if (!match) {
    prefixedLogger.error(`For glob: ${globPattern}, no files matched.`);

    // Throw NodeJS.ErrnoException ENOENT
    const error: NodeJS.ErrnoException = Object.assign(new Error(`No files matched glob pattern: ${globPattern}.`), {
      code: "ENOENT",
      path: globPattern,
      syscall: "glob",
    });
    throw error;
  }

  prefixedLogger.info(`For glob: ${globPattern}, found path: ${match}.`);
  return match;
}
