/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import pkg from "@packageJson" with { type: "json" };
import type { LogOutputChannel } from "vscode";
import { window } from "vscode";

const outputChannel: LogOutputChannel = window.createOutputChannel(
  pkg.displayName,
  { log: true },
);

export type LoggerType = {
  source: string;

  trace(message: string): void;
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

export class Logger {
  source: string;

  constructor(source: string) {
    this.source = source;
  }

  private log(message: string, func: (funcMessage: string) => void): void {
    if (func === null) {
      return;
    }
    func(`[${this.source}] ${message}`);
  }

  trace(message: string): void {
    this.log(message, outputChannel.trace);
  }

  debug(message: string): void {
    this.log(message, outputChannel.debug);
  }

  info(message: string): void {
    this.log(message, outputChannel.info);
  }

  warn(message: string): void {
    this.log(message, outputChannel.warn);
  }

  error(message: string): void {
    this.log(message, outputChannel.error);
  }
}

/**
 * Shows the output channel with the extension's logs.
 *
 * @returns {void}
 */
export function showOutputChannel(): void {
  outputChannel.show(true);
}

/**
 * Disposes the outputChannel.
 *
 * @returns {void}
 */
export function dispose(): void {
  outputChannel.dispose();
}
