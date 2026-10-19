import { useId } from "react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@onysnow/utils";

// The frame every chart sits in. Each kind of chart fills it with its own parts (its arrangement switch, its date
// range, its attribution), but the anatomy is the same, so a reader learns where to look once:
//
//   header   the title, the question the chart answers, and its RULE: one sentence saying why each mark sits where it
//            sits, and why that arrangement was chosen when the chart chose it;
//   tools    the controls that change this chart, top right, beside what they change;
//   canvas   the drawing;
//   key      what each colour, line and size means (only the codes the drawing uses), beside the drawing on a wide
//            screen and under it on a narrow one;
//   footer   counts and caveats.
//
// Grouping a chart with its own key and controls in one bounded region follows the Gestalt principle of common region
// (Palmer, 1992): the key reads as this chart's key and not the page's. The frame is a <figure> named by its title and
// the key an <aside> named "Key", so a screen reader can find both.

export type FrameRule = {
  /** The arrangement's name, e.g. "Arranged by control:". */
  label: string;
  /** Why each mark sits where it sits, in one sentence. */
  text: string;
  /** Why this arrangement was chosen, when the chart chose it. */
  why?: string;
};

type ChartFrameProps = {
  /** Which kind of chart, for your own styling (`data-kind`). */
  kind: string;
  title: string;
  /** The question the chart answers, in the reader's words. */
  question?: string;
  rule?: FrameRule;
  tools?: ReactNode;
  legend?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  testId?: string;
  className?: string;
};

export function ChartFrame({
  kind,
  title,
  question,
  rule,
  tools,
  legend,
  footer,
  children,
  testId,
  className,
}: ChartFrameProps): ReactElement {
  const titleId = useId();
  return (
    <figure
      className={cn("rounded-xl border border-border bg-card p-4 text-card-foreground", className)}
      data-kind={kind}
      aria-labelledby={titleId}
      data-testid={testId ?? `chart-frame-${kind}`}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={titleId} className="text-base font-semibold">
            {title}
          </h3>
          {question && <p className="mt-0.5 text-sm text-muted-foreground">{question}</p>}
          {rule && (
            <p className="mt-1 text-xs text-muted-foreground" data-testid="chart-rule">
              <b className="text-foreground">{rule.label}</b> {rule.text}
              {rule.why && <span> {rule.why}</span>}
            </p>
          )}
        </div>
        {tools && <div className="flex flex-wrap items-center gap-2">{tools}</div>}
      </header>
      <div className={cn("grid gap-4", legend && "lg:grid-cols-[minmax(0,1fr)_14rem]")}>
        <div className="min-w-0 overflow-hidden rounded-lg bg-background">{children}</div>
        {legend && (
          <aside aria-label="Key" className="space-y-4 text-sm">
            {legend}
          </aside>
        )}
      </div>
      {footer && (
        <footer className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {footer}
        </footer>
      )}
    </figure>
  );
}

/** One group of the key: a heading, what channel it is, and its rows. */
export function KeySection({
  title,
  channel,
  children,
}: {
  title: string;
  channel?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section>
      <h4 className="mb-1.5 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
        {channel && <small className="font-normal normal-case tracking-normal">{channel}</small>}
      </h4>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

/** One row of the key: a swatch drawn as the chart draws it, and its meaning. */
export function KeyRow({
  swatch,
  children,
}: {
  swatch: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden className="grid w-9 shrink-0 place-items-center">
        {swatch}
      </span>
      <span>{children}</span>
    </li>
  );
}

/** A line as the chart draws it, for the key. */
export function LineSwatch({
  colour,
  dash,
  width = 2.5,
  arrow = false,
}: {
  colour: string;
  dash?: string;
  width?: number;
  arrow?: boolean;
}): ReactElement {
  return (
    <svg width="36" height="14" viewBox="0 0 36 14">
      <line
        x1="2"
        y1="7"
        x2={arrow ? 27 : 34}
        y2="7"
        stroke={colour}
        strokeWidth={width}
        {...(dash ? { strokeDasharray: dash } : {})}
      />
      {arrow && <path d="M27,3 L34,7 L27,11 z" fill={colour} />}
    </svg>
  );
}

/** A filled block as the chart draws it, for the key. */
export function BlockSwatch({
  colour,
  dashed = false,
}: {
  colour: string;
  dashed?: boolean;
}): ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <rect x="1" y="1" width="18" height="18" rx="3" fill={colour} />
      {dashed && (
        <rect
          x="4"
          y="4"
          width="12"
          height="12"
          fill="none"
          stroke="var(--ground)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
      )}
    </svg>
  );
}

/** The "!" a chart puts on a contested record. */
export function ContestedMark({ size = 16 }: { size?: number }): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-label="Contested">
      <circle cx="8" cy="8" r="7" fill="var(--flag-textbook-fill)" />
      <text x="8" y="11.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">
        !
      </text>
    </svg>
  );
}

/** A choice of one among a few, shown as joined buttons (an ARIA radio group: one tab stop, arrow keys move it). */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
}): ReactElement {
  const move = (step: number) => {
    const index = options.findIndex((o) => o.value === value);
    const next = options[(index + step + options.length) % options.length];
    if (next) onChange(next.value);
  };
  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-border"
      role="radiogroup"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          title={option.title}
          tabIndex={option.value === value ? 0 : -1}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            option.value === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** A count in the footer: the number, then what it counts. */
export function FootStat({
  value,
  children,
}: {
  value: number | string;
  children: ReactNode;
}): ReactElement {
  return (
    <span>
      <b className="text-foreground">{value}</b> {children}
    </span>
  );
}
