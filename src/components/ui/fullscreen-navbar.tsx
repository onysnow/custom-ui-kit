import { motion, useReducedMotion, type HTMLMotionProps, type Transition } from "framer-motion";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/*
 * Fullscreen navbar: a slim bar that opens into a full-viewport menu.
 *
 * Original fonts (Framer-hosted, not bundled here): "Mazius Display" (wordmark and big link
 * labels, regular + extra-italic 900), "Inter Variable" (index numbers and the Menu label, opsz 13
 * wght 500) and "Inter" 400 (meta links and clock). Fallbacks keep the same character.
 */

const DISPLAY_FONT = '"Mazius Display", "Playfair Display", "Times New Roman", Georgia, serif';
const SANS_FONT = 'Inter, "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif';

/** cubic-bezier(0.22, 1, 0.36, 1) is the ease used by every tween in the original. */
const EASE = [0.22, 1, 0.36, 1] as const;
/** Bar background, menu body height and the burger lines. */
const BAR_TRANSITION: Transition = { type: "tween", duration: 0.65, ease: EASE };
/** Burger lines, trigger pill hover colours. */
const BURGER_TRANSITION: Transition = { type: "tween", duration: 0.5, ease: EASE };
/** Menu / Close label swap. */
const LABEL_TRANSITION: Transition = { type: "tween", duration: 0.4, ease: EASE };
/** The link list blurs and fades in with a 50ms delay. */
const LINKS_TRANSITION: Transition = { type: "tween", duration: 0.85, delay: 0.05, ease: EASE };
/** The meta row (email, socials, clock) follows 200ms later. */
const META_TRANSITION: Transition = { type: "tween", duration: 0.7, delay: 0.2, ease: EASE };
/** Nav link hover (label growth, padding, arrow). */
const LINK_SPRING: Transition = { type: "spring", duration: 0.35, bounce: 0.15 };
/** Light-theme trigger hover (scale 1.1). */
const TRIGGER_SPRING: Transition = { type: "spring", duration: 0.4, bounce: 0.2 };
/** Meta link colour change. */
const META_LINK_TRANSITION: Transition = { type: "tween", duration: 0.35, ease: EASE };

const THEMES = {
  dark: {
    background: "rgb(10, 10, 10)",
    text: "rgb(245, 243, 238)",
    triggerBorder: "rgba(245, 243, 238, 0.25)",
    linkBorder: "rgba(245, 243, 238, 0.12)",
    metaLink: "rgb(138, 135, 130)",
    metaLinkHover: "rgb(255, 255, 255)",
    linkLabelHover: "rgb(255, 255, 255)",
    indexHover: "rgb(245, 243, 238)",
  },
  light: {
    background: "rgb(245, 243, 238)",
    text: "rgb(17, 17, 17)",
    triggerBorder: "rgba(10, 10, 10, 0.3)",
    linkBorder: "rgba(10, 10, 10, 0.16)",
    metaLink: "rgb(120, 117, 112)",
    metaLinkHover: "rgb(10, 10, 10)",
    // The light hover variant sets no colour of its own: the label stays dark.
    linkLabelHover: "rgb(17, 17, 17)",
    // No light override for the index either: it stays grey on hover.
    indexHover: "rgb(138, 135, 130)",
  },
} as const;

const MUTED = "rgb(138, 135, 130)";

export interface FullscreenNavbarLink {
  /** Small index shown before the label, e.g. "01". */
  number: string;
  label: string;
  href?: string;
  newTab?: boolean;
}

export interface FullscreenNavbarSocial {
  label: string;
  href?: string;
  newTab?: boolean;
}

export interface FullscreenNavbarProps extends Omit<HTMLMotionProps<"nav">, "children" | "layout"> {
  /** "dark" is near-black with cream text, "light" the reverse. */
  theme?: "dark" | "light";
  /**
   * "desktop" (80px bar, 28px side padding) or "phone" (64px bar, 8px side padding, the open menu
   * scrolls). "auto" picks phone when the navbar is narrower than 810px.
   */
  layout?: "desktop" | "phone" | "auto";
  /** Wordmark; rendered italic with a superscript registered mark. */
  logoName?: string;
  logoHref?: string;
  links?: FullscreenNavbarLink[];
  email?: string;
  socials?: FullscreenNavbarSocial[];
  /** Live 12-hour clock with seconds at the end of the meta row. */
  showClock?: boolean;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Height of the open menu in px. Defaults to the window height. */
  viewportHeight?: number;
}

