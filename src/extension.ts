/*
 * This file is part of vscode-fluent-design.
 *
 * vscode-fluent-design is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vscode-fluent-design is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with vscode-fluent-design. If not, see <https://www.gnu.org/licenses/>.
 */

import { outputChannel, Logger } from "/src/logger";
import { type ExtensionContext, commands, window } from "vscode";
import { installPatch, uninstallPatch } from "/src/patch";

const logger = new Logger().prefix("extension.ts");

/**
 * Reloads the window.
 *
 * @returns {void}
 */
function reloadWindow(): void {
  const prefixedLogger = logger.prefix("reloadWindow()");

  window.showInformationMessage("VSCode needs to restart to apply these changes.", "Restart VSCode").then((): void => {
    prefixedLogger.info("Reloading window.");
    commands.executeCommand("workbench.action.reloadWindow");
  });
}

/**
 * Installs the Fluent Design patch.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the patch is installed.
 */
async function installCommand(): Promise<void> {
  const prefixedLogger = logger.prefix("installCommand()");

  const installResults = await installPatch();
  const installRejectedResults = installResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  if (installRejectedResults.length > 0) {
    prefixedLogger.warn("Some files couldn't be patched.");
    installRejectedResults.forEach((r) => {
      prefixedLogger.warn(String(r.reason));
    });
    throw new Error("Some files couldn't be patched.");
  }

  reloadWindow();
}

/**
 * Uninstalls the Fluent Design patch.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the patch is uninstalled.
 */
async function uninstallCommand(): Promise<void> {
  const prefixedLogger = logger.prefix("uninstallCommand()");

  const uninstallResults = await uninstallPatch();
  const uninstallRejectedResults = uninstallResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  if (uninstallRejectedResults.length > 0) {
    prefixedLogger.warn("Some files couldn't be unpatched.");
    uninstallRejectedResults.forEach((r) => {
      prefixedLogger.warn(String(r.reason));
    });
    throw new Error("Some files couldn't be unpatched.");
  }

  reloadWindow();
}

/**
 * This function is called when the extension is activated.
 *
 * @param {ExtensionContext} context The extension context.
 * @returns {void}
 */
export function activate(context: ExtensionContext): void {
  const install = commands.registerCommand("vscode-fluent-design.install", installCommand);
  const uninstall = commands.registerCommand("vscode-fluent-design.uninstall", uninstallCommand);

  outputChannel.show();

  context.subscriptions.push(install, uninstall, outputChannel);
}
