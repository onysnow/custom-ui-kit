/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Image grid that fills max width, 3 columns, height adjusts to images
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
const DEFAULT_PROPS = {
  images: [
    { src: { src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg" } },
    { src: { src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg" } },
    { src: { src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg" } },
  ],
  gap: 5,
  outerPadding: 0,
  background: "rgba(255, 255, 255, 0)",
  imageRadius: 8,
  columns: 3,
  enableHover: true,
  hoverScale: 1.05,
  hoverTransitionType: "ease",
  customHoverTransition: "transform 0.4s linear",
  enableAppearEffect: true,
  appearDelay: 1,
  appearOffsetY: 20,
  lightboxSettings: {
    enable: false,
    maxHeight: 90,
    maxWidth: 80,
    imageSizing: "original",
    imageRadius: 0,
    transition: "ease",
    closeMode: "anywhere",
    background: "rgba(0, 0, 0, 0.9)",
    enableBlur: false,
    blurStrength: 5,
  },
};

const GROUP_KEYS = ["lightboxSettings"];

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

export interface MasonryGridProps {
  images?: { src?: { src?: string; srcSet?: string; alt?: string } }[];
  gap?: number;
  outerPadding?: number;
  background?: string;
  imageRadius?: number;
  columns?: number;
  enableHover?: boolean;
  hoverScale?: number;
  hoverTransitionType?:
    "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "spring" | "custom";
  customHoverTransition?: string;
  enableAppearEffect?: boolean;
  appearDelay?: number;
  appearOffsetY?: number;
  lightboxSettings?: {
    enable?: boolean;
    maxHeight?: number;
    maxWidth?: number;
    imageSizing?: "force" | "original";
    imageRadius?: number;
    transition?: "linear" | "ease" | "easeIn" | "easeOut" | "easeInOut" | "spring";
    closeMode?: "anywhere" | "topRight" | "cursor";
    background?: string;
    enableBlur?: boolean;
    blurStrength?: number;
  };
  style?: React.CSSProperties;
}

/**
 * Masonry Grid (flexible columns, responsive height)
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
function MasonryGridImpl(props) {
  const {
    images = [
      {
        src: { src: "https://framerusercontent.com/images/kFm9504N2eX9Kz5G2u0w29k.png" },
        alt: "Placeholder 1",
      },
      {
        src: { src: "https://framerusercontent.com/images/7xGzYyN6Z6V6X4S8Z5X3R8L.png" },
        alt: "Placeholder 2",
      },
      {
        src: { src: "https://framerusercontent.com/images/wXn8404N2gX0Kz5G2u0w29k.png" },
        alt: "Placeholder 3",
      },
    ],
    gap = 16,
    outerPadding = 16,
    background = "rgba(255, 255, 255, 0)",
    imageRadius = 8,
    columns = 3,
    enableHover = true,
    hoverScale = 1.05,
    hoverTransitionType = "ease",
    customHoverTransition = "transform 0.4s linear",
    enableAppearEffect = true,
    appearDelay = 1,
    appearOffsetY = 20,
    lightboxSettings = {
      enable: false,
      maxHeight: 90,
      maxWidth: 80,
      imageSizing: "original",
      imageRadius: 0,
      transition: "ease",
      closeMode: "anywhere",
      background: "rgba(0, 0, 0, 0.9)",
      enableBlur: false,
      blurStrength: 5,
    },
    style,
  } = props;
  const isStatic = false; // --- STATE FÜR APPEAR EFFEKT ---
  const [randomDelays, setRandomDelays] = useState([]); // --- STATE FÜR LIGHTBOX ---
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  useEffect(() => {
    // Skip in static rendering or if effect is disabled
    if (isStatic || !enableAppearEffect || !images || images.length === 0) {
      setRandomDelays([]);
      return;
    }
    const count = images.length;
    const indices = Array.from({ length: count }, (_, i) => i); // Fisher-Yates Algorithmus
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const delayStep = appearDelay / count;
    const delays = indices.map((randomIndex) => randomIndex * delayStep);
    setRandomDelays(delays);
  }, [images.length, appearDelay, enableAppearEffect, isStatic]);
  const transitionPresets = {
    linear: "transform 0.4s linear",
    ease: "transform 0.4s ease",
    "ease-in": "transform 0.4s ease-in",
    "ease-out": "transform 0.4s ease-out",
    "ease-in-out": "transform 0.4s ease-in-out",
    spring: "transform 0.4s cubic-bezier(.25, .8, .25, 1)",
  };
  const hoverTransition =
    hoverTransitionType === "custom"
      ? customHoverTransition
      : transitionPresets[hoverTransitionType] || transitionPresets["ease"]; // Disable hover class in static rendering completely
  const hoverClass = enableHover && !isStatic ? { transition: hoverTransition } : {};
  const keyframeCSS = `
        @keyframes appear-in {
            0% { opacity: 0; transform: translateY(${appearOffsetY}px); }
            100% { opacity: 1; transform: translateY(0); }
        }
    `; // --- LIGHTBOX HANDLER & UTILS ---
  const handleImageClick = (src, e) => {
    if (!lightboxSettings.enable) return;
    const target = e.currentTarget; // Exaktes Seitenverhältnis auslesen
    setAspectRatio(target.naturalWidth / (target.naturalHeight || 1));
    setCurrentImage(src);
    setLightboxOpen(true);
  };
  const getLightboxTransition = (type) => {
    switch (type) {
      case "linear":
        return { type: "tween", ease: "linear", duration: 0.3 };
      case "easeIn":
        return { type: "tween", ease: "easeIn", duration: 0.3 };
      case "easeOut":
        return { type: "tween", ease: "easeOut", duration: 0.3 };
      case "easeInOut":
        return { type: "tween", ease: "easeInOut", duration: 0.3 };
      case "spring":
        return { type: "spring", stiffness: 300, damping: 25 };
      case "ease":
      default:
        return { type: "tween", ease: "ease", duration: 0.3 };
    }
  };
  const customCursorSvg = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.6)"/><line x1="30" y1="18" x2="18" y2="30" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="18" y1="18" x2="30" y2="30" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  );
  const sizingStyles =
    lightboxSettings.imageSizing === "original"
      ? {
          maxWidth: `${lightboxSettings.maxWidth}vw`,
          maxHeight: `${lightboxSettings.maxHeight}vh`,
          width: "auto",
          height: "auto",
          objectFit: "contain",
        }
      : {
          maxWidth: `${lightboxSettings.maxWidth}vw`,
          maxHeight: `${lightboxSettings.maxHeight}vh`,
          width: "100vw",
          height: "auto",
          aspectRatio: `${aspectRatio}`,
          objectFit: "contain",
        };
  return /*#__PURE__*/ _jsxs("div", {
    style: {
      ...style,
      width: "100%",
      background: background || undefined,
      position: "relative",
      overflow: "hidden",
    },
    children: [
      enableAppearEffect && !isStatic && /*#__PURE__*/ _jsx("style", { children: keyframeCSS }),
      /*#__PURE__*/ _jsx("div", {
        style: { columnCount: columns, columnGap: gap, padding: outerPadding, marginBottom: -gap },
        children: images.map((img, i) => {
          const src =
            img?.src?.src || "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg";
          const alt = img?.src?.alt || img?.alt || "Image";
          let appearStyle = {}; // Disable appear style if static rendering
          if (!isStatic && enableAppearEffect && randomDelays[i] !== undefined) {
            const animationCSS = `appear-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${randomDelays[i]}s forwards`;
            appearStyle = {
              opacity: 0,
              transform: `translateY(${appearOffsetY}px)`,
              animation: animationCSS,
              WebkitAnimation: animationCSS,
              willChange: "opacity, transform",
            };
          } else {
            appearStyle = { opacity: 1, transform: "translateY(0)" };
          }
          return /*#__PURE__*/ _jsx(
            "div",
            {
              style: {
                breakInside: "avoid",
                width: "100%",
                display: "block",
                overflow: "hidden",
                ...appearStyle,
              },
              children: /*#__PURE__*/ _jsx("div", {
                style: {
                  width: "100%",
                  height: "auto",
                  borderRadius: imageRadius,
                  overflow: "hidden",
                  display: "block",
                  marginBottom: gap,
                },
                children: /*#__PURE__*/ _jsx("img", {
                  src: src,
                  alt: alt,
                  style: {
                    width: `calc(100% + 1px)`,
                    height: "auto",
                    objectFit: "cover",
                    display: "block",
                    verticalAlign: "top",
                    cursor: lightboxSettings.enable ? "pointer" : "default",
                    ...hoverClass,
                    willChange: enableHover && !isStatic ? "transform" : undefined,
                    transform: "scale(1)",
                  },
                  onMouseEnter:
                    enableHover && !isStatic
                      ? (e) => {
                          e.currentTarget.style.transform = `scale(${hoverScale})`;
                        }
                      : undefined,
                  onMouseLeave:
                    enableHover && !isStatic
                      ? (e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      : undefined,
                  onClick: (e) => handleImageClick(src, e),
                }),
              }),
            },
            i,
          );
        }),
      }),
      /*#__PURE__*/ _jsx(AnimatePresence, {
        children:
          lightboxSettings.enable &&
          lightboxOpen &&
          currentImage &&
          /*#__PURE__*/ _jsxs(motion.div, {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.3 },
            style: {
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: lightboxSettings.background,
              backdropFilter: lightboxSettings.enableBlur
                ? `blur(${lightboxSettings.blurStrength}px)`
                : "none",
              WebkitBackdropFilter: lightboxSettings.enableBlur
                ? `blur(${lightboxSettings.blurStrength}px)`
                : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor:
                lightboxSettings.closeMode === "cursor"
                  ? `url('data:image/svg+xml;utf8,${customCursorSvg}') 24 24, auto`
                  : lightboxSettings.closeMode === "anywhere"
                    ? "pointer"
                    : "default",
            },
            onClick: () => {
              if (
                lightboxSettings.closeMode === "anywhere" ||
                lightboxSettings.closeMode === "cursor"
              ) {
                setLightboxOpen(false);
              }
            },
            children: [
              lightboxSettings.closeMode === "topRight" &&
                /*#__PURE__*/ _jsx("div", {
                  style: {
                    position: "absolute",
                    top: 32,
                    right: 32,
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "50%",
                    cursor: "pointer",
                    color: "white",
                    zIndex: 10,
                  },
                  onClick: () => setLightboxOpen(false),
                  children: /*#__PURE__*/ _jsxs("svg", {
                    width: "24",
                    height: "24",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      /*#__PURE__*/ _jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                      /*#__PURE__*/ _jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
                    ],
                  }),
                }),
              /*#__PURE__*/ _jsx(motion.img, {
                src: currentImage,
                initial: { scale: 0.85, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.85, opacity: 0 },
                transition: getLightboxTransition(lightboxSettings.transition),
                style: {
                  ...sizingStyles,
                  borderRadius: lightboxSettings.imageRadius,
                  overflow: "hidden",
                  cursor: lightboxSettings.closeMode === "topRight" ? "default" : undefined,
                },
                onClick: (e) => {
                  if (lightboxSettings.closeMode === "topRight") {
                    e.stopPropagation();
                  }
                },
              }),
            ],
          }),
      }),
    ],
  });
}

export function MasonryGrid(props: MasonryGridProps) {
  return _jsx(MasonryGridImpl, mergeProps(props));
}

MasonryGrid.displayName = "MasonryGrid";

export default MasonryGrid;
