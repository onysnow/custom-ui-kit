import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Every hover change inside a project row: 0.8s, ease cubic-bezier(0.25, 0.1, 0.25, 1). */
const HOVER_TRANSITION = { type: "tween", duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } as const;
const HOVER_CSS = "0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";

/** Narrower than this the list shrinks to chips pinned bottom-left ("Mobile" variant). */
const MOBILE_BELOW = 520;

// Space Grotesk 500 for the index, Playfair Display 400 for the name (Google Fonts).
const NUMBER_FONT = '"Space Grotesk", "Space Grotesk Placeholder", sans-serif';
const NAME_FONT = '"Playfair Display", "Playfair Display Placeholder", serif';

export interface ProjectHoverItem {
  name: string;
  /** Picture shown full-bleed behind the list while the row is hovered. */
  image: string;
  href?: string;
  openInNewTab?: boolean;
}

const DEFAULT_PROJECTS: ProjectHoverItem[] = [
  {
    name: "Mercer",
    image:
      "https://framerusercontent.com/images/vOs0fIm9Oo47UrbF8K9uLRDF0VA.png?width=2400&height=1372",
  },
  {
    name: "Lumina",
    image:
      "https://framerusercontent.com/images/wupFaWcwVEo0LXOGOqwQFPgUMEw.png?width=2400&height=1346",
  },
  {
    name: "Cascadia",
    image:
      "https://framerusercontent.com/images/MjVWvLuTuXIHyOyO6MvhO4QUvQQ.png?width=2400&height=1372",
  },
  {
    name: "Laurel",
    image:
      "https://framerusercontent.com/images/iMQXDmeLO4raDrgMvgN3NJlxBU.png?width=2400&height=1600",
  },
  {
    name: "Palisades",
    image:
      "https://framerusercontent.com/images/h7EpqHoQmA8vMHhHrrpGpFg9ncY.png?width=2400&height=1316",
  },
];

export interface NoiseGrainProps {
  /** Pixels per side of the repeating noise tile. */
  tile?: number;
  /** Distinct noise frames cycled through. */
  frames: number;
  /** Frames shown per second. */
  fps: number;
  /** Turns the animation off and shows one frame. */
  still?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Film grain: a sprite of `frames` random grey tiles drawn once on a canvas, then stepped through
 * with a background-position animation. Pointer events pass through it.
 */
export function NoiseGrain({
  tile = 96,
  frames,
  fps,
  still = false,
  className,
  style,
}: NoiseGrainProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [sprite, setSprite] = useState<string>();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = tile;
    canvas.height = tile * frames;
    const context = canvas.getContext("2d");
    if (!context) return;
    const image = context.createImageData(tile, tile * frames);
    for (let i = 0; i < image.data.length; i += 4) {
      const value = Math.floor(Math.random() * 256);
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    setSprite(canvas.toDataURL("image/png"));
  }, [tile, frames]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !sprite || still) return;
    const animation = element.animate(
      [{ backgroundPosition: "0px 0px" }, { backgroundPosition: `0px ${-tile * frames}px` }],
      { duration: (frames / fps) * 1000, iterations: Infinity, easing: `steps(${frames})` },
    );
    return () => animation.cancel();
  }, [sprite, still, tile, frames, fps]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        backgroundImage: sprite ? `url(${sprite})` : undefined,
        backgroundSize: `${tile}px ${tile * frames}px`,
        backgroundRepeat: "repeat",
        ...style,
      }}
    />
  );
}

/** White arrow (line + chevron) of the original, drawn inline. */
function Arrow() {
  return (
    <svg viewBox="0 0 384 320" fill="none" aria-hidden className="block h-5 w-6">
      <path
        fill="#fff"
        d="M0 159.996a16 16 0 0 1 16-16h352c4.243 0 8.313 1.686 11.314 4.686a16.004 16.004 0 0 1 0 22.628A16 16 0 0 1 368 175.996H16a16 16 0 0 1-16-16"
      />
      <path
        fill="#fff"
        d="M212.688 4.685a16 16 0 0 1 22.624 0l144 144a15.997 15.997 0 0 1 0 22.624l-144 144a16.002 16.002 0 0 1-27.114-11.37 16 16 0 0 1 4.49-11.254l132.688-132.688L212.688 27.309a16 16 0 0 1 0-22.624"
      />
    </svg>
  );
}

interface RowProps {
  project: ProjectHoverItem;
  number: string;
  mobile: boolean;
  reduced: boolean;
  onHover: () => void;
}

