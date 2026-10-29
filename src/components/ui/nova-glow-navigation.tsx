import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/*
 * Nova glow navigation: a glass pill whose 1px border is lit by a rotating conic beam, with a
 * shimmer streak sweeping across it, flip-label links and a gradient call-to-action.
 *
 * Original font: Satoshi Medium (500) from Fontshare, not bundled here.
 */

const FONT = 'Satoshi, "General Sans", Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

/** Link flip, CTA flip/hover/press, pill height change. */
const FLIP_SPRING: Transition = { type: "spring", duration: 0.45, bounce: 0.25 };
/** Phone menu toggle and drawer height. */
const DRAWER_SPRING: Transition = { type: "spring", duration: 0.4, bounce: 0.2 };
/** Links fade/slide in on mount. */
const LINKS_APPEAR: Transition = { type: "spring", duration: 0.5, bounce: 0.25 };
/** Optional entrance of the whole bar. */
const BAR_APPEAR: Transition = { type: "spring", duration: 0.7, bounce: 0.3 };

export interface NovaGlowLink {
  label: string;
  href?: string;
  newTab?: boolean;
}

export interface NovaGlowNavigationProps extends Omit<
  HTMLMotionProps<"nav">,
  "children" | "layout"
> {
  /** Wordmark next to the orbit mark. */
  logoText?: string;
  logoHref?: string;
  links?: NovaGlowLink[];
  /** Gradient call-to-action (desktop bar and phone drawer). */
  cta?: NovaGlowLink;
  /**
   * "desktop" and "tablet" are identical in the source (60px bar, links inline). "phone" has a
   * 32px burger that opens a drawer. "auto" switches to phone below 600px.
   */
  layout?: "desktop" | "tablet" | "phone" | "auto";
  /** Controlled drawer state (phone only). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Play the bar's presence entrance (scale 0.97, 40px drop, spring) on mount. */
  animateIn?: boolean;
}

const DEFAULT_LINKS: NovaGlowLink[] = [
  { label: "Home", href: "#" },
  { label: "About", href: "#" },
  { label: "Work", href: "#" },
  { label: "Contact", href: "#" },
];

const DEFAULT_CTA: NovaGlowLink = { label: "Get Started", href: "#" };

const externalProps = (newTab?: boolean) =>
  newTab ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};

/** Two strokes of the arrow-up-right icon (24px grid, drawn at 7,7 and 10px long). */
function Arrow({ size, stroke, color }: { size: number; stroke: number; color: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flex: "none" }}
    >
      <path d="M 0 0 L 10 0 L 10 10" transform="translate(7 7)" />
      <path d="M 0 10 L 10 0" transform="translate(7 7)" />
    </svg>
  );
}

/** Hover/focus tracking. */
function useActive() {
  const [active, setActive] = useState(false);
  return {
    active,
    handlers: {
      onPointerEnter: () => setActive(true),
      onPointerLeave: () => setActive(false),
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        if (event.currentTarget.matches(":focus-visible")) setActive(true);
      },
      onBlur: () => setActive(false),
    },
  };
}

/**
 * Two stacked 20px labels in a 20px mask. On hover the stack slides up one line, swapping the
 * grey label for the white one.
 */
function FlipLabel({
  label,
  flipped,
  color,
  flipColor,
  transition,
}: {
  label: string;
  flipped: boolean;
  color: string;
  flipColor: string;
  transition: Transition;
}) {
  const text = {
    display: "block",
    height: 20,
    fontFamily: FONT,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: "20px",
    whiteSpace: "pre",
    userSelect: "none",
  } as const;
  return (
    <span className="relative block flex-none overflow-hidden" style={{ height: 20 }}>
      <motion.span
        className="flex flex-col"
        initial={false}
        animate={{ y: flipped ? -20 : 0 }}
        transition={transition}
      >
        <span style={{ ...text, color }}>{label}</span>
        <span aria-hidden style={{ ...text, color: flipColor }}>
          {label}
        </span>
      </motion.span>
    </span>
  );
}

