import pkg from "@packageJson" with { type: "json" };
import type { LogOutputChannel } from "vscode";
import { window } from "vscode";

const outputChannel: LogOutputChannel = window.createOutputChannel(
  pkg.displayName,
  { log: true },
);

export class Logger {
  source: string;

  constructor(source: string) {
    this.source = source;
  }

  private log(message: string, func: (funcMessage: string) => void): void {
    func(`[${this.source}] ${message}`);
  }

  trace(message: string): void {
    this.log(message, outputChannel.trace.bind(outputChannel));
  }

  debug(message: string): void {
    this.log(message, outputChannel.debug.bind(outputChannel));
  }

  info(message: string): void {
    this.log(message, outputChannel.info.bind(outputChannel));
  }

  warn(message: string): void {
    this.log(message, outputChannel.warn.bind(outputChannel));
  }

  error(message: string): void {
    this.log(message, outputChannel.error.bind(outputChannel));
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
export function disposeOutputChannel(): void {
  outputChannel.dispose();
}
