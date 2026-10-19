import { useState } from "react";
import { contrastRatio, ratioText } from "@onysnow/tokens";

/** Two colours and the WCAG ratio between them: the same function every built-in theme is checked with. */
export function ContrastChecker() {
  const [fg, setFg] = useState("#F0EAE1");
  const [bg, setBg] = useState("#211A16");
  const ratio = contrastRatio(fg, bg);
  const rows = [
    { label: "Text (AA)", min: 4.5 },
    { label: "Large text and interface marks (AA)", min: 3 },
    { label: "Text (AAA)", min: 7 },
  ];
  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card/50 p-6 sm:grid-cols-[auto_1fr]">
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="color"
            value={fg}
            onChange={(e) => setFg(e.target.value.toUpperCase())}
            className="size-10 rounded border border-border bg-transparent"
          />
          Foreground <span className="font-mono text-xs text-muted-foreground">{fg}</span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value.toUpperCase())}
            className="size-10 rounded border border-border bg-transparent"
          />
          Background <span className="font-mono text-xs text-muted-foreground">{bg}</span>
        </label>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl p-5" style={{ background: bg, color: fg }}>
          <p className="font-display text-2xl font-light">The quick brown fox</p>
          <p className="text-sm">Contrast {ratioText(ratio)}</p>
        </div>
        <ul className="space-y-1 text-sm">
          {rows.map((r) => (
            <li key={r.label} className="flex justify-between">
              <span className="text-muted-foreground">
                {r.label} · {r.min}:1
              </span>
              <span
                className={
                  ratio >= r.min
                    ? "text-[var(--status-supported)]"
                    : "text-[var(--status-disputed)]"
                }
              >
                {ratio >= r.min ? "✓ pass" : "✕ fail"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
