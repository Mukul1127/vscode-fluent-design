import { disposeOutputChannel, Logger, showOutputChannel } from "@src/logger";
import { messages } from "@src/messages";
import type { Disposable } from "vscode";
import { commands, window } from "vscode";
import { isPatchInstalled } from "./patch";

const logger = new Logger("extension.ts");

/**
 * Reloads the window.
 *
 * @returns {void}
 */
function reloadWindow(): void {
  window.showInformationMessage(messages.patchModified, "Restart VSCode").then((): void => {
    logger.info("Reloading window.");
    commands.executeCommand("workbench.action.reloadWindow");
  });
}

/**
 * Installs the Fluent Design patch.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the patch is installed.
 */
async function install(): Promise<void> {
  const patchInstalled = await isPatchInstalled();
  if (patchInstalled) {
    logger.error("Patch is already installed.");
    return;
  }

  reloadWindow();
}

/**
 * Reinstalls the Fluent Design patch.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the patch is reinstalled.
 */
async function reinstall(): Promise<void> {
  const patchInstalled = await isPatchInstalled();
  if (!patchInstalled) {
    logger.error("Patch is not installed.");
    return;
  }

  reloadWindow();
}

/**
 * Uninstalls the Fluent Design patch.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the patch is uninstalled.
 */
async function uninstall(): Promise<void> {
  const patchInstalled = await isPatchInstalled();
  if (!patchInstalled) {
    logger.error("Patch is not installed.");
    return;
  }

  reloadWindow();
}

let installCommand: Disposable;
let reinstallCommand: Disposable;
let uninstallCommand: Disposable;

/**
 * This function is called when the extension is activated.
 *
 * @returns {void}
 */
export function activate(): void {
  logger.info("Extension started activating.");

  installCommand = commands.registerCommand("vscode-fluent-design.install", install);
  reinstallCommand = commands.registerCommand("vscode-fluent-design.reinstall", reinstall);
  uninstallCommand = commands.registerCommand("vscode-fluent-design.uninstall", uninstall);

  showOutputChannel();

  logger.info("Extension finished activating.");
}

/**
 * This function is called when the extension is deactivated.
 *
 * @returns {void}
 */
export function deactivate(): void {
  logger.info("Extension started deactivating.");

  installCommand.dispose();
  reinstallCommand.dispose();
  uninstallCommand.dispose();

  disposeOutputChannel();

  logger.info("Extension finished deactivating.");
}
