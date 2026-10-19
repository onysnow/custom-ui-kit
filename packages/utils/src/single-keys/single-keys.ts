/**
 * Single-key shortcuts (`[`, `]`, `?`) can be switched off, as WCAG 2.1.4 requires. A per-browser preference that is on
 * by default and falls back to on when storage is blocked.
 *
 *   const keys = createSingleKeyPreference("my-app:single-keys");
 *   if (keys.on()) …;  keys.set(false);
 */
export function createSingleKeyPreference(storageKey: string) {
  return {
    on(): boolean {
      try {
        return window.localStorage.getItem(storageKey) !== "off";
      } catch {
        return true;
      }
    },
    set(on: boolean): void {
      try {
        if (on) window.localStorage.removeItem(storageKey);
        else window.localStorage.setItem(storageKey, "off");
      } catch {
        /* best effort */
      }
    },
  };
}
