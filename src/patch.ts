/*
 * This file is part of vscode-fluent-design.
 *
 * vscode-fluent-design is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vscode-fluent-design is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with vscode-fluent-design. If not, see <https://www.gnu.org/licenses/>.
 */

import { readFile, writeFile } from "node:fs/promises";
import { locateFile } from "/src/file";
import { Logger } from "/src/logger";
import { patchMapping } from "./mapping";

const logger = new Logger().prefix("patch.ts");

const fluentDesignTagStart = "/* Fluent Design Patch -- Start */\n";
const fluentDesignTagEnd = "/* Fluent Design Patch -- End */\n";

const pattern =
  fluentDesignTagStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*" + fluentDesignTagEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATCH_REGEX = new RegExp(pattern, "g");

const FILE_ENCODING = "utf8";

/**
 * Installs the Fluent Design Patch.
 *
 * @async
 * @returns {Promise<PromiseSettledResult<void>[]>} The patching results.
 */
export async function installPatch(): Promise<PromiseSettledResult<void>[]> {
  const prefixedLogger = logger.prefix("installPatch()");

  return Promise.allSettled(
    Object.entries(patchMapping).map(async ([targetFileGlob, relativePatchFilePath]): Promise<void> => {
      const targetFilePath = await locateFile(targetFileGlob);
      const targetContents = await readFile(targetFilePath, FILE_ENCODING);

      if (!targetContents.trim()) {
        prefixedLogger.warn(`Target content for ${targetFilePath} is empty.`);
        throw new Error(`Target content for ${targetFilePath} is empty.`);
      }

      const patchFilePath = new URL(relativePatchFilePath, import.meta.url);
      const patchContents = await readFile(patchFilePath, FILE_ENCODING);

      if (!patchContents.trim()) {
        prefixedLogger.warn(`Patch content for ${patchFilePath} is empty.`);
        throw new Error(`Patch content for ${patchFilePath} is empty.`);
      }

      const patchBlock = fluentDesignTagStart + patchContents + fluentDesignTagEnd;

      let newTargetContents = "";

      if (PATCH_REGEX.test(targetContents)) {
        prefixedLogger.info(`For file ${targetFilePath}, replacing current patch.`);
        newTargetContents = targetContents.replace(PATCH_REGEX, patchBlock);
      } else {
        prefixedLogger.info(`For file ${targetFilePath}, adding patch.`);
        newTargetContents = targetContents + patchBlock;
      }

      await writeFile(targetFilePath, newTargetContents, FILE_ENCODING);

      prefixedLogger.info(`Patched file: ${targetFilePath}`);
    }),
  );
}

/**
 * Uninstalls the Fluent Design Patch.
 *
 * @async
 * @returns {Promise<PromiseSettledResult<void>[]>} The unpatching results.
 */
export async function uninstallPatch(): Promise<PromiseSettledResult<void>[]> {
  const prefixedLogger = logger.prefix("uninstallPatch()");

  return Promise.allSettled(
    Object.keys(patchMapping).map(async (targetFileGlob): Promise<void> => {
      const targetFilePath = await locateFile(targetFileGlob);
      const targetContents = await readFile(targetFilePath, FILE_ENCODING);

      if (!targetContents.trim()) {
        prefixedLogger.warn(`Target content for ${targetFilePath} is empty.`);
        throw new Error(`Target content for ${targetFilePath} is empty.`);
      }

      if (!PATCH_REGEX.test(targetContents)) {
        prefixedLogger.warn(`Patch not found in ${targetFilePath}.`);
        throw new Error(`Patch not found in ${targetFilePath}.`);
      }

      const newTargetContents = targetContents.replace(PATCH_REGEX, "");

      await writeFile(targetFilePath, newTargetContents, FILE_ENCODING);

      prefixedLogger.info(`Unpatched file: ${targetFilePath}`);
    }),
  );
}
