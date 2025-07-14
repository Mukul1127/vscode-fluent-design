import { glob, rm, unlink } from "node:fs/promises";
import path from "node:path";

const pkg = await import(path.join(process.cwd(), "package.json"));

// Delete dist directory
try {
  await rm("dist", { recursive: true });
} catch (error) {
  if (!(error instanceof Error)) {
    throw new Error("error not instance of Error")
  }
  if (error.code !== "ENOENT") {
    throw error;
  }
}

// Delete VSIXs
for await (const path of glob(`${pkg.name}-*.vsix`)) {
  await unlink(path);
}
