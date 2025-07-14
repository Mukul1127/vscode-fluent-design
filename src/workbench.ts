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
    // old path
    "electron-sandbox",
    path.join("electron-sandbox", "workbench"),

    // v1.102+ path
    "electron-browser",
    path.join("electron-browser", "workbench"),
  ];

  const candidateHtmlFiles = [
    "workbench.html", // VSCode
    "workbench.esm.html", // VSCode ESM
    "workbench-dev.html", // VSCode dev
  ];

  const candidatePaths = candidateWorkbenchDirectories.flatMap((dir) =>
    candidateHtmlFiles.map((file) => path.join(basePath, dir, file)),
  );

  const candidatePromises: Promise<string>[] = candidatePaths.map(async (candidatePath) => {
      try {
        const statResult = await stat(candidatePath);
        if (statResult.isDirectory()) {
          // As far as I know, there *should* never be a directory with a .html suffix.
          window.showInformationMessage(
            messages.isDirectoryNotFile(candidatePath),
          );
          throw new Error(messages.isDirectoryNotFile(candidatePath));
        }

        return candidatePath;
      } catch (error) {
        if (!(error instanceof Error)) {
          window.showErrorMessage(messages.errorNotInstanceOfError(error));
          throw error;
        }
        if (error.code !== "ENOENT") {
          // As long as the error is not "file not found", we should log it.
          window.showInformationMessage(
            messages.workbenchPathFailedStat(String(error)),
          );
        }
        throw error;
      }
  });

  try {
    const result = await Promise.any(candidatePromises);
    return result;
  } catch {
    // All candidates failed
    window.showErrorMessage(messages.workbenchPathLookupFailed);
    return null;
  }
}