const DEFAULT_LINKS: FullscreenNavbarLink[] = [
  { number: "01", label: "Home", href: "#" },
  { number: "02", label: "Work", href: "#" },
  { number: "03", label: "About", href: "#" },
  { number: "04", label: "Journal", href: "#" },
  { number: "05", label: "Contact", href: "#" },
];

const DEFAULT_SOCIALS: FullscreenNavbarSocial[] = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
];

const externalProps = (newTab?: boolean) =>
  newTab ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};

/** Hover or keyboard focus. */
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

/** Big row link: index number, display label and an arrow that fades in on hover. */
function NavRow({
  link,
  theme,
  hoverEnabled,
  transition,
}: {
  link: FullscreenNavbarLink;
  theme: "dark" | "light";
  hoverEnabled: boolean;
  transition: Transition;
}) {
  const { active, handlers } = useActive();
  const colors = THEMES[theme];
  const hovered = active && hoverEnabled;
  // Dark hover grows to 88px/0.95; the light hover variant keeps 72px but still goes italic 900.
  const grows = hovered && theme === "dark";

  return (
    <motion.a
      href={link.href}
      {...externalProps(link.newTab)}
      {...handlers}
      className="relative flex w-full cursor-pointer items-center justify-between no-underline outline-none"
      initial={false}
      animate={{ paddingLeft: hovered ? 28 : 0 }}
      transition={transition}
      style={{ paddingTop: 24, paddingBottom: 24, borderBottom: `1px solid ${colors.linkBorder}` }}
    >
      <span className="flex flex-none items-start" style={{ gap: 24 }}>
        <motion.span
          initial={false}
          animate={{ color: hovered ? colors.indexHover : MUTED }}
          transition={transition}
          style={{
            fontFamily: SANS_FONT,
            fontSize: 13,
            fontWeight: 500,
            fontVariationSettings: '"opsz" 13, "wght" 500',
            fontFeatureSettings: '"tnum" on',
            letterSpacing: "0.12em",
            lineHeight: "1em",
            whiteSpace: "pre",
            userSelect: "none",
          }}
        >
          {link.number}
        </motion.span>
        <motion.span
          initial={false}
          animate={{
            color: hovered ? colors.linkLabelHover : colors.text,
            fontSize: grows ? 88 : 72,
            letterSpacing: grows ? "-0.02em" : "-0.01em",
            lineHeight: grows ? 0.95 : 1,
          }}
          transition={transition}
          style={{
            fontFamily: DISPLAY_FONT,
            fontStyle: hovered ? "italic" : "normal",
            fontWeight: hovered ? 900 : 400,
            whiteSpace: "pre",
            userSelect: "none",
          }}
        >
          {link.label}
        </motion.span>
      </span>
      <motion.svg
        aria-hidden
        viewBox="0 0 24 24"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={transition}
        style={{ width: 40, aspectRatio: "1 / 1", flex: "none", display: "block" }}
        fill="none"
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 0 0 L 10 0 L 10 10" transform="translate(7 7)" />
        <path d="M 0 10 L 10 0" transform="translate(7 7)" />
      </motion.svg>
    </motion.a>
  );
}

/** Small 14px link in the meta row. */
function MetaLink({
  label,
  href,
  newTab,
  theme,
  transition,
}: {
  label: string;
  href?: string;
  newTab?: boolean;
  theme: "dark" | "light";
  transition: Transition;
}) {
  const { active, handlers } = useActive();
  const colors = THEMES[theme];
  return (
    <a
      href={href}
      {...externalProps(newTab)}
      {...handlers}
      className="flex w-min cursor-pointer items-center no-underline outline-none"
      style={{ padding: "10px 12px" }}
    >
      <motion.span
        initial={false}
        animate={{ color: active ? colors.metaLinkHover : colors.metaLink }}
        transition={transition}
        style={{
          fontFamily: SANS_FONT,
          fontSize: 14,
          letterSpacing: "0.02em",
          lineHeight: "1em",
          whiteSpace: "pre",
        }}
      >
        {label}
      </motion.span>
    </a>
  );
}

