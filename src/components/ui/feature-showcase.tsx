import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import { FeatureShowcaseProgress } from "@/components/ui/feature-showcase-progress";
import { cn } from "@/lib/utils";

/** Every state change (image cross-fade, heading colour, copy opacity) uses this tween. */
const SWAP: Transition = { type: "tween", duration: 0.55, ease: [0.22, 1, 0.36, 1] };
/** Button hover: dims to 85% with a light spring. */
const BUTTON_HOVER: Transition = { type: "spring", duration: 0.4, bounce: 0.2 };

// The original loads "Inter Display" (500) for headings/buttons and "Inter" (400) for body copy.
const DISPLAY_FONT = '"Inter Display", Inter, system-ui, sans-serif';
const BODY_FONT = "Inter, system-ui, sans-serif";

export interface ShowcaseFeature {
  /** Heading; use "\n" for a line break. */
  title: string;
  description: string;
  /** Label of the pill button under the copy. */
  cta: string;
  /** Makes the pill an anchor instead of a button. */
  ctaHref?: string;
  onCtaClick?: () => void;
  /** Preview image shown (and cross-faded in) while this feature is active. */
  image: string;
  imageAlt?: string;
}

export const DEFAULT_FEATURES: ShowcaseFeature[] = [
  {
    title: "Less noise. More focus.\nMore clarity. More flow.",
    description:
      "Bring projects and priorities into one clear space. Keep your next steps focused and easy to follow. Turn scattered plans into steady, lasting progress.",
    cta: "Learn more",
    image:
      "https://framerusercontent.com/images/BRqgFFbvLw3ilMXnPVonIGrXOQ.png?width=1344&height=896",
  },
  {
    title: "Work better together.\nBuild better together.",
    description:
      "Keep your ideas and conversations in one place. Share clear context and give valuable feedback. Turn a shared direction into confident decisions.",
    cta: "Start now",
    image:
      "https://framerusercontent.com/images/12yzuMWOuyhMq2pXyVdNjPIBj0.png?width=1344&height=896",
  },
  {
    title: "View your progress.\nFind your next step.",
    description:
      "See your progress and what needs focus now. Bring priorities and team workload into focus. Find the clarity to make your next move easier.",
    cta: "Start now",
    image:
      "https://framerusercontent.com/images/6JRVxrWi9g9CAdumAYN3Bdew.png?width=1344&height=896",
  },
];

export interface FeatureShowcaseProps extends Omit<React.ComponentProps<"section">, "children"> {
  /** One entry per scroll section (and per preview image). */
  features?: ShowcaseFeature[];
  /** Feature that is active before any scrolling. */
  defaultStep?: number;
  /** Fires when scrolling (or the progress bar) activates another feature. */
  onStepChange?: (step: number) => void;
  /** Progress bar fill colour. */
  progressFill?: string;
  /** Progress bar track colour. */
  progressTrack?: string;
  /** Where the active section is measured: the middle of the preview stage, or of the viewport. */
  anchorMode?: "preview" | "viewport";
  /** Anchor position in percent of the preview stage / viewport height. */
  anchor?: number;
}

/** Heading text with "\n" turned into <br />. */
function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, index, all) => (
    <span key={index}>
      {line}
      {index < all.length - 1 && <br />}
    </span>
  ));
}

/**
 * Sticky-scroll feature showcase: a preview image and a segmented progress bar stay pinned on
 * the left while three text sections scroll past on the right. The section under the anchor
 * line becomes the active feature; its image fades in and its copy lights up.
 */
