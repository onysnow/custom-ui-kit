import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Packages resolve each other from source in tests, so no build step is needed to run them.
export function testConfig(
  packageDir: string,
  options: { environment?: "jsdom" | "node"; testTimeout?: number } = {},
) {
  const packages = resolve(packageDir, "..");
  return defineConfig({
    resolve: {
      alias: [{ find: /^@onysnow\/(utils|tokens)$/, replacement: `${packages}/$1/src/index.ts` }],
    },
    test: {
      testTimeout: options.testTimeout ?? 5_000,
      environment: options.environment ?? "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: [resolve(packageDir, "../../tooling/test-setup.ts")],
    },
  });
}
