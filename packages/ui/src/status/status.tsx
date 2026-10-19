import type { ReactElement } from "react";
import { cn } from "@onysnow/utils";

// The status grammar: every status shows a shape and a word as well as a colour, the same in every theme. About 1 in
// 12 men see colour differently, and the supported and disputed colours sit close in lightness in every theme, so colour
// alone would fail them (WCAG 1.4.1). The colours are the theme's `--status-*` and `--flag-*` role tokens.

export type ClaimStatus = "supported" | "disputed" | "unshown" | "ruled_out";
export type FlagLevel = "faint" | "strong" | "textbook";

export const STATUS_WORDS: Record<ClaimStatus, { mark: string; word: string }> = {
  supported: { mark: "✓", word: "Supported" },
  disputed: { mark: "✕", word: "Disputed" },
  unshown: { mark: "○", word: "Not yet shown" },
  ruled_out: { mark: "–", word: "Ruled out" },
};

export const LEVEL_WORDS: Record<FlagLevel, { bars: string; word: string; meaning: string }> = {
  faint: { bars: "▮▯▯", word: "Faint", meaning: "the pattern appears" },
  strong: { bars: "▮▮▯", word: "Strong", meaning: "it looks serious" },
  textbook: {
    bars: "▮▮▮",
    word: "Textbook",
    meaning: "it meets the published definition or threshold",
  },
};

const BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap text-[10.5px] font-semibold uppercase leading-none tracking-[0.1em]";

const STATUS_STYLE: Record<ClaimStatus, string> = {
  supported: "text-[var(--status-supported)] border-solid",
  disputed: "text-[var(--status-disputed)] border-solid",
  unshown: "text-[var(--status-unshown)] border-dashed",
  ruled_out: "text-[var(--text-muted)] border-dotted",
};

/** A claim's status: shape, word and colour. Pass `label` to say it in your own words (the shape stays). */
export function StatusChip({
  status,
  label,
}: {
  status: ClaimStatus;
  label?: string;
}): ReactElement {
  const s = STATUS_WORDS[status];
  return (
    <span className={cn(BASE, "rounded-full border-[1.5px] px-[9px] py-1", STATUS_STYLE[status])}>
      <span aria-hidden="true">{s.mark}</span>
      {label ?? s.word}
    </span>
  );
}

const LEVEL_STYLE: Record<FlagLevel, string> = {
  faint: "border-[1.5px] border-[var(--flag-faint)] text-[var(--flag-faint)]",
  // The ink is fixed: it is checked against the theme's strong colour (4.5:1) in every built-in theme.
  strong: "bg-[var(--flag-strong)] text-[#1b1b1b]",
  textbook:
    "border-[1.5px] border-[var(--flag-textbook-edge)] bg-[var(--flag-textbook-fill)] text-[var(--text)]",
};

/** How serious a flag is: bars, word and colour; `showMeaning` spells out what the level means. */
export function LevelChip({
  level,
  showMeaning = false,
}: {
  level: FlagLevel;
  showMeaning?: boolean;
}): ReactElement {
  const l = LEVEL_WORDS[level];
  return (
    <span className={cn(BASE, "rounded-md px-[9px] py-1", LEVEL_STYLE[level])} title={l.meaning}>
      <span aria-hidden="true" className="text-[9px] tracking-[1px]">
        {l.bars}
      </span>
      {l.word}
      {showMeaning && (
        <span className="font-medium normal-case tracking-normal"> · {l.meaning}</span>
      )}
    </span>
  );
}

/** Marks material an AI wrote until a person keeps it. */
export function AiTag({
  date,
  label = "AI draft",
}: {
  date?: string;
  label?: string;
}): ReactElement {
  return (
    <span className="inline-flex items-center rounded-[5px] border border-[var(--ai-mark)] px-[7px] py-[3px] font-mono text-[10.5px] font-semibold leading-none tracking-[0.04em] text-[var(--ai-mark)]">
      {label}
      {date ? ` · ${date}` : ""}
    </span>
  );
}
