import { stat } from "node:fs/promises";
import path from "node:path";
import * as vscode from "vscode";

import messages from "./messages.js";

/**
 * Searches and returns the workbench html file path.
 *
 * @returns {Promise<string | null>} A promise that resolves either a `string` when the workbench html file is found or `null` if the lookup failed.
 */
export async function locateWorkbench(): Promise<string | null> {
  const basePath = path.join(vscode.env.appRoot, "out", "vs", "code");

  const workbenchDirCandidates = [
    // old path
    "electron-sandbox",
    path.join("electron-sandbox", "workbench"),

    // v1.102+ path
    "electron-browser",
    path.join("electron-browser", "workbench"),
  ];

  const htmlFileNameCandidates = [
    "workbench.html", // VSCode
    "workbench.esm.html", // VSCode ESM
    "workbench-dev.html", // VSCode dev
  ];

  for (const workbenchDirCandidate of workbenchDirCandidates) {
    for (const htmlFileNameCandidate of htmlFileNameCandidates) {
      const htmlPathCandidate = path.join(
        basePath,
        workbenchDirCandidate,
        htmlFileNameCandidate,
      );
      try {
        const statResult = await stat(htmlPathCandidate);
        if (!statResult.isFile()) {
          // As far as I know, there should never be a directory with a .html suffix.
          // We shouldn't exit the loop here, because still might be a valid workbench file
          vscode.window.showInformationMessage(
            htmlPathCandidate + messages.workbenchPathIsDirectory,
          );
          continue;
        }
        return htmlPathCandidate;
      } catch (error) {
        if (!(error instanceof Error)) {
          vscode.window.showErrorMessage(messages.errorNotInstanceOfError);
          continue;
        }
        if (error.code !== "ENOENT") {
          // As long as the error is not "file not found", we should log it
          // We shouldn't exit the loop here, because still might be a valid workbench file
          vscode.window.showInformationMessage(
            `${messages.workbenchPathFailedStat} ${error}`,
          );
        }
      }
    }
  }

  vscode.window.showErrorMessage(messages.workbenchPathLookupFailed);
  return null;
}
