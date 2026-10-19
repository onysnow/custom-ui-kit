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
export type FxConfig = {
  /**
   * Whether this page may show unreleased previews and test switches (`?quality=`, `?try=`, `?perf`, ...).
   * Default: only on a local development server.
   */
  experimentsAllowed: () => boolean;
  /** Prefix for the library's bundled textures, rooms and sounds (no trailing slash). Default: "" (the site root). */
  assetBase: string;
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
