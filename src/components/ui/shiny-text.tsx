/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
/**
 * Shiny Text
 * Text with a continuous shimmer sweep. Optionally wraps onto multiple lines.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 220
 * @framerIntrinsicHeight 28
 */ import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
const BASE_SHIMMER_DURATION = 2.2;
const SWEEP_CONFIG = {
  leftToRight: { angle: 105, size: "200% 100%", axis: "X", from: "-50%", to: "150%" },
  rightToLeft: { angle: 105, size: "200% 100%", axis: "X", from: "150%", to: "-50%" },
  topToBottom: { angle: 195, size: "100% 200%", axis: "Y", from: "-50%", to: "150%" },
  bottomToTop: { angle: 195, size: "100% 200%", axis: "Y", from: "150%", to: "-50%" },
};
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}
function ShinyTextImpl({
  text = "Thinking",
  textAlign = "left",
  wrap = false,
  sweepDirection = "leftToRight",
  baseColor = "rgba(120, 120, 120, 0.55)",
  shineColor = "#111111",
  multiColorShine = false,
  shineColor2 = "#555555",
  shineColor3 = "#999999",
  shimmerSpeed = 1,
  shimmerWait = 0,
  link,
  openInNewTab = false,
  font = { fontSize: 18, fontWeight: 500, lineHeight: 1.3, letterSpacing: -0.1 },
  style,
}) {
  const duration = BASE_SHIMMER_DURATION / Math.max(0.1, shimmerSpeed);
  const repeatDelay = Math.max(0, shimmerWait);
  const isStaticRenderer = false;
  const prefersReducedMotion = usePrefersReducedMotion();
  const isStill = isStaticRenderer || prefersReducedMotion;
  const sweep = SWEEP_CONFIG[sweepDirection];
  const hasText = typeof text === "string" && text.trim().length > 0;
  const hasLink = hasText && typeof link === "string" && link.trim().length > 0;
  const OuterTag = hasLink ? "a" : "span";
  const outerProps = hasLink
    ? {
        href: link,
        target: openInNewTab ? "_blank" : undefined,
        rel: openInNewTab ? "noopener noreferrer" : undefined,
      }
    : {};
  const outerStyle = {
    display: "block",
    width: "100%",
    textAlign,
    textDecoration: "none",
    color: "inherit",
    cursor: hasLink ? "pointer" : undefined,
    ...style,
  };
  const innerStyle = wrap
    ? { position: "relative", display: "block", width: "100%" }
    : { position: "relative", display: "inline-block" };
  const baseTextStyle = {
    ...font,
    display: wrap ? "block" : "inline-block",
    whiteSpace: wrap ? "normal" : "nowrap",
    width: wrap ? "100%" : undefined,
    color: baseColor,
  };
  const frozenStops = multiColorShine
    ? `${baseColor} 0%, ${baseColor} 15%, ${shineColor} 35%, ${shineColor2} 50%, ${shineColor3} 65%, ${baseColor} 85%, ${baseColor} 100%`
    : `${baseColor} 0%, ${baseColor} 20%, ${shineColor} 50%, ${baseColor} 80%, ${baseColor} 100%`;
  if (isStill) {
    const frozenGradient = `linear-gradient(${sweep.angle}deg, ${frozenStops})`;
    return /*#__PURE__*/ _jsx(OuterTag, {
      style: outerStyle,
      ...outerProps,
      children: /*#__PURE__*/ _jsx("span", {
        style: innerStyle,
        children: /*#__PURE__*/ _jsx("span", {
          style: {
            ...font,
            display: wrap ? "block" : "inline-block",
            whiteSpace: wrap ? "normal" : "nowrap",
            width: wrap ? "100%" : undefined,
            backgroundImage: frozenGradient,
            backgroundSize: sweep.size,
            backgroundPosition: "50% 50%",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          },
          children: text,
        }),
      }),
    });
  }
  const shineStops = multiColorShine
    ? `transparent 0%, transparent 25%, ${shineColor} 35%, ${shineColor2} 50%, ${shineColor3} 65%, transparent 75%, transparent 100%`
    : `transparent 0%, transparent 35%, ${shineColor} 50%, transparent 65%, transparent 100%`;
  const shineGradient = `linear-gradient(${sweep.angle}deg, ${shineStops})`;
  const shineOverlayStyle = {
    ...font,
    position: "absolute",
    top: 0,
    left: 0,
    width: wrap ? "100%" : undefined,
    whiteSpace: wrap ? "normal" : "nowrap",
    backgroundImage: shineGradient,
    backgroundSize: sweep.size,
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    willChange: "background-position",
    pointerEvents: "none",
  };
  const animate =
    sweep.axis === "X"
      ? { backgroundPositionX: [sweep.from, sweep.to], backgroundPositionY: "0%" }
      : { backgroundPositionX: "0%", backgroundPositionY: [sweep.from, sweep.to] };
  return /*#__PURE__*/ _jsx(OuterTag, {
    style: outerStyle,
    ...outerProps,
    children: /*#__PURE__*/ _jsxs("span", {
      style: innerStyle,
      children: [
        /*#__PURE__*/ _jsx("span", { style: baseTextStyle, children: text }),
        /*#__PURE__*/ _jsx(
          motion.span,
          {
            "aria-hidden": true,
            style: shineOverlayStyle,
            animate: animate,
            transition: { duration, repeat: Infinity, repeatDelay, ease: "linear" },
            children: text,
          },
          sweepDirection,
        ),
      ],
    }),
  });
}

const DEFAULT_PROPS = {
  text: "Thinking",
  textAlign: "left",
  wrap: false,
  sweepDirection: "leftToRight",
  font: { fontSize: 18, fontWeight: 500, lineHeight: 1.3, letterSpacing: -0.1 },
  baseColor: "rgba(120, 120, 120, 0.55)",
  shineColor: "#111111",
  multiColorShine: false,
  shineColor2: "#555555",
  shineColor3: "#999999",
  shimmerSpeed: 1,
  shimmerWait: 0,
  openInNewTab: false,
};

const GROUP_KEYS = [];

/** Fills in missing props; settings groups are merged one level deep. */
function mergeProps(raw) {
  const merged = { ...DEFAULT_PROPS };
  for (const [key, value] of Object.entries(raw || {})) {
    if (value === undefined || value === null) continue;
    const base = DEFAULT_PROPS[key];
    merged[key] =
      GROUP_KEYS.includes(key) && base && typeof base === "object" ? { ...base, ...value } : value;
  }
  return merged;
}

export interface ShinyTextProps {
  text?: string;
  textAlign?: "left" | "center" | "right";
  wrap?: boolean;
  sweepDirection?: "leftToRight" | "rightToLeft" | "topToBottom" | "bottomToTop";
  font?: React.CSSProperties;
  baseColor?: string;
  shineColor?: string;
  multiColorShine?: boolean;
  shineColor2?: string;
  shineColor3?: string;
  shimmerSpeed?: number;
  shimmerWait?: number;
  link?: string;
  openInNewTab?: boolean;
  style?: React.CSSProperties;
}

export function ShinyText(props: ShinyTextProps) {
  return _jsx(ShinyTextImpl, mergeProps(props));
}

ShinyText.displayName = "ShinyText";

export default ShinyText;
