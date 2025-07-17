import { defineConfig } from "tsdown/config";

export default [
  defineConfig({
    entry: "src/extension.ts",
    outDir: "dist",
    platform: "node",
    format: "es",
    external: ["vscode"],
  }),
];
