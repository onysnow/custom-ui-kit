/**
 * What the effect layer needs from the app that hosts it.
 *
 * The effects used to reach into their app directly (a Supabase-backed admin gate, a settings table for asset
 * addresses). They now ask this one object instead, so any app can host them. Nothing here is required: the defaults
 * are the safe ones (no experiments, assets served from the site root).
 *
 *   configureFx({ experimentsAllowed: () => user.isAdmin, assetBase: "https://cdn.example.com/fx" });
 *
 * Plain module state rather than React state for the same reason as the tuning registry: the loops that read it run
 * inside their own requestAnimationFrame callbacks, so routing it through a re-render would cost more than it saves.
 */
import type { PreviewName } from "../engine/preview";

export type FxConfig = {
  /**
   * Whether this page may show unreleased previews and test switches (`?quality=`, `?try=`, `?perf`, ...).
   * Default: only on a local development server.
   */
  experimentsAllowed: () => boolean;
  /** Prefix for the library's bundled textures, rooms and sounds (no trailing slash). Default: "" (the site root). */
  assetBase: string;
  /**
   * Effects that are switched on for everyone on this page, in addition to the ones that are on by default.
   * The named effects (rain on the glass, balloons, webs, fireworks, ...) otherwise only appear with `?try=<name>`
   * for an admin. Read once, on first use, so call `configureFx` before the first effect mounts.
   */
  previews: readonly PreviewName[];
  /**
   * Turns a stored photograph path into a URL, for apps that keep photographs in storage (`<Img image={{ storage_path }}>`).
   * Default: the path is used as the URL.
   */
  photoUrl?: ((storagePath: string) => string) | undefined;
};

/** The dev server on this machine: open, for development and tests. */
export function isLocalDev(
  dev: boolean = Boolean(import.meta.env?.DEV),
  host: string = typeof window === "undefined" ? "" : window.location.hostname,
): boolean {
  return dev && (host === "localhost" || host === "127.0.0.1" || host === "[::1]");
}

const defaults: FxConfig = {
  experimentsAllowed: () => typeof window !== "undefined" && isLocalDev(),
  assetBase: "",
  previews: [],
};

let current: FxConfig = { ...defaults };

/** Override any part of the configuration. Call once, before the first effect mounts. */
export function configureFx(patch: Partial<FxConfig>): FxConfig {
  current = { ...current, ...patch };
  return current;
}

export function getFxConfig(): Readonly<FxConfig> {
  return current;
}

export function resetFxConfig(): void {
  current = { ...defaults };
}

/** Whether this page may show previews and test switches. */
export function experimentsAllowed(): boolean {
  return current.experimentsAllowed();
}

/** Resolve a path the library ships (for example "/glass-surface.jpg") against the configured asset base. */
export function fxAssetPath(path: string): string {
  return `${current.assetBase}${path}`;
}

/**
 * CSS custom properties the stylesheet's fallbacks point at, resolved against the asset base. Put them on `<html>`
 * (`style={fxCssVars()}`, or `document.documentElement.style.setProperty`) when the assets are not served from the
 * site root; the stylesheet's own `url("/glass-surface.jpg")` fallbacks only work from the root.
 */
export function fxCssVars(): Record<string, string> {
  return {
    "--glass-surface": `url("${fxAssetPath("/glass-surface.jpg")}")`,
    "--room": `url("${fxAssetPath("/rooms/metro.jpg")}")`,
  };
}
