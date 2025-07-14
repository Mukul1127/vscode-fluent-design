import esbuild from "esbuild";
import type { BuildOptions } from "esbuild";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

const contexts: BuildOptions[] = [
	{
		entryPoints: ["src/extension.ts"],
		bundle: true,
		platform: "node",
		format: "esm",
		target: "node16",
		outdir: "./dist",
		outbase: "./src",
		external: ["vscode", "sharp"],
		logLevel: "info",
		banner: {
			// https://github.com/evanw/esbuild/issues/1232#issuecomment-830677608
			// shim `require` for cjs deps to load properly in esm-land
			js: `import { createRequire } from "node:module";\nconst require = createRequire(import.meta.url);`,
		},
		minify: production,
		sourcemap: !production,
	},
	{
		entryPoints: ["src/css/*.css", "src/js/*.js"],
		bundle: true,
		platform: "browser",
		format: "cjs",
		outdir: "./dist",
		outbase: "./src",
		external: ["dummy"],
		logLevel: "info",
		minify: production,
		sourcemap: !production,
	},
];

/**
 * Builds all the esbuild contexts in the `contexts` array simultaneously.
 *
 * In normal mode, it performs a one-time build and exits.
 * In watch mode (`--watch`), it rebuilds anyime a source file is modified until stopped.
 * Use the production flag (`--production`) to enable more optimizations.
 *
 * @returns {Promise<void>} A promise that resolves when the build is complete or the user exits watch mode.
 */
async function buildAll(): Promise<void> {
	const ctxs = await Promise.all(contexts.map((opts) => esbuild.context(opts)));

	if (watch) {
		await Promise.all(ctxs.map((ctx) => ctx.watch()));
		console.log("Watching for changes. Press Ctrl+C to stop.");

		// Handle graceful shutdown
		const cleanup = async () => {
			console.log("Stopping...");
			await Promise.all(ctxs.map((ctx) => ctx.dispose()));
			process.exit(0);
		};

		process.on("SIGINT", cleanup);
		process.on("SIGTERM", cleanup);
	} else {
		await Promise.all(ctxs.map(async (ctx) => {
			await ctx.rebuild();
			await ctx.dispose();
		}));
		console.log("Build complete.");
	}
}

buildAll().catch((error) => {
	console.error(error);
	process.exit(1);
});