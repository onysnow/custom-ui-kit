import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Vertical slider: a big rolling title, round up/down buttons with an "n / N" counter, and a
 * vertical column of photos whose neighbours sit blurred, tilted and faded above and below the
 * current one. Changing slide cross-fades the page colour, rolls the title out and the next one
 * in letter by letter (a 3D flip around each letter), and slides the photo column one step.
 *
 * Rebuilt from the owner's screen recordings and from watching the public demo
 * (fine-marketplaces-355194.framer.app) frame by frame; every timing below was measured there.
 */

const FRAMER = "https://framerusercontent.com/images";

export interface VerticalSlide {
  /** Big title. */
  title: string;
  /** Photo URL. */
  image: string;
  /** Page colour while this slide is current. */
  background: string;
  /** Title, counter and button colour while this slide is current. */
  foreground: string;
  /** Alternative text for the photo (defaults to the title). */
  alt?: string;
}

const VERTICAL_SLIDER_DEMO_SLIDES: VerticalSlide[] = [
  {
    title: "Form",
    image: `${FRAMER}/gx41HgNE8REUVECPb3fYc0vIm44.jpg?scale-down-to=1024`,
    background: "rgb(217, 255, 67)",
    foreground: "rgb(23, 35, 20)",
  },
  {
    title: "Cobalt",
    image: `${FRAMER}/hFjttFFvCrluXJCQCkBESHUKEpU.jpg?scale-down-to=1024`,
    background: "rgb(36, 68, 233)",
    foreground: "rgb(245, 241, 232)",
  },
  {
    title: "Earth",
    image: `${FRAMER}/BNSWGB4GP69qYwQfZv0dN6WNY.jpg?scale-down-to=1024`,
    background: "rgb(255, 119, 85)",
    foreground: "rgb(54, 29, 25)",
  },
  {
    title: "Sun",
    image: `${FRAMER}/uZ5Jfr8HEIS0qnfv99wwZKK5w.jpg?scale-down-to=1024`,
    background: "rgb(255, 206, 85)",
    foreground: "rgb(57, 38, 19)",
  },
  {
    title: "Mono",
    image: `${FRAMER}/pm50d16sO4vNqwSOZMCKqXFyewA.jpg?scale-down-to=1024`,
    background: "rgb(220, 202, 249)",
    foreground: "rgb(53, 36, 71)",
  },
];

export interface VerticalSliderProps extends Omit<React.ComponentProps<"section">, "onChange"> {
  /** Slides, in order. The five demo slides by default. */
  slides?: VerticalSlide[];
  /** Slide shown first. */
  initialIndex?: number;
  /** At or below this container width the layout stacks (title above, photo below). */
  stackBelow?: number;
  /** Drag the current photo up / down to change slide. */
  draggable?: boolean;
  /** Called with the new slide index after every change. */
  onChange?: (index: number) => void;
}

// Easings measured on the demo.
/** Page colour, counter and photo column: easeOutCubic over 1s. */
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;
const STEP_DURATION = 1;
/** Title letters: easeOutQuint (enter 0.9s, 45ms stagger; exit 0.5s, 20ms stagger). */
const EASE_OUT_QUINT = [0.23, 1, 0.32, 1] as const;
/** Button fill: cubic-bezier(0.22, 1, 0.36, 1) over 0.45s. */
const FILL = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
const COLOUR = `${STEP_DURATION}s cubic-bezier(${EASE_OUT_CUBIC.join(",")})`;

const mod = (n: number, m: number) => ((n % m) + m) % m;

interface Layout {
  stacked: boolean;
  pad: number;
  font: number;
  titleTop: number;
  gap: number;
  button: number;
  buttonGap: number;
  counterGap: number;
  counterFont: number;
  cardW: number;
  cardH: number;
  cardCenterY: number;
  neighbourOpacity: number;
}