function NavPill({ link, transition }: { link: NovaGlowLink; transition: Transition }) {
  const { active, handlers } = useActive();
  return (
    <motion.a
      href={link.href}
      {...externalProps(link.newTab)}
      {...handlers}
      className="relative flex flex-none cursor-pointer items-center justify-center overflow-hidden no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      initial={false}
      animate={{ backgroundColor: active ? "rgba(255, 255, 255, 0.1)" : "rgba(17, 17, 17, 0)" }}
      transition={transition}
      style={{ padding: "8px 14px", borderRadius: 100 }}
    >
      <FlipLabel
        label={link.label}
        flipped={active}
        color="rgb(160, 160, 160)"
        flipColor="rgb(255, 255, 255)"
        transition={transition}
      />
    </motion.a>
  );
}

const CTA_STATES = {
  rest: {
    background: "linear-gradient(135deg, rgb(59, 108, 255) 0%, rgb(124, 58, 237) 100%)",
    boxShadow:
      "0px 14px 40px 0px rgba(120, 100, 255, 0.45), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.45)",
  },
  hover: {
    background: "linear-gradient(135deg, rgb(79, 126, 255) 0%, rgb(140, 80, 250) 100%)",
    boxShadow:
      "0px 16px 48px 0px rgba(120, 100, 255, 0.6), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.45)",
  },
  // Pressed only changes the gradient; the shadow keeps its hover value.
  pressed: {
    background: "linear-gradient(135deg, rgb(48, 90, 220) 0%, rgb(104, 46, 205) 100%)",
    boxShadow:
      "0px 16px 48px 0px rgba(120, 100, 255, 0.6), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.45)",
  },
} as const;

/** Gradient pill button: label flips up on hover and the white arrow chip turns 45 degrees. */
function Cta({
  cta,
  fullWidth,
  transition,
  tabIndex,
}: {
  cta: NovaGlowLink;
  fullWidth?: boolean;
  transition: Transition;
  tabIndex?: number;
}) {
  const { active, handlers } = useActive();
  const [pressed, setPressed] = useState(false);
  const state = pressed ? "pressed" : active ? "hover" : "rest";
  return (
    <motion.a
      href={cta.href}
      {...externalProps(cta.newTab)}
      {...handlers}
      tabIndex={tabIndex}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => {
        setPressed(false);
        handlers.onPointerLeave();
      }}
      className="relative flex flex-none cursor-pointer items-center justify-center overflow-hidden no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      initial={false}
      animate={CTA_STATES[state]}
      transition={transition}
      style={{
        gap: 14,
        padding: "8px 8px 8px 26px",
        borderRadius: 100,
        border: "1px solid rgba(255, 255, 255, 0.35)",
        width: fullWidth ? "100%" : undefined,
      }}
    >
      <FlipLabel
        label={cta.label}
        flipped={active}
        color="rgb(255, 255, 255)"
        flipColor="rgb(255, 255, 255)"
        transition={transition}
      />
      <motion.span
        aria-hidden
        className="flex flex-none items-center justify-center"
        initial={false}
        animate={{ rotate: state === "hover" ? 45 : 0 }}
        transition={transition}
        style={{
          width: 28,
          height: 28,
          borderRadius: 100,
          backgroundColor: "rgb(255, 255, 255)",
          boxShadow: "0px 2px 12px 0px rgba(10, 10, 20, 0.35)",
        }}
      >
        <Arrow size={14} stroke={2.5} color="rgb(60, 40, 160)" />
      </motion.span>
    </motion.a>
  );
}

