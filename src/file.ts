/*
 * This file is part of vscode-fluent-design.
 *
 * vscode-fluent-design is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vscode-fluent-design is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with vscode-fluent-design. If not, see <https://www.gnu.org/licenses/>.
 */

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
 * @throws {Error} If no valid files were found.
 */
export async function locateFile(globPattern: string): Promise<string> {
  const prefixedLogger = logger.prefix("locateFile()");

  const matches = await glob(globPattern, {
    absolute: true,
    cwd: env.appRoot,
    nodir: true,
    stat: true,
  });

  if (matches.length === 0) {
    prefixedLogger.warn(`For glob: ${globPattern}, no files matched or cannot access.`);
    throw new Error(`For glob: ${globPattern}, no files matched or cannot access.`);
  }

  if (matches.length > 1) {
    prefixedLogger.warn(`For glob: ${globPattern}, multiple files matched, ambiguous.`);
    throw new Error(`For glob: ${globPattern}, multiple files matched, ambiguous.`);
  }

  prefixedLogger.info(`For glob: ${globPattern}, found path: ${matches[0]}.`);
  return matches[0];
}
