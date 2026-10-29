import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const INTER = 'Inter, "Inter Placeholder", system-ui, sans-serif'; // Inter 500/600 (Framer-hosted webfont)

/** The preview card eases with a critically damped spring of 0.6s. */
const PREVIEW_SPRING = { type: "spring", bounce: 0, duration: 0.6 } as const;
/** The details card uses a slightly bouncy 0.4s spring. */
const DETAILS_SPRING = { type: "spring", bounce: 0.2, duration: 0.4 } as const;

/** Narrower than this the two halves stack ("Phone" variant). */
const STACK_BELOW = 600;

/**
 * 32px corners shaped as a superellipse where the browser supports `corner-shape`; browsers
 * without it get a radius scaled by 0.752, as the original does, to look as round.
 */
const CORNERS =
  "rounded-[calc(32px*0.752)] supports-[corner-shape:superellipse(1.5)]:rounded-[32px] supports-[corner-shape:superellipse(1.5)]:[corner-shape:superellipse(1.5)]";

export interface ProjectSplitCardProps extends Omit<
  React.ComponentProps<"a">,
  "title" | "children"
> {
  /** Picture of the project on the large card. */
  imagePreview?: string;
  /** Project name over the picture. */
  textTitle?: string;
  /** Industry line under the name. */
  textIndustry?: string;
  /** The four right-aligned category lines of the details card. */
  categories?: [string, string, string, string] | string[];
  /** Logo at the bottom of the details card. */
  brandIcon?: string;
  /** Paragraph at the bottom of the details card. */
  textDescription?: string;
  /**
   * "row": preview (two thirds) beside details (one third).
   * "column": preview (60%) above details (40%).
   * "auto" stacks when the card is narrower than 600px.
   */
  layout?: "auto" | "row" | "column";
}

function PreviewCard({
  image,
  title,
  industry,
  active,
  reduced,
}: {
  image: string;
  title: string;
  industry: string;
  active: boolean;
  reduced: boolean;
}) {
  const transition = reduced ? { duration: 0 } : PREVIEW_SPRING;
  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-row items-end justify-start overflow-clip bg-white p-6",
        CORNERS,
      )}
    >
      <div className="absolute inset-0 z-[1] overflow-clip">
        <motion.img
          src={image}
          alt=""
          draggable={false}
          className="absolute inset-0 z-[1] h-full w-full object-cover select-none"
          initial={false}
          animate={{ rotate: active ? -5 : 0, scale: active ? 1.4 : 1 }}
          transition={transition}
        />
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background: "linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 38%)",
          }}
        />
      </div>
      <div className="relative z-[2] flex w-min flex-col items-start justify-center gap-2 text-white">
        <p
          className="m-0 text-[32px] font-semibold whitespace-pre"
          style={{ fontFamily: INTER, lineHeight: "1.2em" }}
        >
          {title}
        </p>
        <p
          className="m-0 text-sm font-medium whitespace-pre"
          style={{ fontFamily: INTER, lineHeight: "1.2em" }}
        >
          {industry}
        </p>
      </div>
    </div>
  );
}

function DetailsCard({
  categories,
  brandIcon,
  description,
  active,
  reduced,
}: {
  categories: string[];
  brandIcon: string;
  description: string;
  active: boolean;
  reduced: boolean;
}) {
  const transition = reduced ? { duration: 0 } : DETAILS_SPRING;
  return (
    <motion.div
      className={cn(
        "relative flex h-full min-w-0 flex-col items-center justify-between overflow-clip p-6",
        CORNERS,
      )}
      initial={false}
      animate={{ backgroundColor: active ? "rgb(170, 231, 242)" : "rgb(245, 245, 245)" }}
      transition={transition}
    >
      {/* Hairline frame, drawn above the content like the original's ::after, fading out on hover. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 box-border border-[0.5px] border-solid"
        style={{ borderRadius: "inherit" }}
        initial={false}
        animate={{ borderColor: active ? "rgba(34, 34, 34, 0)" : "rgb(34, 34, 34)" }}
        transition={transition}
      />
      <div className="relative flex w-full flex-col items-end justify-center gap-2">
        {categories.map((category, index) => (
          <p
            key={index}
            className="m-0 w-full text-right text-sm font-medium break-words whitespace-pre-wrap"
            style={{ fontFamily: INTER, lineHeight: "1.2em", color: "rgb(84, 84, 84)" }}
          >
            {category}
          </p>
        ))}
      </div>
      <div className="relative flex w-full flex-col items-start justify-center gap-[22px]">
        <img
          src={brandIcon}
          alt=""
          draggable={false}
          className="size-[34px] flex-none object-cover"
        />
        <p
          className="m-0 w-full text-sm font-medium break-words whitespace-pre-wrap text-black"
          style={{ fontFamily: INTER, lineHeight: "1.5em", textWrap: "balance" }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * A link made of two cards: a large picture card and a narrow details card. Hovering or pressing
 * anywhere on it zooms and tilts the picture while the details card turns light blue.
 */
export function ProjectSplitCard({
  imagePreview = "https://framerusercontent.com/images/KzWYk0eAjZ2ODM05hoTBS2XeI.jpeg?width=1316&height=1187",
  textTitle = "Luma Tech",
  textIndustry = "SaaS Platform",
  categories = ["Web Experience", "UI Systems", "Brand Guidelines", "Framer Development"],
  brandIcon = "https://framerusercontent.com/images/B00RZaWioQ3RGArHmXWSFMjkZB8.png?width=500&height=500",
  textDescription = "Luma Tech is a modern SaaS platform focused on building scalable digital experiences through clean interfaces, structured workflows, and responsive interaction systems for growing businesses.",
  layout = "auto",
  className,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  ...props
}: ProjectSplitCardProps) {
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLAnchorElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const stacked = layout === "column" || (layout === "auto" && narrow);
  const active = hovered || pressed || focused;

  useEffect(() => {
    const element = rootRef.current;
    if (!element || layout !== "auto") return;
    const observer = new ResizeObserver((entries) =>
      setNarrow((entries[0]?.contentRect.width ?? Infinity) < STACK_BELOW),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [layout]);

  return (
    <a
      {...props}
      ref={rootRef}
      className={cn(
        "relative flex w-full max-w-[900px] cursor-pointer items-center justify-center gap-2 overflow-clip no-underline outline-none focus-visible:ring-2 focus-visible:ring-black/60",
        stacked ? "h-[900px] flex-col overflow-auto" : "h-[500px] flex-row",
        className,
      )}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        setPressed(false);
        onPointerLeave?.(event);
      }}
      onPointerDown={(event) => {
        setPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setPressed(false);
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        setPressed(false);
        onPointerCancel?.(event);
      }}
      onFocus={(event) => {
        setFocused(event.currentTarget.matches(":focus-visible"));
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    >
      <div
        className="min-h-0 min-w-0"
        style={
          stacked
            ? { flex: "1.5 0 0px", width: "100%", height: 1 }
            : { flex: "2 0 0px", height: "100%", width: 1 }
        }
      >
        <PreviewCard
          image={imagePreview}
          title={textTitle}
          industry={textIndustry}
          active={active}
          reduced={reduced}
        />
      </div>
      <div
        className="min-h-0 min-w-0"
        style={
          stacked
            ? { flex: "1 0 0px", width: "100%", height: 1 }
            : { flex: "1 0 0px", height: "100%", width: 1 }
        }
      >
        <DetailsCard
          categories={categories}
          brandIcon={brandIcon}
          description={textDescription}
          active={active}
          reduced={reduced}
        />
      </div>
    </a>
  );
}

export default ProjectSplitCard;
