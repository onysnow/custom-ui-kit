import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The switch never jumps straight between off and on. Each toggle plays three steps, exactly as
 * the original's variant chain does:
 *   off → squash (knob 38x14, centred) → arrive (30x20 at the far side, gradient fades in) → on
 *   on  → squash (38x14, centred)      → arrive (30x20 at the far side, gradient gone)   → off
 * The squash lasts 100ms and the arrive step 200ms before the final state takes over.
 */
type Phase = "off" | "squashOn" | "arriveOn" | "on" | "squashOff" | "arriveOff";

const NEXT: Partial<Record<Phase, { to: Phase; after: number }>> = {
  squashOn: { to: "arriveOn", after: 100 },
  arriveOn: { to: "on", after: 200 },
  squashOff: { to: "arriveOff", after: 100 },
  arriveOff: { to: "off", after: 200 },
};

/** Knob box in the 70x36 track for each phase (left, top, width, height). */
const KNOB: Record<Phase, { left: number; top: number; width: number; height: number }> = {
  off: { left: 4, top: 4, width: 28, height: 28 },
  squashOn: { left: 16, top: 11, width: 38, height: 14 },
  arriveOn: { left: 36, top: 8, width: 30, height: 20 },
  on: { left: 38, top: 4, width: 28, height: 28 },
  squashOff: { left: 16, top: 11, width: 38, height: 14 },
  arriveOff: { left: 4, top: 8, width: 30, height: 20 },
};

/** Settling into off/on is a bouncier, longer spring than the in-between steps. */
const SETTLE: Transition = { type: "spring", bounce: 0.6, duration: 0.8 };
const STEP: Transition = { type: "spring", bounce: 0.5, duration: 0.5 };
/** The gradient's fade-in when it first appears on the way to "on". */
const GRADIENT_APPEAR: Transition = { type: "spring", bounce: 0.2, duration: 1.1 };

const WIDTH = 70;
const HEIGHT = 36;

interface GradientLayer {
  /** Conic start angle in degrees. */
  angle: number;
  /** Where colour 2 and colour 3 sit, in % (before the swirl moves them). */
  proportion1: number;
  proportion2: number;
  /** Phase advance per 60fps frame is speed / 100. */
  speed: number;
  /** How fast the colour stops wobble around their proportions. */
  swirl: number;
}

const MAIN: GradientLayer = { angle: 35, proportion1: 2, proportion2: 65, speed: 1, swirl: 4.8 };
const INNER: GradientLayer = { angle: 90, proportion1: 33, proportion2: 33, speed: 1.3, swirl: 10 };
const OUTER: GradientLayer = { angle: 90, proportion1: 33, proportion2: 33, speed: 0.2, swirl: 10 };

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

/** Moving conic gradient: each stop drifts by a sum of three sines driven by a phase `t`. */
function conic(layer: GradientLayer, swirl: number, t: number, colors: [string, string, string]) {
  const stop = (base: number, i: number) =>
    base +
    Math.sin(t * swirl + i * 2) * 20 +
    Math.cos(t * swirl * 0.7 + i * 3) * 20 +
    Math.sin(t * swirl * 1.3 + i * 5) * 10;
  const s1 = clampPercent(stop(layer.proportion1, 0));
  const s2 = clampPercent(stop(layer.proportion1 + layer.proportion2, 1));
  const s3 = clampPercent(stop(100, 2));
  const [c1, c2, c3] = colors;
  return `conic-gradient(from ${layer.angle}deg, ${c1} 0%, ${c2} ${s1}%, ${c3} ${s2}%, ${c1} ${s3}%)`;
}

/**
 * A rounded box filled with an animated conic gradient. The animation writes the style directly
 * (no React renders), stops while the toggle is off-screen and freezes under reduced motion.
 */
function GradientFill({
  layer,
  colors,
  swirl = layer.swirl,
  speed,
  paused,
}: {
  layer: GradientLayer;
  colors: [string, string, string];
  swirl?: number;
  /** Multiplies the layer's own speed. */
  speed: number;
  paused: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.background = conic(layer, swirl, phase.current, colors);
    if (paused) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Original adds speed/100 per animation frame; scaled by elapsed time so 120Hz screens
      // don't run it twice as fast.
      phase.current += ((now - last) / (1000 / 60)) * ((layer.speed * speed) / 100);
      last = now;
      node.style.background = conic(layer, swirl, phase.current, colors);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [layer, swirl, speed, paused, colors]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative h-full w-full overflow-hidden"
      style={{ borderRadius: 50 }}
    />
  );
}

export interface GradientToggleProps extends Omit<
  React.ComponentProps<"button">,
  "onChange" | "role" | "aria-checked"
> {
  /** Controlled state. */
  checked?: boolean;
  /** Initial state when uncontrolled (the demo starts on). */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** The three gradient colours: orange, magenta, red in the original. */
  gradientColors?: [string, string, string];
  /** Multiplies the speed of every gradient layer. */
  gradientSpeed?: number;
  /** Track colour (shows when off). */
  trackColor?: string;
  knobOffColor?: string;
  knobOnColor?: string;
  /** Tight blurred copy of the gradient over the track. */
  innerGlow?: boolean;
  innerGlowBlur?: number;
  innerGlowOpacity?: number;
  /** Wide, soft glow around the track. */
  outerGlow?: boolean;
  outerGlowBlur?: number;
  outerGlowOpacity?: number;
}

