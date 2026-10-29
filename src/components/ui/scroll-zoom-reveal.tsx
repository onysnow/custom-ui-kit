/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState, startTransition } from "react";
/* ----------------------------------
   SHARED RESPONSIVE CONFIGURATION
----------------------------------- */ const RESPONSIVE = {
  desktop: {
    leftFont: "55px",
    rightFont: "55px",
    textWidth: "250px",
    centerFont: "56px",
    playSize: "60px",
    gap: "20px",
    startWidth: "15vw",
    startHeight: "5vh",
  },
  tablet: {
    leftFont: "40px",
    rightFont: "40px",
    textWidth: "160px",
    centerFont: "42px",
    playSize: "52px",
    gap: "16px",
    startWidth: "15vw",
    startHeight: "5vh",
  },
  mobile: {
    leftFont: "22px",
    rightFont: "22px",
    textWidth: "100px",
    centerFont: "26px",
    playSize: "42px",
    gap: "10px",
    startWidth: "15vw",
    startHeight: "5vh",
  },
};
/* ----------------------------------
   SHARED ICON RENDERER
----------------------------------- */ const renderIcon = (
  iconType,
  screen,
  buttonBgColor,
  buttonTextColor,
  customIconImage,
) => {
  if (iconType === "none") return null;
  const current = RESPONSIVE[screen];
  const iconSize = screen === "mobile" ? 14 : 20;
  if (iconType === "play") {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: buttonBgColor,
        width: current.playSize,
        height: current.playSize,
        borderRadius: "50%",
        flexShrink: 0,
      },
      children: /*#__PURE__*/ _jsx("div", {
        style: {
          position: "relative",
          left: "2px",
          borderStyle: "solid",
          borderWidth: screen === "mobile" ? "7px 0px 7px 14px" : "10px 0px 10px 20px",
          borderColor: `transparent transparent transparent ${buttonTextColor}`,
        },
      }),
    });
  }
  if (iconType === "arrow") {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: buttonBgColor,
        width: current.playSize,
        height: current.playSize,
        borderRadius: "50%",
        flexShrink: 0,
      },
      children: /*#__PURE__*/ _jsx("svg", {
        width: iconSize,
        height: iconSize,
        viewBox: "0 0 24 24",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: /*#__PURE__*/ _jsx("path", {
          d: "M5 12H19M19 12L12 5M19 12L12 19",
          stroke: buttonTextColor,
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }),
      }),
    });
  }
  if (iconType === "image" && customIconImage) {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: buttonBgColor,
        width: current.playSize,
        height: current.playSize,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
      },
      children: /*#__PURE__*/ _jsx("img", {
        src: customIconImage,
        alt: "Play Video",
        style: { width: "50%", height: "50%", objectFit: "contain" },
      }),
    });
  }
  return null;
};
/* ----------------------------------
   ANIMATED COMPONENT (Published Site)
----------------------------------- */ export interface ScrollZoomRevealProps {
  videoUrl?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  image?: { src: string; srcSet?: string; alt?: string };
  leftText?: string;
  rightText?: string;
  buttonText?: string;
  buttonLink?: string;
  leftFont?: React.CSSProperties;
  rightFont?: React.CSSProperties;
  buttonFont?: React.CSSProperties;
  textColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  animationStiffness?: number;
  animationDamping?: number;
  animationMass?: number;
  iconType?: "play" | "arrow" | "image" | "none";
  customIconImage?: { src: string; alt?: string };
}

