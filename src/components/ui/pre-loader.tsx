import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Easing of the exit (a slow start with a hair of overshoot): cubic-bezier(0.96, -0.02, 0.38, 1.01). */
const EXIT_TRANSITION = { type: "tween", duration: 1, ease: [0.96, -0.02, 0.38, 1.01] } as const;
/** Easing of every entrance, an ease-in-out that is symmetrical about the midpoint. */
const ENTRANCE_EASE = [0.8, 0.2, 0.2, 0.8] as const;
const ENTRANCE_DURATION = 1.8;

/**
 * The white backdrop travels 1400px up on a 834px-high canvas (about 168% of its own height),
 * so it is fully clear of the frame at the end of the exit.
 */
const EXIT_BACKDROP_Y = "-168%";
/** Filter applied to the content while the backdrop leaves. */
const EXIT_BLUR = "blur(8px)";

export interface PreLoaderImage {
  src: string;
  alt?: string;
  /** Horizontal centre of the picture, as a percentage of the width of the loader. */
  x: number;
  /** Vertical centre of the picture, as a percentage of the height of the loader. */
  y: number;
  /** Resting rotation in degrees. */
  rotate: number;
  /** Rotation it starts from in degrees. */
  fromRotate: number;
  /** Distance in px it starts below its resting place. */
  fromY: number;
  /** Seconds before it starts flying in. */
  delay: number;
  /** Pictures flagged as "side" are the ones hidden by `sideImagesVisible={false}`. */
  side?: boolean;
}

const DEFAULT_IMAGES: PreLoaderImage[] = [
  {
    src: "https://framerusercontent.com/images/pE1kDlzZIQL08N7do8peogJ2ZQ.jpg",
    alt: "speaker with a half white half green background",
    x: 25,
    y: 37.52997601918467,
    rotate: -10,
    fromRotate: -2,
    fromY: 480,
    delay: 0,
    side: true,
  },
  {
    src: "https://framerusercontent.com/images/cKvzUgY1xOODK7lAFkV2q5SrI4.png",
    alt: "futuristic robot with a grey background",
    x: 50,
    y: 18.585131894484437,
    rotate: 0,
    fromRotate: 0,
    fromY: 680,
    delay: 0.2,
  },
  {
    src: "https://framerusercontent.com/images/yqgeFlsSXib7Trr10tG9EsBXhM.png",
    alt: "abstract orange butterfly with a light blue background",
    x: 75,
    y: 37.52997601918467,
    rotate: 10,
    fromRotate: 2,
    fromY: 480,
    delay: 0.4,
    side: true,
  },
  {
    src: "https://framerusercontent.com/images/wbrWTnwMksIfSq6mqrHJeGkabWg.png",
    alt: "white oval shape with a black background",
    x: 31.25,
    y: 74.8201438848921,
    rotate: 10,
    fromRotate: -5,
    fromY: 360,
    delay: 0.6,
  },
  {
    src: "https://framerusercontent.com/images/2aKuT0roruNaxlaUN4NUiRIU.png",
    alt: "material samples on a grey surface",
    x: 68.75,
    y: 74.8201438848921,
    rotate: -10,
    fromRotate: 5,
    fromY: 360,
    delay: 0.8,
  },
];

export interface PreLoaderProps extends Omit<React.ComponentProps<"section">, "children"> {
  /** Word shown in the middle once the pictures have landed. */
  title?: string;
  /** Pictures that fly in, in the order they appear. */
  images?: PreLoaderImage[];
  /** Shows the pictures flagged as "side" (the two beside the top-centre one). */
  sideImagesVisible?: boolean;
  /** Backdrop colour that slides away. */
  backgroundColor?: string;
  /** Text colour of the title. */
  textColor?: string;
  /**
   * Milliseconds after mounting before the exit starts. `null` keeps the loader open until
   * `exited` is set.
   */
  exitDelay?: number | null;
  /** Controls the exit from outside; when omitted the loader exits by itself after `exitDelay`. */
  exited?: boolean;
  /** Called once the backdrop has fully left. */
  onExited?: () => void;
}

