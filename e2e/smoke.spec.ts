import { expect, test, type Page } from "@playwright/test";

/** Collect anything that would be a bug in a real browser: uncaught errors, console errors, hydration warnings. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 200)}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (/favicon|Failed to load resource/.test(text)) return;
    problems.push(`console: ${text.slice(0, 200)}`);
  });
  return problems;
}

const ROUTES = [
  "/",
  "/docs",
  "/docs/installation",
  "/docs/theming",
  "/docs/components",
  "/docs/components/button",
  "/docs/components/dialog",
  "/docs/components/resizable",
  "/docs/effects",
  "/docs/effects/glass",
  "/docs/effects/light",
  "/docs/effects/bokeh",
  "/gallery",
];

test.beforeEach(async ({ context }) => {
  // The lightest effect level keeps software WebGL quick; the stage still mounts every light layer.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("onysnow-ui:effects", "light");
    } catch {
      /* storage blocked */
    }
  });
});

for (const route of ROUTES) {
  test(`${route} renders without errors or hydration warnings`, async ({ page }) => {
    const problems = watch(page);
    await page.goto(route, { waitUntil: "load" });
    await expect(page.locator("h1, [data-slot], main").first()).toBeVisible();
    await page.waitForTimeout(2500);
    expect(problems).toEqual([]);
  });
}

test("the effect stage mounts its layers after the page is idle", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/docs/effects/glass");
  await expect.poll(() => page.locator("canvas").count(), { timeout: 30_000 }).toBeGreaterThan(0);
  // A pane registers itself with the scene.
  await expect(page.locator(".glass").first()).toBeVisible();
  expect(problems).toEqual([]);
});

test("effects can be turned off, and nothing animates then", async ({ page, context }) => {
  await context.addInitScript(() => localStorage.setItem("onysnow-ui:effects", "off"));
  await page.goto("/docs/effects/rain");
  await page.waitForTimeout(3000);
  expect(await page.locator("canvas.floor-light, canvas.plastic-bevel-layer").count()).toBe(0);
});

test("switching theme re-skins the page and survives a reload", async ({ page }) => {
  await page.goto("/docs/theming");
  await page
    .getByRole("button", { name: /Archive/ })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "archive");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "archive");
});

test("search finds a component and navigates to it", async ({ page }) => {
  await page.goto("/docs", { waitUntil: "networkidle" });
  // The shortcut is attached when the page hydrates; open it as a user would once the page is interactive.
  await expect(async () => {
    await page.keyboard.press("Control+k");
    await expect(page.getByPlaceholder(/Search components/)).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 30_000 });
  await page.getByPlaceholder(/Search components/).fill("slider");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/docs\/components\/slider/);
});
