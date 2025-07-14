// Grab body node
const bodyNode = document.querySelector("body");
let isLayoutCompact = false;
let darkBg = "#202020";
let lightBg = "#ffffff";
let accentColor = "#005fb8";
let accentHover = "#005fb8e6";
let accentPressed = "#005fb8cc";
const splitViewSelector =
  ".grid-view-container > .monaco-grid-view > .monaco-grid-branch-node > .monaco-split-view2 > .monaco-scrollable-element > .split-view-container";

let debounceTimer;
const debounce = (callback, time) => {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(callback, time);
};

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentBoxSize) {
      // biome-ignore lint/nursery/noMagicNumbers: Goddamit it's just a reasonable value for a setTimeout()
      debounce(applyCompactStyles, 300);
    }
  }
});

const watchLayout = (mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      // biome-ignore lint/nursery/noMagicNumbers: Goddamit it's just a reasonable value for a setTimeout()
      debounce(applyCompactStyles, 300);
    }
  }
};

const watchAttributes = (mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "attributes") {
      const chromium = document.querySelector("div.chromium");

      const { classList } = chromium;
      if (classList.contains("vs")) {
        applyLightStyles();
      }

      if (classList.contains("vs-dark")) {
        applyDarkStyles();
      }
    }
  }
};

const watchSplitViewChildren = (mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      // biome-ignore lint/nursery/noMagicNumbers: Goddamit it's just a reasonable value for a setTimeout()
      debounce(adjustScrollableWidth, 180);
    }
  }
};
const editorChildrenObserver = new MutationObserver(watchSplitViewChildren);

// Callback function to execute when mutations are observed
const watchForBootstrap = (mutationsList, observer2) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "attributes") {
      // does the style div exist yet?
      const tokensLoaded = document.querySelector(".vscode-tokens-styles");

      // does it have content ?
      // const tokenStyles = document.querySelector('.vscode-tokens-styles').innerText;

      // sometimes VS code takes a while to init the styles content, so stop this observer and add an observer for that
      if (tokensLoaded) {
        observer2.disconnect();
        observer2.observe(tokensLoaded, { childList: true });
      }
    }

    if (mutation.type === "childList") {
      const tokensLoaded = document.querySelector(".vscode-tokens-styles");
      // const tokenStyles = document.querySelector('.vscode-tokens-styles').innerText;

      // Everything we need is ready, so initialise
      if (tokensLoaded) {
        initFluentDesign(
          [IS_COMPACT],
          [LIGHT_BG],
          [DARK_BG],
          [ACCENT],
          observer2,
        );
      }
    }
  }
};

// Add custom styles
const initFluentDesign = (
  isCompact,
  lightBgColor,
  darkBgColor,
  accent,
  obs,
) => {
  isLayoutCompact = isCompact;
  accentColor = accent;
  accentHover = `${accent}e6`;
  accentPressed = `${accent}cc`;
  darkBg = darkBgColor;
  lightBg = lightBgColor;

  const themeStyleTag = document.querySelector(".vscode-tokens-styles");

  if (!themeStyleTag) {
    return;
  }

  // Add style classes
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.add("card");

  const splitViewContainer = sidebar.parentElement.closest(
    ".split-view-container",
  );
  const editorSplitViewContainer = document.querySelector(splitViewSelector);
  editorChildrenObserver.observe(editorSplitViewContainer, {
    childList: true,
  });

  if (editorSplitViewContainer) {
    adjustScrollableWidth();
  }

  if (isLayoutCompact) {
    const sidebarContainer = sidebar.parentElement;
    const editorContainer = document.querySelector(".editor-container");
    // Mutation observer to check layout changes and apply corresponding classes
    const layoutObserver = new MutationObserver(watchLayout);
    layoutObserver.observe(splitViewContainer, { childList: true });

    // init resize observer on sidebarContainer to refresh layout when it changes
    resizeObserver.observe(sidebarContainer);
    resizeObserver.observe(editorContainer);

    applyCompactStyles();
  }

  const chromium = document.querySelector("div.chromium");
  const chromeThemeObserver = new MutationObserver(watchAttributes);
  chromeThemeObserver.observe(chromium, { attributes: true });

  overrideDocumentStyle({
    property: "background",
    value: "var(--wallpaper)",
  });

  // disconnect the observer because we don't need it anymore
  if (obs) {
    obs.disconnect();
  }
};

