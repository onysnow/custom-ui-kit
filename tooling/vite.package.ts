// Shared library build for every package under packages/*.
// One ESM entry per `src/<name>/index.ts` (so `@onysnow/<pkg>/<name>` is a real subpath) plus `src/index.ts`,
// declaration files next to them, and every `src/**/*.css` copied to dist unchanged.
// Dependencies and peer dependencies are always external: a package bundles only its own source.
import { cpSync, globSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig, type PluginOption } from "vite";

type PackageJson = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

type Options = {
  /** "folders": one entry per `src/<name>/index.ts` (default). "modules": one entry per source module. */
  entries?: "folders" | "modules";
};

export function packageConfig(packageDir: string, options: Options = {}) {
  const pkg = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf-8")) as PackageJson;
  const externals = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    "react/jsx-runtime",
  ];
  const isExternal = (id: string) =>
    externals.some((dep) => id === dep || id.startsWith(`${dep}/`));

  const src = join(packageDir, "src");
  const entry: Record<string, string> = {};
  if (options.entries === "modules") {
    const isSource = (file: string) =>
      !/\.(test|d)\.tsx?$/.test(file) && !file.includes("__fixtures__");
    for (const file of globSync("**/*.{ts,tsx}", { cwd: src }).filter(isSource)) {
      entry[file.replace(/\.tsx?$/, "")] = resolve(src, file);
    }
  } else {
    if (globSync("index.ts", { cwd: src }).length) entry["index"] = resolve(src, "index.ts");
    for (const file of globSync("*/index.ts", { cwd: src })) {
      entry[dirname(file) + "/index"] = resolve(src, file);
    }
  }

  const copyCss: PluginOption = {
    name: "copy-css",
    closeBundle() {
      for (const file of globSync("**/*.css", { cwd: src })) {
        cpSync(resolve(src, file), resolve(packageDir, "dist", relative(".", file)), {
          recursive: true,
        });
      }
    },
  };

  return defineConfig({
    publicDir: false,
    plugins: [
      dts({
        root: packageDir,
        include: ["src"],
        exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        tsconfigPath: join(packageDir, "tsconfig.json"),
      }),
      copyCss,
    ],
    build: {
      outDir: join(packageDir, "dist"),
      emptyOutDir: true,
      sourcemap: true,
      lib: { entry, formats: ["es"] },
      rollupOptions: { external: isExternal },
    },
  });
}
