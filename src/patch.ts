/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { LoggerType } from "@src/logger";
import { Logger } from "@src/logger";

const _logger: LoggerType = new Logger("patch.ts");

/**
 * Patches the workbench HTML file to inject Fluent Design CSS and JavaScript.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the patching completed.
 * @throws {NodeJS.ErrnoException} Throws if an error reading or writing a file occured.
 */
export async function patch(): Promise<void> {
}

/**
 * Checks the specified workbench file to see if the Fluent Design Patch is installed.
 *
 * @async
 * @returns {Promise<boolean>} A promise that resolves true if the patch is installed and false otherwise.
 */
export async function isPatchInstalled(): Promise<boolean> {

}