/**
 * Switch with a luminous animated gradient when on (fonts: none). A 70x36 pill; the knob
 * squashes, slides and springs into place on every toggle while the gradient and its glows fade
 * in or vanish.
 */
export function GradientToggle({
  checked: checkedProp,
  defaultChecked = true,
  onCheckedChange,
  gradientColors = ["rgb(255, 153, 0)", "rgb(225, 0, 255)", "rgb(255, 0, 0)"],
  gradientSpeed = 1,
  trackColor = "rgba(117, 117, 117, 0.15)",
  knobOffColor = "rgb(184, 184, 184)",
  knobOnColor = "rgb(0, 0, 0)",
  innerGlow = true,
  innerGlowBlur = 13,
  innerGlowOpacity = 0.51,
  outerGlow = true,
  outerGlowBlur = 37,
  outerGlowOpacity = 0.38,
  className,
  style,
  onClick,
  disabled,
  ...props
}: GradientToggleProps) {
  const [ownChecked, setOwnChecked] = useState(defaultChecked);
  const checked = checkedProp ?? ownChecked;
  const [phase, setPhase] = useState<Phase>(checked ? "on" : "off");
  const reduceMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(true);
  // Keep one colour array identity per set of colours so the gradient loops don't restart.
  const [c1, c2, c3] = gradientColors;
  const colors = useMemo<[string, string, string]>(() => [c1, c2, c3], [c1, c2, c3]);

  // Start the step chain whenever the state flips (click or a new controlled value).
  const settled = phase === "on" || phase === "off";
  const target = phase === "on" || phase === "squashOn" || phase === "arriveOn";
  useEffect(() => {
    if (checked === target) return;
    setPhase(reduceMotion ? (checked ? "on" : "off") : checked ? "squashOn" : "squashOff");
  }, [checked, target, reduceMotion]);

  useEffect(() => {
    const next = NEXT[phase];
    if (!next) return;
    const timer = window.setTimeout(() => setPhase(next.to), next.after);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Pause the gradient loops while the toggle is scrolled away.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) =>
      setVisible(entries[0]?.isIntersecting ?? true),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showGradient = phase === "arriveOn" || phase === "on" || phase === "squashOff";
  const forceGlow = phase === "arriveOn" || phase === "squashOff";
  const knobOn = showGradient;
  const transition = reduceMotion ? { duration: 0 } : settled ? SETTLE : STEP;
  const paused = reduceMotion || !visible;

  return (
    <button
      {...props}
      ref={rootRef}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-center border-0 p-0",
        "outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4",
        "focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 50,
        backgroundColor: trackColor,
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        // Taps are ignored while a step chain is running, as in the original.
        if (event.defaultPrevented || !settled) return;
        const next = !checked;
        if (checkedProp === undefined) setOwnChecked(next);
        onCheckedChange?.(next);
      }}
    >
      <AnimatePresence initial={false}>
        {showGradient && (
          <motion.div
            key="gradient"
            className="absolute inset-0"
            // Fades in only when it arrives during the on chain; it disappears instantly.
            initial={{ opacity: 0.001 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={GRADIENT_APPEAR}
          >
            <GradientFill
              layer={MAIN}
              colors={colors}
              // While arriving the gradient holds still; it starts to swirl once on.
              swirl={phase === "arriveOn" ? 0 : MAIN.swirl}
              speed={gradientSpeed}
              paused={paused}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1px hairline over the track and the main gradient, under the glows and the knob. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "inherit" }}
      />

      {showGradient && (innerGlow || forceGlow) && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            width: 76,
            height: 42,
            left: "calc(50% - 38px)",
            top: "calc(50% - 21px)",
            filter: `blur(${innerGlowBlur}px)`,
            opacity: innerGlowOpacity,
            zIndex: 1,
          }}
        >
          <GradientFill layer={INNER} colors={colors} speed={gradientSpeed} paused={paused} />
        </div>
      )}

      {showGradient && (outerGlow || forceGlow) && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            width: 86,
            height: 51,
            left: "calc(50% - 43px)",
            top: "calc(50% - 25.5px)",
            filter: `blur(${outerGlowBlur}px)`,
            opacity: outerGlowOpacity,
            zIndex: 1,
          }}
        >
          <GradientFill layer={OUTER} colors={colors} speed={gradientSpeed} paused={paused} />
        </div>
      )}

      <motion.span
        aria-hidden
        className="absolute block"
        initial={false}
        animate={{ ...KNOB[phase], backgroundColor: knobOn ? knobOnColor : knobOffColor }}
        transition={transition}
        style={{ borderRadius: 100, zIndex: 1 }}
      />
    </button>
  );
}

export default GradientToggle;
