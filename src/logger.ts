/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */

import type { OutputChannel } from "vscode";
import { window } from "vscode";
import pkg from "../package.json" with { type: "json" };

const outputChannel: OutputChannel = window.createOutputChannel(pkg.name);

export type LoggerType = {
  source: string;

  debug(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  fatal(message: string): void;
};

export class Logger {
  source: string;

  constructor(source: string) {
    this.source = source;
  }

  private log(level: string, message: string): void {
    outputChannel.appendLine(`[${level}] [${this.source}] ${message}`);
  }

  debug(message: string): void {
    this.log("DEBUG", message);
  }

  info(message: string): void {
    this.log("INFO", message);
  }

  warning(message: string): void {
    this.log("WARNING", message);
  }

  error(message: string): void {
    this.log("ERROR", message);
  }

  fatal(message: string): void {
    this.log("FATAL", message);
  }
}