const overrideDocumentStyle = ({ property, value }) => {
  document.documentElement.style.setProperty(property, value);
};

// biome-ignore lint/nursery/noExcessiveLinesPerFunction: bruh
const applyDarkStyles = () => {
  try {
    // Yep, I have to override each one individually until VSCode allows me to dynamically
    overrideDocumentStyle({ property: "--accent", value: accentColor });
    overrideDocumentStyle({ property: "--accent-hover", value: accentHover });
    overrideDocumentStyle({
      property: "--accent-pressed-bg",
      value: accentPressed,
    });
    overrideDocumentStyle({
      property: "--card-bg",
      value: darkBg,
    });
    overrideDocumentStyle({
      property: "--context-menu-bg",
      value: darkBg,
    });
    overrideDocumentStyle({
      property: "--flyout-bg",
      value: darkBg,
    });
    overrideDocumentStyle({
      property: "--editor-bg",
      value: darkBg,
    });
    overrideDocumentStyle({
      property: "--active-action-item-bg",
      value: "var(--card-bg)",
    });
    overrideDocumentStyle({
      property: "--app-bg",
      value: "rgba(44, 44, 44, 0.85)",
    });
    overrideDocumentStyle({
      property: "--body-bg",
      value: "rgba(44, 44, 44, 1)",
    });
    overrideDocumentStyle({
      property: "--body-bg-t",
      value: "rgba(44, 44, 44, 0)",
    });
    overrideDocumentStyle({
      property: "--background-color",
      value: "rgba(0, 0, 0, 0.0578)",
    });

    overrideDocumentStyle({
      property: "--card-bg-blend-mode",
      value: "color, luminosity",
    });

    overrideDocumentStyle({
      property: "--editor-widget-bg",
      value: "var(--card-bg)",
    });
    overrideDocumentStyle({ property: "--foreground", value: "#ffffff" });
    overrideDocumentStyle({
      property: "--hover-bg",
      value: "var(--card-bg)",
    });
    overrideDocumentStyle({
      property: "--list-item-bg",
      value: "rgba(255, 255, 255, 0.0605)",
    });
    overrideDocumentStyle({ property: "--list-item-fg", value: "#ffffff99" });
    overrideDocumentStyle({
      property: "--notification-toast-bg",
      value: "var(--flyout-bg)",
    });
    overrideDocumentStyle({
      property: "--quick-input-widget-bg",
      value: "var(--flyout-bg)",
    });

    overrideDocumentStyle({
      property: "background",
      value: "var(--wallpaper)",
    });
    // biome-ignore lint/suspicious/noEmptyBlockStatements: We just want to catch any error
  } catch {}
};

