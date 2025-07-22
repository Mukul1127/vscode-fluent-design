import { BuildOptions } from "esbuild";

export function getContexts(production: boolean): BuildOptions[] {
  return [
    {
      entryPoints: ["src/extension.ts"],
      bundle: true,
      platform: "node",
      format: "esm",
      outdir: "./dist",
      outbase: "./src",
      external: ["vscode"],
      minify: production,
      sourcemap: !production,
    },
    {
      entryPoints: ["src/modifyFiles/**/*"],
      bundle: true,
      platform: "browser",
      format: "iife",
      outdir: "./dist",
      outbase: "./src",
      external: ["electron"],
      minify: production,
      sourcemap: !production,
    },
  ];
}
