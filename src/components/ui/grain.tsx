/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
const RenderTarget = {
  canvas: "CANVAS",
  thumbnail: "THUMBNAIL",
  export: "EXPORT",
  preview: "PREVIEW",
  current: () => "PREVIEW",
};

/** Stepped easing, as Framer's `steps(n, "start")`: holds each value for 1/n of the time. */
function steps(count, direction = "end") {
  return (progress) => {
    const clamped = direction === "end" ? Math.min(progress, 0.999) : Math.max(progress, 0.001);
    const rounded = direction === "end" ? Math.floor(clamped * count) : Math.ceil(clamped * count);
    return Math.min(1, Math.max(0, rounded / count));
  };
}

/**
 * @framerDisableUnlink
 *
 * @framerIntrinsicWidth 300
 * @framerIntrinsicHeight 300
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function GrainImpl({ animate, animationSpeed, opacity, grainSize, style }) {
  const isCanvas = RenderTarget.current() === RenderTarget.canvas;
  const keyframesX = ["0%", "-5%", "-15%", "7%", "-5%", "-15%", "15%", "0%", "3%", "-10%"];
  const keyframesY = ["0%", "-10%", "5%", "-25%", "25%", "10%", "0%", "15%", "35%", "10%"];
  const containerStyle = {
    background: `url('https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png')`,
    backgroundSize: `${grainSize}px ${grainSize}px`,
    backgroundRepeat: "repeat",
    position: "absolute",
    inset: isCanvas ? 0 : "-200%",
    width: isCanvas ? "100%" : "400%",
    height: isCanvas ? "100%" : "400%",
    opacity,
  };
  return /*#__PURE__*/ _jsx("div", {
    style: { width: "100%", height: "100%", position: "relative", overflow: "hidden", ...style },
    children: /*#__PURE__*/ _jsx(motion.div, {
      style: containerStyle,
      animate: !isCanvas && animate ? { x: keyframesX, y: keyframesY } : undefined,
      transition: { ease: steps(10, "start"), repeat: Infinity, duration: 8 / animationSpeed },
    }),
  });
}
Grain.defaultProps = { animate: true, animationSpeed: 1, opacity: 0.25, grainSize: 250 };

const DEFAULT_PROPS = {
  animate: true,
  animationSpeed: 1,
  opacity: 0.25,
  grainSize: 250,
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

export interface GrainProps {
  animate?: boolean;
  animationSpeed?: number;
  opacity?: number;
  grainSize?: number;
  style?: React.CSSProperties;
}

export function Grain(props: GrainProps) {
  return _jsx(GrainImpl, mergeProps(props));
}

Grain.displayName = "Grain";

export default Grain;
