import pkg from "/package.json" with { type: "json" };
import { window } from "vscode";

type LogLevels = "trace" | "debug" | "info" | "warn" | "error";

const outputChannel = window.createOutputChannel(pkg.displayName, {
  log: true,
});

export class Logger {
  private _prefix = "GLOBAL";

  /**
   * Creates a new logger with an additional prefix.
   *
   * @param newPrefix Additional prefix to chain.
   * @returns {Logger} A new logger instance.
   */
  prefix(newPrefix: string): Logger {
    const combinedPrefix = `${this._prefix} -> ${newPrefix}`;
    const newLogger = new Logger();
    newLogger._prefix = combinedPrefix;
    return newLogger;
  }

  /**
   * Logs a message with the specified level.
   *
   * @param {LogLevels} level The level to log at.
   * @param {string} message The message to log.
   * @returns {void}
   */
  private log(level: LogLevels, message: string): void {
    outputChannel[level](`[${this._prefix}] ${message}`);
  }

  /**
   * Logs a message of level TRACE.
   *
   * @param {string} message The message to log.
   * @returns {void}
   */
  trace(message: string): void {
    this.log("trace", message);
  }

  /**
   * Logs a message of level DEBUG.
   *
   * @param {string} message The message to log.
   * @returns {void}
   */
  debug(message: string): void {
    this.log("debug", message);
  }

  /**
   * Logs a message of level INFO.
   *
   * @param {string} message The message to log.
   * @returns {void}
   */
  info(message: string): void {
    this.log("info", message);
  }

  /**
   * Logs a message of level WARN.
   *
   * @param {string} message The message to log.
   * @returns {void}
   */
  warn(message: string): void {
    this.log("warn", message);
  }

  /**
   * Logs a message of level ERROR.
   *
   * @param {string} message The message to log.
   * @returns {void}
   */
  error(message: string): void {
    this.log("error", message);
  }
}

/**
 * Shows the output channel.
 *
 * @returns {void}
 */
export function showLogChannel(): void {
  outputChannel.show(true);
}

/**
 * Disposes the output channel.
 *
 * @returns {void}
 */
export function disposeLogChannel(): void {
  outputChannel.dispose();
}
