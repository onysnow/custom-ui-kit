import { Link } from "@tanstack/react-router";
import { Github, Menu, Snowflake } from "lucide-react";
import { Pane } from "@onysnow/fx/react/Pane";
import { Button } from "@onysnow/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@onysnow/ui/sheet";
import { DocsNav } from "./DocsSidebar";
import { SearchButton } from "./SearchDialog";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SITE } from "../site";

const LINKS = [
  { to: "/docs", label: "Docs" },
  { to: "/docs/components", label: "Components" },
  { to: "/docs/effects", label: "Effects" },
  { to: "/docs/theming", label: "Theming" },
] as const;

export function SiteHeader() {
  return (
    <Pane variant="bar" as="header" className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto p-4">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <DocsNav />
          </SheetContent>
        </Sheet>
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <Snowflake className="size-5 text-primary" aria-hidden />
          <span className="font-display text-xl font-light tracking-wide">{SITE.name}</span>
        </Link>
        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground" }}
              activeOptions={{ exact: l.to === "/docs" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <SearchButton />
          <ThemeSwitcher />
          <Button variant="ghost" size="icon" asChild>
            <a href={SITE.repo} aria-label="GitHub repository">
              <Github className="size-5" />
            </a>
          </Button>
        </div>
      </div>
    </Pane>
  );
}
