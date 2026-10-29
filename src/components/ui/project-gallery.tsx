/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
// ─── Scroll-triggered card wrapper ──────────────────────────────────────────
function AnimatedCard({ i, isCanvas, cardTextGap, children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  return /*#__PURE__*/ _jsx(motion.div, {
    ref: ref,
    initial: isCanvas ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    animate: isCanvas || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
    transition: { duration: 1.8, delay: isCanvas ? 0 : i * 0.25, ease: [0.16, 1, 0.3, 1] },
    style: { display: "flex", flexDirection: "column", gap: `${cardTextGap}px` },
    children: children,
  });
} // ─── Component ────────────────────────────────────────────────────────────────
export interface ProjectGalleryItem {
  image?: { src: string; srcSet?: string; alt?: string };
  title?: string;
  category?: string;
  focalX?: number;
  focalY?: number;
}

export interface ProjectGalleryProps {
  items?: ProjectGalleryItem[];
  allLabel?: string;
  tabFont?: React.CSSProperties;
  tabUppercase?: boolean;
  activeTextColor?: string;
  inactiveTextColor?: string;
  underlineColor?: string;
  dividerColor?: string;
  tabGap?: number;
  cardFont?: React.CSSProperties;
  cardUppercase?: boolean;
  cardTextColor?: string;
  columns?: number;
  aspectRatio?: "1 / 1" | "4 / 3" | "16 / 9" | "3 / 4" | "9 / 16";
  cardGap?: number;
  cardTextGap?: number;
  sectionGap?: number;
}

const DEFAULT_PROPS = {
  items: [] as ProjectGalleryItem[],
  allLabel: "ALL",
  tabFont: { fontFamily: "Inter", fontSize: 14, fontWeight: 500 },
  tabUppercase: true,
  activeTextColor: "#000000",
  inactiveTextColor: "#888888",
  underlineColor: "#000000",
  dividerColor: "#e5e5e5",
  tabGap: 16,
  cardFont: { fontFamily: "Inter", fontSize: 13, fontWeight: 400 },
  cardUppercase: false,
  cardTextColor: "#000000",
  columns: 3,
  aspectRatio: "4 / 3",
  cardGap: 16,
  cardTextGap: 4,
  sectionGap: 40,
};

export function ProjectGallery(rawProps: ProjectGalleryProps) {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const {
    items = [],
    columns,
    cardGap,
    tabGap,
    sectionGap,
    activeTextColor,
    inactiveTextColor,
    underlineColor,
    dividerColor,
    tabFont,
    tabUppercase,
    cardTextColor,
    cardFont,
    cardUppercase,
    cardTextGap,
    allLabel,
    aspectRatio,
  } = props;
  const getFontStyle = (font, defaultSize, defaultWeight) => {
    const rawSize = font?.fontSize ?? defaultSize;
    const fontSize = typeof rawSize === "number" ? `${rawSize}px` : rawSize;
    return {
      fontFamily: font?.fontFamily || "Inter, sans-serif",
      fontSize: fontSize,
      fontWeight: font?.fontWeight ?? defaultWeight,
      letterSpacing: font?.letterSpacing ?? 0,
      lineHeight: font?.lineHeight ?? 1.3,
      textAlign: font?.textAlign || "left",
    };
  };
  const tabStyles = getFontStyle(tabFont, 14, 500);
  const cardStyles = getFontStyle(cardFont, 13, 400); // The column count is now fully controlled natively by Framer's breakpoint overrides
  // Build unique tab list from item categories (case-insensitive deduplication)
  const tabs = useMemo(() => {
    const catsMap = new Map();
    items.forEach((item) => {
      if (item.category && item.category.trim()) {
        const trimmed = item.category.trim();
        const lower = trimmed.toLowerCase();
        if (!catsMap.has(lower)) {
          catsMap.set(lower, trimmed);
        }
      }
    });
    return [allLabel, ...Array.from(catsMap.values())];
  }, [items, allLabel]);
  const [activeTab, setActiveTab] = useState(allLabel);
  const [direction, setDirection] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);
  const tabsRef = useRef(null);
  const tabsInView = useInView(tabsRef, { once: true, margin: "0px 0px -50px 0px" });
  const handleTabChange = (tab) => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = tabs.indexOf(tab);
    setDirection(nextIndex >= currentIndex ? 1 : -1);
    setActiveTab(tab);
  }; // Filter items by active tab
  const filtered = useMemo(() => {
    if (activeTab === allLabel) return items;
    return items.filter((item) => item.category?.trim().toLowerCase() === activeTab.toLowerCase());
  }, [items, activeTab, allLabel]); // Placeholder when no items are added
  if (!items || items.length === 0) {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        padding: "24px",
        color: "#888",
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
        border: "1px dashed #444",
        borderRadius: 8,
        textAlign: "center",
      },
      children: "Pass projects via the items prop",
    });
  } // On the Framer canvas animations don't run — cards would stay invisible.
  // RenderTarget.current() lets us detect canvas and skip initial animation.
  const isCanvas = false;
  return /*#__PURE__*/ _jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: `${sectionGap}px`, width: "100%" },
    children: [
      /*#__PURE__*/ _jsx(motion.div, {
        ref: tabsRef,
        initial: isCanvas ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 },
        animate: isCanvas || tabsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 },
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: `${tabGap}px`,
          width: "100%",
          borderBottom: `1px solid ${dividerColor}`,
          position: "relative",
          paddingBottom: "1px",
        },
        children: tabs.map((tab, i) => {
          const isActive = activeTab === tab;
          return /*#__PURE__*/ _jsxs(
            motion.button,
            {
              onClick: () => handleTabChange(tab),
              initial: isCanvas ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 },
              animate: isCanvas || tabsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 },
              transition: {
                duration: 0.6,
                delay: isCanvas ? 0 : 0.2 + i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              },
              style: {
                border: "none",
                backgroundColor: "transparent",
                padding: "8px 0",
                cursor: "pointer",
                fontWeight: tabStyles.fontWeight,
                fontSize: tabStyles.fontSize,
                fontFamily: tabStyles.fontFamily,
                letterSpacing: tabStyles.letterSpacing,
                lineHeight: tabStyles.lineHeight,
                textAlign: tabStyles.textAlign,
                textTransform: tabUppercase ? "uppercase" : "none",
                color: isActive ? activeTextColor : inactiveTextColor,
                transition: "color 0.2s ease",
                outline: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
                position: "relative",
              },
              children: [
                tab,
                isActive
                  ? /*#__PURE__*/ _jsx(motion.div, {
                      layoutId: "tabUnderlineLineVariant",
                      style: {
                        position: "absolute",
                        bottom: "-2px",
                        left: 0,
                        right: 0,
                        height: "2px",
                        backgroundColor: underlineColor,
                        zIndex: 2,
                      },
                      transition: { type: "spring", stiffness: 500, damping: 35 },
                    })
                  : null,
              ],
            },
            tab,
          );
        }),
      }),
      /*#__PURE__*/ _jsx("div", {
        style: {
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${cardGap}px`,
          width: "100%",
        },
        children: /*#__PURE__*/ _jsx(AnimatePresence, {
          mode: "wait",
          children: filtered.map((item, i) =>
            /*#__PURE__*/ _jsxs(
              AnimatedCard,
              {
                i: i,
                isCanvas: isCanvas,
                cardTextGap: cardTextGap,
                children: [
                  /*#__PURE__*/ _jsx("div", {
                    onClick: () => {
                      if (item.image?.src) {
                        setLightboxImage(item.image.src);
                      }
                    },
                    style: {
                      width: "100%",
                      aspectRatio: aspectRatio,
                      overflow: "hidden",
                      backgroundColor: "#1a1a1a",
                      flexShrink: 0,
                      cursor: !isCanvas && item.image?.src ? "zoom-in" : "default",
                    },
                    children: item.image?.src
                      ? /*#__PURE__*/ _jsx(motion.img, {
                          src: item.image.src,
                          srcSet: item.image.srcSet,
                          sizes: `${Math.ceil(100 / Math.max(columns, 1))}vw`,
                          alt: item.image.alt || item.title || "",
                          loading: "lazy",
                          decoding: "async",
                          draggable: false,
                          onTap: () => setLightboxImage(item.image.src),
                          whileHover: { scale: 1.04 },
                          transition: { duration: 0.6, ease: [0.22, 0.03, 0.26, 1] },
                          style: {
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: `${item.focalX ?? 50}% ${item.focalY ?? 50}%`,
                            display: "block",
                            transformOrigin: "center center",
                          },
                        })
                      : /*#__PURE__*/ _jsxs("div", {
                          style: {
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#888",
                            fontSize: 11,
                            fontFamily: cardStyles.fontFamily,
                            textAlign: "center",
                            padding: "12px",
                            gap: "6px",
                            lineHeight: 1.4,
                          },
                          children: [
                            /*#__PURE__*/ _jsx("span", { style: { fontSize: 18 }, children: "+" }),
                            "Add image & fill in Title and Category via the right panel",
                          ],
                        }),
                  }),
                  item.title &&
                    /*#__PURE__*/ _jsx("div", {
                      style: {
                        fontSize: cardStyles.fontSize,
                        fontWeight: cardStyles.fontWeight,
                        color: cardTextColor,
                        fontFamily: cardStyles.fontFamily,
                        letterSpacing: cardStyles.letterSpacing,
                        lineHeight: cardStyles.lineHeight,
                        textAlign: cardStyles.textAlign,
                        textTransform: cardUppercase ? "uppercase" : "none",
                        width: "100%",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      },
                      children: item.title,
                    }),
                ],
              },
              `${activeTab}-${i}`,
            ),
          ),
        }),
      }),
      /*#__PURE__*/ _jsx(AnimatePresence, {
        children:
          lightboxImage &&
          /*#__PURE__*/ _jsxs(motion.div, {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            onClick: () => setLightboxImage(null),
            style: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              cursor: "zoom-out",
              pointerEvents: "auto",
            },
            children: [
              /*#__PURE__*/ _jsx("div", {
                style: {
                  position: "absolute",
                  top: "40px",
                  right: "40px",
                  width: "48px",
                  height: "48px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  zIndex: 2,
                  transition: "background-color 0.2s",
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                },
                onClick: (e) => {
                  e.stopPropagation();
                  setLightboxImage(null);
                },
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
                src: lightboxImage,
                initial: { scale: 0.95, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.95, opacity: 0 },
                transition: { type: "spring", damping: 25, stiffness: 300 },
                style: {
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                },
              }),
            ],
          }),
      }),
    ],
  });
} // ─── Property Controls ────────────────────────────────────────────────────────

ProjectGallery.displayName = "ProjectGallery";

export default ProjectGallery;
