import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    entry: ["src/extension.ts"],
    platform: "node",
    format: "esm",
    outbase: "./src",
    outdir: "./dist",
    external: ["vscode"],
    clean: true,
    minify: options.minify,
    sourcemap: options.sourcemap,
    watch: options.watch,
  };
});
