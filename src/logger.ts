/*
 * This file is part of vscode-fluent-design.
 *
 * vscode-fluent-design is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vscode-fluent-design is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with vscode-fluent-design. If not, see <https://www.gnu.org/licenses/>.
 */

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
