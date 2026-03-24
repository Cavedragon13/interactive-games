/**
 * ConfigLoader - Loads game configuration from JSON files
 * Handles rulesets and themes
 */
const ConfigLoader = (() => {
  let loadedRuleset = null;
  let loadedTheme = null;

  // In production, these would be loaded from external JSON files
  // For now, they're embedded as global objects that will be defined in the HTML
  const loadRuleset = (rulesetData) => {
    if (!rulesetData) {
      console.error("No ruleset data provided");
      return null;
    }

    loadedRuleset = rulesetData;
    return loadedRuleset;
  };

  const loadTheme = (themeData) => {
    if (!themeData) {
      console.error("No theme data provided");
      return null;
    }

    loadedTheme = themeData;
    applyCSSVariables(themeData.colors);
    return loadedTheme;
  };

  const getRuleset = () => loadedRuleset;

  const getTheme = () => loadedTheme;

  const getConfig = (path) => {
    // Support nested config access like "levels.level1.deathChance"
    const parts = path.split(".");
    let value = loadedRuleset;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    return value;
  };

  const getThemeString = (path) => {
    // Support nested theme access like "ui.screens.combat"
    const parts = path.split(".");
    let value = loadedTheme;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    return value || "";
  };

  const applyCSSVariables = (colors) => {
    const root = document.documentElement;

    Object.keys(colors).forEach(key => {
      const cssVarName = `--${key
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "")}`;
      root.style.setProperty(cssVarName, colors[key]);
    });
  };

  const validateRuleset = (ruleset) => {
    const required = ["levels", "combat", "training", "economy"];
    const missing = required.filter(key => !ruleset[key]);

    if (missing.length > 0) {
      console.error("Ruleset missing required fields:", missing);
      return false;
    }

    return true;
  };

  const validateTheme = (theme) => {
    const required = ["name", "colors", "narrative", "ui"];
    const missing = required.filter(key => !theme[key]);

    if (missing.length > 0) {
      console.error("Theme missing required fields:", missing);
      return false;
    }

    return true;
  };

  return {
    loadRuleset,
    loadTheme,
    getRuleset,
    getTheme,
    getConfig,
    getThemeString,
    validateRuleset,
    validateTheme
  };
})();
