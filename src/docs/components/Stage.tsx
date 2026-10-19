import type { ReactNode } from "react";
import { cn } from "@onysnow/utils";

/**
 * Something for glass to bend: bold stripes, a ring of colour and a line of type. A pane over it shows refraction,
 * frost and edge light far more clearly than over a flat panel.
 */
export function Stage({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden rounded-xl border border-border bg-[var(--ground)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(115deg, transparent 0 46px, color-mix(in oklab, var(--accent-1) 55%, transparent) 46px 54px)",
            "radial-gradient(circle at 78% 30%, var(--accent-2) 0 74px, transparent 76px)",
            "radial-gradient(circle at 24% 72%, color-mix(in oklab, var(--accent-1) 80%, white) 0 54px, transparent 56px)",
          ].join(","),
        }}
      />
      <p
        aria-hidden
        className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 text-center font-display text-7xl font-light tracking-[0.2em] text-foreground/70 sm:text-8xl"
      >
        REFRACT
      </p>
      {children}
    </div>
  );
}
