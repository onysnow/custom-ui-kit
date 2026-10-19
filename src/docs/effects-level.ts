import { useSyncExternalStore } from "react";

/** How much of the effect layer runs: all of it (rain, lights), lights only, or none. Kept in this browser. */
export type EffectsLevel = "full" | "light" | "off";

const KEY = "onysnow-ui:effects";
const EVENT = "onysnow-ui:effects";

function read(): EffectsLevel {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "full" || v === "light" || v === "off") return v;
  } catch {
    /* storage blocked: the default stands */
  }
  // Anyone who asked their system for less motion starts with the quiet set.
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "off" : "full";
}

export function setEffectsLevel(level: EffectsLevel): void {
  try {
    window.localStorage.setItem(KEY, level);
  } catch {
    /* best effort */
  }
  document.documentElement.dataset["effects"] = level;
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
};

/** The level in force. Always "light" on the server and during hydration, so markup matches. */
export function useEffectsLevel(): EffectsLevel {
  return useSyncExternalStore(subscribe, read, () => "light");
}
