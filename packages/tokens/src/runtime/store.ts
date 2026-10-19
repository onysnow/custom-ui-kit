// Themes, effects and motion as three separate, per-browser choices, with "try, then keep": a theme can be tried for
// this session only, and nothing changes for good until Keep. Every storage access is wrapped, so blocked storage
// falls back to the defaults. A theme of your own is a built-in theme with your colours on top; it is stored in this
// browser only and checked against the contrast floors on every read, so a stored theme that fails is never applied.
import {
  checkPalette,
  COLOUR_TOKENS,
  isHex,
  ratioText,
  type Palette,
  type PaletteCheck,
} from "./contrast";

export type Effects = "full" | "light" | "off";
export type Motion = "normal" | "calm";

export type Appearance<T extends string> = {
  theme: T;
  effects: Effects;
  motion: Motion;
  /** Named effects switched off one by one (data-fx-off on <html>). */
  off: string[];
  /** A theme of your own over `theme`, or null for the built-in theme as it is. */
  custom: string | null;
};

export type CustomTheme<T extends string> = { id: string; name: string; base: T; colours: Palette };
export type SaveResult<T extends string> =
  { ok: true; theme: CustomTheme<T> } | { ok: false; reason: string; check?: PaletteCheck };

export type ThemeStoreOptions<T extends string> = {
  /** Built-in theme ids with their palettes. */
  palettes: Record<T, Palette>;
  defaultTheme: T;
  /** Prefix for storage keys and the change events. Default "onysnow". */
  storagePrefix?: string;
  /** Names of effects that can be switched off one by one. */
  namedEffects?: readonly string[];
  /** Effects that start switched off. */
  offAtFirst?: readonly string[];
  maxCustomThemes?: number;
};

const MAX_NAME = 40;

/** The CSS custom properties a palette sets: its own role tokens (the semantic mapping aliases them). */
export function paletteVars(p: Palette): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const { token } of COLOUR_TOKENS) vars[`--${token}`] = p[token];
  return vars;
}

