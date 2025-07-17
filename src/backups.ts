/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { PathLike } from "node:fs";
import { copyFile, unlink } from "node:fs/promises";
import type { LoggerType } from "@src/logger.ts";
import { Logger } from "@src/logger.ts";

const _logger: LoggerType = new Logger("backups.ts");

/**
 * Creates a backup overwriting the original file if it exists.
 *
 * @async
 * @param {PathLike} originalFilePath The original file path to copy from.
 * @param {PathLike} backupFilePath The backup file path to copy to.
 * @returns {Promise<void>} Resolves when the backup is created.
 * @throws {NodeJS.ErrnoException} Throws if one of the files couldn't be accessed.
 */
export async function createBackup(
  originalFilePath: PathLike,
  backupFilePath: PathLike,
): Promise<void> {
  await copyFile(originalFilePath, backupFilePath);
}

/**
 * Restores a backup overwriting the original file if it exists.
 *
 * @async
 * @param {PathLike} backupFilePath The backup file path to copy from.
 * @param {PathLike} originalFilePath The original file path to copy to.
 * @returns {Promise<void>} Resolves when the restore is complete.
 * @throws {NodeJS.ErrnoException} Throws if one of the files couldn't be accessed.
 */
export async function restoreBackup(
  backupFilePath: PathLike,
  originalFilePath: PathLike,
): Promise<void> {
  await copyFile(backupFilePath, originalFilePath);
}

/**
 * Deletes the specified backup.
 *
 * @async
 * @param {PathLike} backupFilePath The backup file path to delete.
 * @returns {Promise<void>} Resolves when the deletion is complete.
 * @throws {NodeJS.ErrnoException} Throws if the backup doesn't exist.
 */
export async function deleteBackup(backupFilePath: PathLike): Promise<void> {
  await unlink(backupFilePath);
}