export function FeatureShowcase({
  features = DEFAULT_FEATURES,
  defaultStep = 0,
  onStepChange,
  progressFill = "rgb(255, 255, 255)",
  progressTrack = "rgba(255, 255, 255, 0.06)",
  anchorMode = "preview",
  anchor = 50,
  className,
  style,
  ...props
}: FeatureShowcaseProps) {
  const [step, setStep] = useState(defaultStep);
  const reduce = useReducedMotion();
  const swap: Transition = reduce ? { duration: 0 } : SWAP;
  const stage = useRef<HTMLDivElement>(null);
  const sections = useRef<Array<HTMLElement | null>>([]);

  const handleStep = useCallback(
    (next: number) => {
      setStep(next);
      onStepChange?.(next);
    },
    [onStepChange],
  );

  const getAnchorY = useCallback(() => {
    const rect = stage.current?.getBoundingClientRect();
    if (anchorMode === "preview" && rect && rect.height > 0) {
      return rect.top + (rect.height * anchor) / 100;
    }
    return ((window.visualViewport?.height || window.innerHeight) * anchor) / 100;
  }, [anchor, anchorMode]);

  const getSections = useCallback(() => sections.current, []);

  return (
    <section
      aria-label="Feature showcase"
      {...props}
      className={cn("relative flex items-start", className)}
      style={{
        width: "100%",
        maxWidth: 1120,
        gap: 80,
        padding: 48,
        backgroundColor: "rgb(0, 0, 0)",
        color: "rgb(255, 255, 255)",
        ...style,
      }}
    >
      {/* Sticky preview: image stage (389px, images sit 40px down) + progress bar (40px). */}
      <div className="sticky flex flex-none flex-col" style={{ top: 64, width: 511, gap: 6 }}>
        <div
          ref={stage}
          role="group"
          aria-label="Showcase preview"
          className="relative w-full"
          style={{ height: 389, backgroundColor: "rgb(0, 0, 0)" }}
        >
          {features.map((feature, index) => (
            <motion.img
              key={index}
              src={feature.image}
              alt={feature.imageAlt ?? ""}
              draggable={false}
              className="absolute left-0 w-full object-cover"
              style={{ top: 40, height: 341, borderRadius: 16 }}
              initial={false}
              animate={{ opacity: index === step ? 1 : 0 }}
              transition={swap}
            />
          ))}
        </div>
        <div className="w-full" style={{ height: 40 }}>
          <FeatureShowcaseProgress
            count={features.length}
            currentStep={step}
            onStepChange={handleStep}
            getSections={getSections}
            getAnchorY={getAnchorY}
            fill={progressFill}
            track={progressTrack}
          />
        </div>
      </div>

      {/* Scrolling copy: three 480px sections, copy vertically centred in each. */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {features.map((feature, index) => {
          const active = index === step;
          return (
            <section
              key={index}
              ref={(node) => {
                sections.current[index] = node;
              }}
              aria-label={`Showcase feature: ${feature.title.split("\n")[0]}`}
              className="relative flex w-full flex-col justify-center"
              style={{ height: 480, padding: "48px 0 64px" }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0"
                style={{ height: 1, backgroundColor: "rgba(255, 255, 255, 0.06)" }}
              />
              <div className="relative flex w-full flex-col items-start" style={{ gap: 22 }}>
                <motion.h2
                  className="m-0 w-full"
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontSize: 32,
                    fontWeight: 500,
                    letterSpacing: "-0.035em",
                    lineHeight: "1.12em",
                    textWrap: "balance",
                  }}
                  initial={false}
                  animate={{ color: active ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.7)" }}
                  transition={swap}
                >
                  <Lines text={feature.title} />
                </motion.h2>
                <motion.p
                  className="m-0 w-full"
                  style={{
                    maxWidth: 380,
                    fontFamily: BODY_FONT,
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: "1.5em",
                    color: "rgba(255, 255, 255, 0.7)",
                    textWrap: "balance",
                  }}
                  initial={false}
                  animate={{ opacity: active ? 1 : 0.82 }}
                  transition={swap}
                >
                  {feature.description}
                </motion.p>
                <CtaButton feature={feature} />
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

/** Dark pill that dims slightly on hover. */
function CtaButton({ feature }: { feature: ShowcaseFeature }) {
  const reduce = useReducedMotion();
  const shared = {
    className:
      "inline-flex w-min cursor-pointer items-center whitespace-pre border-0 no-underline outline-offset-2 focus-visible:outline-2 focus-visible:outline-white",
    style: {
      padding: "10px 16px",
      borderRadius: 435,
      backgroundColor: "rgb(43, 43, 43)",
      color: "rgb(255, 255, 255)",
      fontFamily: DISPLAY_FONT,
      fontSize: 16,
      fontWeight: 500,
      letterSpacing: "-0.015em",
      lineHeight: "1.12em",
    },
    whileHover: { opacity: 0.85, transition: reduce ? { duration: 0 } : BUTTON_HOVER },
  } as const;

  return feature.ctaHref ? (
    <motion.a {...shared} href={feature.ctaHref} onClick={feature.onCtaClick}>
      {feature.cta}
    </motion.a>
  ) : (
    <motion.button {...shared} type="button" onClick={feature.onCtaClick}>
      {feature.cta}
    </motion.button>
  );
}

export default FeatureShowcase;
