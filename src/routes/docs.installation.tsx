import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "../docs/components/CodeBlock";
import { InstallTabs } from "../docs/components/InstallTabs";
import { SITE } from "../docs/site";

export const Route = createFileRoute("/docs/installation")({
  head: () => ({ meta: [{ title: `Installation · ${SITE.name}` }] }),
  component: Installation,
});

const NPMRC = `@onysnow:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`;

const CSS = `@layer theme, base, components, fx-components, utilities;
@import "tailwindcss";
@import "tw-animate-css";
@import "@onysnow/tokens/index.css";
@import "@onysnow/tokens/tailwind.css";
@source "../node_modules/@onysnow/ui/dist";`;

const ROOT = `import { themeStore } from "@onysnow/tokens";

// In <head>, inline: applies the saved theme before first paint, so it never flashes the default.
<script dangerouslySetInnerHTML={{ __html: themeStore.bootScript }} />

// <html data-theme="rain-noir"> is the default; switch it any time:
themeStore.keepAppearance({ theme: "archive" });`;

const USE = `import { Button } from "@onysnow/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@onysnow/ui/card";

export function Hello() {
  return (
    <Card>
      <CardHeader><CardTitle>Hello</CardTitle></CardHeader>
      <CardContent><Button>Get started</Button></CardContent>
    </Card>
  );
}`;

function Installation() {
  return (
    <article className="surface-read max-w-4xl rounded-3xl border border-border p-6 sm:p-10">
      <h1 className="font-display text-5xl font-light">Installation</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        React 18 or 19 and Tailwind CSS v4. Five minutes to a themed app; add effects when you want
        them.
      </p>
      <div className="docs-prose">
        <h2 id="registry">1. Point at the registry</h2>
        <p>
          The packages are published to GitHub Packages. Give your project read access to the{" "}
          <code>@onysnow</code> scope:
        </p>
        <CodeBlock code={NPMRC} lang="bash" title=".npmrc" />
        <h2 id="install">2. Install</h2>
        <InstallTabs />
        <p>
          You also need the peers: <code>react</code>, <code>react-dom</code>,{" "}
          <code>tailwindcss</code> and <code>tw-animate-css</code>.
        </p>
        <h2 id="css">3. Add the stylesheet</h2>
        <p>
          The tokens file defines the themes; the Tailwind file maps them to utilities like{" "}
          <code>bg-primary</code>. The <code>@source</code> line lets Tailwind see the classes used
          inside the components.
        </p>
        <CodeBlock code={CSS} lang="css" title="app.css" />
        <h2 id="theme">4. Set a theme</h2>
        <CodeBlock code={ROOT} />
        <h2 id="use">5. Use a component</h2>
        <CodeBlock code={USE} />
        <h2 id="effects">6. Add effects (optional)</h2>
        <p>
          Install <code>@onysnow/fx</code> and <code>@onysnow/fx-assets</code>, serve the assets,
          and mount <code>FxStage</code>. See <a href="/docs/effects">Effects</a>.
        </p>
      </div>
    </article>
  );
}
