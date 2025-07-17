/** biome-ignore-all lint/nursery/noUnresolvedImports: Biome disallows NodeJS built-ins and is incompatible with the VSCode API */
/** biome-ignore-all lint/nursery/noSecrets: Biome seems to think our extenion's config is a environment file? */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { window, workspace } from "vscode";
import { messages } from "./messages.ts";

const fluentDesignPatchTag = "<!-- Fluent Design Patched -->";

/**
 * Generates a blured background from the specified wallpaper image.
 *
 * @async
 * @param {string} wallpaperPath The path to the user-specified wallpaper image.
 * @returns {Promise<string>} A promise that resolves a `data-uri` if no error occured and `null` otherwise.
 * @throws {Error} Throws if an error generating the image occured.
 */
async function generateBluredBackgroundImage(
  wallpaperPath: string,
): Promise<string> {
  const blurValue = 100;
  const blurredImage = await sharp(wallpaperPath)
    .blur(blurValue)
    .toFormat("avif")
    .toBuffer();
  return `data:image/avif;base64,${blurredImage.toString("base64")}`;
}

/**
 * Loads CSS from a file enclosed in HTML `<style>` tag
 *
 * @async
 * @param {string} url The URL to load the CSS from.
 * @returns {Promise<string | null>} A promise that resolves the CSS if no error occured and `null` otherwise.
 */
async function getCssTag(url: string): Promise<string | null> {
  try {
    const fileName = fileURLToPath(import.meta.resolve(url));
    const fileContent = await readFile(fileName, { encoding: "utf-8" });
    return `<style>${fileContent}</style>\n`;
  } catch (error) {
    window.showErrorMessage(String(error));
    return null;
  }
}

/**
 * Builds the CSS tag.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves the css tag./
 * @throws {Error} Throws if loading the background path failed, or
 */

// biome-ignore lint/nursery/noExcessiveLinesPerFunction: Error Checking
async  function buildCssTag(): Promise<string> {
  const config = workspace.getConfiguration("vscode-fluent-design");

  const isDark = window.activeColorTheme.kind === 2;
  const enableBg = config.get<boolean>("enableWallpaper");
  const bgUrl = config.get<string>("wallpaperPath", "");

  if (!bgUrl) {
    const error = new Error(messages.errors.invalidBackgroundPath);
    window.showErrorMessage(String(error));
    throw error;
  }

  const accent = `${config.get<string>("accent")}`;
  const darkBgColor = `${config.get<string>("darkBackground")}b3`;
  const lightBgColor = `${config.get<string>("lightBackground")}b3`;

  let encodedImage: string | null = null;

  if (enableBg) {
    try {
      encodedImage = await generateBluredBackgroundImage(bgUrl);
    } catch (error: unknown) {
      const safeError = error as Error;
      window.showErrorMessage(String(safeError));
      throw safeError;
    }
  }

  const styles = ["./css/editor_chrome.css"];
  if (isDark) {
    styles.push("./css/dark_vars.css");
  }

  const cssTags = await Promise.all(
    styles.map(async (url) => {
      let tag = await getCssTag(url);
      if (!tag) {
        const customError = new Error(messages.errors.invalidCssTag)
        window.showErrorMessage(String(customError));
        throw customError;
      }

      if (url.includes("dark")) {
        // dark_vars.css
        tag = tag.replace("CARD_DARK_BG_COLOR", darkBgColor);
      } else {
        // editor_chrome.css
        tag = tag
          .replace("CARD_LIGHT_BG_COLOR", lightBgColor)
          .replace("ACCENT_COLOR", accent);
      }

      tag = tag.replace("APP_BG", enableBg ? "var(--card-bg)" : "transparent");

      return tag;
    }),
  );

  let res = cssTags.join("");

  if (encodedImage) {
    // Replace --app-bg value on res
    res = res.replace("dummy", encodedImage);
  }

  return res;
}

/**
 * Builds the JavaScript tag.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves the script tag.
 * @throws {NodeJS.ErrnoException} Throws if reading the JavaScript template failed.
 */
async function buildJavaScriptTag(): Promise<string> {
  const config = workspace.getConfiguration("vscode-fluent-design");

  const isCompact = config.get<string>("compact");
  const accent = `"${config.get<string>("accent")}"`;
  const darkBgColor = `"${config.get<string>("darkBackground")}b3"`;
  const lightBgColor = `"${config.get<string>("lightBackground")}b3"`;

  let jsTemplate = await readFile(
    fileURLToPath(import.meta.resolve("./js/theme_template.js")),
    "utf-8",
  );

  jsTemplate = jsTemplate.replace(/\[IS_COMPACT\]/g, String(isCompact));
  jsTemplate = jsTemplate.replace(/\[ACCENT\]/g, accent);
  jsTemplate = jsTemplate.replace(/\[LIGHT_BG\]/g, lightBgColor);
  jsTemplate = jsTemplate.replace(/\[DARK_BG\]/g, darkBgColor);

  const tag = `<script>${jsTemplate}</script>`;
  return tag;
}

/**
 * Patches the workbench HTML file to inject Fluent Design CSS and JavaScript.
 *
 * @async
 * @param {string} workbenchPath - The path to the workbench HTML file.
 * @returns {Promise<void>} A promise that resolves when the patching completed.
 * @throws {NodeJS.ErrnoException} Throws if an error reading or writing the file occured or building the CSS and JavaScript tag failed.
 */
export async function patch(workbenchPath: string): Promise<void> {
  let html = await readFile(workbenchPath, { encoding: "utf-8" });

  const cssTag = await buildCssTag();
  html = html.replace("</head>", `${cssTag}</head>`);

  let javaScriptTag: string;
  try {
    javaScriptTag = await buildJavaScriptTag();
  } catch (error: unknown) {
    const safeError = error as NodeJS.ErrnoException;
    window.showErrorMessage(messages.errors.loadingJavaScriptTemplateFailed(safeError));
    throw safeError;
  }
  html = html.replace("</html>", `${javaScriptTag}</html>`);

  // Tag file
  html.replace("<html>", `<html>${fluentDesignPatchTag}`);

  await writeFile(workbenchPath, html, { encoding: "utf-8" });
}

/**
 * Checks the specified workbench file to see if the Fluent Design Patch is installed.
 *
 * @async
 * @param {string} workbenchPath The path to the workbench file to check.
 * @returns {Promise<boolean>} A promise that resolves true if the patch is installed and false otherwise.
 */
export async function isPatchInstalled(
  workbenchPath: string,
): Promise<boolean> {
  const fileContents = await readFile(workbenchPath, { encoding: "utf-8" });
  return fileContents.includes(fluentDesignPatchTag);
}
