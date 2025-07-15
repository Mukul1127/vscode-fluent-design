import { defineConfig } from "tsdown/config";

export default [
  defineConfig({
    entry: "src/extension.ts",
    outDir: "dist",
    platform: "node",
    target: "node22",
    format: "es",
    external: ["vscode", "sharp"],
  }),
  defineConfig({
    entry: ["src/css/*.css", "src/js/*.js"],
    outDir: "dist",
    platform: "browser",
    target: "es2022",
    format: "es",
    external: ["dummy"],
  }),
];
