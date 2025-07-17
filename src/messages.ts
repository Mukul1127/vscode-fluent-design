/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { PathLike } from "node:fs";

export const messages = {
  errors: {
    workbenchPathFailedStat: (
      path: PathLike,
      error: NodeJS.ErrnoException,
    ): string =>
      `Failed to check workbench path: ${path}, encountered error: ${error}`,
    backupOperationFailed: (error: NodeJS.ErrnoException): string =>
      `Failed to copy and/or delete backup: ${error}`,
    workbenchPathLookupFailed: (error: AggregateError): string =>
      `Unable to locate VSCode's workbench html file. Errors returned: ${error.errors}`,
    patchingFailed: (error: Error): string =>
      `Patching failed, Error: ${error}`,
    isDirectoryNotFile: (path: PathLike): string =>
      `${path} is a directory, not a file.`,
    loadingJavaScriptTemplateFailed: (error: NodeJS.ErrnoException): string =>
      `Failed to load JavaScript template, Error: ${error}`,
    invalidBackgroundPath: "Unable to retrieve user-specified background path.",
    invalidCssTag: "Got invalid CSS tag.",
  },
  userFacing: {
    patchAlreadyInstalled:
      "This command can only be used when the Fluent Design patch is not installed.",
    patchNotInstalled:
      "This command can only be used when the Fluent Design patch is installed.",
    patchApplied:
      "Fluent Design patch applied. VS Code needs to reboot to apply the changes.",
    patchRemoved:
      "Fluent Design patch removed. VS Code needs to reboot to apply the changes.",
    adminRequired:
      "VSCode needs to be started as administrator to apply the Fluent Design patch.",
  },
};
