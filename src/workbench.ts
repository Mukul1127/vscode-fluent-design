/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import { statSync } from "node:fs";
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
function testCandidatePath(candidatePath: string): CandidateScore {
  try {
    const statResult = statSync(candidatePath, { throwIfNoEntry: false });
    if (statResult === undefined) {
      return {
        pass: false,
        failReason: "undefined",
      };
    }
    if (statResult.isDirectory()) {
      // As far as I know, there *should* never be a directory with a .html suffix.
      return {
        pass: false,
        failReason: messages.isDirectoryNotFile(candidatePath),
      };
    }
    return { pass: true };
  } catch (error) {
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
    path.join("electron-sandbox", "workbench"), // pre-v1.102 path
    path.join("electron-browser", "workbench"), // post-v1.102 path
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
