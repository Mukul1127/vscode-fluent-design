import { glob, rm, unlink } from "node:fs/promises";
import path from "node:path";

const pkg = await import(path.join(process.cwd(), "package.json"));

// Delete dist directory
try {
  await rm("dist", { recursive: true });
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

// Delete VSIXs
for await (const path of glob(`${pkg.name}-*.vsix`)) {
  await unlink(path);
}
