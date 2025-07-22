import { readFile, writeFile } from "node:fs/promises";
import { locateFile } from "@src/file";
import { Logger } from "@src/logger";

const logger = new Logger("patch.ts");

const fluentDesignTagStart = "/* Fluent Design Patch -- Start */";
const fluentDesignTagEnd = "/* Fluent Design Patch -- End */";

const fileMapping = {
  "main.js": "out/main.js",
  "workbench.html":
    "out/vs/code/{electron-browser,electron-sandbox}/workbench/{workbench.html,workbench.esm.html}",
};

/**
 * Patches the editor with the Fluent Design Patch.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the patching completed.
 * @throws {NodeJS.ErrnoException} Throws if an error reading or writing a file occured.
 */
export async function patch(): Promise<void> {
  await Promise.allSettled(
    Object.entries(fileMapping).map(async ([fileName, targetGlob]): Promise<void> => {
      const patchFilePath = new URL(`modifyFiles/${fileName}`, import.meta.url);
      let patchContent: string;
      try {
        patchContent = await readFile(patchFilePath, { encoding: "utf-8" });
      } catch (error: unknown) {
        const safeError: NodeJS.ErrnoException = error as NodeJS.ErrnoException;
        logger.error(`Failed to read patch file: ${safeError.message}.`);
        return;
      }

      const targetFile = await locateFile(targetGlob);

      const targetContents = await readFile(targetFile, {
        encoding: "utf-8",
      });

      if (targetContents.includes(fluentDesignTagStart)) {
        logger.warn(`Patch already applied to ${targetFile}.`);
        return;
      }

      const newContents = targetContents + fluentDesignTagStart + patchContent + fluentDesignTagEnd;

      await writeFile(targetFile, newContents, { encoding: "utf-8" });

      console.log(`Patched file: ${targetFile}`);
    }),
  );
}

/**
 * Checks whether the Fluent Design Patch is installed.
 *
 * @async
 * @returns {Promise<boolean>} A promise that resolves true if the patch is installed and false otherwise.
 */
export async function isPatchInstalled(): Promise<boolean> {
  const filePath = await locateFile("out/main.js");
  const fileContents = await readFile(filePath, { encoding: "utf-8" });
  return fileContents.includes(fluentDesignTagStart);
}
