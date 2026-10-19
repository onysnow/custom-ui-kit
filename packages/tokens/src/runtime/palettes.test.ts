import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BASE_PALETTES } from "./palettes";
import { checkPalette, COLOUR_TOKENS, contrastRatio, ratioText } from "./contrast";
import { THEMES } from "./themes";

const cssVars = (id: string): Record<string, string> => {
  const css = readFileSync(join(import.meta.dirname, `../themes/${id}.css`), "utf8");
  const body = new RegExp(`\\[data-theme=['"]${id}['"]\\] \\{([^}]*)\\}`).exec(css)?.[1] ?? "";
  return Object.fromEntries(
    [...body.matchAll(/(--[a-z0-9-]+): ([^;]+);/g)].map((m) => [m[1], (m[2] ?? "").trim()]),
  );
};

describe("the contrast check", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
    expect(ratioText(4.6599)).toBe("4.66:1");
    expect(ratioText(4.4999, true)).toBe("4.49:1");
  });

  it("passes every built-in theme, and each one's lowest pair is the one its card shows", () => {
    for (const t of THEMES) {
      const check = checkPalette(BASE_PALETTES[t.id]);
      expect(check.failing, t.id).toEqual([]);
      expect(ratioText(check.lowest.ratio), t.id).toBe(t.lowestContrast);
    }
  });

  it("keeps the TypeScript palettes equal to the theme stylesheets", () => {
    for (const t of THEMES) {
      const vars = cssVars(t.id);
      for (const { token } of COLOUR_TOKENS) {
        expect(BASE_PALETTES[t.id][token].toUpperCase(), `${t.id} ${token}`).toBe(
          (vars[`--${token}`] ?? "").toUpperCase(),
        );
      }
    }
  });
});
