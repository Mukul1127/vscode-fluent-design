/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import { stat } from "node:fs/promises";
import path from "node:path";
import { env, window } from "vscode";

import { messages } from "./messages.ts";

type CandidateScore = {
  pass: boolean;
  failReason?: string;
};

/**
 * Tests the provded path for whether it's a valid path that this we can access.
 *
 * @async
 * @param {string} candidatePath The path to test.
 * @returns {Promise<CandidateScore>} A score for the path with whether it passes and if it failed, why it did.
 */
async function testCandidatePath(
  candidatePath: string,
): Promise<CandidateScore> {
  try {
    const statResult = await stat(candidatePath);
    if (statResult.isDirectory()) {
      // As far as I know, there *should* never be a directory named with a .html suffix.
      return {
        pass: false,
        failReason: messages.errors.isDirectoryNotFile(candidatePath),
      };
    }
    return { pass: true };
  } catch (error) {
    const safeError = error as NodeJS.ErrnoException; // stat() *should* only throw NodeJS.ErrnoExceptions.
    if (safeError.code === "ENOENT") {
      return { pass: false, failReason: "ENOENT" };
    }
    return {
      pass: false,
      failReason: messages.errors.workbenchPathFailedStat(candidatePath, safeError),
    };
  }
}

/**
 * Searches and returns the workbench html file path.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves either a `string` when the workbench html file is found or `null` if the lookup failed.
 * @throws {AggregateError} Throws if all workbench file canidates also threw exceptions.
 */
export async function locateWorkbench(): Promise<string> {
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
        const error = new Error(score.failReason);
        if (score.failReason !== "ENOENT") {
          window.showErrorMessage(String(error));
        }
        throw error;
      }
      return candidatePath;
    },
  );

  // Run all promises at once and return the first promise that succeeds.
  const result = await Promise.any(candidatePromises);
  return result;
}
