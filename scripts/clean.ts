/** biome-ignore-all lint/nursery/noUnresolvedImports: VSCode should show failures if any of these are amiss and biome's implementation is a *bit* overzealous */

import { glob, rm, unlink } from "node:fs/promises";

import packageJson from "../package.json" with { type: "json" };

// Delete dist directory
try {
  await rm("dist", { recursive: true });
} catch (error) {
  if (!(error instanceof Error)) {
    throw new Error("error not instance of Error");
  }
  if (error.code !== "ENOENT") {
    throw error;
  }
}

// Delete VSIXs
for await (const globPath of glob(`${packageJson.name}-*.vsix`)) {
  await unlink(globPath);
}
