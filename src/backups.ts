/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import { cp, rm } from "node:fs/promises";

/**
 * Creates a backup overwriting the original if it exists.
 *
 * @async
 * @param {string} originalFilePath The original path to copy from.
 * @param {string} backupFilePath The backup path to copy to.
 * @returns {Promise<void>} Resolves when the backup is created.
 * @throws {NodeJS.ErrnoException} Throws if one of the paths couldn't be accessed.
 */
export async function createBackup(
  originalFilePath: string,
  backupFilePath: string,
): Promise<void> {
  await cp(originalFilePath, backupFilePath, { recursive: true });
}

/**
 * Restores a backup overwriting the original if it exists.
 *
 * @async
 * @param {string} backupFilePath The backup path to copy from.
 * @param {string} originalFilePath The original path to copy to.
 * @returns {Promise<void>} Resolves when the restore is complete.
 * @throws {NodeJS.ErrnoException} Throws if one of the paths couldn't be accessed.
 */
export async function restoreBackup(
  backupFilePath: string,
  originalFilePath: string,
): Promise<void> {
  await cp(backupFilePath, originalFilePath, { recursive: true });
}

/**
 * Deletes the specified backup.
 *
 * @async
 * @param {string} backupFilePath The backup path to delete.
 * @returns {Promise<void>} Resolves when the deletion is complete.
 * @throws {NodeJS.ErrnoException} Throws if the backup doesn't exist.
 */
export async function deleteBackup(backupFilePath: string): Promise<void> {
  await rm(backupFilePath, { recursive: true });
}
