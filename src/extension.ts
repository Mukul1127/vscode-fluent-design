import { disposeLogChannel, Logger, showLogChannel } from "/src/logger";
import type { Disposable } from "vscode";
import { commands, env, window } from "vscode";
import { isPatchInstalled, patch } from "/src/patch";
import { createBackup, restoreBackup, deleteBackup } from "/src/backups";

const logger = new Logger("extension.ts");

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

  await createBackup(env.appRoot, `${env.appRoot}.bak`).catch((error: unknown) => {
    const safeError = error as NodeJS.ErrnoException;
    prefixedLogger.error(`Failed to create backup, error: ${safeError.message}`);
    throw safeError;
  });

  prefixedLogger.info("Created Backup");

  const results = await patch().catch((error: unknown) => {
    const safeError = error as NodeJS.ErrnoException;
    prefixedLogger.error(`Failed to patch, error: ${safeError.message}`);
    throw safeError;
  });

  const rejectedResults = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  if (rejectedResults.length > 0) {
    prefixedLogger.error("Some files couldn't be patched.");
    rejectedResults.forEach((r) => {
      prefixedLogger.error(String(r.reason));
    });
    throw new Error("Some files couldn't be patched.");
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
  const prefixedLogger = logger.prefix("reinstall()");

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

  await restoreBackup(`${env.appRoot}.bak`, env.appRoot).catch((error: unknown) => {
    const safeError = error as NodeJS.ErrnoException;
    prefixedLogger.error(`Failed to restore backup, error: ${safeError.message}`);
    throw safeError;
  });

  const results = await patch().catch((error: unknown) => {
    const safeError = error as NodeJS.ErrnoException;
    prefixedLogger.error(`Failed to patch, error: ${safeError.message}`);
    throw safeError;
  });

  const rejectedResults = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  if (rejectedResults.length > 0) {
    prefixedLogger.error("Some files couldn't be patched.");
    rejectedResults.forEach((r) => {
      prefixedLogger.error(String(r.reason));
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

  await restoreBackup(`${env.appRoot}.bak`, env.appRoot).catch((error: unknown) => {
    const safeError = error as NodeJS.ErrnoException;
    prefixedLogger.error(`Failed to restore backup, error: ${safeError.message}`);
    return;
  });

  await deleteBackup(`${env.appRoot}.bak`).catch((error: unknown) => {
    const safeError = error as NodeJS.ErrnoException;
    prefixedLogger.error(`Failed to delete backup, error: ${safeError.message}`);
    return;
  });

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
  installCommand = commands.registerCommand("vscode-fluent-design.install", install);
  reinstallCommand = commands.registerCommand("vscode-fluent-design.reinstall", reinstall);
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
  reinstallCommand.dispose();
  uninstallCommand.dispose();

  disposeLogChannel();
}
