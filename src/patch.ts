import { readFile, writeFile } from "node:fs/promises";
import { locateFile } from "/src/file";
import { Logger } from "/src/logger";
import { patchMapping } from "./mapping";

const logger = new Logger().prefix("patch.ts");

const fluentDesignTagStart = "/* Fluent Design Patch -- Start */\n";
const fluentDesignTagEnd = "/* Fluent Design Patch -- End */\n";

/**
 * Installs the Fluent Design Patch.
 *
 * @async
 * @returns {Promise<PromiseSettledResult<void>[]>} A promise that resolves when the installation completed.
 */
export async function installPatch(): Promise<PromiseSettledResult<void>[]> {
  const prefixedLogger = logger.prefix("installPatch()");

  return Promise.allSettled(
    Object.entries(patchMapping).map(async ([targetFileGlob, relativePatchFilePath]): Promise<void> => {
      const targetFilePath = await locateFile(targetFileGlob);
      const targetContents = await readFile(targetFilePath, "utf8");

      if (!targetContents.trim()) {
        prefixedLogger.warn(`Target content for ${targetFilePath} is empty.`);
        throw new Error(`Target content for ${targetFilePath} is empty.`);
      }

      if (targetContents.includes(fluentDesignTagStart)) {
        prefixedLogger.warn(`Patch already applied to ${targetFilePath}.`);
        throw new Error("Patch already applied to file.");
      }

      const patchFilePath = new URL(relativePatchFilePath, import.meta.url);
      const patchContent = await readFile(patchFilePath, "utf8");

      if (!patchContent.trim()) {
        prefixedLogger.warn(`Patch content for ${patchFilePath} is empty.`);
        throw new Error(`Patch content for ${patchFilePath} is empty.`);
      }

      const newTargetContents = targetContents + fluentDesignTagStart + patchContent + fluentDesignTagEnd;

      await writeFile(targetFilePath, newTargetContents, "utf8");

      prefixedLogger.info(`Patched file: ${targetFilePath}`);
    }),
  );
}

/**
 * Uninstalls the Fluent Design Patch.
 *
 * @async
 * @returns {Promise<PromiseSettledResult<void>[]>} A promise that resolves when the uninstallation completed.
 */
export async function uninstallPatch(): Promise<PromiseSettledResult<void>[]> {
  const prefixedLogger = logger.prefix("uninstallPatch()");

  return Promise.allSettled(
    Object.keys(patchMapping).map(async (targetFileGlob): Promise<void> => {
      const targetFilePath = await locateFile(targetFileGlob);
      const targetContents = await readFile(targetFilePath, "utf8");

      if (!targetContents.trim()) {
        prefixedLogger.warn(`Target content for ${targetFilePath} is empty.`);
        throw new Error(`Target content for ${targetFilePath} is empty.`);
      }

      const patchStartIndex = targetContents.indexOf(fluentDesignTagStart);
      const patchEndIndex = targetContents.indexOf(fluentDesignTagEnd);

      if (patchStartIndex === -1 || patchEndIndex === -1) {
        prefixedLogger.warn(`Patch not fully found in ${targetFilePath}.`);
        throw new Error("Patch not fully found in file.");
      }

      const newTargetContents =
        targetContents.slice(0, patchStartIndex) + targetContents.slice(patchEndIndex + fluentDesignTagEnd.length);

      await writeFile(targetFilePath, newTargetContents, "utf8");

      prefixedLogger.info(`Unpatched file: ${targetFilePath}`);
    }),
  );
}

/**
 * Checks whether the Fluent Design Patch is installed.
 *
 * @async
 * @returns {Promise<boolean>} A promise that resolves true if the patch is installed and false otherwise.
 * @throws {Error} If the file couldn't be located or we failed to read it.
 */
export async function isPatchInstalled(): Promise<boolean> {
  const filePath = await locateFile(Object.keys(patchMapping)[0]);
  const fileContents = await readFile(filePath, "utf8");
  return fileContents.includes(fluentDesignTagStart);
}
