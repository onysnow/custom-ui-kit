/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Responsive fan-card carousel component with fanned layout, keyboard navigation, and drag support
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef, startTransition } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
const DEFAULT_PROPS = {
  topicHeadline: "FEATURED COLLECTION",
  mainHeadline: "Discover Amazing Places",
  desktopHeadlineY: 60,
  tabletHeadlineY: 80,
  mobileHeadlineY: 100,
  topicFont: {
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    lineHeight: "1em",
  },
  headlineFont: {
    fontSize: "48px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: "1.1em",
  },
  topicColor: "#E3E78F",
  headlineColor: "#FFFFFF",
  cards: [
    {
      image: {
        src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
        alt: "Card 1",
      },
      title: "Explore Nature",
      subtitle: "Discover the wilderness",
      tag: "NEW",
      link: "",
    },
    {
      image: {
        src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
        alt: "Card 2",
      },
      title: "Urban Adventures",
      subtitle: "City life awaits",
      tag: "POPULAR",
      link: "",
    },
    {
      image: {
        src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
        alt: "Card 3",
      },
      title: "Creative Spaces",
      subtitle: "Inspire your imagination",
      tag: "FEATURED",
      link: "",
    },
    {
      image: {
        src: "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg",
        alt: "Card 4",
      },
      title: "Coastal Escapes",
      subtitle: "Beach paradise",
      tag: "TRENDING",
      link: "",
    },
    {
      image: {
        src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
        alt: "Card 5",
      },
      title: "Mountain Peaks",
      subtitle: "Reach new heights",
      tag: "ADVENTURE",
      link: "",
    },
  ],
  cardRadius: 40,
  cardWidth: 400,
  cardHeight: 500,
  fanSpread: 180,
  rotationAngle: 8,
  activeScale: 1.1,
  inactiveScale: 0.85,
  enableDrag: true,
  enableScrollNavigation: false,
  animationDuration: 0.6,
  verticalPosition: -140,
  tabletVerticalPosition: -100,
  mobileVerticalPosition: -45,
  mobileCarouselScale: 0.8,
  titleFont: {
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: "1.2em",
  },
  subtitleFont: {
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    lineHeight: "1.3em",
  },
  tagFont: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    lineHeight: "1em",
  },
  titleColor: "#FFFFFF",
  subtitleColor: "rgba(255, 255, 255, 0.7)",
  tagColor: "#FFFFFF",
  tagBackground: "rgba(255, 255, 255, 0.15)",
  cardBackground: "#1a1a1a",
  shadowColor: "rgba(0,0,0,0.5)",
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

export interface FanCardCarouselProps {
  topicHeadline?: string;
  mainHeadline?: string;
  desktopHeadlineY?: number;
  tabletHeadlineY?: number;
  mobileHeadlineY?: number;
  topicFont?: React.CSSProperties;
  headlineFont?: React.CSSProperties;
  topicColor?: string;
  headlineColor?: string;
  cards?: {
    image?: { src?: string; srcSet?: string; alt?: string };
    title?: string;
    subtitle?: string;
    tag?: string;
    link?: string;
  }[];
  cardRadius?: number;
  cardWidth?: number;
  cardHeight?: number;
  fanSpread?: number;
  rotationAngle?: number;
  activeScale?: number;
  inactiveScale?: number;
  enableDrag?: boolean;
  enableScrollNavigation?: boolean;
  animationDuration?: number;
  verticalPosition?: number;
  tabletVerticalPosition?: number;
  mobileVerticalPosition?: number;
  mobileCarouselScale?: number;
  titleFont?: React.CSSProperties;
  subtitleFont?: React.CSSProperties;
  tagFont?: React.CSSProperties;
  titleColor?: string;
  subtitleColor?: string;
  tagColor?: string;
  tagBackground?: string;
  cardBackground?: string;
  shadowColor?: string;
  style?: React.CSSProperties;
}