// biome-ignore lint/nursery/noExcessiveLinesPerFunction: bruh
const applyLightStyles = () => {
  try {
    // Yeap, I have to override each one individually until VSCode allows me to dynamically add <style> tags to the document
    overrideDocumentStyle({ property: "--accent", value: accentColor });
    overrideDocumentStyle({ property: "--accent-hover", value: accentHover });
    overrideDocumentStyle({
      property: "--accent-pressed-bg",
      value: accentPressed,
    });
    overrideDocumentStyle({
      property: "--card-bg",
      value: lightBg,
    });
    overrideDocumentStyle({
      property: "--flyout-bg",
      value: lightBg,
    });
    overrideDocumentStyle({
      property: "--background-color",
      value: lightBg,
    });
    overrideDocumentStyle({
      property: "--active-action-item-bg",
      value: "rgba(0, 0, 0, 0.0605)",
    });

    overrideDocumentStyle({ property: "--app-bg", value: "var(--card-bg)" });

    overrideDocumentStyle({
      property: "--card-bg-blend-mode",
      value: "multiply",
    });
    overrideDocumentStyle({
      property: "--context-menu-bg",
      value: "var(--menu-bg)",
    });
    overrideDocumentStyle({
      property: "--editor-bg",
      value: "var(--card-bg)",
    });
    overrideDocumentStyle({
      property: "--editor-widget-bg",
      value: "var(--flyout-bg)",
    });
    overrideDocumentStyle({ property: "--foreground", value: "#000000" });
    overrideDocumentStyle({
      property: "--hover-bg",
      value: " var(--flyout-bg)",
    });
    overrideDocumentStyle({
      property: "--list-item-bg",
      value: "rgba(0, 0, 0, 0.0373)",
    });
    overrideDocumentStyle({ property: "--list-item-fg", value: "#0000009b" });
    overrideDocumentStyle({
      property: "--notification-toast-bg",
      value: "var(--flyout-bg)",
    });
    overrideDocumentStyle({
      property: "--quick-input-widget-bg",
      value: "var(--flyout-bg)",
    });

    overrideDocumentStyle({
      property: "background",
      value: "var(--wallpaper)",
    });
    // biome-ignore lint/suspicious/noEmptyBlockStatements: We just want to catch any error
  } catch {}
};

const adjustScrollableWidth = () => {
  const overflowGuards = document.querySelectorAll(".overflow-guard");

  for (const element of overflowGuards) {
    const width = element.offsetWidth;
    // biome-ignore lint/nursery/noMagicNumbers: It's just minus 4
    element.style.width = `${width - 4}px`;
  }

  setTimeout(() => {
    const minimaps = [...document.querySelectorAll(".minimap")];

    if (minimaps.length > 1) {
      const notLastMinimaps = minimaps.slice(0, -1);
      for (const minimap of notLastMinimaps) {
        minimap.style.setProperty("right", "13px", "important");
      }
    }

    const decorationsOverviewRulers = [
      // biome-ignore lint/nursery/noSecrets: This is just a css selector? No secret here
      ...document.querySelectorAll(".decorationsOverviewRuler"),
    ];

    if (decorationsOverviewRulers.length > 1) {
      const notLastRulers = decorationsOverviewRulers.slice(0, -1);
      for (const ruler of notLastRulers) {
        ruler.style.setProperty("right", "4px", "important");
      }
    }
    // biome-ignore lint/nursery/noMagicNumbers: This is just a reasonable time to wait between each loop, no need for a variable.
  }, 1000);
};

const applyCompactStyles = () => {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.add("compact");
  const sidebarContainer = sidebar.parentElement;

  const activitybar = document.querySelector(".activitybar");
  activitybar.classList.add("compact");

  const tabs = document.querySelector(".tabs");
  tabs.classList.add("compact");

  const bottomPanel = document.querySelector(".part.panel.bottom");
  bottomPanel.classList.add("compact");

  const breadcrumbs = document.querySelector(".monaco-breadcrumbs");
  breadcrumbs.classList.add("compact");

  const editor = document.querySelector(".editor");
  editor.classList.add("compact");

  const editorContainer = document.querySelector(".editor-container");
  editorContainer.classList.add("compact");

  // Here we override the activitybar width
  document.documentElement.style.setProperty("--activity-bar-width", "36px");

  const activitybarContainer = activitybar.parentElement;
  activitybarContainer.style.setProperty("width", "36px");
  activitybarContainer.style.setProperty("max-width", "36px");

  if (sidebar.classList.contains("left")) {
    sidebarContainer.style.setProperty("left", "42px");
  }

  if (activitybar.classList.contains("right")) {
    sidebarContainer.style.setProperty("right", "36px");
    activitybarContainer.style.removeProperty("left");
    activitybarContainer.style.setProperty("right", "0");
    activitybarContainer.style.setProperty("margin-right", "2px");
  }
};

// try to initialise the theme
initFluentDesign([IS_COMPACT], [LIGHT_BG], [DARK_BG], [ACCENT]);

// Use a mutation observer to check when we can bootstrap the theme
const observer = new MutationObserver(watchForBootstrap);
observer.observe(bodyNode, { attributes: true, childList: true });
