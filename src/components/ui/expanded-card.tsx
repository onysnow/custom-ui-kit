import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Every size change of the original is this spring. */
const SPRING = { type: "spring", stiffness: 160, damping: 30, mass: 1 } as const;
const INSTANT = { duration: 0 } as const;

/** Narrower than this the cards stack vertically and open on click ("Mobile" variants). */
const STACK_BELOW = 480;
/** Collapsed and open card height when stacked. */
const STACKED_COLLAPSED = 42;
const STACKED_OPEN = 400;

const SAMPLE_IMAGE =
  "https://framerusercontent.com/images/jsoYuvRP6FOxNSujX1KSiZEvOpc.png?scale-down-to=1024";
const SAMPLE_PARAGRAPH =
  "Today’s demo is another snippet for an expanding flex cards in accordion style.";

export interface ShieldChevronIconProps extends React.ComponentProps<"svg"> {
  /** Stroke colour. */
  color?: string;
  strokeWidth?: number;
}

/** The "Shield Chevron" vector the original uses as its default icon. */
export function ShieldChevronIcon({
  color = "rgb(255, 255, 255)",
  strokeWidth = 1.5,
  ...props
}: ShieldChevronIconProps) {
  const stroke = {
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden display="block" {...props}>
      <path
        {...stroke}
        transform="translate(3.75 4.5)"
        d="M 16.5 6 L 16.5 0.75 C 16.5 0.336 16.164 0 15.75 0 L 0.75 0 C 0.336 0 0 0.336 0 0.75 L 0 6 C 0 15 8.25 17.25 8.25 17.25 C 8.25 17.25 16.5 15 16.5 6 Z"
      />
      <path {...stroke} transform="translate(5.065 11.25)" d="M 13.869 4.854 L 6.935 0 L 0 4.854" />
    </svg>
  );
}

export interface ExpandedCardItem {
  /** Background picture. */
  image: string;
  /** Title shown next to the icon when open. */
  title?: string;
  /** Paragraph shown when open. */
  description?: string;
  /** Replaces the shield icon. */
  icon?: React.ReactNode;
  /** Small index in the top-left corner; defaults to "01", "02", ... */
  number?: string;
  imageAlt?: string;
}

const DEFAULT_CARDS: ExpandedCardItem[] = Array.from({ length: 5 }, () => ({
  image: SAMPLE_IMAGE,
  title: "Expanding Cards",
  description: SAMPLE_PARAGRAPH,
}));

export interface ExpandedCardProps extends Omit<
  React.ComponentProps<"div">,
  "children" | "onChange"
> {
  cards?: ExpandedCardItem[];
  /**
   * "horizontal": a row where the hovered card grows (the "Desktop" variants).
   * "vertical": a column where the clicked card opens (the "Mobile" variants).
   * "auto" picks vertical when the component is narrower than 480px.
   */
  layout?: "auto" | "horizontal" | "vertical";
  /** Controlled index of the open card. */
  activeIndex?: number;
  /** Initial open card when uncontrolled. */
  defaultActiveIndex?: number;
  onActiveChange?: (index: number) => void;
}

interface CardProps {
  item: ExpandedCardItem;
  index: number;
  active: boolean;
  vertical: boolean;
  reduced: boolean;
  onActivate: () => void;
}

/**
 * Offsets that place an element centred in its parent when `p` is 0 and flush left when `p` is 1.
 * `50%` of the parent as a margin minus `50%` of the element itself as a translation centres it;
 * scaling both by (1 - p) slides it to the left edge as the card opens.
 */
function useCentredToLeft(p: MotionValue<number>) {
  return {
    marginLeft: useTransform(p, (value) => `${(1 - value) * 50}%`),
    x: useTransform(p, (value) => `${-(1 - value) * 50}%`),
  };
}

