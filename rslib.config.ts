import { defineConfig } from "@rslib/core";
import { glob } from "glob";
import path from "node:path";

const isProduction = process.argv.includes("production");

const modifyFiles = await glob("src/modifyFiles/**/*", { nodir: true });
const modifyFilesEntries = modifyFiles.map((file) => {
  const entryName: string = file.split(path.sep).slice(1).join(path.sep);
  return { from: file, to: entryName };
})

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
    },
  },
  output: {
    cleanDistPath: true,
    copy: modifyFilesEntries,
    distPath: {
      root: "./dist/"
    },
    externals: ["vscode", "electron"],
    minify: isProduction,
    sourceMap: !isProduction,
    target: "node",
  }
});
