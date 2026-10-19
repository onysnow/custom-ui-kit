import { createFileRoute, Link } from "@tanstack/react-router";
import { Pane } from "@onysnow/fx/react/Pane";
import { CodeBlock } from "../docs/components/CodeBlock";
import { EFFECTS } from "../docs/registry/effects";
import { SITE } from "../docs/site";

export const Route = createFileRoute("/docs/effects/")({
  head: () => ({ meta: [{ title: `Effects · ${SITE.name}` }] }),
  component: EffectsIndex,
});

const SETUP = `import { configureFx } from "@onysnow/fx/core/config";
import { FxStage } from "@onysnow/fx/react/FxStage";
import "@onysnow/fx/styles/effects.css";

// Once, before anything mounts.
configureFx({
  assetBase: "/fx",                // where @onysnow/fx-assets is served
  previews: ["drops", "satin"],    // named effects allowed for everyone
});

export function Root({ children }) {
  return (
    <>
      {children}
      <FxStage rain />             {/* the standard effect layers */}
    </>
  );
}`;

function EffectsIndex() {
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-5xl font-light">Effects</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        One engine, one scene. The glass, the light, the water and the camera all read the same lamp
        and the same room, so they act on each other the way real objects do.
      </p>

      <h2 className="mb-3 mt-12 font-display text-3xl font-light">Set up</h2>
      <p className="mb-4 max-w-2xl text-muted-foreground">
        Serve <code className="font-mono text-sm">@onysnow/fx-assets</code> from your site, import
        the stylesheet, call <code className="font-mono text-sm">configureFx</code> once, and mount{" "}
        <code className="font-mono text-sm">FxStage</code>. Declare the layer order so utilities can
        still override effects:{" "}
        <code className="font-mono text-sm">
          @layer theme, base, components, fx-components, utilities;
        </code>
      </p>
      <CodeBlock code={SETUP} />

      <h2 className="mb-5 mt-14 font-display text-3xl font-light">The effects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {EFFECTS.map((e) => (
          <Link
            key={e.slug}
            to="/docs/effects/$slug"
            params={{ slug: e.slug }}
            className="group block"
          >
            <Pane className="h-full transition-transform duration-500 group-hover:-translate-y-1">
              <div className="space-y-2 p-6">
                <h3 className="font-display text-xl font-light">{e.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                <p className="font-mono text-xs text-muted-foreground/80">
                  {e.exports.join(" · ")}
                </p>
              </div>
            </Pane>
          </Link>
        ))}
      </div>
    </div>
  );
}
