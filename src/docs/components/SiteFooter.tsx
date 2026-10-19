import { Link } from "@tanstack/react-router";
import { SITE } from "../site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="font-display text-base font-light text-foreground">{SITE.name}</span> ·{" "}
          {SITE.tagline}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/docs/installation" className="hover:text-foreground">
            Install
          </Link>
          <Link to="/docs/components" className="hover:text-foreground">
            Components
          </Link>
          <Link to="/docs/effects" className="hover:text-foreground">
            Effects
          </Link>
          <a href={SITE.repo} className="hover:text-foreground">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
