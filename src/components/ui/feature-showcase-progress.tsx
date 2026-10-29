import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export interface FeatureShowcaseProgressProps {
  /** Number of segments (one per feature section). */
  count: number;
  /** Index of the section that is currently active. */
  currentStep: number;
  /** Called when scrolling moves the anchor line into another section. */
  onStepChange: (step: number) => void;
  /** Returns the feature section elements, in order. Called on every measurement. */
  getSections: () => Array<HTMLElement | null | undefined>;
  /**
   * Returns the viewport y coordinate the sections are measured against (the anchor line).
   * The showcase passes the middle of the preview stage.
   */
  getAnchorY: () => number;
  /** Colour of the filled part of each segment. */
  fill?: string;
  /** Colour of the empty part of each segment. */
  track?: string;
  /** Seconds the fill takes to catch up with the scroll position (0 = follow exactly). */
  smoothing?: number;
  /** Height of each segment in px. */
  thickness?: number;
  /** Space between segments in px. */
  gap?: number;
  className?: string;
}

/** One segment's fill: 0 to 100% as the shared progress value crosses its slice. */
function Fill({
  value,
  index,
  count,
  color,
}: {
  value: MotionValue<number>;
  index: number;
  count: number;
  color: string;
}) {
  const width = useTransform(value, (v) => `${clamp(v * count - index) * 100}%`);
  return (
    <motion.span
      style={{ display: "block", height: "100%", width, background: color, borderRadius: 2 }}
    />
  );
}

/**
 * Segmented scroll-progress bar. It is purely scroll driven: on every scroll/resize/layout
 * change it finds which section's "reading block" is under the anchor line, turns the position
 * between the neighbouring block centres into a 0..1 fraction, and eases the fills towards it.
 * Clicking (or using the arrow/Home/End keys on) a segment scrolls that section to the anchor.
 */
export function FeatureShowcaseProgress({
  count,
  currentStep,
  onStepChange,
  getSections,
  getAnchorY,
  fill = "rgb(255, 255, 255)",
  track = "rgba(255, 255, 255, 0.06)",
  smoothing = 0.16,
  thickness = 3,
  gap = 6,
  className,
}: FeatureShowcaseProgressProps) {
  const root = useRef<HTMLDivElement>(null);
  const value = useMotionValue((currentStep + 1) / count);
  const [progress, setProgress] = useState((currentStep + 1) / count);
  const [focused, setFocused] = useState(-1);

  // Latest callbacks and step, readable from the long-lived scroll listener below.
  const latest = useRef({ currentStep, onStepChange, getSections, getAnchorY });
  latest.current = { currentStep, onStepChange, getSections, getAnchorY };

  /** The visible reading block of a section (its first non-empty child), or the section itself. */
  const blockRect = (section: HTMLElement) => {
    const block = Array.from(section.children).find(
      (child) => child.getBoundingClientRect().height > 0,
    );
    return (block ?? section).getBoundingClientRect();
  };

  useEffect(() => {
    let frame = 0;
    let stopped = false;
    let animation: AnimationPlaybackControls | undefined;
    let observed: HTMLElement[] = [];
    const observer = new ResizeObserver(() => request());

    const update = () => {
      frame = 0;
      if (stopped) return;
      const sections = latest.current.getSections();
      const nodes = sections.filter((node): node is HTMLElement => !!node);
      if (nodes.length !== count) return;
      if (nodes.some((node, i) => node !== observed[i])) {
        observer.disconnect();
        nodes.forEach((node) => observer.observe(node));
        observed = nodes;
      }

      // Compare the reading blocks with the anchor, not the empty section padding.
      const centers = nodes.map((node) => {
        const rect = blockRect(node);
        return rect.top + rect.height / 2;
      });
      const at = (i: number) => centers[i] ?? 0;
      if (centers.some((c, i) => !Number.isFinite(c) || (i > 0 && c <= at(i - 1)))) return;

      // Section boundaries sit halfway between neighbouring block centres.
      const firstHeight = nodes[0]?.getBoundingClientRect().height ?? 0;
      const boundaries = [
        at(0) - (count > 1 ? (at(1) - at(0)) / 2 : firstHeight / 2),
        ...centers.slice(1).map((c, i) => (at(i) + c) / 2),
        at(count - 1) + (count > 1 ? (at(count - 1) - at(count - 2)) / 2 : firstHeight / 2),
      ];
      const edge = (i: number) => boundaries[i] ?? 0;

      const y = latest.current.getAnchorY();
      let active = 0;
      while (active < count - 1 && y >= edge(active + 1)) active++;
      const fraction = clamp((y - edge(active)) / Math.max(1, edge(active + 1) - edge(active)));
      const next = (active + fraction) / count;
      setProgress(next);

      animation?.stop();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || smoothing <= 0) {
        value.set(next);
      } else {
        animation = animate(value, next, { duration: smoothing, ease: "easeOut" });
      }
      if (active !== latest.current.currentStep) latest.current.onStepChange(active);
    };

    const request = () => {
      if (!stopped && !frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", request, { capture: true, passive: true });
    window.addEventListener("resize", request, { passive: true });
    request();
    return () => {
      stopped = true;
      window.removeEventListener("scroll", request, true);
      window.removeEventListener("resize", request);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      animation?.stop();
    };
  }, [count, smoothing, value]);

  /** Scroll so the centre of section `index` lands on the anchor line. */
  const go = useCallback((index: number) => {
    const section = latest.current.getSections()[index];
    if (!section) return;
    const rect = blockRect(section);
    window.scrollBy({
      top: rect.top + rect.height / 2 - latest.current.getAnchorY(),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, []);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    let target = index;
    if (event.key === "ArrowRight") target = Math.min(count - 1, index + 1);
    else if (event.key === "ArrowLeft") target = Math.max(0, index - 1);
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = count - 1;
    else return;
    event.preventDefault();
    go(target);
    root.current?.querySelectorAll("button")[target]?.focus();
  };

  return (
    <div
      ref={root}
      role="group"
      aria-label="Feature navigation"
      className={cn("relative flex h-full w-full", className)}
      style={{ gap, minHeight: 24 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`View feature ${i + 1}`}
          aria-current={i === currentStep ? "step" : undefined}
          onClick={() => go(i)}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(-1)}
          onKeyDown={(event) => onKeyDown(event, i)}
          className="flex min-w-0 flex-1 cursor-pointer items-center border-0 bg-transparent p-0"
          style={{
            borderRadius: 3,
            outline: focused === i ? `2px solid ${fill}` : "none",
            outlineOffset: 2,
          }}
        >
          <span
            className="block w-full overflow-hidden"
            style={{ height: thickness, background: track, borderRadius: 2 }}
          >
            <Fill value={value} index={i} count={count} color={fill} />
          </span>
        </button>
      ))}
      <span
        role="progressbar"
        aria-label="Showcase progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="absolute size-px overflow-hidden"
        style={{ clipPath: "inset(50%)" }}
      />
    </div>
  );
}

export default FeatureShowcaseProgress;
