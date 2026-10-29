import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useState } from "react";

// The original loads Switzer (Fontshare) for UI text and Caveat (Google) for handwriting.
export const SWITZER = "Switzer, Inter, system-ui, sans-serif";
export const CAVEAT = 'Caveat, "Segoe Print", "Bradley Hand", cursive';

/** Framer colour tokens are not part of the exported source, so these are chosen to match. */
export interface FooterPalette {
  /** Footer background (also the punched-hole colour on the note card). */
  background: string;
  /** Hairline between the top and bottom halves. */
  divider: string;
  /** Primary text. */
  text: string;
  /** Secondary text. */
  textMuted: string;
  /** Tertiary text (column labels, legal links). */
  textFaint: string;
  /** Sticker and badge fill. */
  accent: string;
  /** Text on the accent (sticker, badge) and polaroid captions. */
  ink: string;
  /** Polaroid paper and sticker border. */
  paper: string;
  /** Note card surface. */
  card: string;
  /** Note card outline. */
  cardBorder: string;
}

export const DEFAULT_PALETTE: FooterPalette = {
  background: "rgb(17, 16, 14)",
  divider: "rgba(255, 255, 255, 0.1)",
  text: "rgb(244, 240, 232)",
  textMuted: "rgb(168, 162, 152)",
  textFaint: "rgb(122, 117, 108)",
  accent: "rgb(255, 122, 69)",
  ink: "rgb(26, 24, 20)",
  paper: "rgb(246, 242, 234)",
  card: "rgb(30, 28, 25)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
};

export type Breakpoint = "desktop" | "tablet" | "phone";

/** Handwriting sizes of the three note-card text styles, per breakpoint. */
const HAND = {
  address: { desktop: [23, 1.25], tablet: [21, 1.25], phone: [16, 1.2] },
  hours: { desktop: [19, 1.2], tablet: [18, 1.2], phone: [14, 1.2] },
  sticker: { desktop: [22, 1.1], tablet: [20, 1.1], phone: [17, 1.1] },
  caption: { desktop: [22, 1.1], tablet: [20, 1.1], phone: [17, 1.1] },
} as const;

const handSize = (kind: keyof typeof HAND, bp: Breakpoint) => ({
  fontSize: HAND[kind][bp][0],
  lineHeight: `${HAND[kind][bp][1]}em`,
});

/* ---------------------------------------------------------------- Snapshot (polaroid) */

export interface SnapshotProps {
  image: string;
  caption: string;
  /** Narrow 6px frame used on phones. */
  small?: boolean;
  breakpoint: Breakpoint;
  palette: FooterPalette;
}

/** A polaroid: paper frame, 3:4 photo, one line of handwriting. Fills the width it is given. */
export function Snapshot({ image, caption, small, breakpoint, palette }: SnapshotProps) {
  const pad = small ? 6 : 9;
  return (
    <div
      className="flex w-full flex-col items-center overflow-hidden"
      style={{
        padding: `${pad}px ${pad}px 0`,
        backgroundColor: palette.paper,
        borderRadius: 3,
        boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25), 0px 18px 36px -10px rgba(0, 0, 0, 0.55)",
      }}
    >
      <img
        src={image}
        alt=""
        draggable={false}
        className="block w-full object-cover"
        style={{
          aspectRatio: "0.75 / 1",
          borderRadius: 1,
          boxShadow: "inset 0px 0px 0px 1px rgba(0, 0, 0, 0.08)",
        }}
      />
      <div
        className="flex w-full flex-col items-center justify-center"
        style={{ padding: small ? "8px 4px 11px" : "14px 8px 18px" }}
      >
        <p
          className="m-0 w-full overflow-hidden text-center"
          style={{
            fontFamily: CAVEAT,
            fontWeight: 600,
            color: palette.ink,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1,
            wordBreak: "break-word",
            ...handSize("caption", breakpoint),
          }}
        >
          {caption}
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Note card */

export interface NoteCardProps {
  lines: [string, string, string, string];
  hours: string;
  sticker: string;
  /** 160x220 card used on phones. */
  small?: boolean;
  breakpoint: Breakpoint;
  palette: FooterPalette;
}

const CARD_SPRING: Transition = { type: "spring", duration: 0.45, bounce: 0.2 };
const STICKER_SPRING: Transition = { type: "spring", duration: 0.6, bounce: 0.45, delay: 0.05 };

/** The hand-waving icon (24px grid, 1.5 stroke) from the original sticker. */
function HandWaving({ size }: { size: number }) {
  const stroke = {
    fill: "none",
    stroke: "rgb(0, 0, 0)",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} style={{ display: "block" }}>
      <path
        {...stroke}
        transform="translate(3.008 5.998)"
        d="M 11.886 9.002 C 10.765 7.345 11.142 5.1 12.742 3.9 L 12.116 2.814 C 11.598 1.917 11.906 0.769 12.804 0.251 C 13.702 -0.266 14.849 0.042 15.367 0.939 L 16.99 3.752 C 19.061 7.34 17.831 11.928 14.243 13.999 C 10.654 16.07 6.066 14.84 3.995 11.252 L 0.245 4.753 C -0.264 3.857 0.045 2.718 0.938 2.203 C 1.83 1.687 2.972 1.989 3.493 2.878 L 5.296 6.002"
      />
      <path
        {...stroke}
        transform="translate(8.816 3.01)"
        d="M 0.245 2.802 C -0.264 1.906 0.045 0.767 0.938 0.252 C 1.83 -0.264 2.972 0.038 3.493 0.927 L 6.305 5.802"
      />
      <path
        {...stroke}
        transform="translate(4.912 3.749)"
        d="M 1.586 5.126 L 0.251 2.813 C -0.266 1.916 0.041 0.769 0.938 0.251 C 1.835 -0.266 2.982 0.041 3.5 0.938 L 6.422 6.001"
      />
      <path
        {...stroke}
        transform="translate(18 3.167)"
        d="M 0 0 C 1.253 0.331 2.322 1.148 2.969 2.271 L 3 2.324"
      />
      <path
        {...stroke}
        transform="translate(4.406 18.75)"
        d="M 2.589 3 C 1.543 2.174 0.665 1.155 0 0"
      />
    </svg>
  );
}

