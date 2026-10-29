/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90";
const DEFAULT_ITEMS = [
  {
    tab: "Overview",
    eyebrow: "Overview",
    title: "Designed for what’s next.",
    description:
      "A flexible tab component to present your ideas, products or services with impact.",
    image: {
      src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90",
      alt: "Minimal interior",
    },
    primaryLabel: "Get Started",
    primaryLink: "#",
    primaryNewTab: false,
    secondaryLabel: "Learn More",
    secondaryLink: "#",
    secondaryNewTab: false,
  },
  {
    tab: "Features",
    eyebrow: "Features",
    title: "Everything in one place.",
    description:
      "Showcase key features with a strong visual, clear hierarchy and simple navigation.",
    image: {
      src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=90",
      alt: "Modern architecture",
    },
    primaryLabel: "Explore",
    primaryLink: "#",
    primaryNewTab: false,
    secondaryLabel: "View Details",
    secondaryLink: "#",
    secondaryNewTab: false,
  },
  {
    tab: "Details",
    eyebrow: "Details",
    title: "Made to be flexible.",
    description:
      "Adapt every tab to your own content, imagery and brand without changing the layout.",
    image: {
      src: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=90",
      alt: "Architectural interior",
    },
    primaryLabel: "Discover",
    primaryLink: "#",
    primaryNewTab: false,
    secondaryLabel: "More Info",
    secondaryLink: "#",
    secondaryNewTab: false,
  },
  {
    tab: "Gallery",
    eyebrow: "Gallery",
    title: "Let the visual lead.",
    description:
      "Large imagery stays at the center of the experience while your content remains clear and easy to explore.",
    image: {
      src: "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1800&q=90",
      alt: "Minimal architectural space",
    },
    primaryLabel: "View Project",
    primaryLink: "#",
    primaryNewTab: false,
    secondaryLabel: "See More",
    secondaryLink: "#",
    secondaryNewTab: false,
  },
];
const GRAIN_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='.55'/%3E%3C/svg%3E")`;
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function getFrameNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}
function ArrowIcon({ direction = "right", size = 14 }) {
  return /*#__PURE__*/ _jsxs("svg", {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true",
    style: { display: "block", transform: direction === "left" ? "rotate(180deg)" : "none" },
    children: [
      /*#__PURE__*/ _jsx("path", {
        d: "M3 8H13",
        stroke: "currentColor",
        strokeWidth: "1.35",
        strokeLinecap: "round",
      }),
      /*#__PURE__*/ _jsx("path", {
        d: "M9.25 4.25L13 8L9.25 11.75",
        stroke: "currentColor",
        strokeWidth: "1.35",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ],
  });
}
export interface AsymmetricTabsItem {
  tab?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: { src: string; srcSet?: string; alt?: string };
  primaryLabel?: string;
  primaryLink?: string;
  primaryNewTab?: boolean;
  secondaryLabel?: string;
  secondaryLink?: string;
  secondaryNewTab?: boolean;
}

export interface AsymmetricTabsProps {
  items?: AsymmetricTabsItem[];
  cardLink?: string;
  cardNewTab?: boolean;
  cardBackground?: string;
  textColor?: string;
  mutedTextColor?: string;
  tabColor?: string;
  activeTabColor?: string;
  primaryBackground?: string;
  primaryTextColor?: string;
  secondaryColor?: string;
  arrowBackground?: string;
  arrowColor?: string;
  imageOverlayColor?: string;
  imageOverlayOpacity?: number;
  grainOpacity?: number;
  cardRadius?: number;
  imageRadius?: number;
  cardWidth?: number;
  imageWidth?: number;
  imageHeight?: number;
  animationSpeed?: number;
  imageZoom?: number;
  eyebrowFont?: React.CSSProperties;
  tabFont?: React.CSSProperties;
  titleFont?: React.CSSProperties;
  bodyFont?: React.CSSProperties;
  buttonFont?: React.CSSProperties;
  counterFont?: React.CSSProperties;
  style?: React.CSSProperties;
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1000
 * @framerIntrinsicHeight 650
 */
export function AsymmetricTabs(props: AsymmetricTabsProps) {
  const {
    items = DEFAULT_ITEMS,
    cardLink = "",
    cardNewTab = false,
    cardBackground = "#F7F5F1",
    textColor = "#171717",
    mutedTextColor = "rgba(23,23,23,0.60)",
    tabColor = "rgba(23,23,23,0.48)",
    activeTabColor = "#171717",
    primaryBackground = "#171717",
    primaryTextColor = "#FFFFFF",
    secondaryColor = "#171717",
    arrowBackground = "#171717",
    arrowColor = "#FFFFFF",
    imageOverlayColor = "#000000",
    imageOverlayOpacity = 0.02,
    grainOpacity = 0.06,
    cardRadius = 22,
    imageRadius = 20,
    cardWidth = 48,
    imageWidth = 68,
    imageHeight = 82,
    animationSpeed = 0.55,
    imageZoom = 1.035,
    eyebrowFont,
    tabFont,
    titleFont,
    bodyFont,
    buttonFont,
    counterFont,
    style,
  } = props;
  const isStatic = false;
  const containerRef = React.useRef(null);
  const styleWidth = getFrameNumber(style?.width);
  const styleHeight = getFrameNumber(style?.height);
  const [frameSize, setFrameSize] = React.useState({
    width: styleWidth ?? 1e3,
    height: styleHeight ?? 650,
  });
  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const updateSize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width > 0 && height > 0) {
        setFrameSize({ width, height });
      }
    };
    updateSize();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      if (width <= 0 || height <= 0) return;
      setFrameSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const frameWidth = styleWidth ?? frameSize.width;
  const isMobile = frameWidth < 600;
  const isTablet = frameWidth >= 600 && frameWidth < 820;
  const isDesktop = frameWidth >= 820;
  const safeItems = items && items.length ? items : DEFAULT_ITEMS;
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    setActiveIndex((current) => clamp(current, 0, safeItems.length - 1));
  }, [safeItems.length]);
  const activeItem = safeItems[clamp(activeIndex, 0, safeItems.length - 1)];
  const imageSrc = activeItem.image?.src || FALLBACK_IMAGE;
  const imageAlt = activeItem.image?.alt || activeItem.title;
  const goTo = React.useCallback(
    (index) => {
      setActiveIndex(clamp(index, 0, safeItems.length - 1));
    },
    [safeItems.length],
  );
  const next = React.useCallback(() => {
    setActiveIndex((current) => (current >= safeItems.length - 1 ? 0 : current + 1));
  }, [safeItems.length]);
  const previous = React.useCallback(() => {
    setActiveIndex((current) => (current <= 0 ? safeItems.length - 1 : current - 1));
  }, [safeItems.length]);
  const openLink = React.useCallback(
    (url, newTab) => {
      if (isStatic || !url || typeof window === "undefined") return;
      if (newTab) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    },
    [isStatic],
  );
  const openCardLink = React.useCallback(
    (event) => {
      if (isStatic || !cardLink || typeof window === "undefined") {
        return;
      }
      const target = event.target;
      if (target.closest("a, button, input, textarea, select")) {
        return;
      }
      if (cardNewTab) {
        window.open(cardLink, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = cardLink;
      }
    },
    [cardLink, cardNewTab, isStatic],
  );
  const tabs = /*#__PURE__*/ _jsx("div", {
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: isMobile ? 18 : 26,
      overflowX: "auto",
      overflowY: "hidden",
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch",
      flexShrink: 0,
    },
    children: safeItems.map((item, index) => {
      const active = index === activeIndex;
      return /*#__PURE__*/ _jsx(
        "button",
        {
          type: "button",
          onClick: isStatic ? undefined : () => goTo(index),
          style: {
            appearance: "none",
            border: "none",
            outline: "none",
            padding: "0 0 9px",
            margin: 0,
            flexShrink: 0,
            background: "transparent",
            color: active ? activeTabColor : tabColor,
            borderBottom: active ? `1px solid ${activeTabColor}` : "1px solid transparent",
            cursor: isStatic ? "default" : "pointer",
            transition: isStatic
              ? "none"
              : `color ${animationSpeed * 0.45}s ease, border-color ${animationSpeed * 0.45}s ease`,
            ...tabFont,
          },
          children: item.tab,
        },
        `${item.tab}-${index}`,
      );
    }),
  });
  const imagePanel = /*#__PURE__*/ _jsxs("div", {
    style: {
      position: "absolute",
      right: 0,
      top: isDesktop ? "8%" : isTablet ? "10%" : 0,
      width: isDesktop ? `${clamp(imageWidth, 50, 82)}%` : isTablet ? "68%" : "100%",
      height: isDesktop ? `${clamp(imageHeight, 55, 92)}%` : isTablet ? "76%" : "58%",
      overflow: "hidden",
      borderRadius: imageRadius,
      backgroundColor: "#C8C3BA",
    },
    children: [
      isStatic
        ? /*#__PURE__*/ _jsx("img", {
            src: imageSrc,
            srcSet: activeItem.image?.srcSet,
            alt: imageAlt,
            draggable: false,
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              userSelect: "none",
            },
          })
        : /*#__PURE__*/ _jsx(AnimatePresence, {
            initial: false,
            mode: "sync",
            children: /*#__PURE__*/ _jsx(
              motion.img,
              {
                src: imageSrc,
                srcSet: activeItem.image?.srcSet,
                alt: imageAlt,
                draggable: false,
                initial: { opacity: 0, scale: imageZoom },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 1.01 },
                transition: { duration: animationSpeed, ease: [0.4, 0, 0.2, 1] },
                style: {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  userSelect: "none",
                },
              },
              `${activeIndex}-${imageSrc}`,
            ),
          }),
      imageOverlayOpacity > 0 &&
        /*#__PURE__*/ _jsx("div", {
          style: {
            position: "absolute",
            inset: 0,
            backgroundColor: imageOverlayColor,
            opacity: imageOverlayOpacity,
            pointerEvents: "none",
          },
        }),
      grainOpacity > 0 &&
        /*#__PURE__*/ _jsx("div", {
          style: {
            position: "absolute",
            inset: "-20%",
            width: "140%",
            height: "140%",
            backgroundImage: GRAIN_TEXTURE,
            backgroundRepeat: "repeat",
            backgroundSize: "180px 180px",
            opacity: grainOpacity,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
          },
        }),
    ],
  });
  const content = /*#__PURE__*/ _jsxs("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "grid",
      gridTemplateRows: "auto minmax(0, 1fr) auto",
      boxSizing: "border-box",
    },
    children: [
      /*#__PURE__*/ _jsx("div", { style: { width: "100%" }, children: tabs }),
      /*#__PURE__*/ _jsx("div", {
        style: {
          minHeight: 0,
          paddingTop: isMobile ? 28 : 32,
          paddingBottom: isMobile ? 20 : 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          overflow: "hidden",
        },
        children: /*#__PURE__*/ _jsx(AnimatePresence, {
          initial: false,
          mode: "wait",
          children: /*#__PURE__*/ _jsxs(
            motion.div,
            {
              initial: isStatic ? false : { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: isStatic ? undefined : { opacity: 0, y: -7 },
              transition: { duration: animationSpeed * 0.7, ease: [0.4, 0, 0.2, 1] },
              style: { width: "100%" },
              children: [
                activeItem.eyebrow &&
                  /*#__PURE__*/ _jsx("div", {
                    style: {
                      marginBottom: 12,
                      color: mutedTextColor,
                      textTransform: "uppercase",
                      ...eyebrowFont,
                    },
                    children: activeItem.eyebrow,
                  }),
                /*#__PURE__*/ _jsx("h2", {
                  style: {
                    margin: 0,
                    maxWidth: 500,
                    color: textColor,
                    ...titleFont,
                    ...(isMobile ? { fontSize: "34px", lineHeight: "0.98em" } : {}),
                  },
                  children: activeItem.title,
                }),
                /*#__PURE__*/ _jsx("p", {
                  style: { margin: "18px 0 0", maxWidth: 430, color: mutedTextColor, ...bodyFont },
                  children: activeItem.description,
                }),
              ],
            },
            activeIndex,
          ),
        }),
      }),
      /*#__PURE__*/ _jsxs("div", {
        style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 22, flexShrink: 0 },
        children: [
          activeItem.primaryLabel &&
            /*#__PURE__*/ _jsxs("button", {
              type: "button",
              onClick: isStatic
                ? undefined
                : () => openLink(activeItem.primaryLink, activeItem.primaryNewTab),
              style: {
                appearance: "none",
                border: "none",
                outline: "none",
                minHeight: 46,
                padding: "0 18px 0 20px",
                display: "inline-flex",
                alignItems: "center",
                gap: 24,
                borderRadius: 999,
                backgroundColor: primaryBackground,
                color: primaryTextColor,
                cursor: isStatic ? "default" : "pointer",
                ...buttonFont,
              },
              children: [
                /*#__PURE__*/ _jsx("span", { children: activeItem.primaryLabel }),
                /*#__PURE__*/ _jsx(ArrowIcon, { size: 13 }),
              ],
            }),
          activeItem.secondaryLabel &&
            /*#__PURE__*/ _jsx("button", {
              type: "button",
              onClick: isStatic
                ? undefined
                : () => openLink(activeItem.secondaryLink, activeItem.secondaryNewTab),
              style: {
                appearance: "none",
                border: "none",
                outline: "none",
                padding: "4px 0",
                borderBottom: `1px solid ${secondaryColor}`,
                background: "transparent",
                color: secondaryColor,
                cursor: isStatic ? "default" : "pointer",
                ...buttonFont,
              },
              children: activeItem.secondaryLabel,
            }),
        ],
      }),
    ],
  });
  const navigation = /*#__PURE__*/ _jsxs("div", {
    style: {
      position: "absolute",
      /* no left margin */ left: 0,
      bottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 22,
      zIndex: 5,
    },
    children: [
      /*#__PURE__*/ _jsxs("div", {
        style: { minWidth: 44, color: mutedTextColor, ...counterFont },
        children: [
          String(activeIndex + 1).padStart(2, "0"),
          " /",
          " ",
          String(safeItems.length).padStart(2, "0"),
        ],
      }),
      /*#__PURE__*/ _jsxs("div", {
        style: { display: "flex", gap: 8 },
        children: [
          /*#__PURE__*/ _jsx("button", {
            type: "button",
            onClick: isStatic ? undefined : previous,
            style: {
              width: 38,
              height: 38,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "1px solid rgba(23,23,23,0.16)",
              backgroundColor: "transparent",
              color: textColor,
              cursor: isStatic ? "default" : "pointer",
            },
            children: /*#__PURE__*/ _jsx(ArrowIcon, { direction: "left", size: 13 }),
          }),
          /*#__PURE__*/ _jsx("button", {
            type: "button",
            onClick: isStatic ? undefined : next,
            style: {
              width: 38,
              height: 38,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "none",
              backgroundColor: arrowBackground,
              color: arrowColor,
              cursor: isStatic ? "default" : "pointer",
            },
            children: /*#__PURE__*/ _jsx(ArrowIcon, { direction: "right", size: 13 }),
          }),
        ],
      }),
    ],
  });
  return /*#__PURE__*/ _jsxs("div", {
    ref: containerRef,
    onClick: openCardLink,
    style: {
      ...style,
      width: style?.width ?? 1e3,
      height: style?.height ?? 650,
      minWidth: 1,
      minHeight: 1,
      position: "relative",
      /*
       * No padding.
       * No outer background.
       * No left spacing.
       */ padding: 0,
      margin: 0,
      boxSizing: "border-box",
      overflow: "visible",
      background: "transparent",
      cursor: !isStatic && cardLink ? "pointer" : "default",
    },
    children: [
      isDesktop &&
        /*#__PURE__*/ _jsxs(_Fragment, {
          children: [
            imagePanel,
            /*#__PURE__*/ _jsx("div", {
              style: {
                position: "absolute",
                /* fully flush left */ left: 0,
                top: "18%",
                width: `${clamp(cardWidth, 34, 60)}%`,
                height: "58%",
                padding: "34px 36px 38px",
                boxSizing: "border-box",
                borderRadius: cardRadius,
                backgroundColor: cardBackground,
                overflow: "hidden",
                zIndex: 3,
              },
              children: content,
            }),
            navigation,
          ],
        }),
      isTablet &&
        /*#__PURE__*/ _jsxs(_Fragment, {
          children: [
            imagePanel,
            /*#__PURE__*/ _jsx("div", {
              style: {
                position: "absolute",
                /* fully flush left */ left: 0,
                top: "20%",
                width: "58%",
                height: "58%",
                padding: "28px 28px 32px",
                boxSizing: "border-box",
                borderRadius: cardRadius,
                backgroundColor: cardBackground,
                overflow: "hidden",
                zIndex: 3,
              },
              children: content,
            }),
            navigation,
          ],
        }),
      isMobile &&
        /*#__PURE__*/ _jsx(_Fragment, {
          children: /*#__PURE__*/ _jsxs("div", {
            style: { position: "relative", width: "100%", height: "100%", margin: 0, padding: 0 },
            children: [
              imagePanel,
              /*#__PURE__*/ _jsx("div", {
                style: {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 54,
                  height: "58%",
                  padding: "26px 24px 30px",
                  boxSizing: "border-box",
                  borderRadius: cardRadius,
                  backgroundColor: cardBackground,
                  overflow: "hidden",
                  zIndex: 3,
                },
                children: content,
              }),
              navigation,
            ],
          }),
        }),
    ],
  });
}

AsymmetricTabs.displayName = "AsymmetricTabs";

export default AsymmetricTabs;
