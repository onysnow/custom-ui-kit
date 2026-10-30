import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Every hover change in the original runs on one spring: bounce 0.4 over 1s. The bounce is what
 * makes the photo overshoot a little as it lifts and the folder front dip before it settles.
 */
const SPRING: Transition = { type: "spring", bounce: 0.4, duration: 1 };
const REDUCED: Transition = { type: "tween", duration: 0.2, ease: "easeOut" };

/** Offsets between the resting and the open card, from the original layout (card is 300x400). */
const OPEN = {
  /** Background is inset by -30px on every side: on a 300x400 cover image that is a 1.15 zoom. */
  backgroundScale: 1.15,
  /** The photo's top goes from 130px to 33px (its parent moves to -30px, the photo to 63px in it). */
  imageLift: -97,
  imageRotate: -10,
  /** Folder front, number and arrow all drop by 100px (80→180, 100→200, 130→230). */
  drop: 100,
} as const;

/** The folder tab: rounded on the left, a 20px-radius ramp down to the front on the right. */
const TAB_PATH =
  "M20 0C8.954 0 0 8.954 0 20v12h150v-2h-25.95a20 20 0 0 1-13.324-5.085L88.528 5.085A20 20 0 0 0 75.203 0Z";

export interface FolderCardData {
  /** Big label on the folder front, e.g. "01". */
  number: string;
  title: string;
  description: string;
  /** Full-bleed image behind the folder; only its top strip shows until the card opens. */
  backgroundImage: string;
  /** Cut-out (transparent PNG) that slides up out of the folder and tilts when the card opens. */
  image: string;
  /** Width / height of `image`; it is drawn 240px wide. */
  imageAspectRatio?: number;
  /** Folder front and tab. */
  folderColor: string;
  /** The 10px frame around the card. */
  borderColor: string;
  numberColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  iconColor?: string;
  /** Optional link target; the card renders as an `<a>` when set. */
  href?: string;
}

