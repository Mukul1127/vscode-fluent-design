/*
 * This file is part of vscode-fluent-design.
 *
 * vscode-fluent-design is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vscode-fluent-design is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with vscode-fluent-design. If not, see <https://www.gnu.org/licenses/>.
 */

import { BuildOptions } from "esbuild";

export function getContexts(production: boolean): BuildOptions[] {
  return [
    {
      bundle: true,
      entryPoints: ["src/extension.ts"],
      external: ["vscode"],
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
      external: ["electron"],
      format: "esm",
      outbase: "./src",
      outdir: "./dist",
      platform: "browser",
      minify: production,
      sourcemap: !production,
    },
  ];
}
