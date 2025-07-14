interface Messages {
  workbenchPathFailedStat: (path: string) => string;
  isDirectoryNotFile: (path: string) => string;
  backupFailed: (error: Error) => string;
  errorNotInstanceOfError: (error: unknown) => string;
  workbenchPathLookupFailed: string;
  installed: string;
  notInstalled: string;
  enabled: string;
  disabled: string;
  admin: string;
}

export const messages: Messages = {
  workbenchPathFailedStat: (path: string) =>
    `Failed to check workbench path: ${path}`,
  isDirectoryNotFile: (path: string) => `${path} is a directory, not a file.`,
  backupFailed: (error: Error) => `Failed to copy backup: ${error}`,
  errorNotInstanceOfError: (error: unknown) =>
    `${typeof error} is not an instance of Error.`,
  workbenchPathLookupFailed: `Unable to locate VSCode's workbench html file.`,
  installed: `This command can only be used when Fluent Design is not installed.`,
  notInstalled: `This command can only be used when Fluent Design is installed.`,
  enabled: `Fluent Design patch applied. VS Code needs to reboot to apply the changes.`,
  disabled: `Fluent Design patch removed. VS Code needs to reboot to apply the changes.`,
  admin: `VSCode needs to be started as admin to apply the Fluent Design patches.`,
};

export default messages;
