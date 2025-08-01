import { cp, rm } from "original-fs/promises";

/**
 * Creates a backup overwriting the original if it exists.
 *
 * @async
 * @param {string} originalFilePath The original path to copy from.
 * @param {string} backupFilePath The backup path to copy to.
 * @returns {Promise<void>} Resolves when the backup is created.
 * @throws {NodeJS.ErrnoException} Throws if one of the paths couldn't be accessed.
 */
export async function createBackup(originalFilePath: string, backupFilePath: string): Promise<void> {
  // Delete folder then copy as we can delete the backup directory while VSCode is running.
  await rm(backupFilePath, { recursive: true, force: true });
  await cp(originalFilePath, backupFilePath, { recursive: true });
}

/**
 * Restores a backup overwriting the original if it exists.
 *
 * @async
 * @param {string} backupFilePath The backup path to copy from.
 * @param {string} originalFilePath The original path to copy to.
 * @returns {Promise<void>} Resolves when the backup is restored.
 * @throws {NodeJS.ErrnoException} Throws if one of the paths couldn't be accessed.
 */
export async function restoreBackup(backupFilePath: string, originalFilePath: string): Promise<void> {
  // Copy overwritting changes as we can't just delete the directory while VSCode is running.
  await cp(backupFilePath, originalFilePath, { recursive: true, force: true });
}

/**
 * Deletes the specified backup.
 *
 * @async
 * @param {string} backupFilePath The backup path to delete.
 * @returns {Promise<void>} Resolves when the backup is deleted.
 * @throws {NodeJS.ErrnoException} Throws if the path couldn't be accessed.
 */
export async function deleteBackup(backupFilePath: string): Promise<void> {
  await rm(backupFilePath, { recursive: true });
}