export function ScrollZoomReveal(props: ScrollZoomRevealProps) {
  const {
    image,
    videoUrl = "https://framerusercontent.com/assets/eyVMUuEcpvbKYJwPqZANvybTfI.mp4",
    autoPlay = false,
    loop = true,
    muted = false,
    leftText = "\xa92026",
    rightText = "Showreel",
    buttonText = "Play showreel",
    buttonLink = "#",
    textColor = "#000000",
    buttonTextColor = "#FFFFFF",
    buttonBgColor = "#000000",
    animationStiffness = 90,
    animationDamping = 25,
    animationMass = 0.6,
    leftFont = { fontWeight: 500 },
    rightFont = { fontWeight: 500 },
    buttonFont = { fontWeight: 500 },
    iconType = "play",
    customIconImage,
  } = props;
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [screen, setScreen] = useState("desktop");
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 810) startTransition(() => setScreen("mobile"));
      else if (window.innerWidth <= 1799) startTransition(() => setScreen("tablet"));
      else startTransition(() => setScreen("desktop"));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const current = RESPONSIVE[screen];
  const imageSrc =
    image?.src ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80";
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const width = useTransform(scrollYProgress, [0, 1], [current.startWidth, "100vw"]);
  const height = useTransform(scrollYProgress, [0, 1], [current.startHeight, "100vh"]);
  const rawRadius = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const borderRadius = useSpring(rawRadius, {
    stiffness: animationStiffness,
    damping: animationDamping,
    mass: animationMass,
  });
  const centerTextOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const centerTextY = useTransform(scrollYProgress, [0.45, 0.6], [60, 0]);
  const handlePlayClick = (e) => {
    if (videoUrl) {
      e.preventDefault();
      setIsPlaying(true);
      if (videoRef.current) videoRef.current.play();
    }
  };
  return /*#__PURE__*/ _jsx("section", {
    ref: ref,
    style: { height: "400vh", position: "relative" },
    children: /*#__PURE__*/ _jsxs("div", {
      style: {
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: current.gap,
        padding: "0 20px",
      },
      children: [
        /*#__PURE__*/ _jsx("div", {
          style: {
            whiteSpace: "nowrap",
            width: current.textWidth,
            textAlign: "right",
            fontWeight: 500,
            color: textColor,
            ...leftFont,
            fontSize: current.leftFont,
          },
          children: leftText,
        }),
        /*#__PURE__*/ _jsxs(motion.div, {
          style: {
            width,
            height,
            borderRadius,
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
            background: "#000",
          },
          children: [
            /*#__PURE__*/ _jsx(motion.img, {
              src: imageSrc,
              alt: image?.alt || "Showreel background",
              style: {
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "100vw",
                height: "100vh",
                objectFit: "cover",
                transform: "translate(-50%, -50%)",
                opacity: isPlaying ? 0 : 1,
                transition: "opacity 0.4s ease",
              },
            }),
            videoUrl &&
              /*#__PURE__*/ _jsx("video", {
                ref: videoRef,
                autoPlay: autoPlay,
                loop: loop,
                muted: muted,
                playsInline: true,
                style: {
                  position: "absolute",
                  left: "0",
                  top: "0",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: isPlaying ? 1 : 0,
                  pointerEvents: isPlaying ? "auto" : "none",
                  transition: "opacity 0.4s ease",
                },
                children: /*#__PURE__*/ _jsx("source", { src: videoUrl, type: "video/mp4" }),
              }),
            !isPlaying &&
              /*#__PURE__*/ _jsxs(motion.a, {
                href: buttonLink,
                onClick: handlePlayClick,
                "aria-label": buttonText || "Play showreel",
                style: {
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  translateX: "-50%",
                  translateY: "-50%",
                  opacity: centerTextOpacity,
                  y: centerTextY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontFamily: "Inter",
                  fontWeight: 500,
                  color: buttonTextColor,
                  textAlign: "center",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  ...buttonFont,
                  fontSize: current.centerFont,
                  cursor: "pointer",
                  zIndex: 10,
                },
                children: [
                  buttonText,
                  renderIcon(iconType, screen, buttonBgColor, buttonTextColor, customIconImage),
                ],
              }),
          ],
        }),
        /*#__PURE__*/ _jsx("div", {
          style: {
            whiteSpace: "nowrap",
            width: current.textWidth,
            textAlign: "left",
            fontWeight: 500,
            color: textColor,
            ...rightFont,
            fontSize: current.rightFont,
          },
          children: rightText,
        }),
      ],
    }),
  });
}
/* ----------------------------------
   MAIN COMPONENT EXPORT
----------------------------------- */

ScrollZoomReveal.displayName = "ScrollZoomReveal";

export default ScrollZoomReveal;
