import { motion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

/** Easing and duration of every layout change in the original design. */
const EASE = "cubic-bezier(0.44, 0, 0, 1)";
const DURATION = "1s";
const EDGE = `${DURATION} ${EASE}`;

type Corner = "tl" | "tr" | "bl" | "br";
const CORNERS: Corner[] = ["tl", "tr", "bl", "br"];

export interface QuickScanButtonProps extends Omit<React.ComponentProps<"a">, "title"> {
  /** Label shown on the button. */
  title?: string;
  /**
   * "outline" holds the corner marks outside the frame and fills the frame on hover;
   * "bracket" holds them as brackets on the frame and sends a scan band upward on hover.
   */
  variant?: "outline" | "bracket";
  /** Corner marks and scan line. */
  accentColor?: string;
  /** Label, frame and hovered corner marks. */
  textColor?: string;
}

/**
 * One corner mark: an 11px box clipping a vertical and a horizontal 1px line.
 * Resting "outline" marks are plus signs sitting on the corner; on hover they collapse to
 * brackets. "Bracket" marks work the other way round: brackets that push outward on hover.
 */
function CornerMark({
  corner,
  bracket,
  pushed,
  color,
}: {
  corner: Corner;
  /** Lines pinned to the box edges (a bracket) rather than crossing at its centre (a plus). */
  bracket: boolean;
  /** Box moved 5px outward of the frame, lines inset by 5px. */
  pushed: boolean;
  color: string;
}) {
  const top = corner[0] === "t";
  const left = corner[1] === "l";
  const inset = pushed ? 5 : 0;
  const boxOffset = pushed ? -5 : 0;
  const line = { position: "absolute", backgroundColor: color, transition: `all ${EDGE}` } as const;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: 11,
        aspectRatio: "1 / 1",
        overflow: "hidden",
        zIndex: 2,
        [top ? "top" : "bottom"]: boxOffset,
        [left ? "left" : "right"]: boxOffset,
        transition: `all ${EDGE}`,
      }}
    >
      <div
        style={{
          ...line,
          top: 0,
          bottom: 0,
          width: 1,
          ...(bracket ? { [left ? "left" : "right"]: inset } : { left: "calc(50% - 0.5px)" }),
        }}
      />
      <div
        style={{
          ...line,
          left: 0,
          right: 0,
          height: 1,
          ...(bracket ? { [top ? "top" : "bottom"]: inset } : { top: "calc(50% - 0.5px)" }),
        }}
      />
    </div>
  );
}

export function QuickScanButton({
  title = "Get In Touch",
  variant = "outline",
  accentColor = "rgb(255, 0, 0)",
  textColor = "rgb(255, 255, 255)",
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  ...props
}: QuickScanButtonProps) {
  const [active, setActive] = useState(false);
  const outline = variant === "outline";

  // Outline: plus signs that collapse into brackets, a 1px scan line that floods the frame.
  // Bracket: brackets that push outward, a scan band that lifts off the frame.
  const brackets = outline ? active : true;
  const markColor = outline ? (active ? textColor : accentColor) : textColor;

  const scan = outline
    ? {
        top: active ? 0 : "calc(100% + 1px)",
        height: active ? "calc(100% + 2px)" : 1,
        left: "0%",
        width: "100%",
        opacity: active ? 1 : 0.1,
      }
    : {
        top: active ? "calc(100% - 100px)" : "calc(100% + 1px)",
        height: active ? 30 : 1,
        left: active ? "-6.688%" : "0%",
        width: active ? "114%" : "100%",
        opacity: active ? 0.4 : 0.1,
      };

  return (
    <a
      {...props}
      className={cn("relative inline-flex cursor-pointer no-underline", className)}
      style={{ color: textColor, ...style }}
      onPointerEnter={(event) => {
        setActive(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setActive(false);
        onPointerLeave?.(event);
      }}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {CORNERS.map((corner) => (
        <CornerMark
          key={corner}
          corner={corner}
          bracket={brackets}
          pushed={!outline && active}
          color={markColor}
        />
      ))}

      <span
        className="relative flex items-center justify-center overflow-hidden"
        style={{ padding: "24px 30px", zIndex: 1 }}
      >
        {/* The four frame lines: always faint on "outline", revealed on hover for "bracket". */}
        {(["top", "bottom", "left", "right"] as const).map((side) => (
          <span
            key={side}
            aria-hidden
            style={{
              position: "absolute",
              backgroundColor: textColor,
              opacity: outline || active ? 0.1 : 0,
              transition: `opacity ${EDGE}`,
              zIndex: 1,
              ...(side === "top" || side === "bottom"
                ? { height: 1, width: "100%", left: 0, [side]: 0 }
                : { width: 1, height: "100%", top: 0, [side]: 0 }),
            }}
          />
        ))}

        <span
          aria-hidden
          style={{
            position: "absolute",
            backgroundColor: accentColor,
            zIndex: 1,
            transition: `all ${EDGE}`,
            ...scan,
          }}
        />

        {/* Two stacked copies of the label: the roll-up reveals the second, which types in. */}
        <span className="relative block overflow-hidden" style={{ height: 19, zIndex: 5 }}>
          <span
            className="block"
            style={{
              transform: `translateY(${active ? -19 : 0}px)`,
              transition: `transform ${EDGE}`,
            }}
          >
            <span className="block whitespace-pre text-base" style={{ lineHeight: "1.2em" }}>
              {title}
            </span>
            <span
              className="block whitespace-pre text-base"
              style={{ lineHeight: "1.2em" }}
              aria-hidden
            >
              {Array.from(title).map((character, index) => (
                <motion.span
                  key={`${active}-${index}`}
                  className="inline-block whitespace-pre"
                  initial={active ? { opacity: 0.001, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    duration: 0.3,
                    bounce: 0,
                    delay: active ? index * 0.06 : 0,
                  }}
                >
                  {character}
                </motion.span>
              ))}
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}

export default QuickScanButton;
