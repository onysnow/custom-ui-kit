/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 *
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 */
function SmoothPreloaderImpl(props) {
  const {
    logo = {
      src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
      alt: "Logo",
    },
    logoSize,
    backgroundColor,
    counterColor,
    counterFont,
    duration,
    exitEffect,
    onComplete,
    style,
  } = props;
  const [counter, setCounter] = useState(10);
  const [isVisible, setIsVisible] = useState(true);
  const isStatic = false;
  const getExitAnimation = () => {
    switch (exitEffect) {
      case "fade":
        return { opacity: 0 };
      case "slideUp":
        return { y: "-100%" };
      case "slideDown":
        return { y: "100%" };
      default:
        return { opacity: 0 };
    }
  }; // Counter animation (disabled in static mode)
  useEffect(() => {
    if (isStatic) return;
    const increment = 90 / ((duration * 1e3) / 50);
    const interval = setInterval(() => {
      startTransition(() => {
        setCounter((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              startTransition(() => {
                setIsVisible(false);
                onComplete?.();
              });
            }, 200);
            return 100;
          }
          return next;
        });
      });
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onComplete, isStatic]); // STATIC RENDER (Canvas / Export safe)
  if (isStatic) {
    return /*#__PURE__*/ _jsxs("div", {
      style: {
        ...style,
        width: "100%",
        height: "100%",
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        /*#__PURE__*/ _jsx("img", {
          src: logo.src,
          alt: logo.alt,
          style: { maxWidth: `${logoSize}px`, maxHeight: `${logoSize}px`, objectFit: "contain" },
        }),
        /*#__PURE__*/ _jsx("div", {
          style: {
            position: "absolute",
            bottom: "40px",
            right: "40px",
            color: counterColor,
            ...counterFont,
          },
          children: "55%",
        }),
      ],
    });
  }
  return /*#__PURE__*/ _jsx("div", {
    style: { ...style, width: "100%", height: "100%", position: "relative" },
    children: /*#__PURE__*/ _jsx(AnimatePresence, {
      children:
        isVisible &&
        /*#__PURE__*/ _jsxs(motion.div, {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: {
            ...getExitAnimation(),
            transition: { duration: 0.8, ease: [0.6, 0.01, 0.05, 0.95] },
          },
          style: {
            position: "fixed",
            inset: 0,
            backgroundColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
            zIndex: 9999,
          },
          children: [
            /*#__PURE__*/ _jsx(motion.img, {
              src: logo.src,
              alt: logo.alt,
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.3, duration: 0.6 },
              style: {
                maxWidth: `${logoSize}px`,
                maxHeight: `${logoSize}px`,
                objectFit: "contain",
              },
            }),
            /*#__PURE__*/ _jsxs(motion.div, {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.5, duration: 0.4 },
              style: {
                position: "absolute",
                bottom: "40px",
                right: "40px",
                color: counterColor,
                ...counterFont,
              },
              children: [Math.round(counter), "%"],
            }),
          ],
        }),
    }),
  });
}

const DEFAULT_PROPS = {
  logoSize: 200,
  backgroundColor: "#FFFFFF",
  counterColor: "#000000",
  counterFont: { fontSize: "80px", lineHeight: "1em", letterSpacing: "-0.02em" },
  duration: 3,
  exitEffect: "fade",
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

export interface SmoothPreloaderProps {
  logo?: { src?: string; srcSet?: string; alt?: string };
  logoSize?: number;
  backgroundColor?: string;
  counterColor?: string;
  counterFont?: React.CSSProperties;
  duration?: number;
  exitEffect?: "fade" | "slideUp" | "slideDown";
  onComplete?: (...args: unknown[]) => void;
  style?: React.CSSProperties;
}

export function SmoothPreloader(props: SmoothPreloaderProps) {
  return _jsx(SmoothPreloaderImpl, mergeProps(props));
}

SmoothPreloader.displayName = "SmoothPreloader";

export default SmoothPreloader;
