/**
 * Changes to the look that are built but not yet approved.
 *
 * Every change that alters how the site looks ships switched OFF, and Ony
 * turns it on to see it by adding it to the address: `?try=marks`, or
 * several at once, `?try=a,b`. Nothing else turns them on, so the
 * site everyone sees is the approved one until a change is approved -- and
 * then its switch is removed and the new behaviour becomes the only one.
 *
 * The list is also put on the root element as `data-try`, so a stylesheet
 * can follow the same switch: `html[data-try~="marks"] ...`.
 *
 * Read once, on first use: a switch does not change without a page load.
 */

import { experimentsAllowed, getFxConfig, notePreviewsRead } from "../core/config";
export { PREVIEWS, type PreviewName } from "../core/previews";
import { PREVIEWS, type PreviewName } from "../core/previews";

/**
 * The ones that are not previews any more: corrections to things the site
 * already does, so they are on for everyone (Ony, 2026-10-01: "the default
 * is what I am telling you to do in regards to features that already exist
 * is a fix so quit making me try them"). Each keeps its name so the code
 * paths and their tests stay as they were; the lab no longer offers them as
 * switches.
 */
export const ON_BY_DEFAULT: readonly PreviewName[] = [
  "kelvin",
  "flash",
  "photolights",
  "dimroom",
  "marks",
  "roughglass",
  "corners",
  "shaderplastic",
  "bounce",
  "gapparallax",
  "polariser",
  "vignette",
  "burn",
  "liquidlights",
  "liquidedge",
  "redroom",
  // Quality tiers: phones and reduced motion get the quiet set, weak devices the lite one. A library that runs
  // simulations and a frame loop must be able to stand down, so this is not opt-in.
  "quality",
];

let active: ReadonlySet<string> | null = null;

function read(): ReadonlySet<string> {
  if (active) return active;
  if (typeof window === "undefined") return new Set();
  let list: string[] = [];
  // Only for Ony signed in as the admin (item 48; lib/admin-gate).
  const configured = getFxConfig().previews;
  notePreviewsRead();
  if (!experimentsAllowed()) {
    active = new Set([...ON_BY_DEFAULT, ...configured]);
    document.documentElement.dataset["try"] = [...active].join(" ");
    return active;
  }
  try {
    list = (new URLSearchParams(window.location.search).get("try") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is PreviewName => s in PREVIEWS);
  } catch {
    list = [];
  }
  // And the ones switched on in the lab, which stay on in this browser (storedPreviews).
  for (const name of storedPreviews()) if (!list.includes(name)) list.push(name);
  for (const name of [...ON_BY_DEFAULT, ...configured]) if (!list.includes(name)) list.push(name);
  active = new Set(list);
  if (list.length > 0) document.documentElement.dataset["try"] = list.join(" ");
  return active;
}

/** Whether a change that is not yet approved is switched on for this page load. */
export function previewing(name: PreviewName): boolean {
  return read().has(name);
}

const STORE = "onysnow:previews";

/**
 * The previews switched on in the lab (Ony, 2026-10-01: "Make all the try=
 * stuff into toggles"). Kept in this browser, so they stay on as he goes
 * round the site; only ever read for him signed in as the admin (read()).
 */
export function storedPreviews(): PreviewName[] {
  if (typeof window === "undefined") return [];
  try {
    return (window.localStorage.getItem(STORE) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is PreviewName => s in PREVIEWS);
  } catch {
    return [];
  }
}

/** Switch a preview on or off in this browser (the lab's switches). Takes effect on the next load. */
export function setStoredPreview(name: PreviewName, on: boolean) {
  const now = new Set(storedPreviews());
  if (on) now.add(name);
  else now.delete(name);
  try {
    if (now.size) window.localStorage.setItem(STORE, [...now].join(","));
    else window.localStorage.removeItem(STORE);
  } catch {
    /* no storage: the address's ?try= still works */
  }
}

/** For tests: forget what was read. */
export function resetPreviews(next?: readonly PreviewName[]) {
  active = next ? new Set(next) : null;
}
