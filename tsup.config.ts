import { defineConfig } from "tsup"

export default defineConfig((options) => {
  return {
    entry: ["src/extension.ts"],
    platform: "node",
    format: "esm",
    outdir: "./dist",
    outbase: "./src",
    external: ["vscode"],
    minify: options.minify,
    sourcemap: options.sourcemap,
    watch: options.watch,
  }
})