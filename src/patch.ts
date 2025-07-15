/** biome-ignore-all lint/nursery/noUnresolvedImports: ESBuild and VSCode should show failures if any of these are amiss and biome's implementation is a *bit* overzealous */
/** biome-ignore-all lint/nursery/noExcessiveLinesPerFunction: Fix later */
/** biome-ignore-all lint/nursery/noSecrets: Biome seems to think our extenion's config is a environment file? */
/** biome-ignore-all lint/performance/useTopLevelRegex: The patch() function is only called when installing, updating, or removing the fluent design patch. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { window, workspace } from "vscode";
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
    const blurValue = 100;
    const blurredImage = await sharp(wallpaperPath)
      .blur(blurValue)
      .toFormat("avif")
      .toBuffer();
    return `data:image/avif;base64,${blurredImage.toString("base64")}`;
  } catch (error) {
    window.showErrorMessage(String(error));
    window.showInformationMessage(messages.admin);
    return null;
  }
}

/**
 * Loads CSS from a file enclosed in HTML `<style>` tag
 *
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
 * @returns {Promise<string | null>} A promise that resolves the css tag.
 */
async function buildCssTag(): Promise<string | null> {
  const config = workspace.getConfiguration("vscode-fluent-design");

  const isDark = window.activeColorTheme.kind === 2;
  const enableBg = config.get<boolean>("enableWallpaper");
  const bgUrl = config.get<string>("wallpaperPath", "");

  if (!bgUrl) {
    window.showErrorMessage(messages.invalidBackgroundPath);
    return null;
  }

  const accent = `${config.get<string>("accent")}`;
  const darkBgColor = `${config.get<string>("darkBackground")}b3`;
  const lightBgColor = `${config.get<string>("lightBackground")}b3`;

  let encodedImage: string | null = null;

  if (enableBg) {
    encodedImage = await generateBluredBackgroundImage(bgUrl);
  }

  const styles = ["./css/editor_chrome.css"];
  if (isDark) {
    styles.push("./css/dark_vars.css");
  }

  const cssTags = await Promise.all(
    styles.map(async (url) => {
      let tag = await getCssTag(url);
      if (!tag) {
        window.showErrorMessage(messages.invalidCssTag);
        return null;
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

      tag = tag.replace(
        "APP_BG",
        enableBg ? "var(--card-bg)" : "transparent",
      );

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
 * @returns {Promise<string | null>} A promise that resolves the script tag if no error occured and `null` otherwise.
 */
async function buildJavaScriptTag(): Promise<string> {
  try {
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
  } catch (error) {
    window.showErrorMessage(String(error));
    return "";
  }
}

/**
 * Patches the workbench HTML file to inject Fluent Design CSS and JavaScript.
 *
 * @param {string} workbenchPath - The path to the workbench HTML file.
 * @returns {Promise<void>} A promise that resolves when the patching completed.
 */
export async function patch(workbenchPath: string): Promise<void> {
  try {
    let html = await readFile(workbenchPath, { encoding: "utf-8" });

    const cssTag = await buildCssTag();
    html = html.replace(/(<\/head>)/, `\n${cssTag}\n</head>`);

    const javaScriptTag = await buildJavaScriptTag();
    html = html.replace(/(<\/html>)/, `\n${javaScriptTag}\n</html>`);

    await writeFile(workbenchPath, html, { encoding: "utf-8" });
  } catch (error) {
    window.showErrorMessage(String(error));
  }
}