function ProjectRow({ project, number, mobile, reduced, onHover }: RowProps) {
  const [hovered, setHovered] = useState(false);
  const on = hovered && !mobile;
  const transition = reduced ? { duration: 0 } : HOVER_TRANSITION;
  const colorTransition = reduced ? undefined : `color ${HOVER_CSS}`;
  const textColor = on ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)";

  return (
    <motion.a
      href={project.href}
      target={project.openInNewTab ? "_blank" : undefined}
      rel={project.openInNewTab ? "noopener noreferrer" : undefined}
      onMouseEnter={() => {
        setHovered(true);
        if (!mobile) onHover();
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setHovered(true);
        if (!mobile) onHover();
      }}
      onBlur={() => setHovered(false)}
      className={cn(
        "relative flex flex-row items-center overflow-clip no-underline outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-inset",
        mobile
          ? "h-min w-min justify-start gap-5 px-6 py-[15px]"
          : "h-px w-full flex-[1_0_0px] cursor-pointer justify-start gap-5 px-10",
      )}
    >
      {/* White plate; on hover it slides out to the left to uncover the photograph behind. */}
      <motion.div
        aria-hidden
        className="absolute top-0 bottom-0 z-0 bg-white"
        style={{ left: 0, width: mobile ? 586 : "100%" }}
        initial={false}
        animate={on ? { left: -40, width: "1%" } : { left: 0, width: mobile ? 586 : "100%" }}
        transition={transition}
      />

      <div
        className={cn(
          "relative z-[2] flex min-w-0 flex-col items-start justify-center overflow-clip",
          mobile ? "w-min gap-1.5" : "w-px flex-[1_0_0px] gap-2",
        )}
      >
        <span
          className="block text-base leading-none font-medium tracking-[0.15em] whitespace-pre opacity-40 max-[1199px]:text-xs"
          style={{ fontFamily: NUMBER_FONT, color: textColor, transition: colorTransition }}
        >
          {number}
        </span>
        <span
          className="block text-[44px] leading-none font-normal tracking-[-0.05em] whitespace-pre max-[1199px]:text-[28px]"
          style={{ fontFamily: NAME_FONT, color: textColor, transition: colorTransition }}
        >
          {project.name}
        </span>
      </div>

      {!mobile && (
        <motion.div
          aria-hidden
          className="relative z-[2] flex w-min flex-row items-center justify-center"
          initial={false}
          animate={{ opacity: on ? 1 : 0, gap: on ? 0 : 10 }}
          transition={transition}
        >
          <motion.div
            className="origin-center"
            initial={false}
            animate={{ scale: on ? 1 : 0.9 }}
            transition={transition}
          >
            <Arrow />
          </motion.div>
          <div className="w-px flex-none self-stretch" />
        </motion.div>
      )}
    </motion.a>
  );
}

export interface ProjectHoverProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Up to any number of projects; the first one's picture shows until a row is hovered. */
  projects?: ProjectHoverItem[];
  /**
   * "list": a 30%-wide column of full-height rows beside the photograph.
   * "chips": small white chips pinned to the bottom-left; hover does nothing.
   * "auto" switches to chips when narrower than 520px.
   */
  layout?: "auto" | "list" | "chips";
  /** Film grain over the list (4%) and over the whole component (7%, overlay blend). */
  grain?: boolean;
  /** Index of the project whose picture shows at first. */
  defaultActiveIndex?: number;
  onActiveChange?: (index: number) => void;
}

/**
 * A list of project names over a full-bleed photograph. Hovering a row swaps the photograph to
 * that project's, slides the row's white plate away, turns its text white and draws an arrow.
 */
export function ProjectHover({
  projects = DEFAULT_PROJECTS,
  layout = "auto",
  grain = true,
  defaultActiveIndex = 0,
  onActiveChange,
  className,
  ...props
}: ProjectHoverProps) {
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [active, setActive] = useState(defaultActiveIndex);
  const mobile = layout === "chips" || (layout === "auto" && narrow);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || layout !== "auto") return;
    const observer = new ResizeObserver((entries) =>
      setNarrow((entries[0]?.contentRect.width ?? Infinity) < MOBILE_BELOW),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [layout]);

  return (
    <div
      {...props}
      ref={rootRef}
      className={cn(
        "relative flex h-[800px] w-full overflow-clip",
        mobile ? "items-end justify-start" : "items-center justify-start gap-2.5",
        className,
      )}
    >
      {/* All photographs stay mounted so a swap is instant; only the active one is visible. */}
      {projects.map((project, index) => (
        <img
          key={project.image}
          src={project.image}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover brightness-[0.7]"
          style={{ opacity: index === active ? 1 : 0 }}
        />
      ))}

      <div
        className={cn(
          "relative z-[3] flex flex-col items-start justify-start overflow-clip",
          mobile ? "h-min w-min gap-[5px]" : "h-full w-[30%] gap-0",
        )}
      >
        {projects.map((project, index) => (
          <ProjectRow
            key={project.name + index}
            project={project}
            number={String(index + 1).padStart(2, "0")}
            mobile={mobile}
            reduced={reduced}
            onHover={() => {
              if (index === active) return;
              setActive(index);
              onActiveChange?.(index);
            }}
          />
        ))}
        {grain && (
          <NoiseGrain frames={12} fps={16} still={reduced} className="z-[1] opacity-[0.04]" />
        )}
      </div>

      {grain && (
        <NoiseGrain
          frames={10}
          fps={12}
          still={reduced}
          className="z-[2] opacity-[0.07] mix-blend-overlay"
        />
      )}
    </div>
  );
}

export default ProjectHover;