/**
 * Address note with punched holes. On hover/press the card slides up and tilts, and a round
 * "say hi!" sticker flies in from below and settles on the bottom-left corner.
 */
export function NoteCard({ lines, hours, sticker, small, breakpoint, palette }: NoteCardProps) {
  const [active, setActive] = useState(false);
  const reduce = useReducedMotion();
  const holeSize = small ? 5 : 7;
  const dims = small ? { w: 160, h: 220 } : { w: 220, h: 300 };
  const lift = small ? 80 : 112;
  const stickerSize = small ? 82 : 112;
  const stickerRest = small ? 246 : 336;
  const stickerHover = small ? 70 : 92;
  const t = (value: Transition): Transition => (reduce ? { duration: 0 } : value);

  return (
    <div
      className="relative"
      style={{ width: dims.w, height: dims.h, cursor: "default" }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerDown={() => setActive(true)}
    >
      <motion.div
        className="absolute left-0 flex flex-col items-start overflow-hidden"
        style={{
          width: dims.w,
          height: dims.h,
          padding: small ? "30px 12px 12px 14px" : "44px 16px 22px 22px",
          backgroundColor: palette.card,
          borderRadius: 4,
          // The 1px outline is drawn inside the box so it does not shift the padding.
          boxShadow: `inset 0 0 0 1px ${palette.cardBorder}, 0px 18px 36px -14px rgba(0, 0, 0, 0.7)`,
        }}
        initial={false}
        animate={{ top: active ? -lift : 0, rotate: active ? -2 : 0 }}
        transition={t(CARD_SPRING)}
      >
        <div
          aria-hidden
          className="absolute left-0 flex w-full items-center justify-center"
          style={{ top: small ? 11 : 14, height: 8, gap: small ? 6 : 11 }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              style={{
                width: holeSize,
                height: holeSize,
                flex: "none",
                borderRadius: "50%",
                backgroundColor: palette.background,
                boxShadow: "inset 0px 1px 1px 0px rgba(0, 0, 0, 0.8)",
              }}
            />
          ))}
        </div>
        <div className="flex w-full flex-col" style={{ gap: 2 }}>
          {lines.map((line, i) => (
            <p
              key={i}
              className="m-0 w-full whitespace-pre-wrap"
              style={{
                fontFamily: CAVEAT,
                fontWeight: 500,
                color: palette.text,
                wordBreak: "break-word",
                ...handSize("address", breakpoint),
              }}
            >
              {line}
            </p>
          ))}
        </div>
        <p
          className="absolute m-0 whitespace-pre"
          style={{
            bottom: small ? 14 : 22,
            right: small ? 14 : 22,
            fontFamily: CAVEAT,
            fontWeight: 500,
            color: palette.textMuted,
            ...handSize(small ? "address" : "hours", breakpoint),
          }}
        >
          {hours}
        </p>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute flex flex-col items-center justify-center"
        style={{
          left: small ? -10 : -16,
          width: stickerSize,
          height: stickerSize,
          boxSizing: "border-box",
          backgroundColor: palette.accent,
          border: `${small ? 4 : 5}px solid ${palette.paper}`,
          borderRadius: "50%",
          boxShadow: "0px 12px 24px -8px rgba(0, 0, 0, 0.6)",
        }}
        initial={false}
        animate={{ top: active ? stickerHover : stickerRest, rotate: active ? -9 : -28 }}
        transition={t(STICKER_SPRING)}
      >
        <HandWaving size={small ? 28 : 40} />
        <span
          className="whitespace-pre"
          style={{
            fontFamily: CAVEAT,
            fontWeight: 600,
            color: palette.ink,
            ...handSize("sticker", breakpoint),
          }}
        >
          {sticker}
        </span>
      </motion.div>
    </div>
  );
}
