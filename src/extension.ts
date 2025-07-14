import { constants } from "node:fs";
import { access } from "node:fs/promises";
import * as vscode from "vscode";
import { createBackup, restoreBackup } from "./backups.js";
import messages from "./messages.js";
import { patch } from "./patch.js";
import { locateWorkbench } from "./workbench.js";

function reloadWindow(): void {
  vscode.commands.executeCommand("workbench.action.reloadWindow");
}

/**
 * Checks whether a path exists (Shim).
 *
 * @param {string} path The path to be checked.
 * @returns {Promise<boolean>} A promise returning `true` if the path exists and `false` otherwise.
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * This function is called when the extension is activated
 *
 * @param {vscode.ExtensionContext} context The VSCode Extension Context
 * @returns {void}
 */
export function activate(context: vscode.ExtensionContext): void {
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
      vscode.window.showInformationMessage(messages.installed);
      return;
    }

    const succeeded = createBackup(workbenchPath, backupWorkbenchPath);
    if (!succeeded) {
      return;
    }

    patch(workbenchPath);

    vscode.window
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
      vscode.window.showInformationMessage(messages.notInstalled);
      return;
    }

    const succeeded = restoreBackup(workbenchPath, backupWorkbenchPath, true);
    if (!succeeded) {
      return;
    }

    patch(workbenchPath);

    vscode.window
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
      vscode.window.showInformationMessage(messages.notInstalled);
      return;
    }

    const succeeded = restoreBackup(workbenchPath, backupWorkbenchPath);
    if (!succeeded) {
      return;
    }

    vscode.window
      .showInformationMessage(messages.disabled, { title: "Restart VSCode" })
      .then(reloadWindow);
  }

  const installCommand = vscode.commands.registerCommand(
    "vscode-fluent-design.install",
    install,
  );
  const reinstallCommand = vscode.commands.registerCommand(
    "vscode-fluent-design.reinstall",
    reinstall,
  );
  const uninstallCommand = vscode.commands.registerCommand(
    "vscode-fluent-design.uninstall",
    uninstall,
  );

  context.subscriptions.push(installCommand);
  context.subscriptions.push(reinstallCommand);
  context.subscriptions.push(uninstallCommand);
}

/**
 * This function is called when the extension is deactivated.
 *
 * @returns {void}
 */
export function deactivate(): void {}
