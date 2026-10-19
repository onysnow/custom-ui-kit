import { createFileRoute } from "@tanstack/react-router";
import { THEMES } from "@onysnow/tokens";
import { CodeBlock } from "../docs/components/CodeBlock";
import { ContrastChecker } from "../docs/components/ContrastChecker";
import { SITE } from "../docs/site";
import { themes } from "../docs/theme";

export const Route = createFileRoute("/docs/theming")({
  head: () => ({ meta: [{ title: `Theming · ${SITE.name}` }] }),
  component: Theming,
});

const TOKENS = [
  ["--ground", "The page itself; always darker than the panels over it."],
  ["--surface-1 … 3", "Panel, card and selected row, in that order."],
  ["--text, --text-muted", "Body and quiet text."],
  ["--line", "Outlines and inputs; must reach 3:1 on a panel."],
  ["--accent-1, --accent-2", "The two accents: buttons, links, focus rings, effect tints."],
  ["--status-*, --flag-*, --ai-mark", "Status and flag colours; never the only signal."],
  ["--font-ui, --font-read, --font-display, --font-mono", "Type stacks per theme."],
];

const STORE = `import { BASE_PALETTES, createThemeStore } from "@onysnow/tokens";

export const themes = createThemeStore({
  palettes: BASE_PALETTES,
  defaultTheme: "rain-noir",
  storagePrefix: "my-app",       // keeps this app's choices apart from others on the same origin
});

themes.tryTheme("archive");      // for this session only
themes.keepAppearance({ theme: "archive" });   // makes it stay`;

const CUSTOM = `const result = themes.saveCustomTheme({
  name: "Night desk",
  base: "rain-noir",
  colours: { ...BASE_PALETTES["rain-noir"], "accent-1": "#E0A040" },
});

if (!result.ok) console.log(result.reason);
// "Quiet text on the ground is 4.31:1; it needs 4.5:1."`;

function Theming() {
  return (
    <article className="surface-read max-w-4xl rounded-3xl border border-border p-6 sm:p-10">
      <h1 className="font-display text-5xl font-light">Theming</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Seventeen role tokens per theme. Components never name a colour; they name a job, and the
        theme fills it.
      </p>
      <div className="docs-prose">
        <h2 id="themes">Built-in themes</h2>
        <div className="not-prose my-4 grid gap-3 sm:grid-cols-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => themes.keepAppearance({ theme: t.id })}
              className="rounded-xl border border-border bg-card/50 p-4 text-left transition hover:border-primary/60"
            >
              <div className="mb-3 flex h-8 overflow-hidden rounded-md border border-black/30">
                {t.swatches.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.mood}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                Lowest contrast {t.lowestContrast}
              </p>
            </button>
          ))}
        </div>
        <p>Click one: the whole site switches, components and effects together.</p>

        <h2 id="tokens">The tokens</h2>
        <ul className="!list-none !pl-0">
          {TOKENS.map(([name, body]) => (
            <li
              key={name}
              className="grid gap-1 border-b border-border/60 py-2.5 sm:grid-cols-[16rem_1fr]"
            >
              <code className="self-start">{name}</code>
              <span>{body}</span>
            </li>
          ))}
        </ul>
        <p>
          The shadcn-style semantic variables (<code>--background</code>, <code>--primary</code>,{" "}
          <code>--border</code>…) are plain <code>var()</code> aliases of these, so there is one
          palette and no colour conversion.
        </p>

        <h2 id="contrast">Contrast is checked, not hoped for</h2>
        <p>
          Every built-in pair passes WCAG 2.2 (text 4.5:1, interface marks 3:1). The same function
          is exported:
        </p>
        <ContrastChecker />

        <h2 id="runtime">The runtime</h2>
        <p>
          <code>createThemeStore</code> keeps three separate per-browser choices (theme, effects,
          motion), with &ldquo;try, then keep&rdquo;: a theme can be tried for the session and
          nothing changes for good until Keep.
        </p>
        <CodeBlock code={STORE} />

        <h2 id="custom">Themes of your own</h2>
        <p>
          A custom theme starts from a built-in one and is refused, with the failing pair named, if
          any colour fails contrast.
        </p>
        <CodeBlock code={CUSTOM} />
      </div>
    </article>
  );
}
