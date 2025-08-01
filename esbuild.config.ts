import { BuildOptions } from "esbuild";

export function getContexts(production: boolean): BuildOptions[] {
  return [
    {
      bundle: true,
      entryPoints: ["src/extension.ts"],
      external: ["vscode", "original-fs"],
      format: "esm",
      outbase: "./src",
      outdir: "./dist",
      platform: "node",
      minify: production,
      sourcemap: !production,
    },
    {
      bundle: true,
      entryPoints: ["src/modifyFiles/**/*"],
      external: ["electron", "original-fs"],
      format: "esm",
      outbase: "./src",
      outdir: "./dist",
      platform: "browser",
      minify: production,
      sourcemap: !production,
    },
  ];
}
