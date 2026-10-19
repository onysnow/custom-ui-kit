import { BASE_PALETTES, createThemeStore, type BuiltInThemeId } from "@onysnow/tokens";

/** This site's theme store: Rain Noir by default, kept under its own storage keys. */
export const themes = createThemeStore<BuiltInThemeId>({
  palettes: BASE_PALETTES,
  defaultTheme: "rain-noir",
  storagePrefix: "onysnow-ui",
  namedEffects: ["rain", "lights"],
  offAtFirst: [],
});