/** Sizes as fractions of the container, measured on the demo at 390–1400px widths. */
function computeLayout(W: number, H: number, stackBelow: number): Layout {
  if (W <= stackBelow) {
    return {
      stacked: true,
      pad: 0.07 * W,
      font: Math.min(0.19 * W, 112),
      titleTop: 0.14 * H,
      gap: 0.03 * H,
      button: 52,
      buttonGap: 10,
      counterGap: 18,
      counterFont: 16,
      cardW: 0.7 * W,
      cardH: 0.3 * H,
      cardCenterY: 0.69 * H,
      neighbourOpacity: 0.12,
    };
  }
  const font = 0.1848 * W;
  const gap = 0.055 * H;
  const button = 110;
  return {
    stacked: false,
    pad: 0.052 * W,
    font,
    // The text block hangs with 35% of its height above the vertical centre.
    titleTop: H / 2 - 0.35 * (font + gap + button),
    gap,
    button,
    buttonGap: 12,
    counterGap: 32,
    counterFont: Math.max(16, 0.02 * W),
    cardW: 0.45 * W,
    cardH: 0.47 * H,
    cardCenterY: H / 2,
    neighbourOpacity: 0.65,
  };
}

function Arrow({ up = false }: { up?: boolean | undefined }) {
  return (
    <svg
      width="26"
      height="30"
      viewBox="0 0 26 30"
      fill="none"
      aria-hidden
      style={{ transform: up ? "rotate(180deg)" : undefined, position: "relative" }}
    >
      <path
        d="M13 4.5v20M5 16.5l8 8 8-8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RoundButton({
  label,
  up,
  size,
  foreground,
  background,
  onClick,
}: {
  label: string;
  up?: boolean | undefined;
  size: number;
  foreground: string;
  background: string;
  onClick: () => void;
}) {
  const [hot, setHot] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHot(true)}
      onPointerLeave={() => {
        setHot(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && setHot(true)}
      onBlur={() => setHot(false)}
      className="relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        width: size,
        height: size,
        border: `1px solid ${foreground}`,
        color: hot || pressed ? background : foreground,
        background: "transparent",
        transform: pressed ? "scale(0.94)" : "scale(1)",
        transition: "transform 0.25s, color 0.35s, border-color 0.35s",
        // Tailwind ring colour follows the slide colour.
        ["--tw-ring-color" as string]: foreground,
        ["--tw-ring-offset-color" as string]: background,
      }}
    >
      {/* A disc that rises from below to fill the button. */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          inset: -1,
          background: foreground,
          transform: hot || pressed ? "translateY(0%)" : "translateY(105%)",
          transition: `${FILL}, background-color 0.35s`,
        }}
      />
      <Arrow up={up} />
    </button>
  );
}

