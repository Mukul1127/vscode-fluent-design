import { defineConfig } from "@rslib/core";

const isProduction = process.argv.includes("production");
console.log(`Production: ${String(isProduction)}`);

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
    externals: ["vscode"],
    minify: isProduction,
    sourceMap: !isProduction,
    target: "node",
  },
});