/** 12-hour clock with seconds, tabular figures, ticking on the second. */
function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const date = new Date();
      setNow(date);
      timer = setTimeout(tick, 1000 - date.getMilliseconds());
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  const text = now
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(now)
    : "";
  return (
    <p
      className="m-0 p-0"
      style={{
        color: MUTED,
        fontFamily: SANS_FONT,
        fontSize: 14,
        fontWeight: 400,
        letterSpacing: "0.02em",
        lineHeight: "1em",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        visibility: now ? "visible" : "hidden",
        minHeight: "1em",
      }}
    >
      {text || "0:00:00 AM"}
    </p>
  );
}

export function FullscreenNavbar({
  theme = "dark",
  layout = "desktop",
  logoName = "Élan",
  logoHref = "#",
  links = DEFAULT_LINKS,
  email = "hello@elan.studio",
  socials = DEFAULT_SOCIALS,
  showClock = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  viewportHeight,
  className,
  style,
  ...props
}: FullscreenNavbarProps) {
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const navRef = useRef<HTMLElement | null>(null);
  const topbarRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);
  const metaRef = useRef<HTMLDivElement | null>(null);

  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const [autoPhone, setAutoPhone] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const update = () => setWindowHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const node = navRef.current;
    if (!node || layout !== "auto") return;
    const observer = new ResizeObserver(
      ([entry]) => entry && setAutoPhone(entry.contentRect.width < 810),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout]);

  const phone = layout === "phone" || (layout === "auto" && autoPhone);
  const colors = THEMES[theme];
  const barHeight = phone ? 64 : 80;
  const bodyPaddingBottom = phone ? (open ? 88 : 20) : 30;
  const fullHeight = viewportHeight ?? windowHeight;

  const measure = useCallback(() => {
    const sum =
      (topbarRef.current?.offsetHeight ?? 0) +
      (linksRef.current?.offsetHeight ?? 0) +
      (metaRef.current?.offsetHeight ?? 0);
    setContentHeight(sum);
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    for (const node of [topbarRef.current, linksRef.current, metaRef.current]) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [measure, phone, links.length, socials.length, showClock]);

  // Desktop: height is min-content with a viewport minimum. Phone: always the viewport height.
  const openHeight = phone ? fullHeight : Math.max(contentHeight + bodyPaddingBottom, fullHeight);
  const bodyHeight = open ? openHeight : barHeight;

  const none: Transition = { duration: 0 };
  const t = (value: Transition) => (reduceMotion ? none : value);

  const hoverEnabled = !(phone && theme === "dark");
  const triggerHover = theme === "light";
  const metaColumn = phone;

  return (
    <motion.nav
      {...props}
      ref={navRef}
      aria-label={props["aria-label"] ?? "Main"}
      className={cn("relative flex flex-col items-center", className)}
      initial={false}
      animate={{ backgroundColor: colors.background }}
      transition={t(BAR_TRANSITION)}
      style={{
        width: phone && layout === "phone" ? 390 : "100%",
        maxWidth: "100%",
        overflow: "clip",
        ...style,
      }}
    >
      <motion.div
        id={menuId}
        className="relative flex w-full flex-col items-center justify-between"
        initial={false}
        animate={{ height: bodyHeight }}
        transition={t(BAR_TRANSITION)}
        data-hide-scrollbars={phone && open ? "true" : undefined}
        style={{
          padding: phone ? `0 8px ${bodyPaddingBottom}px` : `0 28px ${bodyPaddingBottom}px`,
          overflowX: "clip",
          overflowY: phone && open ? "auto" : "clip",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
        }}
      >
        <div
          ref={topbarRef}
          className="relative flex w-full flex-none items-center justify-between"
          style={{ height: barHeight, padding: "0 12px", zIndex: 2 }}
        >
          <a
            href={logoHref}
            aria-label={logoName}
            className="flex flex-none items-center justify-center no-underline"
            style={{ gap: 4, color: colors.text }}
          >
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: 24,
                lineHeight: "1em",
                whiteSpace: "pre",
                userSelect: "none",
              }}
            >
              <em>{logoName}</em>
            </span>
            <span
              aria-hidden
              style={{
                fontFamily: DISPLAY_FONT,
                fontFeatureSettings: '"sups" on',
                fontSize: 24,
                lineHeight: "1em",
                color: MUTED,
                userSelect: "none",
              }}
            >
              {"®"}
            </span>
          </a>

          <motion.button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(!open)}
            className="relative flex flex-none cursor-pointer items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-current"
            initial={false}
            animate={{ backgroundColor: "rgba(10, 10, 10, 0)", scale: 1 }}
            {...(triggerHover
              ? {
                  whileHover: {
                    backgroundColor: "rgba(10, 10, 10, 0.06)",
                    scale: 1.1,
                    transition: t(TRIGGER_SPRING),
                  },
                }
              : {})}
            transition={t(TRIGGER_SPRING)}
            style={{
              width: 128,
              gap: 12,
              padding: "10px 20px",
              border: `1px solid ${colors.triggerBorder}`,
              borderRadius: 999,
              color: colors.text,
              font: "inherit",
            }}
          >
            <span
              className="relative block flex-none overflow-hidden"
              style={{ width: 50, height: 14 }}
              aria-hidden
            >
              {(["Menu", "Close"] as const).map((word) => {
                const isClose = word === "Close";
                const shown = isClose ? open : !open;
                // Closed bar: "Menu" at 0 and "Close" parked 10px below; open swaps them.
                const y = isClose ? (open ? 0 : 10) : open ? -10 : 0;
                return (
                  <motion.span
                    key={word}
                    initial={false}
                    animate={{ opacity: shown ? 1 : 0, y }}
                    transition={t(LABEL_TRANSITION)}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      fontFamily: SANS_FONT,
                      fontSize: 13,
                      fontWeight: 500,
                      fontVariationSettings: '"opsz" 13, "wght" 500',
                      letterSpacing: "0.14em",
                      lineHeight: "1em",
                      textTransform: "uppercase",
                      whiteSpace: "pre",
                      userSelect: "none",
                    }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </span>
            <span
              className="relative block flex-none"
              style={{ width: 20, height: 20 }}
              aria-hidden
            >
              {([45, -45] as const).map((angle, index) => (
                <motion.span
                  key={angle}
                  initial={false}
                  animate={{
                    rotate: open ? angle : 0,
                    top: open ? 9 : index === 0 ? 6 : 12,
                  }}
                  transition={t(BURGER_TRANSITION)}
                  style={{
                    position: "absolute",
                    left: 1,
                    width: 18,
                    height: 2,
                    borderRadius: 2,
                    backgroundColor: colors.text,
                  }}
                />
              ))}
            </span>
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </motion.button>
        </div>

        <motion.div
          ref={linksRef}
          className="relative flex w-full flex-none flex-col items-start"
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            filter: open ? "blur(0px)" : "blur(12px)",
            // The closed layout pads the list 90px down; it glides up as the menu opens.
            y: open ? 0 : 90,
          }}
          transition={t(LINKS_TRANSITION)}
          style={{ padding: "0 12px", pointerEvents: open ? "auto" : "none" }}
          aria-hidden={!open}
          inert={!open}
        >
          {links.map((link) => (
            <NavRow
              key={link.number + link.label}
              link={link}
              theme={theme}
              hoverEnabled={hoverEnabled}
              transition={t(LINK_SPRING)}
            />
          ))}
        </motion.div>

        <motion.div
          ref={metaRef}
          className="relative flex w-full flex-none flex-wrap justify-between"
          initial={false}
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : 90 }}
          transition={t(META_TRANSITION)}
          style={{
            flexDirection: metaColumn ? "column" : "row",
            alignItems: metaColumn ? "flex-start" : "center",
            padding: "18px 12px 0 0",
            borderTop: phone && theme === "light" ? "1px solid rgba(10, 10, 10, 0.14)" : undefined,
            pointerEvents: open ? "auto" : "none",
          }}
          aria-hidden={!open}
          inert={!open}
        >
          <MetaLink
            label={email}
            href={`mailto:${email}`}
            theme={theme}
            transition={t(META_LINK_TRANSITION)}
          />
          <div
            className="flex flex-none"
            style={{
              gap: 4,
              flexDirection: metaColumn ? "column" : "row",
              alignItems: metaColumn ? "flex-start" : "center",
            }}
          >
            {socials.map((social) => (
              <MetaLink
                key={social.label}
                {...social}
                theme={theme}
                transition={t(META_LINK_TRANSITION)}
              />
            ))}
          </div>
          {showClock && (
            <div
              className="flex flex-none"
              style={{
                width: 146,
                justifyContent: metaColumn ? "flex-start" : "flex-end",
                padding: metaColumn ? "10px 12px" : 0,
              }}
            >
              <Clock />
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}

export default FullscreenNavbar;
