import { createThemeStore } from "./runtime/store";
import { BASE_PALETTES, type BuiltInThemeId } from "./runtime/palettes";

export * from "./runtime/contrast";
export * from "./runtime/palettes";
export * from "./runtime/themes";
export * from "./runtime/store";

/** A ready-made store for the five built-in themes. Create your own with createThemeStore for other keys or themes. */
export const themeStore = createThemeStore<BuiltInThemeId>({
  palettes: BASE_PALETTES,
  defaultTheme: "case-night",
  namedEffects: ["bokeh", "rain", "grain", "iris", "shutter", "neon", "bloom"],
  offAtFirst: ["neon"],
});
