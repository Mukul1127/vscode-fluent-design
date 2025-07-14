/** biome-ignore-all lint/nursery/noUnresolvedImports: ESBuild and VSCode should show failures if any of these are amiss and biome's implementation is a *bit* overzealous */

import { access } from "node:fs/promises";
import type { ExtensionContext } from "vscode";
import { commands, window } from "vscode";
import { createBackup, restoreBackup } from "./backups.js";
import { messages } from "./messages.js";
import { patch } from "./patch.js";
import { locateWorkbench } from "./workbench.js";

function reloadWindow(): void {
  commands.executeCommand("workbench.action.reloadWindow");
}

/**
 * Checks whether a path exists asynchronously.
 *
 * @param {string} path The path to be checked.
 * @returns {Promise<boolean>} A promise returning `true` if the path exists and `false` otherwise.
 */
async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Installs the Fluent Design patch.
 *
 * Steps:
 * - Locates the workbench html file.
 * - Ensures no backup exists.
 * - Creates a workbench backup.
 * - Applies the patch.
 *
 * @returns {Promise<void>}
 */
async function install(): Promise<void> {
  const workbenchPath = await locateWorkbench();
  if (workbenchPath === null) {
    return;
  }
  const backupWorkbenchPath = `${workbenchPath}.bak`;

  if (await exists(backupWorkbenchPath)) {
    window.showInformationMessage(messages.installed);
    return;
  }

  const succeeded = await createBackup(workbenchPath, backupWorkbenchPath);
  if (!succeeded) {
    return;
  }

  await patch(workbenchPath);

  window
    .showInformationMessage(messages.enabled, { title: "Restart VSCode" })
    .then(reloadWindow);
}

/**
 * Reinstalls the Fluent Design patch.
 *
 * Steps:
 * - Locates the workbench html file.
 * - Ensures a backup exists.
 * - Restores the original workbench file.
 * - Reapplies the patch.
 *
 * @returns {Promise<void>}
 */
async function reinstall(): Promise<void> {
  const workbenchPath = await locateWorkbench();
  if (workbenchPath === null) {
    return;
  }
  const backupWorkbenchPath = `${workbenchPath}.bak`;

  if (!(await exists(backupWorkbenchPath))) {
    window.showInformationMessage(messages.notInstalled);
    return;
  }

  const succeeded = await restoreBackup(
    backupWorkbenchPath,
    workbenchPath,
    true,
  );
  if (!succeeded) {
    return;
  }

  await patch(workbenchPath);

  window
    .showInformationMessage(messages.enabled, { title: "Restart VSCode" })
    .then(reloadWindow);
}

/**
 * Uninstalls the Fluent Design patch.
 *
 * Steps:
 * - Locates the workbench html file.
 * - Ensures a backup exists.
 * - Restores the original workbench file.
 *
 * @returns {Promise<void>}
 */
async function uninstall(): Promise<void> {
  const workbenchPath = await locateWorkbench();
  if (workbenchPath === null) {
    return;
  }
  const backupWorkbenchPath = `${workbenchPath}.bak`;

  if (!(await exists(backupWorkbenchPath))) {
    window.showInformationMessage(messages.notInstalled);
    return;
  }

  const succeeded = restoreBackup(backupWorkbenchPath, workbenchPath);
  if (!succeeded) {
    return;
  }

  window
    .showInformationMessage(messages.disabled, { title: "Restart VSCode" })
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
