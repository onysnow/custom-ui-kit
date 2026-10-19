import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import { Badge } from "@onysnow/ui/badge";
import { CodeBlock } from "../docs/components/CodeBlock";
import { Demo } from "../docs/components/Demo";
import { componentDemo, componentDemoSource, exportedNames, uiSource } from "../docs/demos";
import { bySlug, COMPONENTS } from "../docs/registry/components";
import { SITE } from "../docs/site";

export const Route = createFileRoute("/docs/components/$slug")({
  loader: async ({ params }) => {
    const entry = bySlug(params.slug);
    if (!entry) throw notFound();
    const [demoCode, componentCode] = await Promise.all([
      componentDemoSource(entry.slug)?.(),
      uiSource(entry.slug)?.(),
    ]);
    return {
      slug: entry.slug,
      demoCode: demoCode ?? "",
      names: componentCode ? exportedNames(componentCode) : [],
    };
  },
  head: ({ params }) => {
    const entry = bySlug(params.slug);
    return {
      meta: [
        { title: `${entry?.title ?? "Component"} · ${SITE.name}` },
        { name: "description", content: entry?.description ?? "" },
      ],
    };
  },
  component: ComponentPage,
});

function ComponentPage() {
  const { slug, demoCode, names } = Route.useLoaderData();
  const entry = bySlug(slug)!;
  const group = COMPONENTS.filter((c) => c.group === entry.group);
  const index = group.findIndex((c) => c.slug === slug);
  const prev = group[index - 1];
  const next = group[index + 1];
  const Demo_ = useMemo(() => {
    const load = componentDemo(slug);
    return load ? lazy(load) : null;
  }, [slug]);

  return (
    <article className="surface-read max-w-4xl rounded-3xl border border-border p-6 sm:p-10">
      <Badge variant="outline" className="mb-4 font-mono text-[11px] uppercase tracking-wider">
        {entry.group}
      </Badge>
      <h1 className="font-display text-5xl font-light">{entry.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{entry.description}</p>

      <div className="docs-prose">
        <h2 id="import">Import</h2>
        <CodeBlock
          code={`import { ${names.slice(0, 3).join(", ")}${names.length > 3 ? ", …" : ""} } from "@onysnow/ui/${slug}";`}
        />

        <h2 id="demo">Example</h2>
        {Demo_ ? (
          <Demo code={demoCode}>
            <Suspense
              fallback={<div className="h-24 w-full animate-pulse rounded-lg bg-muted/40" />}
            >
              <Demo_ />
            </Suspense>
          </Demo>
        ) : (
          <p>No example yet.</p>
        )}

        <h2 id="exports">Exports</h2>
        <p>
          Everything exported from <code>@onysnow/ui/{slug}</code>. Each part takes{" "}
          <code>className</code>; parts that render an element also forward its props and ref.
        </p>
        <ul className="grid list-none grid-cols-2 gap-x-6 gap-y-1 !pl-0 sm:grid-cols-3">
          {names.map((n) => (
            <li key={n} className="font-mono text-sm text-foreground">
              {n}
            </li>
          ))}
        </ul>

        {entry.radix && (
          <>
            <h2 id="api">API</h2>
            <p>
              Built on Radix UI&apos;s <code>{entry.radix}</code> primitive, so it accepts the same
              props, events and keyboard behaviour.{" "}
              <a
                href={`https://www.radix-ui.com/primitives/docs/components/${entry.radix}`}
                className="inline-flex items-center gap-1"
              >
                Radix docs <ExternalLink className="size-3.5" />
              </a>
            </p>
          </>
        )}
      </div>

      <nav
        aria-label="Pagination"
        className="mt-12 flex justify-between gap-4 border-t border-border pt-6 text-sm"
      >
        {prev ? (
          <Link
            to="/docs/components/$slug"
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
            to="/docs/components/$slug"
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
