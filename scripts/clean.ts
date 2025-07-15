import { glob, rm, unlink } from "node:fs/promises";

import pkg from "../package.json" with { type: "json" };

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
for await (const globPath of glob(`${pkg.name}-*.vsix`)) {
  await unlink(globPath);
}
