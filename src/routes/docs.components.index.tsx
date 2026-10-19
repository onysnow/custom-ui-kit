import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPONENTS, GROUPS } from "../docs/registry/components";
import { SITE } from "../docs/site";

export const Route = createFileRoute("/docs/components/")({
  head: () => ({ meta: [{ title: `Components · ${SITE.name}` }] }),
  component: ComponentsIndex,
});

function ComponentsIndex() {
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-5xl font-light">Components</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        {COMPONENTS.length} accessible components on Radix UI and Tailwind v4. Each lives in its own
        folder and is its own import, so you only ship what you use.
      </p>
      {GROUPS.map((group) => (
        <section key={group} className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {group}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPONENTS.filter((c) => c.group === group).map((c) => (
              <Link
                key={c.slug}
                to="/docs/components/$slug"
                params={{ slug: c.slug }}
                className="surface-read group rounded-xl border border-border p-4 transition hover:-translate-y-0.5 hover:border-primary/60"
              >
                <p className="font-medium">{c.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
