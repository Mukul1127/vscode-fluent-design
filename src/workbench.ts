import { stat } from "node:fs/promises";
import path from "node:path";
import { env, window } from "vscode";

import { messages } from "./messages.ts";

type CandidateScore = {
  pass: boolean;
  failReason?: string;
};

/**
 *
 * @param {string} candidatePath The path to test.
 * @returns {Promise<CandidateScore>} A score for the path with whether it passes and if it failed, why it did.
 */
async function testCandidatePath(
  candidatePath: string,
): Promise<CandidateScore> {
  try {
    const statResult = await stat(candidatePath);
    if (statResult.isDirectory()) {
      // As far as I know, there *should* never be a directory with a .html suffix.
      return {
        pass: false,
        failReason: messages.isDirectoryNotFile(candidatePath),
      };
    }
    return { pass: true };
  } catch (error) {
    if (!(error instanceof Error)) {
      return {
        pass: false,
        failReason: messages.errorNotInstanceOfError(error),
      };
    }
    if (error.code === "ENOENT") {
      return { pass: false, failReason: "ENOENT" };
    }
    return {
      pass: false,
      failReason: messages.workbenchPathFailedStat(candidatePath, error),
    };
  }
}

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

  // Make array of Promises that ensures path is correct before returning path, throwing otherwise.
  const candidatePromises: Promise<string>[] = candidatePaths.map(
    async (candidatePath) => {
      const score = await testCandidatePath(candidatePath);
      if (!score.pass) {
        const customError = new Error(score.failReason);
        if (score.failReason !== "ENOENT") {
          window.showErrorMessage(String(customError));
        }
        throw customError;
      }
      return candidatePath;
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
