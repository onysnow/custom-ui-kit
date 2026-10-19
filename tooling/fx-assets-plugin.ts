// Serves @onysnow/fx-assets under /fx for the docs app, in dev and in the production build, with no script hooks:
// the files are copied into public/fx (git-ignored) as soon as Vite reads its config, so Vite's own public-dir
// handling picks them up everywhere.
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

export function fxAssets(root = process.cwd()): Plugin {
  return {
    name: "onysnow-fx-assets",
    enforce: "pre",
    config() {
      const from = resolve(root, "packages/fx-assets/assets");
      if (existsSync(from)) cpSync(from, resolve(root, "public/fx"), { recursive: true });
    },
  };
}