function Card({ item, index, active, vertical, reduced, onActivate }: CardProps) {
  // 0 = collapsed, 1 = open. Width (flex-grow) or height, the overlay, the paragraph and the icon
  // position all follow this single spring-driven value.
  const progress = useMotionValue(active ? 1 : 0);
  useEffect(() => {
    const controls = animate(progress, active ? 1 : 0, reduced ? INSTANT : SPRING);
    return () => controls.stop();
  }, [active, progress, reduced]);

  const overlayOpacity = useTransform(progress, [0, 1], [0.8, 0.5]);
  const paragraphMinWidth = useTransform(progress, [0, 1], [vertical ? 0 : 320, 0]);
  const height = useTransform(progress, [0, 1], [STACKED_COLLAPSED, STACKED_OPEN]);
  const numberOffset = useCentredToLeft(progress);
  const iconOffset = useCentredToLeft(progress);

  // A stacked card that is closed shows only its number.
  const showBottom = !vertical || active;
  const number = item.number ?? String(index + 1).padStart(2, "0");

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-expanded={active}
      aria-label={item.title}
      onClick={onActivate}
      onMouseEnter={vertical ? undefined : onActivate}
      onFocus={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate();
        }
      }}
      className="relative flex cursor-pointer items-end justify-center gap-2.5 overflow-hidden p-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset"
      style={
        vertical
          ? { width: "100%", flexGrow: 0, flexShrink: 0, flexBasis: "auto", height }
          : { flexBasis: "10%", flexShrink: 0, flexGrow: progress, height: "100%", minWidth: 0 }
      }
    >
      <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center overflow-hidden rounded-[10px]">
        <img
          src={item.image}
          alt={item.imageAlt ?? ""}
          draggable={false}
          className="z-[1] flex-none object-cover select-none"
          style={
            vertical
              ? { width: "100%", height: 420 }
              : { width: "max(400px, 100%)", height: "100%" }
          }
        />
        <motion.div
          className="absolute top-0 left-0 z-[1] h-full w-full bg-black"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      <div className="relative z-[2] flex h-full min-w-0 flex-1 flex-col items-center justify-between overflow-hidden">
        <div className="relative flex min-h-px w-full flex-1 items-start overflow-visible">
          <motion.span
            className="block text-sm leading-[1.2em] font-semibold whitespace-pre"
            style={{
              fontFamily: 'Inter, "Inter Placeholder", system-ui, sans-serif', // Inter 600 (Framer-hosted webfont)
              ...(vertical ? {} : numberOffset),
              alignSelf: vertical && !active ? "center" : "flex-start",
            }}
          >
            {number}
          </motion.span>
        </div>

        {showBottom && (
          <div className="relative flex h-min w-full flex-col items-start justify-center gap-2.5">
            <motion.div
              className="flex w-full items-center gap-2.5"
              style={{ opacity: progress, minWidth: paragraphMinWidth }}
            >
              <p
                className="m-0 min-w-0 flex-1 text-sm leading-[1.6em] break-words"
                style={{ fontFamily: 'Inter, "Inter Placeholder", system-ui, sans-serif' }}
              >
                {item.description}
              </p>
            </motion.div>
            <div className="relative flex w-full items-center gap-2.5">
              <motion.span className="block size-5 flex-none" style={vertical ? {} : iconOffset}>
                {item.icon ?? <ShieldChevronIcon className="size-full" />}
              </motion.span>
              {active && (
                <p
                  className="m-0 min-w-0 flex-1 text-sm leading-[1.2em] font-semibold break-words"
                  style={{ fontFamily: 'Inter, "Inter Placeholder", system-ui, sans-serif' }}
                >
                  {item.title}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * An accordion of picture cards. On a wide container the cards form a row and the hovered card
 * springs open to take most of the width (the others shrink to 10% strips); on a narrow one they
 * stack and the clicked card springs open to 400px tall, the others collapse to 42px.
 */
export function ExpandedCard({
  cards = DEFAULT_CARDS,
  layout = "auto",
  activeIndex,
  defaultActiveIndex = 0,
  onActiveChange,
  className,
  style,
  ...props
}: ExpandedCardProps) {
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [innerIndex, setInnerIndex] = useState(defaultActiveIndex);
  const current = activeIndex ?? innerIndex;
  const vertical = layout === "vertical" || (layout === "auto" && narrow);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || layout !== "auto") return;
    const observer = new ResizeObserver((entries) =>
      setNarrow((entries[0]?.contentRect.width ?? Infinity) < STACK_BELOW),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [layout]);

  const activate = (index: number) => {
    if (index === current) return;
    setInnerIndex(index);
    onActiveChange?.(index);
  };

  return (
    <div
      {...props}
      ref={rootRef}
      className={cn(
        "relative flex w-full max-w-[800px] gap-2.5 overflow-hidden",
        vertical ? "h-min flex-col" : "h-[400px] flex-row items-center justify-center",
        className,
      )}
      style={style}
    >
      {cards.map((item, index) => (
        <Card
          key={index}
          item={item}
          index={index}
          active={index === current}
          vertical={vertical}
          reduced={reduced}
          onActivate={() => activate(index)}
        />
      ))}
    </div>
  );
}

export default ExpandedCard;
