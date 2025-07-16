/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

export const messages = {
  workbenchPathFailedStat: (path: string, error: unknown): string =>
    `Failed to check workbench path ${path} with error ${error}`,
  isDirectoryNotFile: (path: string): string =>
    `${path} is a directory, not a file.`,
  backupFailed: (error: Error): string => `Failed to copy backup: ${error}`,
  errorNotInstanceOfError: (error: unknown): string =>
    `Thrown Error ${typeof error} is not an instance of Error.`,
  workbenchPathLookupFailed: `Unable to locate VSCode's workbench html file.`,
  invalidBackgroundPath: "Unable to retrieve user-specified background path.",
  invalidCssTag: "Got invalid CSS tag.",
  installed:
    "This command can only be used when Fluent Design is not installed.",
  notInstalled:
    "This command can only be used when Fluent Design is installed.",
  enabled:
    "Fluent Design patch applied. VS Code needs to reboot to apply the changes.",
  disabled:
    "Fluent Design patch removed. VS Code needs to reboot to apply the changes.",
  admin:
    "VSCode needs to be started as admin to apply the Fluent Design patches.",
};
