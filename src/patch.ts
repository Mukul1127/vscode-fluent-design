import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import * as vscode from "vscode";
import { messages } from "./messages.js";

/**
 * Generates a blured background from the specified wallpaper image.
 *
 * @param {string} wallpaperPath The path to the user-specified wallpaper image.
 * @returns {Promise<string | null>} A promise that resolves a `data-uri` if no error occured and `null` otherwise.
 */
async function generateBluredBackgroundImage(
  wallpaperPath: string,
): Promise<string | null> {
  try {
    const blurredImage = await sharp(wallpaperPath)
      .blur(100)
      .toFormat("avif")
      .toBuffer();
    return `data:image/avif;base64,${blurredImage.toString("base64")}`;
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
    vscode.window.showInformationMessage(messages.admin);
    return null;
  }
}

/**
 * Loads CSS from a file enclosed in HTML `<style>` tag
 *
 * @param {string} url The URL to load the CSS from.
 * @returns {Promise<string | null>} A promise that resolves the CSS if no error occured and `null` otherwise.
 */
async function getCSSTag(url: string): Promise<string | null> {
  try {
    const fileName = path.join(import.meta.dirname, url);
    const fileContent = await readFile(fileName);
    return `<style>${fileContent}</style>\n`;
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
    return null;
  }
}

/**
 * Builds the CSS tag.
 *
 * @returns {string} A promise that resolves the css tag.
 */
async function buildCSSTag(): Promise<string> {
  const config = vscode.workspace.getConfiguration("vscode-fluent-design");

  const activeTheme = vscode.window.activeColorTheme;
  const isDark = activeTheme.kind === 2;
  const enableBg = config.get<boolean>("enableWallpaper", false);
  const bgURL = config.get<string>("wallpaperPath", "");

  const accent = `${config.get<string>("accent", "#005fb8")}`;
  const darkBgColor = `${config.get<string>("darkBackground", "#202020")}b3`;
  const lightBgColor = `${config.get<string>("lightBackground", "#ffffff")}b3`;

  let encodedImage: string | null = null;

  if (enableBg) {
    encodedImage = await generateBluredBackgroundImage(bgURL);
  }

  let res = "";

  const styles = [path.join("css", "editor_chrome.css")];
  if (isDark) {
    styles.push(path.join("css", "dark_vars.css"));
  }

  for (const url of styles) {
    let imp = await getCSSTag(url);

    if (imp) {
      if (url.includes("dark")) {
        imp = imp.replace("CARD_DARK_BG_COLOR", darkBgColor);
      } else {
        imp = imp.replace("CARD_LIGHT_BG_COLOR", lightBgColor);
        imp = imp.replace("ACCENT_COLOR", accent);
      }

      if (!enableBg) {
        imp = imp.replace("APP_BG", "transparent");
      } else {
        imp = imp.replace("APP_BG", "var(--card-bg)");
      }

      res += imp;
    }
  }

  if (encodedImage) {
    // Replace --app-bg value on res
    res = res.replace("dummy", encodedImage);
  }

  return res;
}

/**
 * Builds the JavaScript tag.
 *
 * @returns {Promise<string | null>} A promise that resolves the script tag if no error occured and `null` otherwise.
 */
async function buildJavaScriptTag(): Promise<string | null> {
  try {
    const config = vscode.workspace.getConfiguration("vscode-fluent-design");
    const jsTemplate = await readFile(
      path.join(import.meta.dirname, "js", "theme_template.js"),
    );
    let buffer = jsTemplate.toString();

    const isCompact = config.get<string>("compact");
    const accent = config.get<string>("accent");
    const darkBgColor = `${config.get<string>("darkBackground")}b3`;
    const lightBgColor = `${config.get<string>("lightBackground")}b3`;

    buffer = buffer.replace(/\[IS_COMPACT\]/g, String(isCompact));
    buffer = buffer.replace(/\[LIGHT_BG\]/g, `"${lightBgColor}"`);
    buffer = buffer.replace(/\[DARK_BG\]/g, `"${darkBgColor}"`);
    buffer = buffer.replace(/\[ACCENT\]/g, `"${accent}"`);

    const tag = `<script>${buffer}</script>`;
    return tag;
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
    return null;
  }
}

/**
 * Patches the workbench HTML file to inject Fluent Design CSS and JavaScript.
 *
 * @param {string} workbenchPath - The path to the workbench HTML file.
 * @returns {Promise<void>} A promise that resolves when the patching completed.
 */
export async function patch(workbenchPath: string): Promise<void> {
  let html = await readFile(workbenchPath, "utf-8");

  const cssTag = await buildCSSTag();
  html = html.replace(/(<\/head>)/, `\n${cssTag}\n</head>`);

  const javaScriptTag = await buildJavaScriptTag();
  html = html.replace(/(<\/html>)/, `\n${javaScriptTag}\n</html>`);

  try {
    await writeFile(workbenchPath, html, "utf-8");
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
  }
}
