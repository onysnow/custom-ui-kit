import { Code2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@onysnow/ui/button";
import { cn } from "@onysnow/utils";
import { ClientOnly } from "./ClientOnly";
import { CodeBlock } from "./CodeBlock";

/** A live example with its exact source beneath it. The source shown is the file that runs, so it cannot drift. */
export function Demo({
  children,
  code,
  title,
  stage = false,
  className,
}: {
  children: ReactNode;
  code: string;
  title?: string;
  /** The preview sits on a dark scene (for effects) instead of a plain surface. */
  stage?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-border">
      {title && (
        <figcaption className="border-b border-border bg-card/60 px-5 py-2.5 text-sm font-medium">
          {title}
        </figcaption>
      )}
      <div
        className={cn(
          "relative flex min-h-40 items-center justify-center p-8",
          stage ? "bg-[color-mix(in_oklab,var(--ground)_55%,transparent)]" : "surface-read",
          className,
        )}
      >
        <ClientOnly fallback={<div className="h-24 w-full animate-pulse rounded-lg bg-muted/40" />}>
          {children}
        </ClientOnly>
      </div>
      <div className="border-t border-border bg-card/50">
        <Button
          variant="ghost"
          size="sm"
          className="m-1.5 gap-2 text-muted-foreground"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <Code2 className="size-4" /> {open ? "Hide code" : "Show code"}
        </Button>
        {open && <CodeBlock code={code} className="rounded-none border-0 border-t" />}
      </div>
    </figure>
  );
}
