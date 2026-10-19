import { defineConfig } from "@playwright/test";

// Smoke tests for the docs site, which is also the integration harness for @onysnow/fx. They run on whatever WebGL
// the machine has (software rendering in CI), so they check that things mount and nothing throws, not pixels.
// PW_CHROMIUM points at a preinstalled Chromium (the sandbox has one); in CI Playwright installs its own.
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env["CI"] ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1280, height: 900 },
    launchOptions: {
      ...(process.env["PW_CHROMIUM"] ? { executablePath: process.env["PW_CHROMIUM"] } : {}),
      args: [
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--no-sandbox",
      ],
    },
  },
  webServer: {
    command: "bun run dev -- --port 3000 --host 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