export function NovaGlowNavigation({
  logoText = "Nova",
  logoHref = "#",
  links = DEFAULT_LINKS,
  cta = DEFAULT_CTA,
  layout = "desktop",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  animateIn = false,
  className,
  style,
  ...props
}: NovaGlowNavigationProps) {
  const reduceMotion = useReducedMotion();
  const drawerId = useId();
  const navRef = useRef<HTMLElement | null>(null);
  const inView = useInView(navRef);
  const loops = inView && !reduceMotion;

  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [autoPhone, setAutoPhone] = useState(false);
  useEffect(() => {
    const node = navRef.current;
    if (!node || layout !== "auto") return;
    const observer = new ResizeObserver(
      ([entry]) => entry && setAutoPhone(entry.contentRect.width < 600),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout]);

  const phone = layout === "phone" || (layout === "auto" && autoPhone);
  const open = phone && (openProp ?? innerOpen);
  const toggle = () => {
    const next = !open;
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const none: Transition = { duration: 0 };
  const t = (value: Transition) => (reduceMotion ? none : value);

  const loop = (
    duration: number,
    ease: [number, number, number, number],
    repeatDelay = 0,
  ): Transition => ({
    duration,
    ease,
    repeat: Infinity,
    repeatDelay,
    repeatType: "loop",
  });

  return (
    <motion.nav
      {...props}
      ref={navRef}
      aria-label={props["aria-label"] ?? "Main"}
      className={cn("relative flex flex-col items-center overflow-hidden", className)}
      initial={animateIn && !reduceMotion ? { opacity: 0.001, scale: 0.97, y: -40 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={t(BAR_APPEAR)}
      {...(style ? { style } : {})}
    >
      {/* Border glow wrap: 1px of translucent white, lit by the rotating beam underneath. */}
      <div
        className="relative flex w-full flex-none flex-col items-center overflow-hidden"
        style={{
          maxWidth: 1200,
          padding: 1,
          borderRadius: 31,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          willChange: "transform",
        }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute"
          initial={false}
          animate={{ rotate: loops ? 360 : 0 }}
          transition={loops ? loop(5, [0, 0, 1, 1]) : none}
          style={{
            top: -800,
            bottom: -800,
            left: -300,
            right: -300,
            zIndex: 0,
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(160, 150, 255, 0) 0deg, rgba(160, 150, 255, 0) 60deg, rgba(120, 100, 255, 0.7) 78deg, rgb(200, 190, 255) 86deg, rgb(255, 255, 255) 90deg, rgba(160, 150, 255, 0) 100deg)",
          }}
        />

        {/* Glass pill. On phone its height is 60px closed and grows to fit the drawer. */}
        <motion.div
          className="relative flex w-full flex-none flex-col items-center overflow-hidden"
          initial={false}
          animate={{ height: phone ? (open ? "auto" : 60) : "auto" }}
          transition={t(DRAWER_SPRING)}
          style={{
            zIndex: 1,
            borderRadius: 30,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            background:
              "linear-gradient(180deg, rgba(24, 24, 34, 0.9) 0%, rgba(8, 8, 14, 0.88) 100%)",
            boxShadow:
              "0px 30px 80px 0px rgba(0, 0, 0, 0.65), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.22), 0px 12px 60px 0px rgba(99, 78, 255, 0.35)",
            willChange: "transform",
          }}
        >
          <div
            aria-hidden
            className="absolute"
            style={{
              top: 0,
              left: 60,
              width: "70%",
              height: 1,
              zIndex: 2,
              background:
                "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(160, 150, 255, 0.9) 50%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
          {/* Shimmer: slides 900px while turning a full revolution, then rests 2.5s. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute"
            initial={false}
            animate={loops ? { x: 900, rotate: 360 } : { x: 0, rotate: 0 }}
            transition={loops ? loop(2.2, [0.45, 0, 0.55, 1], 2.5) : none}
            style={{
              top: 0,
              left: -160,
              width: 120,
              height: "100%",
              zIndex: 2,
              background:
                "linear-gradient(105deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.06) 45%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.06) 55%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          <div
            className="relative flex w-full flex-none items-center justify-between"
            style={{ height: 60, padding: phone ? "0 16px" : "0 10px 0 24px" }}
          >
            <a
              href={logoHref}
              className="flex flex-none items-center justify-center no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={{ gap: 8 }}
            >
              <span
                aria-hidden
                className="relative flex flex-none items-center justify-center overflow-hidden rounded-[7.1px] [corner-shape:superellipse(1.6)] supports-[corner-shape:superellipse(1.6)]:rounded-[10px]"
                style={{ width: 30, height: 30 }}
              >
                <motion.span
                  className="pointer-events-none absolute"
                  initial={false}
                  animate={{ rotate: loops ? 360 : 0 }}
                  transition={loops ? loop(5, [0, 0, 1, 1]) : none}
                  style={{
                    inset: -14,
                    zIndex: 0,
                    background:
                      "conic-gradient(from 0deg at 50% 50%, rgba(160, 150, 255, 0) 0deg, rgba(160, 150, 255, 0) 60deg, rgba(120, 100, 255, 0.35) 78deg, rgba(200, 190, 255, 0.5) 86deg, rgba(255, 255, 255, 0.55) 90deg, rgba(160, 150, 255, 0) 100deg)",
                  }}
                />
                {/*
                 * Orbit mark: a 6px core inside an 18px ring. The original also spins the ring
                 * (8s linear), which is invisible on a plain circle, so it is not animated here.
                 */}
                <span
                  className="relative block flex-none"
                  style={{ width: 18, height: 18, zIndex: 1 }}
                >
                  <span
                    className="absolute rounded-full"
                    style={{ left: 6, top: 6, width: 6, height: 6, backgroundColor: "white" }}
                  />
                  <span
                    className="absolute rounded-full"
                    style={{ inset: 0, border: "1px solid rgba(255, 255, 255, 0.3)" }}
                  />
                </span>
                {/* The 1px mark border sits above the beam. */}
                <span
                  className="pointer-events-none absolute inset-0 border border-solid [border-radius:inherit] [corner-shape:inherit]"
                  style={{ borderColor: "rgba(255, 255, 255, 0.14)", zIndex: 2 }}
                />
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                  color: "rgb(255, 255, 255)",
                  whiteSpace: "pre",
                }}
              >
                {logoText}
              </span>
            </a>

            {!phone && (
              <motion.div
                className="flex flex-none items-center justify-center"
                initial={reduceMotion ? false : { opacity: 0.001, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={t(LINKS_APPEAR)}
                style={{ gap: 4 }}
              >
                {links.map((link) => (
                  <NavPill key={link.label} link={link} transition={t(FLIP_SPRING)} />
                ))}
              </motion.div>
            )}

            <div className="flex flex-none items-center justify-center" style={{ gap: 12 }}>
              {phone ? (
                <button
                  type="button"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  aria-controls={drawerId}
                  onClick={toggle}
                  className="relative flex-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  style={{ width: 32, height: 32, borderRadius: 8 }}
                >
                  {([45, -45] as const).map((angle, index) => (
                    <motion.span
                      key={angle}
                      aria-hidden
                      initial={false}
                      animate={{ rotate: open ? angle : 0, top: open ? 15 : index === 0 ? 11 : 19 }}
                      transition={t(DRAWER_SPRING)}
                      style={{
                        position: "absolute",
                        left: 6,
                        width: 20,
                        height: 2,
                        borderRadius: 2,
                        backgroundColor: "rgb(255, 255, 255)",
                      }}
                    />
                  ))}
                </button>
              ) : (
                <Cta cta={cta} transition={t(FLIP_SPRING)} />
              )}
            </div>
          </div>

          {/* Drawer: always laid out on phone, revealed by the pill growing from 60px. */}
          {phone && (
            <div
              id={drawerId}
              inert={!open}
              className="relative flex w-full flex-none flex-col items-start"
              style={{ gap: 20, padding: "4px 8px 16px" }}
            >
              <div className="flex w-full flex-none flex-col items-start" style={{ gap: 4 }}>
                {links.map((link) => (
                  <NavPill key={link.label} link={link} transition={t(FLIP_SPRING)} />
                ))}
              </div>
              <Cta cta={cta} fullWidth transition={t(FLIP_SPRING)} />
            </div>
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
}

export default NovaGlowNavigation;