export function VerticalSlider({
  slides = VERTICAL_SLIDER_DEMO_SLIDES,
  initialIndex = 0,
  stackBelow = 600,
  draggable = true,
  onChange,
  className,
  style,
  ...props
}: VerticalSliderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // `step` is an unbounded integer so the column always moves the short way; the slide shown
  // is step mod N. `dir` is +1 for "next" (content moves up) and -1 for "previous".
  const [{ step, dir }, setStep] = useState({ step: initialIndex, dir: 1 });
  const pos = useMotionValue(initialIndex);
  const drag = useMotionValue(0);
  const [reduced, setReduced] = useState(false);

  const N = slides.length;
  const index = mod(step, Math.max(1, N));
  const slide = slides[index];
  const L = computeLayout(size.w, size.h, stackBelow);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(mq?.matches ?? false);
    const onMq = () => setReduced(mq.matches);
    mq?.addEventListener("change", onMq);
    return () => {
      ro.disconnect();
      mq?.removeEventListener("change", onMq);
    };
  }, []);

  const go = useCallback(
    (delta: 1 | -1) => {
      setStep((s) => ({ step: s.step + delta, dir: delta }));
    },
    [setStep],
  );

  // Move the photo column whenever the step changes.
  useEffect(() => {
    const controls = animate(pos, step, {
      duration: reduced ? 0 : STEP_DURATION,
      ease: EASE_OUT_CUBIC,
    });
    return () => controls.stop();
  }, [pos, step, reduced]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onChangeRef.current?.(index);
  }, [index]);

  // Each photo's look is a function of its distance d from the current position: the current
  // one is sharp; at one step away a photo is 87% size, tilted 12deg (away from the centre),
  // shifted 25px left and blurred 20px. Photos further out stay parked at two steps. Opacity is
  // not positional: the photo that stops being current drops straight to the neighbour opacity,
  // and the new one fades from 65% to 100% as it arrives (as measured on the demo).
  const layoutRef = useRef(L);
  layoutRef.current = L;
  const indexRef = useRef(index);
  indexRef.current = index;
  const paint = useCallback(() => {
    const lay = layoutRef.current;
    const p = pos.get();
    const dragY = drag.get();
    for (let i = 0; i < N; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const current = i === indexRef.current;
      let d = mod(i - p + N / 2, N) - N / 2;
      d = Math.max(-2, Math.min(2, d));
      const a = Math.min(1, Math.abs(d));
      const y = d * 1.1 * lay.cardH + (current ? dragY : 0);
      el.style.transform = `translate(${-25 * a}px, ${y}px) rotate(${12 * Math.max(-1, Math.min(1, d))}deg) scale(${1 - 0.13 * a})`;
      el.style.opacity = String(current ? 1 - 0.35 * a : lay.neighbourOpacity);
      el.style.filter = a > 0.01 ? `blur(${20 * a}px)` : "none";
      el.style.zIndex = String(10 - Math.round(Math.abs(d) * 2));
      el.style.boxShadow = `rgba(0,0,0,${0.28 * (1 - a)}) 0px 25px 65px -35px`;
      el.style.cursor = draggable && current ? "grab" : "default";
    }
  }, [N, pos, drag, draggable]);

  useEffect(() => {
    paint();
    const a = pos.on("change", paint);
    const b = drag.on("change", paint);
    return () => {
      a();
      b();
    };
  }, [paint, pos, drag, size, index]);

  // Dragging the current photo: it follows at a third of the finger (rubber band); past 30px,
  // or with a flick, it moves on; otherwise it springs home.
  const dragState = useRef<{ id: number; y0: number; t: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (!draggable || i !== index) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { id: e.pointerId, y0: e.clientY, t: performance.now(), y: e.clientY };
    e.currentTarget.style.cursor = "grabbing";
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || s.id !== e.pointerId) return;
    s.t = performance.now();
    s.y = e.clientY;
    drag.set((e.clientY - s.y0) / 3);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || s.id !== e.pointerId) return;
    dragState.current = null;
    const moved = drag.get();
    animate(drag, 0, { duration: reduced ? 0 : 0.45, ease: EASE_OUT_CUBIC });
    if (moved < -30) go(1);
    else if (moved > 30) go(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      go(-1);
    }
  };

  // Variants read the direction at the moment an animation starts, so a title that is leaving
  // rolls the way of the change that removed it.
  const dirRef = useRef(dir);
  dirRef.current = dir;
  const t = (duration: number, delay = 0) => ({
    duration: reduced ? 0 : duration,
    ease: EASE_OUT_QUINT,
    delay: reduced ? 0 : delay,
  });
  const letterVariants = (i: number) => ({
    enter: () => ({ y: `${1.15 * dirRef.current}em`, rotateX: -65 * dirRef.current, opacity: 0 }),
    rest: { y: "0em", rotateX: 0, opacity: 1, transition: t(0.9, 0.015 + i * 0.045) },
    exit: () => ({
      y: `${-1.15 * dirRef.current}em`,
      rotateX: 65 * dirRef.current,
      opacity: 0,
      transition: t(0.5, i * 0.02),
    }),
  });
  const step1 = { duration: reduced ? 0 : STEP_DURATION, ease: EASE_OUT_CUBIC };
  const counterVariants = {
    enter: () => ({ y: `${1.35 * dirRef.current}em`, opacity: 0 }),
    rest: { y: "0em", opacity: 1, transition: step1 },
    exit: () => ({ y: `${-1.7 * dirRef.current}em`, opacity: 0, transition: step1 }),
  };

  if (!slide) return null;

  const em = L.font;
  const fg = slide.foreground;
  const bg = slide.background;
  const ready = size.w > 0;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Slides"
      onKeyDown={onKeyDown}
      {...props}
      className={cn("relative h-full w-full overflow-hidden select-none", className)}
      style={{
        background: bg,
        color: fg,
        transition: `background-color ${COLOUR}, color ${COLOUR}`,
        // The demo uses Inter (Google Fonts), weight 500.
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 500,
        ...style,
      }}
    >
      {ready && (
        <>
          {/* Photo column */}
          <div aria-hidden={false} className="absolute inset-0">
            {slides.map((s, i) => (
              <div
                key={i}
                ref={(node) => {
                  itemRefs.current[i] = node;
                }}
                aria-hidden={i !== index}
                className="absolute overflow-hidden"
                style={{
                  width: L.cardW,
                  height: L.cardH,
                  right: L.pad,
                  top: L.cardCenterY - L.cardH / 2,
                  borderRadius: 16,
                  willChange: "transform, filter, opacity",
                  touchAction: draggable ? "none" : undefined,
                }}
                onPointerDown={(e) => onPointerDown(e, i)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <img
                  src={s.image}
                  alt={s.alt ?? s.title}
                  draggable={false}
                  className="pointer-events-none block h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Title and controls */}
          <div
            className="absolute"
            style={{ left: L.pad, top: L.titleTop, zIndex: 20, pointerEvents: "none" }}
          >
            <h2
              aria-live="polite"
              className="m-0 grid"
              style={{
                fontSize: em,
                lineHeight: 1,
                letterSpacing: "-0.1em",
                fontWeight: 500,
                // Room above and below the line so the rolling letters are clipped just
                // outside the glyphs, as in the demo (0.12em each side).
                padding: "0.12em 0",
                margin: "-0.12em 0",
                overflow: "hidden",
                perspective: 900,
                whiteSpace: "nowrap",
              }}
            >
              <AnimatePresence initial={false}>
                <motion.span
                  key={step}
                  aria-label={slide.title}
                  initial="enter"
                  animate="rest"
                  exit="exit"
                  style={{ gridArea: "1 / 1", display: "block" }}
                >
                  {Array.from(slide.title).map((ch, i) => (
                    <motion.span
                      key={i}
                      aria-hidden
                      variants={letterVariants(i)}
                      style={{
                        display: "inline-block",
                        transformOrigin: "50% 60%",
                        whiteSpace: "pre",
                      }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </h2>

            <div className="flex items-center" style={{ marginTop: L.gap, pointerEvents: "auto" }}>
              <RoundButton
                label="Next slide"
                size={L.button}
                foreground={fg}
                background={bg}
                onClick={() => go(1)}
              />
              <div style={{ width: L.buttonGap }} />
              <RoundButton
                label="Previous slide"
                up
                size={L.button}
                foreground={fg}
                background={bg}
                onClick={() => go(-1)}
              />
              <div
                aria-label={`Slide ${index + 1} of ${N}`}
                className="flex items-center"
                style={{
                  marginLeft: L.counterGap,
                  fontSize: L.counterFont,
                  lineHeight: 1.35,
                  letterSpacing: "-0.025em",
                  gap: "0.6em",
                }}
              >
                {/* The current number rolls with the slide. */}
                <span aria-hidden className="relative grid overflow-hidden">
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={step}
                      variants={counterVariants}
                      initial="enter"
                      animate="rest"
                      exit="exit"
                      style={{ gridArea: "1 / 1" }}
                    >
                      {index + 1}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span aria-hidden style={{ opacity: 0.4 }}>
                  /
                </span>
                <span aria-hidden style={{ opacity: 0.55 }}>
                  {N}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default VerticalSlider;