export function createThemeStore<T extends string>(options: ThemeStoreOptions<T>) {
  const prefix = options.storagePrefix ?? "onysnow";
  const namedEffects = options.namedEffects ?? [];
  const offAtFirst = options.offAtFirst ?? [];
  const maxCustom = options.maxCustomThemes ?? 12;
  const KEY = `${prefix}:appearance`;
  const TRY_KEY = `${prefix}:appearance-trying`;
  const EVENT = `${prefix}:appearance`;
  const CUSTOM_KEY = `${prefix}:custom-themes`;
  const CUSTOM_EVENT = `${prefix}:custom-themes`;
  const baseIds = Object.keys(options.palettes) as T[];
  const isBase = (v: unknown): v is T =>
    typeof v === "string" && Object.prototype.hasOwnProperty.call(options.palettes, v);
  const defaults: Appearance<T> = {
    theme: options.defaultTheme,
    effects: "full",
    motion: "normal",
    off: [...offAtFirst],
    custom: null,
  };

  // --- themes of your own -------------------------------------------------------------------------------------

  function readOne(v: unknown): CustomTheme<T> | null {
    if (!v || typeof v !== "object") return null;
    const o = v as Record<string, unknown>;
    if (typeof o["id"] !== "string" || !/^[a-z0-9-]{1,40}$/.test(o["id"])) return null;
    if (typeof o["name"] !== "string" || !o["name"].trim() || !isBase(o["base"])) return null;
    const raw = o["colours"] as Record<string, unknown> | undefined;
    if (!raw || typeof raw !== "object") return null;
    const colours = {} as Palette;
    for (const { token } of COLOUR_TOKENS) {
      const value = raw[token];
      if (!isHex(value)) return null;
      colours[token] = value.toUpperCase();
    }
    if (checkPalette(colours).failing.length) return null;
    return { id: o["id"], name: o["name"].trim().slice(0, MAX_NAME), base: o["base"], colours };
  }

  /** Your own themes kept in this browser; any that fail the check are left out. */
  function customThemes(): CustomTheme<T>[] {
    try {
      const list = JSON.parse(window.localStorage.getItem(CUSTOM_KEY) ?? "[]") as unknown;
      if (!Array.isArray(list)) return [];
      const seen = new Set<string>();
      const out: CustomTheme<T>[] = [];
      for (const item of list) {
        const t = readOne(item);
        if (t && !seen.has(t.id)) {
          seen.add(t.id);
          out.push(t);
        }
      }
      return out.slice(0, maxCustom);
    } catch {
      return [];
    }
  }

  const customTheme = (id: string | null | undefined): CustomTheme<T> | null =>
    id ? (customThemes().find((t) => t.id === id) ?? null) : null;

  function writeCustom(list: CustomTheme<T>[]): boolean {
    try {
      // The variables go with each theme so the first-paint script can set them without this module.
      window.localStorage.setItem(
        CUSTOM_KEY,
        JSON.stringify(list.map((t) => ({ ...t, vars: paletteVars(t.colours) }))),
      );
    } catch {
      return false;
    }
    window.dispatchEvent(new Event(CUSTOM_EVENT));
    return true;
  }

  /** Keep a theme of your own (new, or replacing the one with the same id). Refused while any pair fails. */
  function saveCustomTheme(draft: {
    id?: string;
    name: string;
    base: T;
    colours: Palette;
  }): SaveResult<T> {
    const name = draft.name.trim().slice(0, MAX_NAME);
    if (!name) return { ok: false, reason: "Give it a name first." };
    if (!isBase(draft.base)) return { ok: false, reason: "Start from one of the themes." };
    const colours = {} as Palette;
    for (const { token, name: word } of COLOUR_TOKENS) {
      const value = draft.colours[token];
      if (!isHex(value)) return { ok: false, reason: `${word} is not a colour written #rrggbb.` };
      colours[token] = value.toUpperCase();
    }
    const check = checkPalette(colours);
    const first = check.failing[0];
    if (first) {
      return {
        ok: false,
        check,
        reason: `${first.what} is ${ratioText(first.ratio, true)}; it needs ${first.min}:1.`,
      };
    }
    const list = customThemes();
    const exists = draft.id !== undefined && list.some((t) => t.id === draft.id);
    const id = exists && draft.id ? draft.id : `own-${Date.now().toString(36)}`;
    if (!exists && list.length >= maxCustom) {
      return {
        ok: false,
        reason: `This browser keeps ${maxCustom} of your own; delete one first.`,
      };
    }
    const theme: CustomTheme<T> = { id, name, base: draft.base, colours };
    const next = exists ? list.map((t) => (t.id === id ? theme : t)) : [...list, theme];
    return writeCustom(next)
      ? { ok: true, theme }
      : { ok: false, reason: "This browser would not keep it (storage is blocked or full)." };
  }

  function deleteCustomTheme(id: string): void {
    writeCustom(customThemes().filter((t) => t.id !== id));
  }

  function onCustomThemesChange(fn: () => void): () => void {
    window.addEventListener(CUSTOM_EVENT, fn);
    return () => window.removeEventListener(CUSTOM_EVENT, fn);
  }

  // --- appearance ---------------------------------------------------------------------------------------------

  function parse(raw: string | null): Partial<Appearance<T>> {
    if (!raw) return {};
    try {
      const v = JSON.parse(raw) as Partial<Appearance<T>>;
      return typeof v === "object" && v ? v : {};
    } catch {
      return {};
    }
  }

  function valid(a: Partial<Appearance<T>>): Appearance<T> {
    const own = customTheme(a.custom);
    return {
      theme: own ? own.base : isBase(a.theme) ? a.theme : defaults.theme,
      custom: own ? own.id : null,
      effects: a.effects === "light" || a.effects === "off" ? a.effects : "full",
      motion: a.motion === "calm" ? "calm" : "normal",
      off: Array.isArray(a.off) ? namedEffects.filter((e) => a.off?.includes(e)) : [...offAtFirst],
    };
  }

  /** The kept appearance (what stays after Keep). */
  function keptAppearance(): Appearance<T> {
    try {
      return valid(parse(window.localStorage.getItem(KEY)));
    } catch {
      return { ...defaults, off: [...defaults.off] };
    }
  }

  /** What is being tried this session, if anything: a built-in theme, or one of your own (stored as "own:<id>"). */
  function tryingRaw(): { theme: T; custom: string | null } | null {
    try {
      const t = window.sessionStorage.getItem(TRY_KEY);
      if (t?.startsWith("own:")) {
        const own = customTheme(t.slice(4));
        return own ? { theme: own.base, custom: own.id } : null;
      }
      return isBase(t) ? { theme: t, custom: null } : null;
    } catch {
      return null;
    }
  }

  const tryingTheme = (): T | null => tryingRaw()?.theme ?? null;
  const tryingCustom = (): string | null => tryingRaw()?.custom ?? null;

  /** What the screen shows now: the kept appearance, with a theme on trial if one is. */
  function currentAppearance(): Appearance<T> {
    const kept = keptAppearance();
    const trying = tryingRaw();
    return trying ? { ...kept, ...trying } : kept;
  }

  const OWN_VARS = Object.keys(paletteVars(options.palettes[options.defaultTheme]));

  function applyAppearance(a: Appearance<T> = currentAppearance()): void {
    const html = document.documentElement;
    html.dataset["theme"] = a.theme;
    html.dataset["effects"] = a.effects;
    html.dataset["motion"] = a.motion;
    html.dataset["fxOff"] = a.off.join(" ");
    for (const name of OWN_VARS) html.style.removeProperty(name);
    const own = customTheme(a.custom);
    if (own) {
      html.dataset["custom"] = own.id;
      for (const [name, value] of Object.entries(paletteVars(own.colours)))
        html.style.setProperty(name, value);
    } else {
      delete html.dataset["custom"];
    }
  }

  function changed(): void {
    applyAppearance();
    window.dispatchEvent(new Event(EVENT));
  }

  /** Keep a change. Choosing a built-in theme (`theme` without `custom`) leaves any theme of your own. */
  function keepAppearance(patch: Partial<Appearance<T>>): void {
    const choosing = patch.theme !== undefined || patch.custom !== undefined;
    const leaveOwn =
      patch.theme !== undefined && patch.custom === undefined ? { custom: null } : {};
    const next = valid({ ...keptAppearance(), ...leaveOwn, ...patch });
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* best effort */
    }
    if (choosing) {
      try {
        window.sessionStorage.removeItem(TRY_KEY);
      } catch {
        /* best effort */
      }
    }
    changed();
  }

  /** Try a theme for this session only (or, with `custom`, one of your own); Keep makes it stay, Go back drops it. */
  function tryTheme(theme: T | null, custom: string | null = null): void {
    try {
      if (theme && custom) window.sessionStorage.setItem(TRY_KEY, `own:${custom}`);
      else if (theme) window.sessionStorage.setItem(TRY_KEY, theme);
      else window.sessionStorage.removeItem(TRY_KEY);
    } catch {
      /* best effort */
    }
    changed();
  }

  function onAppearanceChange(fn: () => void): () => void {
    window.addEventListener(EVENT, fn);
    return () => window.removeEventListener(EVENT, fn);
  }

  /**
   * Runs before the first paint (inline in <head>), so a kept theme never flashes the default. Self-contained: it
   * re-applies a theme of your own from the variables stored with it, accepting only values that look like colours.
   */
  const bootScript =
    `(function(){try{var a=JSON.parse(localStorage.getItem('${KEY}')||'{}');var t=sessionStorage.getItem('${TRY_KEY}');` +
    `var h=document.documentElement;var own=t&&t.indexOf('own:')===0?t.slice(4):(t?null:a.custom);` +
    `h.dataset.theme=(t&&!own?t:a.theme)||'${options.defaultTheme}';h.dataset.effects=a.effects||'full';` +
    `h.dataset.motion=a.motion||'normal';h.dataset.fxOff=(a.off||${JSON.stringify(offAtFirst)}).join(' ');` +
    `if(own){var l=JSON.parse(localStorage.getItem('${CUSTOM_KEY}')||'[]');for(var i=0;i<l.length;i++){` +
    `if(l[i]&&l[i].id===own&&l[i].vars){h.dataset.theme=l[i].base;for(var k in l[i].vars){var v=String(l[i].vars[k]);` +
    `if(/^--[a-z0-9-]+$/.test(k)&&/^[#0-9a-fA-F% .]+$/.test(v))h.style.setProperty(k,v);}}}}}catch(e){}})();`;

  return {
    baseIds,
    keys: { appearance: KEY, trying: TRY_KEY, custom: CUSTOM_KEY },
    customThemes,
    customTheme,
    saveCustomTheme,
    deleteCustomTheme,
    onCustomThemesChange,
    keptAppearance,
    currentAppearance,
    applyAppearance,
    keepAppearance,
    tryTheme,
    tryingTheme,
    tryingCustom,
    onAppearanceChange,
    bootScript,
  };
}

export type ThemeStore<T extends string> = ReturnType<typeof createThemeStore<T>>;
