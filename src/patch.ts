import { readFile, writeFile } from "node:fs/promises";
import { locateFile } from "/src/file";
import { Logger } from "/src/logger";

const logger = new Logger("patch.ts");

const fluentDesignTagStart = "/* Fluent Design Patch -- Start */";
const fluentDesignTagEnd = "/* Fluent Design Patch -- End */";

const fileMapping = {
  "main.js": "out/main.js",
};

/**
 * Patches the editor with the Fluent Design Patch.
 *
 * @async
 * @returns {Promise<PromiseSettledResult<void>[]>} A promise that resolves when the patching completed.
 * @throws {NodeJS.ErrnoException} Throws if an error reading or writing a file occured.
 */
export async function patch(): Promise<PromiseSettledResult<void>[]> {
  return await Promise.allSettled(
    Object.entries(fileMapping).map(async ([fileName, targetGlob]): Promise<void> => {
      const patchFilePath = import.meta.resolve(`modifyFiles/${fileName}`);
      const patchContent = await readFile(patchFilePath, {
        encoding: "utf-8",
      });

      const targetFilePath = await locateFile(targetGlob);
      const targetContents = await readFile(targetFilePath, {
        encoding: "utf-8",
      });

      if (targetContents.includes(fluentDesignTagStart)) {
        logger.warn(`Patch already applied to ${targetFilePath}.`);
        throw new Error("Patch already applied to file.");
      }

      const newContents = targetContents + fluentDesignTagStart + patchContent + fluentDesignTagEnd;

      await writeFile(targetFilePath, newContents, { encoding: "utf-8" });

      logger.info(`Patched file: ${targetFilePath}`);
    }),
  );
}

/**
 * Checks whether the Fluent Design Patch is installed.
 *
 * @async
 * @returns {Promise<boolean>} A promise that resolves true if the patch is installed and false otherwise.
 * @throws {Error} If the main.js file couldn't be located or we failed to read it.
 */
export async function isPatchInstalled(): Promise<boolean> {
  const filePath = await locateFile("out/main.js");
  const fileContents = await readFile(filePath, { encoding: "utf-8" });
  return fileContents.includes(fluentDesignTagStart);
}
