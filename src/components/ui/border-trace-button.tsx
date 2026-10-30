import { animate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Room around the button for the glow stroke and its blur (the SVG overhangs by half of it). */
const PAD = 100;
/** The dash pattern repeats every 50 of the path's 100 units, so two light segments run at once. */
const PERIOD = 50;
/** How far along the path (in path units) the segments travel during one pass. */
const TRAVEL = 80;
/** CSS `ease-in`, which is what the original uses for both the travel and the fade. */
const EASE_IN = [0.42, 0, 1, 1] as const;

export interface BorderTraceButtonProps extends React.ComponentProps<"button"> {
  /** Text when no children are given. */
  label?: string;
  /** Duration of one trace around the border, in ms. */
  duration?: number;
  /** Length of each light segment, as a share of half the perimeter (1–49). */
  lineLength?: number;
  /** Width of the soft halo under the segment; the halo is blurred by half of this. */
  glowSize?: number;
  glowColor?: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  textColor?: string;
  fontSize?: number;
  width?: number;
  height?: number;
}

/**
 * Pill button with a thin border. On hover (mouse), press (touch) or keyboard focus, two short
 * bright segments race around the border: they grow from points to `lineLength` while sliding
 * 80% of the way round, fading in over the first quarter and out over the last. One pass per
 * hover, like the original; leaving the button fades the light out in 0.2s.
 * Fonts: the original loads Inter 400 from Framer's font CDN.
 */
export function BorderTraceButton({
  label = "Hi everyone!",
  children,
  duration = 2100,
  lineLength = 30,
  glowSize = 3,
  glowColor = "rgb(215, 243, 250)",
  borderColor = "rgb(158, 158, 158)",
  borderWidth = 2,
  radius = 32,
  textColor = "rgb(255, 255, 255)",
  fontSize = 11,
  width = 128,
  height = 48,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onFocus,
  onBlur,
  ...props
}: BorderTraceButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const haloRef = useRef<SVGRectElement>(null);
  const lineRef = useRef<SVGRectElement>(null);
  const running = useRef<AnimationPlaybackControls[]>([]);
  const [size, setSize] = useState({ width, height });
  const reduceMotion = useReducedMotion();

  // The glow follows the button's real size, so it still fits when the label or CSS changes it.
  useLayoutEffect(() => {
    const node = buttonRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.borderBoxSize?.[0];
      setSize({
        width: box ? box.inlineSize : node.offsetWidth,
        height: box ? box.blockSize : node.offsetHeight,
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const setDash = useCallback((dash: number, offset: number) => {
    for (const rect of [haloRef.current, lineRef.current]) {
      rect?.setAttribute("stroke-dasharray", `${dash} ${PERIOD - dash}`);
      rect?.setAttribute("stroke-dashoffset", String(offset));
    }
  }, []);

  const stop = useCallback(() => {
    running.current.forEach((control) => control.stop());
    running.current = [];
  }, []);

  const start = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    stop();
    const seconds = duration / 1000;
    const length = Math.max(1, Math.min(49, lineLength));
    setDash(reduceMotion ? length : 0, 0);
    svg.style.opacity = "0";
    running.current = [
      animate(
        svg,
        { opacity: [0, 1, 1, 0] },
        { duration: seconds, times: [0, 0.25, 0.75, 1], ease: EASE_IN },
      ),
    ];
    if (!reduceMotion) {
      running.current.push(
        animate(0, 1, {
          duration: seconds,
          ease: EASE_IN,
          onUpdate: (progress) => setDash(length * progress, -TRAVEL * progress),
        }),
      );
    }
  }, [duration, lineLength, reduceMotion, setDash, stop]);

  const end = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    stop();
    running.current = [animate(svg, { opacity: 0 }, { duration: 0.2 })];
    setDash(0, 0);
  }, [setDash, stop]);

  useEffect(() => stop, [stop]);

  const rect = {
    x: PAD / 2,
    y: PAD / 2,
    width: size.width,
    height: size.height,
    rx: radius,
    pathLength: 100,
    strokeLinecap: "round" as const,
    fill: "transparent",
    stroke: glowColor,
    strokeDasharray: `0 ${PERIOD}`,
    strokeDashoffset: 0,
  };

  return (
    <button
      type="button"
      {...props}
      ref={buttonRef}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0",
        "outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-transparent",
        className,
      )}
      style={{
        width,
        height,
        borderRadius: radius,
        color: textColor,
        fontFamily: 'Inter, "Inter Placeholder", system-ui, sans-serif',
        fontSize,
        fontWeight: 400,
        lineHeight: "1.2em",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") start();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (event.pointerType === "mouse") end();
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        // Touch has no hover: a press plays the pass instead.
        if (event.pointerType !== "mouse") start();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (event.currentTarget.matches(":focus-visible")) start();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        end();
      }}
    >
      <span className="relative whitespace-pre" style={{ zIndex: 2 }}>
        {children ?? label}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ border: `${borderWidth}px solid ${borderColor}`, borderRadius: radius }}
      />

      {/* The light: a blurred wide stroke under a crisp 2px one, both on the button's outline. */}
      <svg
        ref={svgRef}
        aria-hidden
        width={size.width + PAD}
        height={size.height + PAD}
        className="pointer-events-none absolute"
        style={{ left: -PAD / 2, top: -PAD / 2, overflow: "visible", zIndex: 1, opacity: 0 }}
      >
        <rect
          ref={haloRef}
          {...rect}
          strokeWidth={glowSize}
          style={{ filter: `blur(${glowSize / 2}px)` }}
        />
        <rect ref={lineRef} {...rect} strokeWidth={2} />
      </svg>
    </button>
  );
}

export default BorderTraceButton;
