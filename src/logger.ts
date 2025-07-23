import pkg from "/package.json" with { type: "json" };
import { window } from "vscode";

const outputChannel = window.createOutputChannel(pkg.displayName, {
  log: true,
});
outputChannel.clear();

type LogLevels = "trace" | "debug" | "info" | "warn" | "error";

export class Logger {
  source: string;

  constructor(source: string) {
    this.source = source;
  }

  private log(level: LogLevels, message: string): void {
    outputChannel[level](`[${this.source}] ${message}`);
  }

  trace(message: string): void {
    this.log("trace", message);
  }

  debug(message: string): void {
    this.log("debug", message);
  }

  info(message: string): void {
    this.log("info", message);
  }

  warn(message: string): void {
    this.log("warn", message);
  }

  error(message: string): void {
    this.log("error", message);
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
