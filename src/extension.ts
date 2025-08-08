import { disposeLogChannel, Logger, showLogChannel } from "/src/logger";
import type { Disposable } from "vscode";
import { commands, window } from "vscode";
import { isPatchInstalled, installPatch, uninstallPatch } from "/src/patch";

const logger = new Logger().prefix("extension.ts");

/**
 * Reloads the window.
 *
 * @returns {void}
 */
function reloadWindow(): void {
  window.showInformationMessage("VSCode needs to restart to apply these changes.", "Restart VSCode").then((): void => {
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
  const prefixedLogger = logger.prefix("install()");

  const patchInstalled = await isPatchInstalled().catch((error: unknown) => {
    const safeError = error as Error;
    prefixedLogger.error(`Failed to check if patch is installed, error: ${safeError.message}`);
    throw safeError;
  });
  prefixedLogger.info(`Patch installed: ${patchInstalled ? "Yes" : "No"}`);
  if (patchInstalled) {
    prefixedLogger.error("Command requires patch to not be installed.");
    return;
  }

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
async function uninstall(): Promise<void> {
  const prefixedLogger = logger.prefix("uninstall()");

  const patchInstalled = await isPatchInstalled().catch((error: unknown) => {
    const safeError = error as Error;
    prefixedLogger.error(`Failed to check if patch is installed, error: ${safeError.message}`);
    throw safeError;
  });
  prefixedLogger.info(`Patch installed: ${patchInstalled ? "Yes" : "No"}`);
  if (!patchInstalled) {
    prefixedLogger.error("Command requires patch to be installed.");
    return;
  }

  const uninstallResults = await uninstallPatch();
  const uninstallRejectedResults = uninstallResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  if (uninstallRejectedResults.length > 0) {
    prefixedLogger.warn("Some files couldn't be patched.");
    uninstallRejectedResults.forEach((r) => {
      prefixedLogger.warn(String(r.reason));
    });
    throw new Error("Some files couldn't be patched.");
  }

  reloadWindow();
}

let installCommand: Disposable;
let uninstallCommand: Disposable;

/**
 * This function is called when the extension is activated.
 *
 * @returns {void}
 */
export function activate(): void {
  installCommand = commands.registerCommand("vscode-fluent-design.install", install);
  uninstallCommand = commands.registerCommand("vscode-fluent-design.uninstall", uninstall);

  showLogChannel();
}

/**
 * This function is called when the extension is deactivated.
 *
 * @returns {void}
 */
export function deactivate(): void {
  installCommand.dispose();
  uninstallCommand.dispose();

  disposeLogChannel();
}
