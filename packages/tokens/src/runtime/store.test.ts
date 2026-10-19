import { beforeEach, describe, expect, it } from "vitest";
import { themeStore as s } from "../index";
import { BASE_PALETTES, type BuiltInThemeId } from "./palettes";
import { paletteVars } from "./store";

const html = document.documentElement;
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  html.removeAttribute("style");
  s.applyAppearance();
});

const night = () => ({
  name: "Night desk",
  base: "rain-noir" as const,
  colours: { ...BASE_PALETTES["rain-noir"], "accent-1": "#E0A040" },
});

describe("themes of your own", () => {
  it("refuses a failing pair by name, or no name, and keeps a passing theme in this browser", () => {
    const bad = s.saveCustomTheme({
      ...night(),
      colours: { ...night().colours, "text-muted": "#55504A" },
    });
    expect(bad.ok).toBe(false);
    expect(!bad.ok && bad.reason).toMatch(
      /^Quiet text on the ground is \d\.\d\d:1; it needs 4.5:1\.$/,
    );
    expect(s.saveCustomTheme({ ...night(), name: "  " })).toMatchObject({
      ok: false,
      reason: "Give it a name first.",
    });
    expect(s.customThemes()).toEqual([]);
    expect(s.saveCustomTheme(night()).ok).toBe(true);
    expect(s.customThemes()).toMatchObject([{ name: "Night desk", base: "rain-noir" }]);
  });

  it("never reads back a stored theme that fails the check or is malformed", () => {
    const good = s.saveCustomTheme(night());
    const stored = JSON.parse(window.localStorage.getItem(s.keys.custom) ?? "[]");
    stored.push(
      { ...stored[0], id: "own-bad", colours: { ...stored[0].colours, text: "#222222" } },
      { id: "own-x", name: "x", base: "nope", colours: {} },
    );
    window.localStorage.setItem(s.keys.custom, JSON.stringify(stored));
    expect(s.customThemes().map((t) => t.id)).toEqual([good.ok && good.theme.id]);
  });

  it("is tried and kept over its base theme, and leaves when deleted", () => {
    const saved = s.saveCustomTheme(night());
    if (!saved.ok) throw new Error(saved.reason);
    const id = saved.theme.id;
    s.tryTheme("rain-noir", id);
    expect(s.currentAppearance()).toMatchObject({ theme: "rain-noir", custom: id });
    expect(s.keptAppearance().custom).toBeNull();
    expect(html.dataset["theme"]).toBe("rain-noir");
    expect(html.style.getPropertyValue("--accent-1")).toBe("#E0A040");
    s.keepAppearance({ theme: "rain-noir", custom: id });
    expect(s.keptAppearance()).toMatchObject({ theme: "rain-noir", custom: id });
    s.keepAppearance({ theme: "archive" });
    expect(s.keptAppearance().custom).toBeNull();
    expect(html.style.getPropertyValue("--accent-1")).toBe("");
    s.keepAppearance({ custom: id });
    expect(s.keptAppearance().theme).toBe("rain-noir");
    s.deleteCustomTheme(id);
    s.keepAppearance({});
    expect(s.keptAppearance()).toMatchObject({ theme: "rain-noir", custom: null });
    expect(html.dataset["custom"]).toBeUndefined();
  });

  it("is set before the first paint by the boot script", () => {
    const saved = s.saveCustomTheme(night());
    if (!saved.ok) throw new Error(saved.reason);
    s.keepAppearance({ custom: saved.theme.id });
    html.removeAttribute("style");
    html.dataset["theme"] = "case-night";
    new Function(s.bootScript)();
    expect(html.dataset["theme"]).toBe("rain-noir");
    expect(html.style.getPropertyValue("--accent-1")).toBe("#E0A040");
    expect(html.style.getPropertyValue("--surface-1")).toBe(
      paletteVars(saved.theme.colours)["--surface-1"],
    );
  });
});

describe("storage prefix", () => {
  it("keeps a second store's choices apart", async () => {
    const { createThemeStore } = await import("./store");
    const other = createThemeStore<BuiltInThemeId>({
      palettes: BASE_PALETTES,
      defaultTheme: "archive",
      storagePrefix: "site-b",
    });
    other.keepAppearance({ theme: "forest-ledger" });
    expect(other.keptAppearance().theme).toBe("forest-ledger");
    expect(s.keptAppearance().theme).toBe("case-night");
  });
});
