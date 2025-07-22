import { defineConfig } from "@rslib/core";
import { glob } from "glob";
import path from "node:path";

const isProduction = process.argv.includes("production");

const modifyFiles = await glob("src/modifyFiles/**/*", { nodir: true });
const modifyFilesEntries = Object.fromEntries(
  modifyFiles.map((file) => {
    const entryName: string = file.split(path.sep).slice(1).join(path.sep);
    return [entryName, file];
  }),
);

export default defineConfig({
  lib: [
    {
      format: "esm",
      bundle: true,
      syntax: "esnext",
    },
  ],
  source: {
    entry: {
      extension: "./src/extension.ts",
      ...modifyFilesEntries,
    },
  },
  output: {
    cleanDistPath: true,
    externals: ["vscode", "electron"],
    minify: isProduction,
    sourceMap: !isProduction,
    target: "node",
  }
});
