import {
  motion,
  useInView,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import {
  DEFAULT_PALETTE,
  NoteCard,
  SWITZER,
  Snapshot,
  type Breakpoint,
  type FooterPalette,
} from "@/components/ui/snapshot-footer-parts";
import { cn } from "@/lib/utils";

export type { Breakpoint, FooterPalette } from "@/components/ui/snapshot-footer-parts";

export interface FooterLink {
  label: string;
  href: string;
  /** Small pill after the label; shown when greater than 0. */
  badge?: number;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
  /** Open the links in a new tab (the original does this for the social column). */
  external?: boolean;
}

export interface FooterPhoto {
  src: string;
  caption: string;
}

export interface SnapshotFooterProps extends Omit<React.ComponentProps<"footer">, "children"> {
  /** Large intro heading; "\n" starts a new line. Revealed word by word (blur-in) on scroll. */
  heading?: string;
  /** Paragraph next to the heading. */
  paragraph?: string;
  /** The five polaroids, left to right in the order photo 1, 2, 3, 4, 5 of the original. */
  photos?: [FooterPhoto, FooterPhoto, FooterPhoto, FooterPhoto, FooterPhoto];
  /** Address note card. */
  note?: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    hours: string;
    stickerText: string;
  };
  wordmark?: string;
  logoHref?: string;
  /** First tagline lines in the primary colour; "\n" starts a new line. */
  tagline?: string;
  /** Last tagline line in the muted colour. */
  taglineLastLine?: string;
  columns?: [FooterColumn, FooterColumn, FooterColumn];
  copyright?: string;
  legalLinks?: Array<{ label: string; href: string }>;
  /** "auto" follows the footer's own width: <810px phone, <1200px tablet. */
  layout?: "auto" | Breakpoint;
  palette?: Partial<FooterPalette>;
}

const DEFAULT_PHOTOS: NonNullable<SnapshotFooterProps["photos"]> = [
  {
    src: "https://framerusercontent.com/images/d8x1pDxPrS0GGT5ROElHH5YGJe0.jpg?width=440&height=660",
    caption: "Monday, 9:04 am",
  },
  {
    src: "https://framerusercontent.com/images/irmtS5Cuy46TYVIrVdg5opJhLA.jpg?width=440&height=550",
    caption: "Lunch on the roof",
  },
  {
    src: "https://framerusercontent.com/images/HjXEmTCMnb1gswJaxTcMq2WTHH4.jpg?width=440&height=587",
    caption: "Sprint plan, v3",
  },
  {
    src: "https://framerusercontent.com/images/XiXf4CMfUfUe534wlPh8Hwgg.jpg?width=440&height=660",
    caption: "Head of morale",
  },
  {
    src: "https://framerusercontent.com/images/M3woVqmkTedc5zPmZqyLEOtE.jpg?width=440&height=660",
    caption: "Demo day",
  },
];

const DEFAULT_COLUMNS: NonNullable<SnapshotFooterProps["columns"]> = [
  {
    title: "Studio",
    links: [
      { label: "Home", href: "/" },
      { label: "Work", href: "/" },
      { label: "Services", href: "/" },
      { label: "About", href: "/" },
      { label: "Journal", href: "/" },
      { label: "Careers", href: "/", badge: 3 },
      { label: "Contact", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Playbook", href: "/" },
      { label: "Process", href: "/" },
      { label: "Brand kit", href: "/" },
      { label: "Press", href: "/" },
      { label: "FAQ", href: "/" },
    ],
  },
  {
    title: "Follow",
    external: true,
    links: [
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "Dribbble", href: "https://dribbble.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Behance", href: "https://www.behance.net/" },
      { label: "X", href: "https://x.com/" },
      { label: "GitHub", href: "https://github.com/" },
      { label: "YouTube", href: "https://www.youtube.com/" },
    ],
  },
];

/** Follows the element's own width, using the original's 1200/810 breakpoints. */
function useBreakpoint(
  ref: React.RefObject<HTMLElement | null>,
  forced: SnapshotFooterProps["layout"],
) {
  const [measured, setMeasured] = useState<Breakpoint>("desktop");
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || (forced && forced !== "auto")) return;
    const update = () => {
      const width = node.getBoundingClientRect().width;
      setMeasured(width < 810 ? "phone" : width < 1200 ? "tablet" : "desktop");
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, forced]);
  return forced && forced !== "auto" ? forced : measured;
}

