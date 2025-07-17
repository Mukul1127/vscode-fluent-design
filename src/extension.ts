/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { PathLike } from "node:fs";
import type { Disposable, ExtensionContext } from "vscode";
import { commands, window } from "vscode";
import { createBackup, deleteBackup, restoreBackup } from "./backups.ts";
import type { LoggerType } from "./logger.ts";
import { Logger, showOutputChannel } from "./logger.ts";
import { messages } from "./messages.ts";
import { isPatchInstalled, patch } from "./patch.ts";
import { locateWorkbench } from "./workbench.ts";

const logger: LoggerType = new Logger("extension.ts");

/**
 * Reloads the window.
 *
 * @returns {void}
 */
function reloadWindow(): void {
  logger.info("Reloading window.");
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
  logger.info("Started installing Fluent Design Patch.");

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

  logger.info(
    `Finished locating workbench, original path: ${workbenchPath}, backup path: ${backupWorkbenchPath}`,
  );

  if (await isPatchInstalled(workbenchPath)) {
    logger.info("Patch already installed, gracefully exiting.");
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

  logger.info("Finished installing Fluent Design Patch.");

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
  logger.info("Started reinstalling Fluent Design Patch.");

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

  logger.info(
    `Finished locating workbench, original path: ${workbenchPath}, backup path: ${backupWorkbenchPath}`,
  );

  if (!(await isPatchInstalled(workbenchPath))) {
    logger.info("Patch not installed, gracefully exiting.");
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

  logger.info("Finished reinstalling Fluent Design Patch.");

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
  logger.info("Started uninstalling Fluent Design Patch.");

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

  logger.info(
    `Finished locating workbench, original path: ${workbenchPath}, backup path: ${backupWorkbenchPath}`,
  );

  if (!(await isPatchInstalled(workbenchPath))) {
    logger.info("Patch not installed, gracefully exiting.");
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

  logger.info("Finished uninstalling Fluent Design Patch.");

  window
    .showInformationMessage(messages.userFacing.patchRemoved, {
      title: "Restart VSCode",
    })
    .then(reloadWindow);
}

let installCommand: Disposable;
let reinstallCommand: Disposable;
let uninstallCommand: Disposable;
let showLogsCommand: Disposable;

/**
 * This function is called when the extension is activated
 *
 * @param {ExtensionContext} context The VSCode Extension Context
 * @returns {void}
 */
export function activate(context: ExtensionContext): void {
  logger.info("Extension started activating.");

  installCommand = commands.registerCommand(
    "vscode-fluent-design.install",
    install,
  );
  reinstallCommand = commands.registerCommand(
    "vscode-fluent-design.reinstall",
    reinstall,
  );
  uninstallCommand = commands.registerCommand(
    "vscode-fluent-design.uninstall",
    uninstall,
  );
  showLogsCommand = commands.registerCommand(
    "vscode-fluent-design.showLogs",
    showOutputChannel,
  );

  context.subscriptions.push(installCommand);
  context.subscriptions.push(reinstallCommand);
  context.subscriptions.push(uninstallCommand);
  context.subscriptions.push(showLogsCommand);

  logger.info("Extension finished activating.");
}

/**
 * This function is called when the extension is activated
 *
 * @returns {void}
 */
export function deactivate(): void {
  logger.info("Extension started deactivating.");

  installCommand.dispose();
  reinstallCommand.dispose();
  uninstallCommand.dispose();
  showLogsCommand.dispose();

  logger.info("Extension finished deactivating.");
}
