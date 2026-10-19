import { Link } from "@tanstack/react-router";
import { NAV } from "../nav";

/** The documentation tree. Used in the fixed sidebar and in the mobile sheet. */
export function DocsNav() {
  return (
    <nav aria-label="Documentation" className="space-y-7 text-sm">
      {NAV.map((section) => (
        <div key={section.title}>
          <h2 className="mb-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {section.title}
          </h2>
          <ul className="space-y-px">
            {section.items.map((item) => (
              <li key={item.to + (item.params?.["slug"] ?? "")}>
                <Link
                  to={item.to}
                  {...(item.params ? { params: item.params } : {})}
                  activeOptions={{ exact: true }}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                  activeProps={{
                    className: "block rounded-md px-2 py-1.5 bg-accent text-foreground font-medium",
                  }}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 overflow-y-auto py-8 pr-4 lg:block">
      <DocsNav />
    </aside>
  );
}
