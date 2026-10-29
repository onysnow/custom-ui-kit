/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Component that displays an image with a dithered radial streak zone following the cursor
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect, useCallback, startTransition } from "react";
import { useMotionValue, useSpring } from "framer-motion"; // 8×8 Bayer matrix normalized 0–1
// Defined at module level so it's created once, not recreated on every render
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => v / 64);
const DEFAULT_PROPS = {
  ovalSize: 200,
  dotSize: 4,
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

export interface DitheringHoverProps {
  image?: { src?: string; srcSet?: string; alt?: string };
  ovalSize?: number;
  dotSize?: number;
}

/**
 * Dithering Hover
 *
 * @framerIntrinsicWidth 600
 * @framerIntrinsicHeight 400
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function DitheringHoverImpl(props) {
  const {
    image = {
      src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
      alt: "Image",
    },
    ovalSize = 200,
    dotSize = 4,
    damping = 25,
    stiffness = 300,
  } = props;
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;
    img.crossOrigin = "anonymous";
    img.src = image.src;
  }, [image.src]);
  const isHoveringRef = useRef(false);
  const hasEverHoveredRef = useRef(false);
  const hasPositionedRef = useRef(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isStatic = false;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping, stiffness };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const exitRadius = useMotionValue(0);
  const smoothRadius = useSpring(exitRadius, { damping: 20, stiffness: 120 });
  const buildMask = useCallback((cx, cy, radius, ds) => {
    const mask = new Map(); // The solid body: every dot block whose center is within `radius` gets blend=1
    // This guarantees zero hollow areas inside
    const bodyR = radius;
    for (let py = Math.floor(cy - bodyR - ds); py <= Math.ceil(cy + bodyR + ds); py += ds) {
      for (let px = Math.floor(cx - bodyR - ds); px <= Math.ceil(cx + bodyR + ds); px += ds) {
        const gx = Math.floor(px / ds) * ds;
        const gy = Math.floor(py / ds) * ds;
        const bcx = gx + ds / 2;
        const bcy = gy + ds / 2;
        const dist = Math.sqrt((bcx - cx) ** 2 + (bcy - cy) ** 2);
        if (dist <= bodyR) {
          mask.set(`${gx},${gy}`, 1);
        }
      }
    } // Ragged fringe: radial streaks that extend BEYOND radius to create scattered edges
    // These only add blocks outside the solid body, with fading blend
    const numRays = 200;
    const angleStep = (Math.PI * 2) / numRays;
    for (let ri = 0; ri < numRays; ri++) {
      const angle = ri * angleStep;
      const seed1 = Math.sin(ri * 127.1 + 43.7);
      const seed2 = Math.sin(ri * 269.5 + 183.3);
      const seed3 = Math.sin(ri * 311.7 + 91.4); // Fringe starts at radius and extends outward randomly
      const fringeLen = radius * (0.1 + Math.abs(seed1) * 0.55);
      const rayEnd = radius + fringeLen;
      const gapFreq = 4 + Math.abs(seed2) * 7;
      const gapPhase = seed3 * Math.PI;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let d = radius * 0.85; d < rayEnd; d += ds * 0.8) {
        // Gap pattern only in the fringe zone
        const gapVal = Math.sin(((d * gapFreq) / radius) * Math.PI + gapPhase);
        if (gapVal < -0.05) continue;
        const wx = cx + cosA * d;
        const wy = cy + sinA * d;
        const gx = Math.floor(wx / ds) * ds;
        const gy = Math.floor(wy / ds) * ds;
        const key = `${gx},${gy}`; // Fade from 1 at radius to 0 at rayEnd
        const t = (d - radius) / fringeLen;
        const blend = Math.pow(1 - Math.max(0, Math.min(1, t)), 1.5);
        const existing = mask.get(key) ?? 0;
        if (blend > existing) mask.set(key, blend);
      }
    }
    return mask;
  }, []);
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageLoaded) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, [imageLoaded]);
  const drawImageCovered = useCallback((ctx) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const dW = canvas.width,
      dH = canvas.height;
    const nW = img.naturalWidth,
      nH = img.naturalHeight;
    const scale = Math.max(dW / nW, dH / nH);
    ctx.drawImage(img, (dW - nW * scale) / 2, (dH - nH * scale) / 2, nW * scale, nH * scale);
  }, []);
  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current || isStatic) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX.set(x);
      mouseY.set(y);
      if (!hasPositionedRef.current) {
        smoothX.jump(x); // teleport spring to cursor
        smoothY.jump(y); // before radius starts growing
        smoothRadius.jump(0);
        exitRadius.set(ovalSize / 2);
        isHoveringRef.current = true;
        hasEverHoveredRef.current = true;
        hasPositionedRef.current = true;
      }
    },
    [mouseX, mouseY, smoothX, smoothY, smoothRadius, exitRadius, ovalSize, isStatic],
  );
  const handleMouseEnter = useCallback(() => {
    if (isStatic) return;
    hasPositionedRef.current = false;
  }, [isStatic]);
  const handleMouseLeave = useCallback(() => {
    if (isStatic) return;
    exitRadius.set(0);
    isHoveringRef.current = false;
    hasPositionedRef.current = false;
  }, [isStatic, exitRadius]);
  useEffect(() => {
    if (isStatic) return;
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, isStatic]);
  useEffect(() => {
    if (!imageLoaded || isStatic) return;
    syncCanvasSize();
    const observer = new ResizeObserver(() => syncCanvasSize());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [imageLoaded, syncCanvasSize, isStatic]);
  useEffect(() => {
    if (isStatic || !imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let animationFrameId;
    const render = () => {
      const radius = smoothRadius.get();
      const isActive = hasEverHoveredRef.current && (isHoveringRef.current || radius >= 0.5);
      if (!isActive) {
        // Fully idle — draw clean image and wait
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawImageCovered(ctx);
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const cx = smoothX.get();
      const cy = smoothY.get();
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      drawImageCovered(ctx);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const mask = buildMask(cx, cy, radius, dotSize);
      for (const [key, blend] of mask) {
        if (blend <= 0) continue;
        const comma = key.indexOf(",");
        const px = parseInt(key.slice(0, comma));
        const py = parseInt(key.slice(comma + 1));
        if (px < 0 || py < 0 || px >= w || py >= h) continue;
        const blockX = Math.min(px, w - dotSize);
        const blockY = Math.min(py, h - dotSize);
        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        for (let by = 0; by < dotSize && blockY + by < h; by++) {
          for (let bx = 0; bx < dotSize && blockX + bx < w; bx++) {
            const i = ((blockY + by) * w + (blockX + bx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        const luma = (0.299 * r + 0.587 * g + 0.114 * b) / (count * 255);
        const bx8 = Math.floor(blockX / dotSize) % 8;
        const by8 = Math.floor(blockY / dotSize) % 8;
        const threshold = BAYER_8[by8 * 8 + bx8];
        const dithered = luma > threshold ? 255 : 0;
        for (let by = 0; by < dotSize && blockY + by < h; by++) {
          for (let bx = 0; bx < dotSize && blockX + bx < w; bx++) {
            const i = ((blockY + by) * w + (blockX + bx)) * 4;
            data[i] = Math.round(dithered * blend + data[i] * (1 - blend));
            data[i + 1] = Math.round(dithered * blend + data[i + 1] * (1 - blend));
            data[i + 2] = Math.round(dithered * blend + data[i + 2] * (1 - blend));
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isStatic, imageLoaded, smoothX, smoothY, smoothRadius, dotSize, drawImageCovered, buildMask]);
  const handleImageLoad = useCallback(() => {
    startTransition(() => setImageLoaded(true));
  }, []);
  return /*#__PURE__*/ _jsxs("div", {
    ref: containerRef,
    style: { position: "relative", width: "100%", height: "100%", overflow: "hidden" },
    children: [
      /*#__PURE__*/ _jsx("img", {
        ref: imageRef,
        alt: image.alt,
        onLoad: handleImageLoad,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        },
      }),
      /*#__PURE__*/ _jsx("canvas", {
        ref: canvasRef,
        style: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
      }),
    ],
  });
}

export function DitheringHover(props: DitheringHoverProps) {
  return _jsx(DitheringHoverImpl, mergeProps(props));
}

DitheringHover.displayName = "DitheringHover";

export default DitheringHover;