/**
 * Fan Card Carousel
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function FanCardCarouselImpl(props) {
  const {
    cards,
    cardWidth,
    cardHeight,
    fanSpread,
    rotationAngle,
    activeScale,
    inactiveScale,
    enableDrag,
    enableScrollNavigation,
    animationDuration,
    verticalPosition,
    mobileVerticalPosition,
    tabletVerticalPosition,
    mobileCarouselScale,
    topicHeadline,
    mainHeadline,
    topicFont,
    headlineFont,
    topicColor,
    headlineColor,
    desktopHeadlineY,
    tabletHeadlineY,
    mobileHeadlineY,
    titleFont,
    subtitleFont,
    tagFont,
    titleColor,
    subtitleColor,
    tagColor,
    tagBackground,
    cardBackground,
    shadowColor,
    cardRadius,
    style,
  } = props;
  const [activeIndex, setActiveIndex] = useState(Math.floor(cards.length / 2));
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);
  const dragX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);
  const scrollTimeoutRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth || 1200);
      }
    };
    updateWidth();
    const element = containerRef.current;
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
  }, []);
  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;
  const responsiveCardWidth = isMobile
    ? Math.min(cardWidth * mobileCarouselScale, containerWidth * 0.78)
    : isTablet
      ? Math.min(cardWidth * 0.88, containerWidth * 0.46)
      : cardWidth;
  const responsiveCardHeight =
    isMobile || isTablet ? responsiveCardWidth * (cardHeight / cardWidth) : cardHeight;
  const responsiveFanSpread = isMobile
    ? Math.min(fanSpread * mobileCarouselScale * 0.72, responsiveCardWidth * 0.52)
    : isTablet
      ? fanSpread * 0.78
      : fanSpread;
  const responsiveRotation = isMobile
    ? rotationAngle * 0.45
    : isTablet
      ? rotationAngle * 0.7
      : rotationAngle;
  const responsiveActiveScale = isMobile
    ? Math.min(activeScale, 1)
    : isTablet
      ? Math.min(activeScale, 1.05)
      : activeScale;
  const responsiveInactiveScale = isMobile
    ? Math.min(inactiveScale, 0.78)
    : isTablet
      ? Math.min(inactiveScale, 0.82)
      : inactiveScale;
  const responsiveVerticalPosition = isMobile
    ? mobileVerticalPosition
    : isTablet
      ? tabletVerticalPosition
      : verticalPosition;
  const responsiveHeadlineY = isMobile
    ? mobileHeadlineY
    : isTablet
      ? tabletHeadlineY
      : desktopHeadlineY;
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        startTransition(() => {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        startTransition(() => {
          setActiveIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
        });
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [cards.length]);
  useEffect(() => {
    if (!enableScrollNavigation || !containerRef.current) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        if (e.deltaY > 0) {
          startTransition(() => {
            setActiveIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
          });
        } else if (e.deltaY < 0) {
          startTransition(() => {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
          });
        }
      }, 50);
    };
    const container = containerRef.current;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enableScrollNavigation, cards.length]);
  const handleCardClick = useCallback(
    (index) => {
      if (index === activeIndex) {
        const link = cards[index].link;
        if (link && typeof window !== "undefined") {
          if (link.startsWith("http") || link.startsWith("//")) {
            window.open(link, "_blank");
          } else {
            window.location.href = link;
          }
        }
      } else {
        startTransition(() => {
          setActiveIndex(index);
        });
      }
    },
    [activeIndex, cards],
  );
  const handleDragEnd = useCallback(
    (_event, info) => {
      setIsDragging(false);
      const threshold = isMobile ? 30 : 50;
      if (info.offset.x > threshold && activeIndex > 0) {
        startTransition(() => {
          setActiveIndex(activeIndex - 1);
        });
      } else if (info.offset.x < -threshold && activeIndex < cards.length - 1) {
        startTransition(() => {
          setActiveIndex(activeIndex + 1);
        });
      }
      animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
    },
    [activeIndex, cards.length, dragX, isMobile],
  );
  const getCardTransform = useCallback(
    (index) => {
      const distance = index - activeIndex;
      const absDistance = Math.abs(distance);
      const xOffset = distance * responsiveFanSpread;
      const yOffset = absDistance * (isMobile ? 32 : isTablet ? 46 : 60);
      const rotation = distance * responsiveRotation;
      const scale =
        index === activeIndex
          ? responsiveActiveScale
          : Math.max(0.4, responsiveInactiveScale - absDistance * 0.05);
      const zIndex = cards.length - absDistance;
      return { xOffset, yOffset, rotation, scale, zIndex };
    },
    [
      activeIndex,
      responsiveFanSpread,
      responsiveRotation,
      responsiveActiveScale,
      responsiveInactiveScale,
      cards.length,
      isMobile,
      isTablet,
    ],
  );
  return /*#__PURE__*/ _jsxs("div", {
    ref: containerRef,
    style: {
      ...style,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingBottom: isMobile ? 40 : isTablet ? 60 : 80,
      paddingTop: isMobile ? 40 : isTablet ? 60 : 80,
      backgroundColor: "#000000",
    },
    children: [
      /*#__PURE__*/ _jsxs("div", {
        style: {
          width: "100%",
          maxWidth: isMobile ? "90%" : isTablet ? "80%" : "1000px",
          textAlign: "center",
          marginBottom: isMobile ? 90 : isTablet ? 160 : 240,
          paddingLeft: 20,
          paddingRight: 20,
          transform: `translateY(${responsiveHeadlineY}px)`,
        },
        children: [
          topicHeadline &&
            /*#__PURE__*/ _jsx("p", {
              style: {
                margin: 0,
                marginBottom: isMobile ? 12 : 16,
                color: topicColor,
                textTransform: "uppercase",
                ...topicFont,
                fontSize: isMobile
                  ? `calc(${topicFont.fontSize} * 0.8)`
                  : isTablet
                    ? `calc(${topicFont.fontSize} * 0.9)`
                    : topicFont.fontSize,
              },
              children: topicHeadline,
            }),
          mainHeadline &&
            /*#__PURE__*/ _jsx("h1", {
              style: {
                margin: 0,
                color: headlineColor,
                ...headlineFont,
                fontSize: isMobile
                  ? `calc(${headlineFont.fontSize} * 0.7)`
                  : isTablet
                    ? `calc(${headlineFont.fontSize} * 0.85)`
                    : headlineFont.fontSize,
              },
              children: mainHeadline,
            }),
        ],
      }),
      /*#__PURE__*/ _jsx("div", {
        style: {
          position: "relative",
          transform: `translateY(${responsiveVerticalPosition}px)`,
          width: "100%",
          height: "100%",
          minHeight: isMobile
            ? responsiveCardHeight * 1.35
            : isTablet
              ? responsiveCardHeight * 1.25
              : responsiveCardHeight * 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        children: cards.map((card, index) => {
          const { xOffset, yOffset, rotation, scale, zIndex } = getCardTransform(index);
          const isActive = index === activeIndex;
          const isHovered = hoveredIndex === index;
          const resolvedCardRadius = isMobile
            ? cardRadius * 0.7
            : isTablet
              ? cardRadius * 0.85
              : cardRadius;
          const cardImage = card.image || {
            src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
            alt: "Default image",
          };
          return /*#__PURE__*/ _jsx(
            motion.div,
            {
              style: {
                position: "absolute",
                left: "50%",
                top: "50%",
                width: responsiveCardWidth,
                height: responsiveCardHeight,
                marginLeft: -responsiveCardWidth / 2,
                marginTop: -responsiveCardHeight / 2,
                cursor: "pointer",
                zIndex,
                touchAction: isMobile ? "pan-y" : "auto",
                borderRadius: resolvedCardRadius,
                overflow: "visible",
              },
              initial: false,
              animate: {
                x: xOffset,
                y: yOffset,
                rotate: rotation,
                scale: isHovered && !isActive ? scale * 1.05 : scale,
              },
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: animationDuration,
              },
              drag: enableDrag || isMobile ? "x" : false,
              dragConstraints: { left: 0, right: 0 },
              dragElastic: isMobile ? 0.3 : 0.2,
              onDragStart: () => setIsDragging(true),
              onDragEnd: handleDragEnd,
              onClick: () => !isDragging && handleCardClick(index),
              onMouseEnter: () => !isMobile && startTransition(() => setHoveredIndex(index)),
              onMouseLeave: () => !isMobile && startTransition(() => setHoveredIndex(null)),
              whileHover: !isActive && !isMobile ? { y: yOffset - 10 } : undefined,
              children: /*#__PURE__*/ _jsxs(motion.div, {
                style: {
                  width: "100%",
                  height: "100%",
                  borderRadius: resolvedCardRadius,
                  overflow: "hidden",
                  backgroundColor: cardBackground,
                  boxShadow: `0 ${isActive ? 20 : 10}px ${isActive ? 40 : 30}px ${shadowColor}`,
                  position: "relative",
                  clipPath: `inset(0 round ${resolvedCardRadius}px)`,
                  WebkitClipPath: `inset(0 round ${resolvedCardRadius}px)`,
                  transform: "translateZ(0)",
                  isolation: "isolate",
                },
                animate: {
                  boxShadow: isHovered
                    ? `0 ${isActive ? 25 : 15}px ${isActive ? 50 : 40}px ${shadowColor}`
                    : `0 ${isActive ? 20 : 10}px ${isActive ? 40 : 30}px ${shadowColor}`,
                },
                children: [
                  /*#__PURE__*/ _jsx(motion.div, {
                    style: {
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: resolvedCardRadius,
                    },
                    children: /*#__PURE__*/ _jsx(motion.img, {
                      src: cardImage.src,
                      alt: cardImage.alt,
                      style: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: resolvedCardRadius,
                        display: "block",
                      },
                      animate: { scale: isHovered ? 1.05 : 1 },
                      transition: { type: "spring", stiffness: 300, damping: 25 },
                    }),
                  }),
                  /*#__PURE__*/ _jsxs("div", {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      padding: isMobile ? 16 : isTablet ? 20 : 24,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
                    },
                    children: [
                      /*#__PURE__*/ _jsxs("div", {
                        style: { flex: 1, marginRight: 12 },
                        children: [
                          /*#__PURE__*/ _jsx("h3", {
                            style: {
                              margin: 0,
                              color: titleColor,
                              ...titleFont,
                              fontSize: isMobile
                                ? `calc(${titleFont.fontSize} * 0.7)`
                                : isTablet
                                  ? `calc(${titleFont.fontSize} * 0.85)`
                                  : titleFont.fontSize,
                            },
                            children: card.title,
                          }),
                          /*#__PURE__*/ _jsx("p", {
                            style: {
                              margin: "4px 0 0 0",
                              color: subtitleColor,
                              ...subtitleFont,
                              fontSize: isMobile
                                ? `calc(${subtitleFont.fontSize} * 0.7)`
                                : isTablet
                                  ? `calc(${subtitleFont.fontSize} * 0.85)`
                                  : subtitleFont.fontSize,
                            },
                            children: card.subtitle,
                          }),
                        ],
                      }),
                      card.tag &&
                        /*#__PURE__*/ _jsx("div", {
                          style: {
                            backgroundColor: tagBackground,
                            color: tagColor,
                            padding: isMobile ? "6px 12px" : "8px 16px",
                            borderRadius: 999,
                            backdropFilter: "blur(12px) saturate(180%)",
                            WebkitBackdropFilter: "blur(12px) saturate(180%)",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            ...tagFont,
                            fontSize: isMobile
                              ? `calc(${tagFont.fontSize} * 0.7)`
                              : isTablet
                                ? `calc(${tagFont.fontSize} * 0.85)`
                                : tagFont.fontSize,
                            whiteSpace: "nowrap",
                          },
                          children: card.tag,
                        }),
                    ],
                  }),
                ],
              }),
            },
            index,
          );
        }),
      }),
      /*#__PURE__*/ _jsx("div", {
        style: {
          position: "absolute",
          bottom: isMobile ? 20 : 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          zIndex: 1e3,
        },
        children: cards.map((_, index) =>
          /*#__PURE__*/ _jsx(
            "button",
            {
              onClick: () => startTransition(() => setActiveIndex(index)),
              style: {
                width: index === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                backgroundColor: index === activeIndex ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              },
              "aria-label": `Go to card ${index + 1}`,
            },
            index,
          ),
        ),
      }),
    ],
  });
}

export function FanCardCarousel(props: FanCardCarouselProps) {
  return _jsx(FanCardCarouselImpl, mergeProps(props));
}

FanCardCarousel.displayName = "FanCardCarousel";

export default FanCardCarousel;
