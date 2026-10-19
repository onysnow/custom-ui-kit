import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SITE } from "../docs/site";

export const Route = createFileRoute("/docs/")({
  head: () => ({ meta: [{ title: `Overview · ${SITE.name}` }] }),
  component: Overview,
});

const PACKAGES = [
  [
    "@onysnow/tokens",
    "Themes, the Tailwind mapping, motion tokens, the contrast checker and the theme runtime.",
  ],
  ["@onysnow/utils", "cn() and shared hooks."],
  ["@onysnow/ui", "46 accessible components, one import each."],
  ["@onysnow/fx", "Glass, light, rain, shadow and camera on one engine."],
  [
    "@onysnow/fx-assets",
    "Textures, HDR rooms, the fracture library and sounds (about 12 MB, versioned on their own).",
  ],
];

function Overview() {
  return (
    <article className="surface-read max-w-4xl rounded-3xl border border-border p-6 sm:p-10">
      <h1 className="font-display text-5xl font-light">Overview</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{SITE.description}</p>
      <div className="docs-prose">
        <h2 id="packages">Packages</h2>
        <p>
          Install only what you use. Each package is versioned with semver and published to GitHub
          Packages under <code>@onysnow</code>.
        </p>
        <ul className="!list-none !pl-0">
          {PACKAGES.map(([name, body]) => (
            <li
              key={name}
              className="grid gap-1 border-b border-border/60 py-3 sm:grid-cols-[14rem_1fr]"
            >
              <code className="self-start">{name}</code>
              <span>{body}</span>
            </li>
          ))}
        </ul>
        <h2 id="principles">Principles</h2>
        <ul>
          <li>
            <strong>Accessible by default.</strong> Radix primitives handle focus, keyboard and
            ARIA. Every theme passes WCAG contrast, and a custom theme that fails is refused.
          </li>
          <li>
            <strong>Themed from one palette.</strong> Components use semantic utilities (
            <code>bg-primary</code>). Switching <code>data-theme</code> on <code>&lt;html&gt;</code>{" "}
            re-skins everything, effects included.
          </li>
          <li>
            <strong>Effects share one scene.</strong> One lamp and one room feed the glass, plastic,
            photographs and shadows, so they act on each other.
          </li>
          <li>
            <strong>Quiet when asked.</strong> Effects run after the page is idle, can be turned to
            Light or Off, and are off by default for people who prefer reduced motion.
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            to="/docs/installation"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            Installation <ArrowRight className="size-3.5" />
          </Link>
          <Link
            to="/docs/components"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            Components <ArrowRight className="size-3.5" />
          </Link>
          <Link
            to="/docs/effects"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            Effects <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
