/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Sticky full width and page height scroll component with CMS collection images
// Displays full screen background image with text centered
// Vertical stack of 8 thumbnail images with white outline on active image
// Scrolling transitions between images with fade effect
// Property controls for fonts, thumbnail radius, and outline styling
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useEffect, useState, useRef, useMemo, startTransition } from "react";
import { motion, useScroll } from "framer-motion";
/**
 * Scroll Image Gallery
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export interface ImageScrollerItem {
  image?: { src: string; srcSet?: string; alt?: string };
  video?: string;
  text?: string;
}

export interface ImageScrollerProps {
  items?: ImageScrollerItem[];
  transition?: {
    transitionType?: string;
    imageAnimationDelay?: number;
    textAnimationDelay?: number;
  };
  layout?: { backgroundColor?: string; componentPadding?: number; [key: string]: unknown };
  dock?: {
    dockPosition?: string;
    dockInset?: number;
    dockPadding?: number;
    thumbBlur?: number;
    thumbColor?: string;
    thumbRadius?: number;
    [key: string]: unknown;
  };
  text?: { fontWeight?: number; textColor?: string; [key: string]: unknown };
  thumbnails?: {
    dimInactive?: boolean;
    inactiveOpacity?: number;
    thumbImageRadius?: number;
    thumbPadding?: number;
    thumbSize?: number;
    thumbnailRadius?: number;
    [key: string]: unknown;
  };
  outline?: {
    outlineRadius?: number;
    outlineSize?: number;
    outlineThickness?: number;
    [key: string]: unknown;
  };
  dragHandle?: {
    dragHandleShow?: boolean;
    dragHandleColor?: string;
    dragHandleWidth?: number;
    dragHandleHeight?: number;
    dragHandleRadius?: number;
    dragHandleInset?: number;
    dragHandleBGBlur?: number;
    dragHandleInnerColor?: string;
    dragHandleInnerWidth?: number;
    dragHandleInnerHeight?: number;
    dragHandleInnerRadius?: number;
    dragHandleInnerOpacity?: number;
    [key: string]: unknown;
  };
}

export function ImageScroller(props: ImageScrollerProps) {
  const {
    items = [
      {
        image: {
          src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
          alt: "Image 1",
        },
        text: "First Image",
      },
      {
        image: {
          src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
          alt: "Image 2",
        },
        text: "Second Image",
      },
      {
        image: {
          src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
          alt: "Image 3",
        },
        text: "Third Image",
      },
      {
        image: {
          src: "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg",
          alt: "Image 4",
        },
        text: "Fourth Image",
      },
      {
        image: {
          src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
          alt: "Image 5",
        },
        text: "Fifth Image",
      },
      {
        image: {
          src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
          alt: "Image 6",
        },
        text: "Sixth Image",
      },
      {
        image: {
          src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
          alt: "Image 7",
        },
        text: "Seventh Image",
      },
      {
        image: {
          src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
          alt: "Image 8",
        },
        text: "Eighth Image",
      },
    ],
    transition,
    layout,
    dock,
    text,
    thumbnails,
    outline,
    dragHandle,
  } = props;
  const transitionType = transition?.transitionType ?? "fade";
  const imageAnimationDelay = transition?.imageAnimationDelay ?? 0;
  const textAnimationDelay = transition?.textAnimationDelay ?? 0.2;
  const backgroundColor = layout?.backgroundColor ?? "#DDD";
  const componentPadding = layout?.componentPadding ?? 0;
  const dockPosition = dock?.dockPosition ?? "center";
  const thumbColor = dock?.thumbColor ?? "#fff";
  const dockInset = dock?.dockInset ?? 0;
  const dockPadding = dock?.dockPadding ?? 8;
  const thumbBlur = dock?.thumbBlur ?? 5;
  const thumbRadius = dock?.thumbRadius ?? 12;
  const textFont = text?.textFont;
  const textColor = text?.textColor ?? "#FFFFFF";
  const fontWeight = text?.fontWeight ?? 400;
  const thumbSize = thumbnails?.thumbSize ?? 64; // default to 64
  const thumbnailRadius = thumbnails?.thumbnailRadius ?? 12;
  const thumbPadding = thumbnails?.thumbPadding ?? 8;
  const thumbImageRadius = thumbnails?.thumbImageRadius ?? 12;
  const dimInactive = thumbnails?.dimInactive ?? false;
  const inactiveOpacity = thumbnails?.inactiveOpacity ?? 0.5;
  const outlineSize = outline?.outlineSize ?? 72; // default to 4
  const outlineThickness = outline?.outlineThickness ?? 2;
  const outlineRadius = outline?.outlineRadius ?? 16;
  const dragHandleShow = dragHandle?.dragHandleShow ?? true;
  const dragHandleColor = dragHandle?.dragHandleColor ?? "#ccc";
  const dragHandleRadius = dragHandle?.dragHandleRadius ?? 6;
  const dragHandleBGBlur = dragHandle?.dragHandleBGBlur ?? 0;
  const dragHandleWidth = dragHandle?.dragHandleWidth ?? 36;
  const dragHandleHeight = dragHandle?.dragHandleHeight ?? 12;
  const dragHandleInset = dragHandle?.dragHandleInset ?? -18;
  const dragHandleInnerColor = dragHandle?.dragHandleInnerColor ?? "#555";
  const dragHandleInnerWidth = dragHandle?.dragHandleInnerWidth ?? 20;
  const dragHandleInnerHeight = dragHandle?.dragHandleInnerHeight ?? 4;
  const dragHandleInnerRadius = dragHandle?.dragHandleInnerRadius ?? 2;
  const dragHandleInnerOpacity = dragHandle?.dragHandleInnerOpacity ?? 1; // Outer scroll container (tall)
  const containerRef = useRef(null); // Inner sticky viewport (one screen high) — used for drag math
  const stickyRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0); // DRAGGING STATES (must be declared before any conditional returns)
  const [isDragging, setIsDragging] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const dockRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const isStaticRenderer = false;
  const getImageSrc = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    if (typeof image === "object") {
      const src = image.src;
      if (typeof src === "string") return src;
      if (src && typeof src === "object") {
        const nested = src.src;
        if (typeof nested === "string") return nested;
      }
    }
    return "";
  };
  const hasVideo = (item) => {
    return !!item?.video && item.video.length > 0;
  }; // Filter out items without valid images
  const validItems = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return arr.filter((item) => {
      if (!item) return false;
      const src = getImageSrc(item.image);
      return typeof src === "string" && src.length > 0;
    });
  }, [items]); // Clamp active index whenever item count changes
  useEffect(() => {
    const total = validItems.length;
    if (total <= 0) {
      if (activeIndex !== 0) startTransition(() => setActiveIndex(0));
      return;
    }
    const next = Math.max(0, Math.min(activeIndex, total - 1));
    if (next !== activeIndex) startTransition(() => setActiveIndex(next));
  }, [validItems.length]);
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const totalItems = validItems.length;
      if (totalItems === 0) return;
      const newIndex = Math.min(Math.floor(latest * totalItems), totalItems - 1);
      startTransition(() => {
        setActiveIndex(newIndex);
      });
    });
    return () => unsubscribe();
  }, [scrollYProgress, validItems.length]);
  const scrollHeight = useMemo(() => {
    return Math.max(validItems.length * 100, 100);
  }, [validItems.length]);
  const getTransitionVariants = (transitionType, index, activeIndex) => {
    const isActive = activeIndex === index;
    const isInitial = index === 0;
    switch (transitionType) {
      case "scale":
        return {
          initial: { opacity: isInitial ? 1 : 0, scale: isInitial ? 1 : 0.8 },
          animate: { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.2 },
        };
      case "rotate":
        return {
          initial: { opacity: isInitial ? 1 : 0, rotate: isInitial ? 0 : -180 },
          animate: { opacity: isActive ? 1 : 0, rotate: isActive ? 0 : 180 },
        };
      case "spiral":
        return {
          initial: {
            opacity: isInitial ? 1 : 0,
            rotate: isInitial ? 0 : -360,
            scale: isInitial ? 1 : 0.3,
          },
          animate: {
            opacity: isActive ? 1 : 0,
            rotate: isActive ? 0 : 360,
            scale: isActive ? 1 : 0.3,
          },
        };
      case "blur":
        return {
          initial: { opacity: isInitial ? 1 : 0, filter: isInitial ? "blur(0px)" : "blur(20px)" },
          animate: { opacity: isActive ? 1 : 0, filter: isActive ? "blur(0px)" : "blur(20px)" },
        };
      case "zoom":
        return {
          initial: { opacity: isInitial ? 1 : 0, scale: isInitial ? 1 : 0.5 },
          animate: { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.5 },
        };
      case "pixellated":
        return {
          initial: {
            opacity: isInitial ? 1 : 0,
            filter: isInitial
              ? "none"
              : "blur(0px) grayscale(0) contrast(1) brightness(1) opacity(1)",
          },
          animate: {
            opacity: isActive ? 1 : 0,
            filter: isActive
              ? "none"
              : "blur(22px) grayscale(0.86) brightness(1.8) contrast(0.6) opacity(0.34)",
          },
        };
      case "saturate":
        return {
          initial: {
            opacity: isInitial ? 1 : 0,
            filter: isInitial
              ? "saturate(1) hue-rotate(0deg) invert(0) sepia(0) brightness(1) contrast(1)"
              : "saturate(8) hue-rotate(720deg) invert(1) sepia(1) brightness(2) contrast(3)",
          },
          animate: {
            opacity: isActive ? 1 : 0,
            filter: isActive
              ? "saturate(1) hue-rotate(0deg) invert(0) sepia(0) brightness(1) contrast(1)"
              : "saturate(8) hue-rotate(720deg) invert(1) sepia(1) brightness(2) contrast(3)",
          },
        };
      case "fade":
      default:
        return {
          initial: { opacity: index === 0 ? 1 : 0 },
          animate: { opacity: isActive ? 1 : 0 },
        };
    }
  };
  const handleThumbnailClick = (index) => {
    if (typeof window !== "undefined" && containerRef.current) {
      const containerTop = containerRef.current.offsetTop;
      const sectionHeight = window.innerHeight;
      const scrollTarget = containerTop + index * sectionHeight;
      window.scrollTo({ top: scrollTarget, behavior: "smooth" });
    }
  };
  const isHorizontal =
    dockPosition === "top" || dockPosition === "bottom" || dockPosition === "center-horizontal";
  const thumbnailGap = thumbPadding ?? 8;
  const getDockStyles = () => {
    const baseStyles = { position: "absolute", zIndex: 10, pointerEvents: "auto" };
    switch (dockPosition) {
      case "left":
        return { ...baseStyles, top: "50%", left: dockInset, transform: "translateY(-50%)" };
      case "right":
        return { ...baseStyles, top: "50%", right: dockInset, transform: "translateY(-50%)" };
      case "top":
        return { ...baseStyles, top: dockInset, left: "50%", transform: "translateX(-50%)" };
      case "bottom":
        return { ...baseStyles, bottom: dockInset, left: "50%", transform: "translateX(-50%)" };
      case "center-horizontal":
        return { ...baseStyles, top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      case "center":
      default:
        return { ...baseStyles, top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  }; // Reset logical drag when dockPosition changes (visual position still comes from getDockStyles)
  useEffect(() => {
    startTransition(() => setDrag({ x: 0, y: 0 }));
  }, [dockPosition, dockInset]);
  function handleDragStart(e) {
    if (!dragHandleShow) return;
    if (!dockRef.current || !stickyRef.current) return;
    const handleRect = dockRef.current
      .querySelector('[aria-label="Drag handle"]')
      ?.getBoundingClientRect();
    if (handleRect) {
      if (
        e.clientX < handleRect.left ||
        e.clientX > handleRect.right ||
        e.clientY < handleRect.top ||
        e.clientY > handleRect.bottom
      ) {
        e.preventDefault();
        return;
      }
    }
    e.preventDefault();
    startTransition(() => setIsDragging(true));
    const containerRect = stickyRef.current.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();
    const dockVisualX = dockRect.left - containerRect.left;
    const dockVisualY = dockRect.top - containerRect.top;
    dragOffset.current = {
      x: e.clientX - containerRect.left - dockVisualX,
      y: e.clientY - containerRect.top - dockVisualY,
    };
    if (typeof document !== "undefined") {
      document.body.style.userSelect = "none";
    }
  }
  function handleDragMove(e) {
    if (!isDragging || !dragHandleShow) return;
    if (!stickyRef.current || !dockRef.current) return;
    const containerRect = stickyRef.current.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();
    let relX = e.clientX - containerRect.left - dragOffset.current.x;
    let relY = e.clientY - containerRect.top - dragOffset.current.y;
    const minX = dockInset;
    const minY = dockInset;
    const maxX = containerRect.width - dockRect.width - dockInset;
    const maxY = containerRect.height - dockRect.height - dockInset;
    relX = Math.max(minX, Math.min(relX, maxX));
    relY = Math.max(minY, Math.min(relY, maxY));
    startTransition(() => setDrag({ x: relX, y: relY }));
  }
  function handleDragEnd() {
    startTransition(() => setIsDragging(false));
    if (typeof document !== "undefined") {
      document.body.style.userSelect = "";
    }
  }
  useEffect(() => {
    if (!isDragging) return;
    if (!dragHandleShow) return;
    const move = (e) => handleDragMove(e);
    const up = () => handleDragEnd();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [isDragging, dragHandleShow]);
  const dockDynamicStyle = {
    ...getDockStyles(),
    ...(drag.x !== 0 || drag.y !== 0
      ? {
          left: drag.x,
          top: drag.y,
          bottom: undefined,
          right: undefined,
          transform: undefined,
          position: "absolute",
          pointerEvents: "auto",
          zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
          willChange: "transform",
        }
      : { cursor: isDragging ? "grabbing" : "grab" }),
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prevHtml = document.documentElement.style.overscrollBehaviorY;
      const prevBody = document.body.style.overscrollBehaviorY;
      document.documentElement.style.overscrollBehaviorY = "none";
      document.body.style.overscrollBehaviorY = "none";
      return () => {
        document.documentElement.style.overscrollBehaviorY = prevHtml;
        document.body.style.overscrollBehaviorY = prevBody;
      };
    }
  }, []); // CONDITIONAL RENDER (after all hooks)
  if (validItems.length === 0) {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: textColor,
        ...(textFont || {}),
        userSelect: "none",
        pointerEvents: "none",
      },
      children: "No valid images to display",
    });
  }
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    style: {
      position: "relative",
      width: "100%",
      minHeight: "100vh",
      height: `${scrollHeight}vh`,
      backgroundColor: backgroundColor,
      boxSizing: "border-box",
      overflow: isStaticRenderer ? "hidden" : undefined,
      overscrollBehaviorY: "none",
    },
    children: /*#__PURE__*/ _jsxs("div", {
      ref: stickyRef,
      style: {
        position: "sticky",
        top: componentPadding,
        left: componentPadding,
        right: componentPadding,
        width: `calc(100% - ${componentPadding * 2}px)`,
        height: `calc(100vh - ${componentPadding * 2}px)`,
        overflow: "hidden",
        boxSizing: "border-box",
      },
      children: [
        validItems.map((item, index) => {
          const variants = getTransitionVariants(transitionType, index, activeIndex);
          const src = getImageSrc(item.image);
          return /*#__PURE__*/ _jsx(
            motion.div,
            {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: activeIndex === index ? undefined : "none",
                zIndex: activeIndex === index ? 1 : 0,
                overflow: "hidden",
                ...(isStaticRenderer ? { clipPath: `inset(0px 0px 0px 0px)` } : {}),
              },
              initial: variants.initial,
              animate: variants.animate,
              transition: { duration: 0.6, ease: "easeInOut", delay: imageAnimationDelay },
              children: hasVideo(item)
                ? /*#__PURE__*/ _jsx("video", {
                    src: item.video,
                    autoPlay: true,
                    loop: true,
                    muted: true,
                    playsInline: true,
                    style: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      position: "absolute",
                      inset: 0,
                      zIndex: 0,
                      backgroundColor: backgroundColor,
                      display: "block",
                      userSelect: "none",
                      ...(isStaticRenderer ? { clipPath: `inset(0px 0px 0px 0px)` } : {}),
                    },
                  })
                : /*#__PURE__*/ _jsxs(_Fragment, {
                    children: [
                      /*#__PURE__*/ _jsx("img", {
                        src: src,
                        alt:
                          typeof item.image === "object" && item.image?.alt
                            ? item.image.alt
                            : item.text,
                        style: {
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          position: "absolute",
                          inset: 0,
                          zIndex: -1,
                          backgroundColor: backgroundColor,
                          display: "block",
                          userSelect: "none",
                          ...(isStaticRenderer ? { clipPath: `inset(0px 0px 0px 0px)` } : {}),
                        },
                        draggable: false,
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        style: {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundImage: src ? `url(${src})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundColor: backgroundColor,
                          backgroundRepeat: "no-repeat",
                          backgroundAttachment: "scroll",
                          ...(isStaticRenderer ? { clipPath: `inset(0px 0px 0px 0px)` } : {}),
                        },
                      }),
                    ],
                  }),
            },
            index,
          );
        }),
        /*#__PURE__*/ _jsx("div", {
          style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            textAlign: "center",
            color: textColor,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            pointerEvents: "none",
          },
          children: validItems.map((item, index) => {
            const { fontWeight: _, ...nonWeightFont } = textFont || {};
            const textVariants = getTransitionVariants(transitionType, index, activeIndex);
            return /*#__PURE__*/ _jsx(
              motion.div,
              {
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: textColor,
                  ...nonWeightFont,
                  fontVariationSettings: `'wght' ${fontWeight}`,
                  fontWeight: fontWeight,
                  textAlign: "center",
                  userSelect: "none",
                  pointerEvents: "none",
                },
                initial: textVariants.initial,
                animate: textVariants.animate,
                transition: { duration: 0.6, ease: "easeInOut", delay: textAnimationDelay },
                children: item.text,
              },
              index,
            );
          }),
        }),
        /*#__PURE__*/ _jsxs("div", {
          ref: dockRef,
          style: dockDynamicStyle,
          onMouseDown: dragHandleShow ? handleDragStart : undefined,
          children: [
            dragHandleShow &&
              /*#__PURE__*/ _jsx("div", {
                style: {
                  position: "absolute",
                  top: dragHandleInset,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: dragHandleWidth,
                  height: dragHandleHeight,
                  borderRadius: dragHandleRadius,
                  background: dragHandleColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 20,
                  cursor: isDragging ? "grabbing" : "grab",
                  backdropFilter: dragHandleBGBlur ? `blur(${dragHandleBGBlur}px)` : undefined,
                  WebkitBackdropFilter: dragHandleBGBlur
                    ? `blur(${dragHandleBGBlur}px)`
                    : undefined,
                },
                "aria-label": "Drag handle",
                children: /*#__PURE__*/ _jsx("svg", {
                  width: dragHandleInnerWidth,
                  height: dragHandleInnerHeight,
                  viewBox: `0 0 ${dragHandleInnerWidth} ${dragHandleInnerHeight}`,
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg",
                  style: { display: "block" },
                  children: /*#__PURE__*/ _jsx("rect", {
                    x: "0",
                    y: "0",
                    width: dragHandleInnerWidth,
                    height: dragHandleInnerHeight,
                    rx: dragHandleInnerRadius,
                    fill: dragHandleInnerColor,
                    fillOpacity: dragHandleInnerOpacity,
                  }),
                }),
              }),
            /*#__PURE__*/ _jsx("div", {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "max-content",
                height: "max-content",
                minWidth: "100%",
                minHeight: "100%",
                background: thumbColor,
                borderRadius: thumbnailRadius,
                backdropFilter: thumbBlur ? `blur(${thumbBlur}px)` : undefined,
                WebkitBackdropFilter: thumbBlur ? `blur(${thumbBlur}px)` : undefined,
                zIndex: 0,
                pointerEvents: "none",
              },
            }),
            /*#__PURE__*/ _jsx("div", {
              style: {
                position: "relative",
                display: "flex",
                flexDirection: isHorizontal ? "row" : "column",
                gap: thumbnailGap,
                zIndex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: dockPadding,
                background: "transparent",
              },
              children: validItems.map((item, index) => {
                const src = getImageSrc(item.image);
                return /*#__PURE__*/ _jsxs(
                  "div",
                  {
                    style: {
                      position: "relative",
                      width: thumbSize,
                      height: thumbSize,
                      minWidth: thumbSize,
                      minHeight: thumbSize,
                      maxWidth: thumbSize,
                      maxHeight: thumbSize,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    onClick: () => handleThumbnailClick(index),
                    children: [
                      activeIndex === index &&
                        /*#__PURE__*/ _jsx(motion.div, {
                          layoutId: "thumb-outline",
                          style: {
                            position: "absolute",
                            top: `calc(50% - ${outlineSize / 2}px)`,
                            left: `calc(50% - ${outlineSize / 2}px)`,
                            width: outlineSize,
                            height: outlineSize,
                            boxSizing: "border-box",
                            border: `${outlineThickness}px solid white`,
                            borderRadius: outlineRadius,
                            pointerEvents: "none",
                            zIndex: 1e3,
                            background: "transparent",
                            transition: "border-color 0.15s, border-width 0.15s",
                          },
                          transition: { type: "spring", stiffness: 400, damping: 32 },
                        }),
                      /*#__PURE__*/ _jsxs("div", {
                        style: {
                          width: "100%",
                          height: "100%",
                          borderRadius: thumbImageRadius,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          opacity: dimInactive && activeIndex !== index ? inactiveOpacity : 1,
                          transition: "opacity 0.3s ease",
                        },
                        children: [
                          hasVideo(item)
                            ? /*#__PURE__*/ _jsx("video", {
                                src: item.video,
                                muted: true,
                                playsInline: true,
                                style: {
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: thumbImageRadius,
                                  backgroundColor: backgroundColor,
                                  display:
                                    typeof window !== "undefined" &&
                                    window.matchMedia &&
                                    window.matchMedia("(max-width: 768px)").matches
                                      ? "none"
                                      : "block",
                                },
                              })
                            : /*#__PURE__*/ _jsx("div", {
                                style: {
                                  width: "100%",
                                  height: "100%",
                                  backgroundImage: src ? `url(${src})` : "none",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  borderRadius: thumbImageRadius,
                                  backgroundColor: backgroundColor,
                                  backgroundRepeat: "no-repeat",
                                  backgroundAttachment: "scroll",
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                },
                              }),
                          hasVideo(item) &&
                            typeof window !== "undefined" &&
                            window.matchMedia &&
                            window.matchMedia("(max-width: 768px)").matches &&
                            /*#__PURE__*/ _jsx("div", {
                              style: {
                                width: "100%",
                                height: "100%",
                                backgroundImage: src ? `url(${src})` : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: thumbImageRadius,
                                backgroundColor: backgroundColor,
                                backgroundRepeat: "no-repeat",
                                backgroundAttachment: "scroll",
                                position: "absolute",
                                top: 0,
                                left: 0,
                              },
                            }),
                        ],
                      }),
                    ],
                  },
                  index,
                );
              }),
            }),
          ],
        }),
      ],
    }),
  });
}

ImageScroller.displayName = "ImageScroller";

export default ImageScroller;