/** Per-breakpoint numbers read from the original's variant CSS. */
const LAYOUT = {
  desktop: {
    topPad: "120px 40px 0",
    topGap: 64,
    introDirection: "row",
    introGap: 40,
    bodyWidth: 460,
    pileHeight: 280,
    pileMax: 1240,
    bottomPad: "72px 40px 36px",
    bottomGap: 88,
    mainDirection: "row",
    mainGap: 40,
    heading: { size: 44, tracking: "-0.025em", leading: "1.08em" },
    body: { size: 19, tracking: "-0.005em", leading: "1.45em" },
    tagline: { size: 28, tracking: "-0.02em" },
  },
  tablet: {
    topPad: "96px 32px 0",
    topGap: 56,
    introDirection: "column",
    introGap: 20,
    bodyWidth: 560,
    pileHeight: 250,
    pileMax: 820,
    bottomPad: "64px 32px 32px",
    bottomGap: 64,
    mainDirection: "column",
    mainGap: 56,
    heading: { size: 38, tracking: "-0.02em", leading: "1.1em" },
    body: { size: 18, tracking: "-0.005em", leading: "1.45em" },
    tagline: { size: 26, tracking: "-0.02em" },
  },
  phone: {
    topPad: "72px 20px 0",
    topGap: 44,
    introDirection: "column",
    introGap: 16,
    bodyWidth: 0,
    pileHeight: 200,
    pileMax: 420,
    bottomPad: "48px 20px 28px",
    bottomGap: 48,
    mainDirection: "column",
    mainGap: 48,
    heading: { size: 32, tracking: "-0.02em", leading: "1.1em" },
    body: { size: 16, tracking: "0em", leading: "1.5em" },
    tagline: { size: 24, tracking: "-0.015em" },
  },
} as const;

/** Where each pile item sits and how it moves, per breakpoint (null = hidden). */
interface PileSlot {
  /** CSS left (percentage, or calc for the note card). */
  left: string;
  top: number;
  width: number;
  rest: number;
  /** Starting pose before it scrolls into view. */
  enter: { rotate: number; y: number };
  /** Pose while hovered/pressed. */
  hover?: { rotate: number; y: number };
  /** Spring delay of the entrance. */
  delay: number;
}

type PileKey = "p1" | "p2" | "note" | "p4" | "p3" | "p5";
const PILE: Record<Breakpoint, Record<PileKey, PileSlot | null>> = {
  desktop: {
    p1: {
      left: "11%",
      top: 130,
      width: 210,
      rest: 4,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: -3, y: -158 },
      delay: 0,
    },
    p2: {
      left: "22%",
      top: 182,
      width: 210,
      rest: -11,
      enter: { rotate: -6, y: 70 },
      hover: { rotate: -4, y: -205 },
      delay: 0.06,
    },
    note: {
      left: "calc(39.3% - 110px)",
      top: 78,
      width: 220,
      rest: -1,
      enter: { rotate: -4, y: 90 },
      delay: 0.12,
    },
    p4: {
      left: "71%",
      top: 112,
      width: 210,
      rest: -4,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: 5, y: -140 },
      delay: 0.24,
    },
    p3: {
      left: "56%",
      top: 162,
      width: 210,
      rest: -5,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: 4, y: -188 },
      delay: 0.18,
    },
    p5: {
      left: "89%",
      top: 118,
      width: 210,
      rest: 9,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: 12, y: -140 },
      delay: 0.3,
    },
  },
  tablet: {
    p1: {
      left: "12%",
      top: 120,
      width: 170,
      rest: 4,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: -3, y: -128 },
      delay: 0,
    },
    p2: {
      left: "25%",
      top: 170,
      width: 170,
      rest: -11,
      enter: { rotate: -6, y: 56 },
      hover: { rotate: -4, y: -178 },
      delay: 0.06,
    },
    note: {
      left: "calc(42% - 110px)",
      top: 65,
      width: 220,
      rest: -1,
      enter: { rotate: -4, y: 90 },
      delay: 0.12,
    },
    p4: {
      left: "78%",
      top: 100,
      width: 170,
      rest: -4,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: 5, y: -110 },
      delay: 0.24,
    },
    p3: {
      left: "65%",
      top: 150,
      width: 170,
      rest: -5,
      enter: { rotate: -6, y: 80 },
      hover: { rotate: 4, y: -158 },
      delay: 0.18,
    },
    p5: {
      left: "91%",
      top: 104,
      width: 170,
      rest: 9,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: 12, y: -112 },
      delay: 0.3,
    },
  },
  phone: {
    p1: {
      left: "17%",
      top: 90,
      width: 128,
      rest: 5,
      enter: { rotate: -6, y: 80 },
      hover: { rotate: -3, y: -82 },
      delay: 0,
    },
    p2: null,
    note: {
      left: "calc(49% - 80px)",
      top: 60,
      width: 160,
      rest: -2,
      enter: { rotate: -4, y: 90 },
      delay: 0.12,
    },
    p4: {
      left: "87%",
      top: 80,
      width: 128,
      rest: -5,
      enter: { rotate: -6, y: 90 },
      hover: { rotate: 5, y: -72 },
      delay: 0.24,
    },
    p3: null,
    p5: null,
  },
};

