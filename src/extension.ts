/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { PathLike } from "node:fs";
import type { ExtensionContext } from "vscode";
import { commands, window } from "vscode";
import { createBackup, deleteBackup, restoreBackup } from "./backups.ts";
import { messages } from "./messages.ts";
import { isPatchInstalled, patch } from "./patch.ts";
import { locateWorkbench } from "./workbench.ts";

function reloadWindow(): void {
  commands.executeCommand("workbench.action.reloadWindow");
}

/**
 * Installs the Fluent Design patch.
 *
 * Steps:
 * - Locates the workbench html file.
 * - Ensures the patch isn't already installed.
 * - Creates a workbench backup.
 * - Applies the patch.
 *
 * @async
 * @returns {Promise<void>}
 */
async function install(): Promise<void> {
  let workbenchPath: PathLike;
  try {
    workbenchPath = await locateWorkbench();
  } catch (error: unknown) {
    const safeError = error as AggregateError; // Promise.any() *should* only throw AggregateErrors
    window.showErrorMessage(
      messages.errors.workbenchPathLookupFailed(safeError),
    );
    return;
  }
  const backupWorkbenchPath = `${workbenchPath}.bak`;

  if (await isPatchInstalled(workbenchPath)) {
    window.showInformationMessage(messages.userFacing.patchAlreadyInstalled);
    return;
  }

  try {
    await createBackup(workbenchPath, backupWorkbenchPath);
  } catch (error: unknown) {
    const safeError = error as NodeJS.ErrnoException; // Filesystem Operations *should* only throw NodeJS.ErrnoExceptions.
    window.showErrorMessage(messages.errors.backupOperationFailed(safeError));
  }

  try {
    await patch(workbenchPath);
  } catch (error: unknown) {
    const safeError = error as Error;
    window.showErrorMessage(messages.errors.patchingFailed(safeError));
  }

  window
    .showInformationMessage(messages.userFacing.patchApplied, {
      title: "Restart VSCode",
    })
    .then(reloadWindow);
}

/**
 * Reinstalls the Fluent Design patch.
 *
 * Steps:
 * - Locates the workbench html file.
 * - Ensures the patch is installed.
 * - Restores the original workbench file.
 * - Reapplies the patch.
 *
 * @async
 * @returns {Promise<void>}
 */
async function reinstall(): Promise<void> {
  let workbenchPath: PathLike;
  try {
    workbenchPath = await locateWorkbench();
  } catch (error: unknown) {
    const safeError = error as AggregateError; // Promise.any() *should* only throw AggregateErrors
    window.showErrorMessage(
      messages.errors.workbenchPathLookupFailed(safeError),
    );
    return;
  }
  const backupWorkbenchPath = `${workbenchPath}.bak`;

  if (!(await isPatchInstalled(workbenchPath))) {
    window.showInformationMessage(messages.userFacing.patchNotInstalled);
    return;
  }

  try {
    await restoreBackup(backupWorkbenchPath, workbenchPath);
  } catch (error: unknown) {
    const safeError = error as NodeJS.ErrnoException; // Filesystem Operations *should* only throw NodeJS.ErrnoExceptions.
    window.showErrorMessage(messages.errors.backupOperationFailed(safeError));
  }

  try {
    await patch(workbenchPath);
  } catch (error: unknown) {
    const safeError = error as Error;
    window.showErrorMessage(messages.errors.patchingFailed(safeError));
  }

  window
    .showInformationMessage(messages.userFacing.patchApplied, {
      title: "Restart VSCode",
    })
    .then(reloadWindow);
}

/**
 * Uninstalls the Fluent Design patch.
 *
 * Steps:
 * - Locates the workbench html file.
 * - Ensures the patch is installed.
 * - Restores the original workbench file.
 *
 * @async
 * @returns {Promise<void>}
 */
async function uninstall(): Promise<void> {
  let workbenchPath: PathLike;
  try {
    workbenchPath = await locateWorkbench();
  } catch (error: unknown) {
    const safeError = error as AggregateError; // Promise.any() *should* only throw AggregateErrors
    window.showErrorMessage(
      messages.errors.workbenchPathLookupFailed(safeError),
    );
    return;
  }
  const backupWorkbenchPath = `${workbenchPath}.bak`;

  if (!(await isPatchInstalled(workbenchPath))) {
    window.showInformationMessage(messages.userFacing.patchNotInstalled);
    return;
  }

  try {
    await restoreBackup(backupWorkbenchPath, workbenchPath);
  } catch (error: unknown) {
    const safeError = error as NodeJS.ErrnoException; // Filesystem Operations *should* only throw NodeJS.ErrnoExceptions.
    window.showErrorMessage(messages.errors.backupOperationFailed(safeError));
  }

  try {
    await deleteBackup(backupWorkbenchPath);
  } catch (error: unknown) {
    const safeError = error as NodeJS.ErrnoException; // Filesystem Operations *should* only throw NodeJS.ErrnoExceptions.
    window.showErrorMessage(messages.errors.backupOperationFailed(safeError));
  }

  window
    .showInformationMessage(messages.userFacing.patchRemoved, {
      title: "Restart VSCode",
    })
    .then(reloadWindow);
}

/**
 * This function is called when the extension is activated
 *
 * @param {ExtensionContext} context The VSCode Extension Context
 * @returns {void}
 */
export function activate(context: ExtensionContext): void {
  const installCommand = commands.registerCommand(
    "vscode-fluent-design.install",
    install,
  );
  const reinstallCommand = commands.registerCommand(
    "vscode-fluent-design.reinstall",
    reinstall,
  );
  const uninstallCommand = commands.registerCommand(
    "vscode-fluent-design.uninstall",
    uninstall,
  );

  context.subscriptions.push(installCommand);
  context.subscriptions.push(reinstallCommand);
  context.subscriptions.push(uninstallCommand);
}
