import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Shared easing and duration of every hover movement in the original design. */
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION = "0.6s";

/** Characters a scrambling label cycles through before each letter settles. */
const SCRAMBLE_CHARSET = "01#@%*+=-_/";
/** Time a label takes to resolve, left to right. */
const SCRAMBLE_DURATION_MS = 600;

/**
 * Left-to-right text scramble: for `duration` ms every letter that has not been "reached" yet is
 * replaced by a random character each frame, and the revealed share grows linearly from 0 to 100%.
 * Whitespace is never scrambled. Does nothing when the user prefers reduced motion.
 */
function useTextScramble(
  text: string,
  { duration = SCRAMBLE_DURATION_MS, charset = SCRAMBLE_CHARSET } = {},
) {
  const [scrambled, setScrambled] = useState<string | null>(null);
  const frame = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setScrambled(null);
  }, []);

  const start = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const startedAt = performance.now();

    const tick = () => {
      const progress = Math.min(1, (performance.now() - startedAt) / duration);
      if (progress >= 1) {
        frame.current = null;
        setScrambled(null);
        return;
      }
      const revealed = Math.floor(text.length * progress);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const character = text.charAt(i);
        next +=
          i < revealed || /\s/.test(character)
            ? character
            : charset.charAt(Math.floor(Math.random() * charset.length));
      }
      setScrambled(next);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [charset, duration, text]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return { text: scrambled ?? text, start, stop };
}

type Corner = "tl" | "bl" | "tr" | "br";

/** Corner brackets in the order the original staggers them (0.1s, 0.2s, 0.4s, 0.3s). */
const CORNERS: { corner: Corner; delay: number }[] = [
  { corner: "tl", delay: 0.1 },
  { corner: "bl", delay: 0.2 },
  { corner: "tr", delay: 0.4 },
  { corner: "br", delay: 0.3 },
];

/** Per size: padding, how far the corners and the inset background travel on hover. */
const SIZES = {
  L: {
    padding: "12px 24px",
    travel: 4,
    hoverScale: 0.95,
    font: "text-[16px] max-md:text-[14px] max-[319px]:text-[13px]",
  },
  M: {
    padding: "8px 16px",
    travel: 2,
    hoverScale: 1,
    font: "text-[13px] max-md:text-[12px] max-[319px]:text-[10px]",
  },
} as const;

export interface TacticalButtonProps extends Omit<React.ComponentProps<"a">, "title"> {
  /** Label shown on the button. */
  title?: string;
  /** "L" is the large button, "M" the compact one. */
  size?: keyof typeof SIZES;
  /** Open the link in a new tab. */
  newTab?: boolean;
  /** Corner bracket colour. */
  borderColor?: string;
  /** Fill colour; it contracts and blurs on hover. */
  backgroundColor?: string;
  /** Label colour. */
  textColor?: string;
}

/**
 * Corner bracket: an 8px box with a 1px border on the two sides facing the button's corner.
 * Resting on the corner, it slides outward when the button is hovered.
 */
function CornerBracket({
  corner,
  delay,
  offset,
  color,
}: {
  corner: Corner;
  delay: number;
  offset: number;
  color: string;
}) {
  const top = corner[0] === "t";
  const left = corner[1] === "l";
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        width: 8,
        height: 8,
        zIndex: 2,
        boxSizing: "border-box",
        [top ? "top" : "bottom"]: offset ? -offset : 0,
        [left ? "left" : "right"]: offset ? -offset : 0,
        [top ? "borderTop" : "borderBottom"]: `1px solid ${color}`,
        [left ? "borderLeft" : "borderRight"]: `1px solid ${color}`,
        transition: `top ${DURATION} ${EASE} ${delay}s, bottom ${DURATION} ${EASE} ${delay}s, left ${DURATION} ${EASE} ${delay}s, right ${DURATION} ${EASE} ${delay}s`,
      }}
    />
  );
}

/**
 * Tactical button: a dark slab with corner brackets. On hover the brackets slide out in a stagger,
 * the slab contracts and blurs, and the label scrambles through binary/symbol characters before
 * resolving left to right.
 *
 * Original fonts: Geist Mono 400 (uppercase, line height 1.6em), loaded from Google Fonts.
 */
export function TacticalButton({
  title = "Button",
  size = "L",
  newTab = false,
  borderColor = "rgb(185, 187, 198)",
  backgroundColor = "rgb(24, 25, 27)",
  // The original reads a theme token whose fallback (rgb(28, 32, 36)) is nearly the slab colour, so it
  // is unreadable standalone; white is used as the default instead.
  textColor = "rgb(255, 255, 255)",
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: TacticalButtonProps) {
  const [active, setActive] = useState(false);
  const scramble = useTextScramble(title);
  const spec = SIZES[size];
  const offset = active ? spec.travel : 0;

  const activate = () => {
    setActive(true);
    scramble.start();
  };
  const deactivate = () => {
    setActive(false);
    scramble.stop();
  };

  return (
    <a
      {...props}
      aria-label={props["aria-label"] ?? title}
      target={newTab ? "_blank" : props.target}
      rel={newTab ? "noopener noreferrer" : props.rel}
      data-size={size}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center no-underline outline-none focus-visible:outline-1 focus-visible:outline-offset-4",
        className,
      )}
      style={{ padding: spec.padding, color: textColor, outlineColor: borderColor, ...style }}
      onPointerEnter={(event) => {
        activate();
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        deactivate();
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) activate();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        deactivate();
        onBlur?.(event);
      }}
    >
      {CORNERS.map(({ corner, delay }) => (
        <CornerBracket
          key={corner}
          corner={corner}
          delay={delay}
          offset={offset}
          color={borderColor}
        />
      ))}

      <span
        aria-hidden
        className={cn("relative block whitespace-pre text-center uppercase", spec.font)}
        style={{
          zIndex: 2,
          fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          fontFeatureSettings: "'blwf' on, 'cv03' on, 'cv04' on, 'cv09' on, 'cv11' on",
          fontWeight: 400,
          lineHeight: "1.6em",
          transform: `scale(${active ? spec.hoverScale : 1})`,
          transition: `transform ${DURATION} ${EASE}`,
        }}
      >
        {scramble.text}
      </span>

      <span
        aria-hidden
        style={{
          position: "absolute",
          zIndex: 1,
          backgroundColor,
          inset: offset,
          filter: active ? "blur(1px)" : "none",
          transition: `inset ${DURATION} ${EASE}, filter ${DURATION} ${EASE}`,
        }}
      />
    </a>
  );
}

export default TacticalButton;
