import type { ComponentType } from "react";

// Demos are plain files; the page shows the file that runs. Everything is lazy so only the demo on screen is loaded.
const demoModules = import.meta.glob<{ default: ComponentType }>("./demos/components/*.tsx");
const demoSources = import.meta.glob<string>("./demos/components/*.tsx", {
  query: "?raw",
  import: "default",
});
const effectModules = import.meta.glob<{ default: ComponentType }>("./demos/effects/*.tsx");
const effectSources = import.meta.glob<string>("./demos/effects/*.tsx", {
  query: "?raw",
  import: "default",
});
const uiSources = import.meta.glob<string>("../../packages/ui/src/*/*.tsx", {
  query: "?raw",
  import: "default",
});

export const componentDemo = (slug: string) => demoModules[`./demos/components/${slug}.tsx`];
export const componentDemoSource = (slug: string) => demoSources[`./demos/components/${slug}.tsx`];
export const effectDemo = (slug: string) => effectModules[`./demos/effects/${slug}.tsx`];
export const effectDemoSource = (slug: string) => effectSources[`./demos/effects/${slug}.tsx`];
export const uiSource = (slug: string) => uiSources[`../../packages/ui/src/${slug}/${slug}.tsx`];

/** The names a component file exports, read from its `export { ... }` and `export const|function|type` lines. */
export function exportedNames(source: string): string[] {
  const names = new Set<string>();
  for (const m of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of (m[1] ?? "").split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name && !name.startsWith("type ")) names.add(name);
    }
  }
  for (const m of source.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z0-9_]+)/g))
    names.add(m[1]!);
  return [...names].filter((n) => /^[A-Z]/.test(n)).sort();
}
