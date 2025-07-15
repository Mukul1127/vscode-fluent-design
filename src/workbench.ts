/** biome-ignore-all lint/nursery/noUnresolvedImports: ESBuild and VSCode should show failures if any of these are amiss and biome's implementation is a *bit* overzealous */
/** biome-ignore-all lint/nursery/noExcessiveLinesPerFunction: fix soon */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: its not that bad, right? */

import { stat } from "node:fs/promises";
import path from "node:path";
import { env, window } from "vscode";

import { messages } from "./messages.js";

/**
 * Searches and returns the workbench html file path.
 *
 * @returns {Promise<string | null>} A promise that resolves either a `string` when the workbench html file is found or `null` if the lookup failed.
 */
export async function locateWorkbench(): Promise<string | null> {
  const basePath = path.join(env.appRoot, "out", "vs", "code");

  const candidateWorkbenchDirectories = [
    "electron-sandbox", // pre-v1.102 path
    "electron-browser", // post-v1.102 path
  ];

  const candidateHtmlFiles = [
    "workbench.html", // VSCode
    "workbench.esm.html", // VSCode ESM
    "workbench-dev.html", // VSCode dev
  ];

  // Get list of candidate paths.
  const candidatePaths = candidateWorkbenchDirectories.flatMap((dir) =>
    candidateHtmlFiles.map((file) => path.join(basePath, dir, file)),
  );

  // Make array of Promises that ensures path is correct before returning path, null otherwise.
  const candidatePromises: Promise<string>[] = candidatePaths.map(
    async (candidatePath) => {
      try {
        const statResult = await stat(candidatePath);
        if (statResult.isDirectory()) {
          // As far as I know, there *should* never be a directory with a .html suffix.
          const customError = new Error(messages.isDirectoryNotFile(candidatePath));
          window.showErrorMessage(String(customError));
          throw customError;
        }

        return candidatePath;
      } catch (error) {
        if (!(error instanceof Error)) {
          const customError = new Error(messages.errorNotInstanceOfError(error));
          window.showErrorMessage(String(customError));
          throw customError;
        }
        if (error.code !== "ENOENT") {
          // As long as the error is not "file not found", we should log it.
          window.showInformationMessage(
            messages.workbenchPathFailedStat(String(error)),
          );
        }
        throw error;
      }
    },
  );

  // Run all promises at once and return the first promies that succeeds.
  try {
    const result = await Promise.any(candidatePromises);
    return result;
  } catch {
    // All candidates failed
    window.showErrorMessage(messages.workbenchPathLookupFailed);
    return null;
  }
}