const ENTER_SPRING = { type: "spring", duration: 0.9, bounce: 0.22 } as const;
const HOVER_SPRING: Transition = { type: "spring", duration: 0.45, bounce: 0.22 };
const EASE_OUT_EXPO_ISH: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LINK_FADE = "color 0.2s cubic-bezier(0.44, 0, 0.56, 1)";

const HIDDEN_WORD = { opacity: 0.001, filter: "blur(6px)", y: 14 };

/** Breaks "a b\nc d" into word spans that blur/slide in one after another once in view. */
function WordReveal({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  let index = 0;
  return (
    <h2 ref={ref} className={className} style={style}>
      {text.split("\n").map((line, lineIndex, lines) => (
        <span key={lineIndex}>
          {line.split(" ").map((word, wordIndex) => {
            const delay = 0.05 * index++;
            return (
              <span key={wordIndex}>
                {wordIndex > 0 && " "}
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : HIDDEN_WORD}
                  animate={
                    inView || reduce ? { opacity: 1, filter: "blur(0px)", y: 0 } : HIDDEN_WORD
                  }
                  transition={{ type: "spring", duration: 0.8, bounce: 0, delay }}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </h2>
  );
}

/** One absolutely placed pile item: waits below/tilted, springs into place once the pile is in view. */
function PileItem({
  slot,
  inView,
  height,
  centered,
  children,
}: {
  slot: PileSlot;
  inView: boolean;
  height?: number;
  /** Items positioned by their centre (everything but the note card). */
  centered: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const rest: TargetAndTransition = {
    rotate: slot.rest,
    y: 0,
    transition: reduce ? { duration: 0 } : { ...ENTER_SPRING, delay: slot.delay },
  };
  const enter = { rotate: slot.enter.rotate, y: slot.enter.y, scale: 1 };
  const hover: TargetAndTransition | undefined =
    slot.hover && !reduce
      ? {
          rotate: slot.hover.rotate,
          y: slot.hover.y,
          scale: 1.02,
          opacity: 1,
          transition: HOVER_SPRING,
        }
      : undefined;
  return (
    <motion.div
      className="absolute"
      style={{
        left: slot.left,
        top: slot.top,
        width: slot.width,
        height,
        cursor: "default",
        willChange: "transform",
      }}
      initial={reduce ? { rotate: slot.rest, y: 0 } : enter}
      animate={inView ? rest : enter}
      {...(centered
        ? { transformTemplate: (_: unknown, transform: string) => `translateX(-50%) ${transform}` }
        : {})}
      {...(hover ? { whileHover: hover, whileTap: hover } : {})}
    >
      {children}
    </motion.div>
  );
}

function FooterAnchor({
  href,
  external,
  className,
  style,
  hoverColor,
  children,
}: {
  href: string;
  external?: boolean | undefined;
  className?: string;
  style: CSSProperties;
  hoverColor: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      className={cn("no-underline outline-offset-2 focus-visible:outline-2", className)}
      style={{ ...style, color: hovered ? hoverColor : style.color, transition: LINK_FADE }}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

export function SnapshotFooter({
  heading = "Pull up a chair.\nThe kettle’s always on.",
  paragraph = "Our studio is more than a place to work. It’s where ideas get sketched on napkins, Friday demos turn into long lunches, and the office dog has strong opinions about design. Come and see for yourself.",
  photos = DEFAULT_PHOTOS,
  note = {
    line1: "Studio 7",
    line2: "48 Mill Lane",
    line3: "Bristol BS1 4DJ",
    line4: "+44 117 000 0000",
    hours: "Mon–Fri, 9–6",
    stickerText: "say hi!",
  },
  wordmark = "marlo",
  logoHref = "/",
  tagline = "Small team.\nBig ideas.",
  taglineLastLine = "Good coffee.",
  columns = DEFAULT_COLUMNS,
  copyright = "© 2026 Marlo Studio. All rights reserved.",
  legalLinks = [
    { label: "Privacy", href: "/" },
    { label: "Terms", href: "/" },
    { label: "Cookies", href: "/" },
  ],
  layout = "auto",
  palette: paletteOverride,
  className,
  style,
  ...props
}: SnapshotFooterProps) {
  const palette: FooterPalette = { ...DEFAULT_PALETTE, ...paletteOverride };
  const root = useRef<HTMLElement>(null);
  const pile = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint(root, layout);
  const L = LAYOUT[bp];
  const slots = PILE[bp];
  const reduce = useReducedMotion();
  const pileInView = useInView(pile, { amount: 0, once: true });
  const bodyInView = useRef<HTMLParagraphElement>(null);
  const bodyVisible = useInView(bodyInView, { amount: 0.5, once: true });
  const small = bp === "phone";

  const photoSlots: Array<[PileKey, number]> = [
    ["p1", 0],
    ["p2", 1],
    ["note", -1],
    ["p4", 3],
    ["p3", 2],
    ["p5", 4],
  ];

  return (
    <footer
      ref={root}
      {...props}
      className={cn("relative flex w-full flex-col items-center overflow-hidden", className)}
      style={{
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: SWITZER,
        ...style,
      }}
    >
      {/* Top: intro + photo pile (clipped at the divider, so the pile peeks out from below). */}
      <div className="flex w-full flex-col items-center overflow-hidden">
        <div
          className="flex w-full flex-col items-center"
          style={{ maxWidth: 1440, gap: L.topGap, padding: L.topPad }}
        >
          <div
            className="flex w-full items-start"
            style={{ flexDirection: L.introDirection, gap: L.introGap }}
          >
            <WordReveal
              text={heading}
              className="m-0"
              style={{
                flex: L.introDirection === "row" ? "1 0 0" : undefined,
                width: L.introDirection === "row" ? 1 : "100%",
                fontSize: L.heading.size,
                fontWeight: 500,
                letterSpacing: L.heading.tracking,
                lineHeight: L.heading.leading,
                fontFeatureSettings: "'blwf' on, 'cv03' on, 'cv04' on, 'cv09' on, 'cv11' on",
                color: palette.text,
              }}
            />
            <motion.p
              ref={bodyInView}
              className="m-0"
              style={{
                width: L.introDirection === "row" ? L.bodyWidth : "100%",
                maxWidth: bp === "tablet" ? L.bodyWidth : undefined,
                flex: "none",
                fontSize: L.body.size,
                fontWeight: 400,
                letterSpacing: L.body.tracking,
                lineHeight: L.body.leading,
                color: palette.textMuted,
                textWrap: "pretty",
              }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={bodyVisible || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ type: "tween", duration: 0.9, delay: 0.3, ease: EASE_OUT_EXPO_ISH }}
            >
              {paragraph}
            </motion.p>
          </div>

          <div
            ref={pile}
            className="relative w-full"
            style={{ height: L.pileHeight, maxWidth: L.pileMax }}
          >
            {photoSlots.map(([key, photoIndex]) => {
              const slot = slots[key];
              if (!slot) return null;
              if (key === "note") {
                return (
                  <PileItem
                    key={key}
                    slot={slot}
                    inView={pileInView}
                    height={small ? 220 : 300}
                    centered={false}
                  >
                    <NoteCard
                      lines={[note.line1, note.line2, note.line3, note.line4]}
                      hours={note.hours}
                      sticker={note.stickerText}
                      small={small}
                      breakpoint={bp}
                      palette={palette}
                    />
                  </PileItem>
                );
              }
              const photo = photos[photoIndex];
              if (!photo) return null;
              return (
                <PileItem key={key} slot={slot} inView={pileInView} centered>
                  <Snapshot
                    image={photo.src}
                    caption={photo.caption}
                    small={small}
                    breakpoint={bp}
                    palette={palette}
                  />
                </PileItem>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full" style={{ height: 1, backgroundColor: palette.divider }} />

      {/* Bottom: brand, link columns, legal row. */}
      <div className="flex w-full flex-col items-center">
        <div
          className="flex w-full flex-col items-start"
          style={{ maxWidth: 1440, gap: L.bottomGap, padding: L.bottomPad }}
        >
          <div
            className="flex w-full items-start"
            style={{ flexDirection: L.mainDirection, gap: L.mainGap }}
          >
            <div
              className="flex flex-col items-start"
              style={
                bp === "desktop"
                  ? {
                      flex: "1 0 0",
                      alignSelf: "stretch",
                      width: 1,
                      justifyContent: "space-between",
                    }
                  : { width: "100%", gap: bp === "tablet" ? 40 : 28 }
              }
            >
              <a
                href={logoHref}
                className="flex items-center no-underline outline-offset-2 focus-visible:outline-2"
                style={{ gap: 10, color: palette.text }}
              >
                <span
                  aria-hidden
                  className="relative block flex-none"
                  style={{
                    width: 22,
                    height: 22,
                    boxSizing: "border-box",
                    border: `2px solid ${palette.text}`,
                    borderRadius: "11px 11px 11px 3px",
                  }}
                />
                <span
                  className="whitespace-pre"
                  style={{
                    fontSize: 21,
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: "1em",
                  }}
                >
                  {wordmark}
                </span>
              </a>
              <div
                className="flex w-full flex-col"
                style={{ fontWeight: 600, letterSpacing: L.tagline.tracking }}
              >
                <p
                  className="m-0 whitespace-pre-wrap"
                  style={{ fontSize: L.tagline.size, lineHeight: "1.1em", color: palette.text }}
                >
                  {tagline}
                </p>
                <p
                  className="m-0 whitespace-pre-wrap"
                  style={{
                    fontSize: L.tagline.size,
                    lineHeight: "1.1em",
                    color: palette.textMuted,
                  }}
                >
                  {taglineLastLine}
                </p>
              </div>
            </div>

            <nav
              aria-label="Footer"
              style={
                bp === "phone"
                  ? {
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(50px, 1fr))",
                      gap: "40px 20px",
                      width: "100%",
                    }
                  : { display: "flex", width: bp === "tablet" ? "100%" : "min-content" }
              }
            >
              {columns.map((column) => (
                <div
                  key={column.title}
                  className="flex flex-col items-start"
                  style={{
                    gap: 22,
                    ...(bp === "tablet"
                      ? { flex: "1 0 0", width: 1 }
                      : { width: bp === "phone" ? "100%" : 190, flex: "none" }),
                  }}
                >
                  <p
                    className="m-0 w-full"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      lineHeight: "1.2em",
                      textTransform: "uppercase",
                      color: palette.textFaint,
                    }}
                  >
                    {column.title}
                  </p>
                  <ul className="m-0 flex w-full list-none flex-col p-0" style={{ gap: 12 }}>
                    {column.links.map((link) => (
                      <li key={link.label} className="flex items-center" style={{ gap: 8 }}>
                        <FooterAnchor
                          href={link.href}
                          external={column.external}
                          hoverColor={palette.textMuted}
                          style={{
                            color: palette.text,
                            fontSize: 16,
                            fontWeight: 400,
                            letterSpacing: "-0.005em",
                            lineHeight: "1.25em",
                            whiteSpace: "pre",
                          }}
                        >
                          {link.label}
                        </FooterAnchor>
                        {(link.badge ?? 0) > 0 && (
                          <span
                            className="flex items-center justify-center"
                            style={{
                              padding: "2px 6px",
                              borderRadius: 20,
                              backgroundColor: palette.accent,
                              color: palette.ink,
                              fontSize: 11,
                              fontWeight: 600,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {link.badge}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div
            className="flex w-full"
            style={
              bp === "phone"
                ? { flexDirection: "column", alignItems: "flex-start", gap: 12 }
                : { alignItems: "center", justifyContent: "space-between" }
            }
          >
            <p
              className="m-0 whitespace-pre"
              style={{ fontSize: 13, lineHeight: "1.4em", color: palette.textFaint }}
            >
              {copyright}
            </p>
            <div className="flex items-center" style={{ gap: 24 }}>
              {legalLinks.map((link) => (
                <FooterAnchor
                  key={link.label}
                  href={link.href}
                  hoverColor={palette.text}
                  style={{
                    color: palette.textFaint,
                    fontSize: 13,
                    lineHeight: "1.4em",
                    whiteSpace: "pre",
                  }}
                >
                  {link.label}
                </FooterAnchor>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SnapshotFooter;