export interface FolderCardProps extends FolderCardData {
  /** Open state. Leave undefined to let the card follow hover / tap / focus by itself. */
  active?: boolean;
  /** Called when hover, tap or focus asks the card to open or close. */
  onActiveChange?: (active: boolean) => void;
  width?: number;
  height?: number;
  /** Frame thickness in px. */
  borderWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

function ArrowUpRight({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden fill="none">
      <g
        transform="translate(7 7)"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 0 10 L 10 0" />
        <path d="M 0 0 L 10 0 L 10 10" />
      </g>
    </svg>
  );
}

/**
 * One folder-shaped card. Resting, the folder front covers everything below its tab, so only a
 * strip of the background image shows. Opening it zooms the background, drops the front (with the
 * number and arrow) by 100px and lifts the cut-out photo out of the folder, tilted by -10°.
 */
export function FolderCard({
  number,
  title,
  description,
  backgroundImage,
  image,
  imageAspectRatio = 1,
  folderColor,
  borderColor,
  numberColor = "rgb(255, 255, 255)",
  titleColor = "rgb(255, 255, 255)",
  descriptionColor = "rgba(255, 255, 255, 0.6)",
  iconColor = "rgb(255, 255, 255)",
  href,
  active: activeProp,
  onActiveChange,
  width = 300,
  height = 400,
  borderWidth = 10,
  className,
  style,
}: FolderCardProps) {
  const [ownActive, setOwnActive] = useState(false);
  const active = activeProp ?? ownActive;
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? REDUCED : SPRING;

  const request = (next: boolean) => {
    if (activeProp === undefined) setOwnActive(next);
    onActiveChange?.(next);
  };

  const Root = href ? "a" : "div";

  return (
    <Root
      href={href}
      {...(href ? {} : { tabIndex: 0, role: "group" })}
      aria-label={`${number} ${title}`}
      className={cn(
        "relative block shrink-0 cursor-pointer overflow-hidden no-underline outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
        className,
      )}
      style={{
        width,
        height,
        borderRadius: 30,
        fontFamily: 'Inter, "Inter Placeholder", system-ui, sans-serif',
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      // Mouse hover opens; touch opens on tap and stays open (like iOS sticky hover) until
      // another card or the page is tapped.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") request(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") request(false);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") request(true);
      }}
      onFocus={() => request(true)}
      onBlur={() => request(false)}
    >
      {/* Background image, zoomed from the centre when open. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={false}
        animate={{ scale: active ? OPEN.backgroundScale : 1 }}
        transition={transition}
        style={{
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Cut-out photo: hidden behind the folder front until it lifts out. */}
      <motion.img
        src={image}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute select-none"
        initial={false}
        animate={{
          y: active ? OPEN.imageLift : 0,
          rotate: active ? OPEN.imageRotate : 0,
        }}
        transition={transition}
        style={{
          width: 240,
          aspectRatio: String(imageAspectRatio),
          top: 130,
          left: "50%",
          marginLeft: -120,
          objectFit: "cover",
        }}
      />

      {/* Folder: the tab (150x32 at x=10) and the front, which starts 30px below the tab top. */}
      <motion.div
        aria-hidden
        className="absolute left-0 w-full"
        initial={false}
        animate={{ y: active ? OPEN.drop : 0 }}
        transition={transition}
        style={{ top: 80, height: height + OPEN.drop, zIndex: 0 }}
      >
        <svg
          className="absolute"
          style={{ left: 10, top: 0, zIndex: 1 }}
          width={150}
          height={32}
          viewBox="0 0 150 32"
          overflow="visible"
        >
          <path d={TAB_PATH} fill={folderColor} />
        </svg>
        <div
          className="absolute"
          style={{
            top: 30,
            left: 10,
            right: 10,
            bottom: 0,
            backgroundColor: folderColor,
            borderTopRightRadius: 20,
            zIndex: 1,
          }}
        />
      </motion.div>

      {/* Title and description stay pinned to the bottom. */}
      <div
        className="absolute flex flex-col items-start"
        style={{ left: 30, right: 30, bottom: 30, gap: 6, zIndex: 2 }}
      >
        <p
          className="m-0 w-full"
          style={{ color: titleColor, fontSize: 16, fontWeight: 500, lineHeight: "1.2em" }}
        >
          {title}
        </p>
        <p
          className="m-0 w-full"
          style={{ color: descriptionColor, fontSize: 14, fontWeight: 300, lineHeight: "1.2em" }}
        >
          {description}
        </p>
      </div>

      <motion.p
        aria-hidden
        className="absolute m-0 whitespace-pre"
        initial={false}
        animate={{ y: active ? OPEN.drop : 0 }}
        transition={transition}
        style={{
          top: 100,
          zIndex: 2,
          left: 30,
          color: numberColor,
          fontSize: 56,
          fontWeight: 500,
          lineHeight: "1.2em",
        }}
      >
        {number}
      </motion.p>

      <motion.span
        aria-hidden
        className="absolute block"
        initial={false}
        animate={{ y: active ? OPEN.drop : 0 }}
        transition={transition}
        style={{ top: 130, right: 30, width: 24, height: 24, zIndex: 2 }}
      >
        <ArrowUpRight color={iconColor} />
      </motion.span>

      {/* Frame drawn over everything, inside the rounded clip. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ border: `${borderWidth}px solid ${borderColor}`, borderRadius: "inherit" }}
      />
    </Root>
  );
}

/** The three demo cards from the original site. */
const DEFAULT_FOLDER_CARDS: FolderCardData[] = [
  {
    number: "01",
    title: "Simple and easy to use",
    description: "Fully customize to suit your needs",
    backgroundImage:
      "https://framerusercontent.com/images/TwnkNQFLEWNpmIu3nEzVRCas.jpg?scale-down-to=1024",
    image: "https://framerusercontent.com/images/IEOBUuCEauHSXD3htblRUSpMTA.png",
    imageAspectRatio: 489 / 409,
    folderColor: "rgb(4, 0, 74)",
    borderColor: "rgb(1, 0, 38)",
  },
  {
    number: "02",
    title: "Number two for example",
    description: "The description of the second example is still easy to add",
    backgroundImage:
      "https://framerusercontent.com/images/P6uKOhwaryAj0oyu6cfF4jOg5wI.jpg?scale-down-to=1024",
    image: "https://framerusercontent.com/images/gJjCI4eGnogbGVLXSSbvyN1E.png?scale-down-to=512",
    imageAspectRatio: 1,
    folderColor: "rgb(228, 231, 237)",
    borderColor: "rgb(193, 207, 222)",
    numberColor: "rgb(18, 18, 18)",
    titleColor: "rgb(18, 18, 18)",
    descriptionColor: "rgba(18, 18, 18, 0.8)",
    iconColor: "rgb(18, 18, 18)",
  },
  {
    number: "03",
    title: "The third number, which shows ease of use",
    description:
      "This description needs to be made larger to show how easily the space can be filled.",
    backgroundImage:
      "https://framerusercontent.com/images/1SHK7I3Fjkd0j1mUG6Xn4FBHCCc.jpg?scale-down-to=1024",
    image: "https://framerusercontent.com/images/fccWkurPA6PVKME92PhC1om4LF4.png",
    imageAspectRatio: 715 / 734,
    folderColor: "rgb(16, 27, 33)",
    borderColor: "rgb(2, 4, 5)",
  },
];

export interface CardsFolderProps {
  cards?: FolderCardData[];
  /** Space between cards in px. */
  gap?: number;
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

/**
 * A row of folder cards (fonts: the original loads Inter Medium and Inter Light from Framer's
 * font CDN). One card is open at a time: the hovered one with a mouse, the last tapped one on
 * touch, the focused one from the keyboard.
 */
export function CardsFolder({
  cards = DEFAULT_FOLDER_CARDS,
  gap = 10,
  cardWidth = 300,
  cardHeight = 400,
  className,
}: CardsFolderProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // A tap outside the row closes the open card (touch has no pointerleave to do it).
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("flex flex-row flex-wrap items-center justify-center", className)}
      style={{ gap }}
    >
      {cards.map((card, index) => (
        <FolderCard
          key={`${card.number}-${index}`}
          {...card}
          width={cardWidth}
          height={cardHeight}
          active={activeIndex === index}
          onActiveChange={(next) =>
            setActiveIndex((current) => (next ? index : current === index ? null : current))
          }
        />
      ))}
    </div>
  );
}

export default CardsFolder;
