/** biome-ignore-all lint/nursery/noUnresolvedImports: ESBuild and VSCode should show failures if any of these are amiss and biome's implementation is a *bit* overzealous */

import { constants, copyFile, unlink } from "node:fs/promises";
import { window } from "vscode";
import { messages } from "./messages.js";

/**
 * Creates a backup if the backup file doesn't already exist.
 *
 * @param {string} originalFilePath The original file path to copy from.
 * @param {string} backupFilePath The backup file path to copy to.
 * @returns {Promise<void>} Resolves when the backup is created. `true` means the operation completed successfully.
 */
export async function createBackup(
  originalFilePath: string,
  backupFilePath: string,
): Promise<boolean> {
  try {
    await copyFile(originalFilePath, backupFilePath, constants.COPYFILE_EXCL);
    return true;
  } catch (error) {
    window.showErrorMessage(messages.backupFailed + String(error));
    return false;
  }
}

/**
 * Restores a backup overwriting the original file if it exists
 *
 * Optionally, the backup file is kept if `keepBackup` is `true`.
 *
 * @param {string} backupFilePath The backup file path to copy from.
 * @param {string} originalFilePath The original file path to copy to.
 * @param {boolean} keepBackup Whether to keep the backup file.
 * @returns {Promise<void>} Resolves when the restore is complete. `true` means the operation completed successfully.
 */
export async function restoreBackup(
  backupFilePath: string,
  originalFilePath: string,
  keepBackup?: boolean,
): Promise<boolean> {
  try {
    await copyFile(backupFilePath, originalFilePath);
    if (!keepBackup) {
      await unlink(backupFilePath);
    }
    return true;
  } catch (error) {
    window.showErrorMessage(messages.backupFailed + String(error));
    return false;
  }
}