/**
 * Full-bleed intro: five pictures rise from below and settle at a tilt one after another, the
 * title rises last, then the content blurs out while the white backdrop slides off the top.
 * Remount it (change its `key`) to play the sequence again.
 */
export function PreLoader({
  title = "Pre Studio",
  images = DEFAULT_IMAGES,
  sideImagesVisible = true,
  backgroundColor = "rgb(255, 255, 255)",
  textColor = "rgb(0, 0, 0)",
  exitDelay = 2500,
  exited,
  onExited,
  className,
  style,
  ...props
}: PreLoaderProps) {
  const reducedMotion = useReducedMotion();
  const [autoExited, setAutoExited] = useState(false);
  const isExited = exited ?? autoExited;

  useEffect(() => {
    if (exited !== undefined || exitDelay === null) return;
    const timer = window.setTimeout(() => setAutoExited(true), exitDelay);
    return () => window.clearTimeout(timer);
  }, [exited, exitDelay]);

  const exit = reducedMotion ? { ...EXIT_TRANSITION, duration: 0.4 } : EXIT_TRANSITION;

  return (
    <section
      {...props}
      aria-busy={!isExited}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden",
        className,
      )}
      style={{ pointerEvents: isExited ? "none" : undefined, ...style }}
    >
      <motion.div
        className="absolute top-0 left-0 flex h-full w-full justify-center"
        style={{ backgroundColor }}
        initial={false}
        animate={
          reducedMotion ? { opacity: isExited ? 0 : 1 } : { y: isExited ? EXIT_BACKDROP_Y : 0 }
        }
        transition={exit}
        onAnimationComplete={() => {
          if (isExited) onExited?.();
        }}
      >
        <motion.div
          className="relative flex h-full flex-1 flex-col items-center justify-center"
          initial={false}
          animate={{
            filter: isExited ? EXIT_BLUR : "blur(0px)",
            opacity: isExited ? 0 : 1,
          }}
          transition={exit}
        >
          {images.map((image) =>
            image.side && !sideImagesVisible ? null : (
              <motion.img
                key={image.src}
                src={image.src}
                alt={image.alt ?? ""}
                draggable={false}
                className="absolute z-[1] h-[200px] w-[180px] rounded-[10px] object-cover select-none"
                style={{
                  left: `calc(${image.x}% - 90px)`,
                  top: `calc(${image.y}% - 100px)`,
                  boxShadow: "0px 4px 16px 2px rgba(0, 0, 0, 0.15)",
                }}
                initial={
                  reducedMotion
                    ? { opacity: 0.001, rotate: image.rotate }
                    : { opacity: 0.001, y: image.fromY, rotate: image.fromRotate }
                }
                animate={{ opacity: 1, y: 0, rotate: image.rotate }}
                transition={{
                  type: "tween",
                  duration: reducedMotion ? 0.4 : ENTRANCE_DURATION,
                  ease: ENTRANCE_EASE,
                  delay: reducedMotion ? 0 : image.delay,
                }}
              />
            ),
          )}

          {/* Rises last, after the five pictures; the pictures sit above it in the paint order. */}
          <motion.p
            className="absolute m-0 whitespace-pre"
            style={{
              left: "50%",
              top: "50%",
              color: textColor,
              fontFamily: '"Instrument Serif", "Instrument Serif Placeholder", serif', // Google Fonts: Instrument Serif italic
              fontSize: 44,
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: "1.2em",
            }}
            transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
            initial={{ opacity: 0.001, y: reducedMotion ? 0 : 600 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "tween",
              duration: reducedMotion ? 0.4 : ENTRANCE_DURATION,
              ease: ENTRANCE_EASE,
              delay: reducedMotion ? 0 : 1.3,
            }}
          >
            {title}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default PreLoader;
