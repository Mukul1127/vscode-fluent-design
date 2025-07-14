import { constants, copyFile, unlink } from "node:fs/promises";
import * as vscode from "vscode";
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
    // COPYFILE_EXCL ensures the backup won't be created if it already exists.
    await copyFile(originalFilePath, backupFilePath, constants.COPYFILE_EXCL);
    return true;
  } catch (error) {
    vscode.window.showErrorMessage(messages.backupFailed + String(error));
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
    // COPYFILE_FICLONE overwrites the original file if it exists, creating it otherwise.
    await copyFile(
      backupFilePath,
      originalFilePath,
      constants.COPYFILE_FICLONE,
    );
    if (!keepBackup) {
      await unlink(backupFilePath);
    }
    return true;
  } catch (error) {
    vscode.window.showErrorMessage(messages.backupFailed + String(error));
    return false;
  }
}
