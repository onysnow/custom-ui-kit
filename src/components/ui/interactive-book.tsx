/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { motion, useAnimationControls } from "framer-motion";
export interface InteractiveBookProps {
  frontCover?: string;
  backCover?: string;
  innerPages?: string[];
  width?: number;
  height?: number;
  borderRadius?: number;
  shadow?: {
    color?: string;
    opacity?: number;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
    spread?: number;
  };
}

const DEFAULT_PROPS = {
  width: 400,
  height: 600,
  innerPages: [] as string[],
  borderRadius: 10,
  shadow: { color: "#000", opacity: 0.4, blur: 10, offsetX: 5, offsetY: 5, spread: 0 },
};

export function InteractiveBook(rawProps: InteractiveBookProps) {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const {
    width = 400,
    height = 600,
    frontCover,
    backCover,
    innerPages = [],
    shadow,
    borderRadius = 10,
  } = props;
  const rawImages = [frontCover, ...innerPages, backCover].filter(Boolean);
  const allImages = rawImages.length % 2 === 0 ? rawImages : [...rawImages, null];
  const leafPairs = [];
  for (let i = 0; i < allImages.length; i += 2) {
    leafPairs.push([allImages[i], allImages[i + 1]]);
  }
  const totalLeaves = leafPairs.length;
  const [flippedCount, setFlippedCount] = React.useState(0);
  const [isBookClosed, setIsBookClosed] = React.useState(true);
  const flippedRef = React.useRef(0);
  // Fixed-length pool (always 100 calls per render), so hook order is stable.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const controlsPool = Array.from({ length: 100 }, () => useAnimationControls());
  const bookContainerControls = useAnimationControls();
  const getRgba = (color, alpha) => {
    if (!color) return `rgba(0,0,0,${alpha})`;
    const hex = color.replace("#", "");
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const shadowCol = getRgba(shadow.color, shadow.opacity);
  const closedBookShadow = `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadowCol}`;
  const handleClick = async () => {
    if (flippedCount === 0) {
      setIsBookClosed(false);
      bookContainerControls.start({
        x: width / 2,
        transition: { duration: 0.6, ease: "easeInOut" },
      });
    }
    if (flippedCount < totalLeaves) {
      const indexToFlip = flippedCount;
      setFlippedCount((prev) => prev + 1);
      flippedRef.current = flippedCount + 1;
      await controlsPool[indexToFlip].start({
        rotateY: -180,
        transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
      });
    } else {
      bookContainerControls.start({ x: 0, transition: { duration: 0.8, ease: "easeInOut" } });
      for (let i = totalLeaves - 1; i >= 0; i--) {
        controlsPool[i].start({ rotateY: 0, transition: { duration: 0.5, ease: "easeInOut" } });
        await new Promise((r) => setTimeout(r, 80));
      }
      setFlippedCount(0);
      flippedRef.current = 0;
      setIsBookClosed(true);
    }
  };
  return /*#__PURE__*/ _jsx("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      perspective: 2500,
      cursor: "pointer",
      overflow: "visible",
    },
    onClick: handleClick,
    children: /*#__PURE__*/ _jsx(motion.div, {
      animate: bookContainerControls,
      style: {
        width,
        height,
        position: "relative",
        transformStyle: "preserve-3d",
        boxShadow: isBookClosed ? closedBookShadow : "0px 0px 0px transparent",
      },
      children: leafPairs.map(([frontSrc, backSrc], index) => {
        const isFlipped = index < flippedCount;
        const isFlipping = index === flippedCount - 1; // Reduced to 0.4px to remove the "thick border" look
        const zOffset = isFlipped ? index * 0.4 : (totalLeaves - index) * 0.4; // Boost the zIndex of the page currently moving to prevent it
        // from clipping through the pages below it.
        const zIndex = isFlipping ? 100 : isFlipped ? index : totalLeaves - index;
        return /*#__PURE__*/ _jsxs(
          motion.div,
          {
            animate: controlsPool[index],
            initial: { rotateY: 0 },
            style: {
              position: "absolute",
              inset: 0,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              zIndex: zIndex,
              transform: `translateZ(${zOffset}px)`,
              willChange: "transform",
            },
            children: [
              /*#__PURE__*/ _jsxs("div", {
                style: {
                  ...faceStyle,
                  borderRadius: `0px ${borderRadius}px ${borderRadius}px 0px`,
                },
                children: [
                  frontSrc &&
                    /*#__PURE__*/ _jsx("img", { src: frontSrc, style: imgStyle, alt: "" }),
                  /*#__PURE__*/ _jsx("div", { style: spineGradient }),
                ],
              }),
              /*#__PURE__*/ _jsxs("div", {
                style: {
                  ...faceStyle,
                  transform: "rotateY(180deg) translateZ(0.01px)",
                  borderRadius: `${borderRadius}px 0px 0px ${borderRadius}px`,
                },
                children: [
                  backSrc && /*#__PURE__*/ _jsx("img", { src: backSrc, style: imgStyle, alt: "" }),
                  /*#__PURE__*/ _jsx("div", {
                    style: { ...spineGradient, left: "auto", right: 0, transform: "scaleX(-1)" },
                  }),
                ],
              }),
            ],
          },
          index,
        );
      }),
    }),
  });
}
const faceStyle = {
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  backgroundColor: "transparent",
  overflow: "hidden",
};
const imgStyle = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const spineGradient = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "12%",
  background: "linear-gradient(to right, rgba(0,0,0,0.1), transparent)",
  pointerEvents: "none",
};

InteractiveBook.displayName = "InteractiveBook";

export default InteractiveBook;
