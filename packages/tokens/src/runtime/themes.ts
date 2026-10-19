import type { BuiltInThemeId } from "./palettes";

export type ThemeInfo<T extends string = BuiltInThemeId> = {
  id: T;
  name: string;
  mood: string;
  swatches: string[];
  fonts: string;
  lowestContrast: string;
  effects: string;
  /** Where the effects may never go. */
  calm: string;
  /** What the effects cost the computer. */
  cost: string;
};

/** The five built-in themes; every text and interface pair passed the contrast check (lowest pair shown). */
export const THEMES: ThemeInfo[] = [
  {
    id: "case-night",
    name: "Case Night",
    mood: "The newsroom after dark: navy, cream paper, an amber lamp.",
    swatches: ["#14263A", "#1E3448", "#26425A", "#2E4D67", "#F5ECDA", "#E8A95B", "#7FB7E0"],
    fonts: "IBM Plex Sans · Source Serif 4 · Plex Mono",
    lowestContrast: "4.66:1",
    effects: "A faint hairline grid on the board",
    calm: "Panels and reading areas are plain; the grid stays on the board.",
    cost: "Next to none: one still background.",
  },
  {
    id: "rain-noir",
    name: "Rain Noir",
    mood: "A city at night through a wet window: the work stays dry.",
    swatches: ["#18120F", "#211A16", "#2A221E", "#342C27", "#F0EAE1", "#DD9231", "#3AB3AD"],
    fonts: "Manrope · Jost 300 titles · Source Serif 4 · Plex Mono",
    lowestContrast: "5.90:1",
    effects: "Drifting bokeh lights, rain on the case-title glass, film grain on the board",
    calm: "Lights, rain and grain stay on the board, never over text.",
    cost: "Bokeh drift and one rain pane (WebGL); none with Effects Light or Off.",
  },
  {
    id: "archive",
    name: "Archive",
    mood: "A records room: manila folders, a desk lamp.",
    swatches: ["#221A15", "#2C221B", "#3A2D24", "#54463A", "#F3E7CF", "#D9945A", "#7CC0B4"],
    fonts: "Public Sans · Domine · Plex Mono",
    lowestContrast: "4.72:1",
    effects: "Paper grain on the board",
    calm: "Grain stays on the board, never under text.",
    cost: "Next to none: one still texture.",
  },
  {
    id: "forest-ledger",
    name: "Forest Ledger",
    mood: "A quiet library for long sessions. No effects.",
    swatches: ["#0F272B", "#163338", "#1D3F45", "#264C53", "#F4EEDC", "#D4B06A", "#B5C98A"],
    fonts: "Inter · Newsreader · Plex Mono",
    lowestContrast: "4.84:1",
    effects: "None: depth from shadow only",
    calm: "No effects, so nothing to keep away from text.",
    cost: "None.",
  },
  {
    id: "indigo-clarity",
    name: "Indigo Clarity",
    mood: "High clarity, low motion. For tired eyes and bright rooms.",
    swatches: ["#121233", "#1B1B45", "#272757", "#33336A", "#FBF6EA", "#FFD166", "#A6D4FF"],
    fonts: "Inclusive Sans · Lexend · Plex Mono",
    lowestContrast: "6.39:1",
    effects: "None",
    calm: "No effects, so nothing to keep away from text.",
    cost: "None.",
  },
];
