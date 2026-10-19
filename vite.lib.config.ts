// Library build: bundles src/index.ts (components only, no app routes) to dist/.
// The app/demo build lives in vite.config.ts and is unaffected.
import { copyFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};
const externals = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  "react/jsx-runtime",
];
const isExternal = (id: string) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`));

export default defineConfig({
  publicDir: false,
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  plugins: [
    dts({
      include: ["src/index.ts", "src/components/**/*", "src/hooks/**/*", "src/lib/utils.ts"],
      tsconfigPath: "./tsconfig.json",
    }),
    {
      name: "copy-theme-css",
      closeBundle() {
        copyFileSync("src/theme.css", "dist/theme.css");
      },
    },
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: { external: isExternal },
    sourcemap: true,
    emptyOutDir: true,
  },
});
