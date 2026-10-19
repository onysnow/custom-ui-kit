import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@onysnow/ui/alert";
import { Badge } from "@onysnow/ui/badge";
import { CodeBlock } from "../docs/components/CodeBlock";
import { Demo } from "../docs/components/Demo";
import { effectDemo, effectDemoSource } from "../docs/demos";
import { EFFECTS, effectBySlug } from "../docs/registry/effects";
import { SITE } from "../docs/site";

export const Route = createFileRoute("/docs/effects/$slug")({
  loader: async ({ params }) => {
    const entry = effectBySlug(params.slug);
    if (!entry) throw notFound();
    return { slug: entry.slug, demoCode: (await effectDemoSource(entry.slug)?.()) ?? "" };
  },
  head: ({ params }) => {
    const entry = effectBySlug(params.slug);
    return {
      meta: [
        { title: `${entry?.title ?? "Effect"} · ${SITE.name}` },
        { name: "description", content: entry?.description ?? "" },
      ],
    };
  },
  component: EffectPage,
});

function EffectPage() {
  const { slug, demoCode } = Route.useLoaderData();
  const entry = effectBySlug(slug)!;
  const index = EFFECTS.findIndex((e) => e.slug === slug);
  const prev = EFFECTS[index - 1];
  const next = EFFECTS[index + 1];
  const Demo_ = useMemo(() => {
    const load = effectDemo(slug);
    return load ? lazy(load) : null;
  }, [slug]);

  return (
    <article className="surface-read max-w-4xl rounded-3xl border border-border p-6 sm:p-10">
      <Badge variant="outline" className="mb-4 font-mono text-[11px] uppercase tracking-wider">
        Effect
      </Badge>
      <h1 className="font-display text-5xl font-light">{entry.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{entry.description}</p>

      <div className="docs-prose">
        {entry.needs && (
          <Alert className="mt-6">
            <AlertTitle>Needs a named effect switched on</AlertTitle>
            <AlertDescription>
              Call <code>configureFx({`{ ${entry.needs} }`})</code> before the first effect mounts.
              This site already does.
            </AlertDescription>
          </Alert>
        )}
        <h2 id="import">Import</h2>
        <CodeBlock code={entry.importLine} />

        <h2 id="demo">Try it</h2>
        {Demo_ ? (
          <Demo code={demoCode} stage>
            <Suspense
              fallback={<div className="h-48 w-full animate-pulse rounded-lg bg-muted/40" />}
            >
              <Demo_ />
            </Suspense>
          </Demo>
        ) : (
          <p>No demo yet.</p>
        )}

        <h2 id="how">How it works</h2>
        <ul>
          {entry.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <h2 id="exports">Exports</h2>
        <ul className="grid list-none grid-cols-2 gap-x-6 gap-y-1 !pl-0 sm:grid-cols-3">
          {entry.exports.map((n) => (
            <li key={n} className="font-mono text-sm text-foreground">
              {n}
            </li>
          ))}
        </ul>
      </div>

      <nav
        aria-label="Pagination"
        className="mt-12 flex justify-between gap-4 border-t border-border pt-6 text-sm"
      >
        {prev ? (
          <Link
            to="/docs/effects/$slug"
            params={{ slug: prev.slug }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/docs/effects/$slug"
            params={{ slug: next.slug }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {next.title} <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
