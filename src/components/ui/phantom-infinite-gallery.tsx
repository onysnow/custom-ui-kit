/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Phantom-Inspired Draggable Infinite Gallery - Framer compatible version
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useState, useEffect, useCallback, startTransition } from "react";
function computePinnedOffset(prevSize, nextSize, pivot, prevOffset) {
  const worldX = (pivot.x - prevOffset.x) / prevSize;
  const worldY = (pivot.y - prevOffset.y) / prevSize;
  return { x: pivot.x - worldX * nextSize, y: pivot.y - worldY * nextSize };
}
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}
function calcArcTransform(opts) {
  const { cellCenterX, cellCenterY, viewportW, viewportH, arcAxis, arcMaxAngleDeg, arcAmount } =
    opts;
  const maxAngle = toRadians(arcMaxAngleDeg) * Math.max(0, Math.min(1, arcAmount));
  if (maxAngle === 0) return { z: 0, yawDeg: 0, pitchDeg: 0, edgeFactor: 0 };
  if (arcAxis === "horizontal") {
    const dx = (cellCenterX - viewportW / 2) / (viewportW / 2); // -1..1
    const angle = dx * maxAngle;
    const radius = viewportW / (2 * Math.sin(Math.max(0.001, maxAngle)));
    const z = -radius * (Math.cos(angle) - 1); // Reversed: negative sign removed, making sides curve away
    const yawDeg = -(angle * 180) / Math.PI; // Reversed: negative sign to flip rotation direction
    const edgeFactor = Math.min(1, Math.abs(dx)); // 0 center → 1 edges
    return { z, yawDeg, pitchDeg: 0, edgeFactor };
  } else {
    const dy = (cellCenterY - viewportH / 2) / (viewportH / 2);
    const angle = dy * maxAngle;
    const radius = viewportH / (2 * Math.sin(Math.max(0.001, maxAngle)));
    const z = -radius * (Math.cos(angle) - 1); // Reversed: negative sign removed, making sides curve away
    const pitchDeg = (angle * 180) / Math.PI; // Reversed: positive sign to flip rotation direction
    const edgeFactor = Math.min(1, Math.abs(dy));
    return { z, yawDeg: 0, pitchDeg, edgeFactor };
  }
}
const DEFAULT_PROPS = {
  items: [
    {
      title: "Motion Study",
      image: {
        src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
        alt: "Motion Study",
      },
      year: 2024,
    },
    {
      title: "Idle Form",
      image: {
        src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
        alt: "Idle Form",
      },
      year: 2023,
    },
    {
      title: "Blur Signal",
      image: {
        src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
        alt: "Blur Signal",
      },
      year: 2024,
    },
    {
      title: "Still Drift",
      image: {
        src: "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg",
        alt: "Still Drift",
      },
      year: 2023,
    },
    {
      title: "Tidewalk",
      image: {
        src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
        alt: "Tidewalk",
      },
      year: 2024,
    },
  ],
  cellSize: 200,
  gap: 12,
  backgroundColor: "#000000",
  textColor: "#808080",
  border: {
    width: 1,
    style: "solid",
    color: "#FFFFFF",
    showTop: false,
    showBottom: true,
    showLeft: true,
    showRight: true,
  },
  hoverColor: "#FF5588",
  cellPadding: 10,
  zoomValue: 0.7,
  arcAmount: 0.6,
  arcMaxAngleDeg: 28,
  arcAxis: "horizontal",
  edgeFade: 0.25,
  parallaxEnabled: true,
  parallaxStrength: 0.1,
  parallaxEase: 0.12,
  parallaxWhileDragging: false,
  inertiaEnabled: true,
  throwFriction: 0.92,
  throwVelocityScale: 1,
  throwMinSpeed: 80,
  throwMaxSpeed: 2500,
};

const GROUP_KEYS = ["border"];

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

export interface PhantomInfiniteGalleryProps {
  items?: {
    title?: string;
    image?: { src?: string; srcSet?: string; alt?: string };
    year?: number;
  }[];
  cellSize?: number;
  gap?: number;
  backgroundColor?: string;
  textColor?: string;
  border?: {
    width?: number;
    style?: "solid" | "dashed" | "dotted" | "double";
    color?: string;
    showTop?: boolean;
    showBottom?: boolean;
    showLeft?: boolean;
    showRight?: boolean;
  };
  hoverColor?: string;
  cellPadding?: number;
  zoomValue?: number;
  arcAmount?: number;
  arcMaxAngleDeg?: number;
  arcAxis?: "horizontal" | "vertical";
  edgeFade?: number;
  parallaxEnabled?: boolean;
  parallaxStrength?: number;
  parallaxEase?: number;
  parallaxWhileDragging?: boolean;
  inertiaEnabled?: boolean;
  throwFriction?: number;
  throwVelocityScale?: number;
  throwMinSpeed?: number;
  throwMaxSpeed?: number;
}

/**
 * Phantom Infinite Gallery
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function PhantomInfiniteGalleryImpl(props) {
  const {
    items = [
      {
        title: "Motion Study",
        image: {
          src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
          alt: "Motion Study",
        },
        year: 2024,
      },
      {
        title: "Idle Form",
        image: {
          src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
          alt: "Idle Form",
        },
        year: 2023,
      },
      {
        title: "Blur Signal",
        image: {
          src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
          alt: "Blur Signal",
        },
        year: 2024,
      },
      {
        title: "Still Drift",
        image: {
          src: "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg",
          alt: "Still Drift",
        },
        year: 2023,
      },
      {
        title: "Tidewalk",
        image: {
          src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
          alt: "Tidewalk",
        },
        year: 2024,
      },
    ],
    cellSize = 200,
    backgroundColor = "#000000",
    textColor = "#808080",
    borderColor = "#FFFFFF",
    cellPadding = 10,
    gap = 12,
    arcAmount = 0.6,
    arcMaxAngleDeg = 28,
    arcAxis = "horizontal",
    edgeFade = 0.25,
    border = {
      width: 1,
      style: "solid",
      color: "#FFFFFF",
      showTop: false,
      showBottom: true,
      showLeft: true,
      showRight: true,
    },
    parallaxEnabled = true,
    parallaxStrength = 0.1,
    parallaxEase = 0.12,
    parallaxWhileDragging = false,
    inertiaEnabled = true,
    throwFriction = 0.92,
    throwVelocityScale = 1,
    throwMinSpeed = 80,
    throwMaxSpeed = 2500,
  } = props;
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentCellSize, setCurrentCellSize] = useState(cellSize);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [targetMouseOffset, setTargetMouseOffset] = useState({ x: 0, y: 0 }); // Add smooth transition state for zoom
  const [targetCellSize, setTargetCellSize] = useState(cellSize); // Inertia delta (added on top of base offset)
  const [inertia, setInertia] = React.useState({ x: 0, y: 0 });
  const inertiaRef = React.useRef(inertia);
  React.useEffect(() => {
    inertiaRef.current = inertia;
  }, [inertia]); // Pointer velocity in px/s
  const velocityRef = React.useRef({ x: 0, y: 0 });
  const lastMoveRef = React.useRef({ x: 0, y: 0, t: 0 });
  const inertiaActiveRef = React.useRef(false); // New refs/flags near other hooks:
  const pointerIdRef = React.useRef(null);
  const isPressingRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  React.useEffect(() => {
    draggingRef.current = isDragging;
  }, [isDragging]);
  const offsetRef = React.useRef(offset);
  React.useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);
  const targetOffsetRef = React.useRef(targetOffset);
  React.useEffect(() => {
    targetOffsetRef.current = targetOffset;
  }, [targetOffset]);
  const mouseOffsetRef = React.useRef(mouseOffset);
  React.useEffect(() => {
    mouseOffsetRef.current = mouseOffset;
  }, [mouseOffset]);
  const targetMouseOffsetRef = React.useRef(targetMouseOffset);
  React.useEffect(() => {
    targetMouseOffsetRef.current = targetMouseOffset;
  }, [targetMouseOffset]);
  const pressPosRef = React.useRef({ x: 0, y: 0 });
  const startOffsetRef = React.useRef({ x: 0, y: 0 });
  const pressTimerRef = React.useRef(null); // frame timing
  const lastTimeRef = React.useRef(performance.now());
  const DRAG_THRESHOLD = 4; // px
  const PRESS_ZOOM_DELAY = 120; // ms
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v)); // Add helper to commit inertia into base offset
  const commitInertiaToBase = React.useCallback(() => {
    const currentOffset = offsetRef.current;
    const currentInertia = inertiaRef.current || { x: 0, y: 0 };
    const committed = {
      x: currentOffset.x + currentInertia.x,
      y: currentOffset.y + currentInertia.y,
    }; // Snap base to the visible position, then zero inertia
    setOffset(committed);
    setTargetOffset(committed);
    setInertia({ x: 0, y: 0 });
    if (inertiaActiveRef) inertiaActiveRef.current = false;
  }, []); // Track container size
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setViewport({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []); // Keep RAF animator but don't tween offset while dragging
  useEffect(() => {
    let raf = 0;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1e3); // cap 50ms
      lastTimeRef.current = now; // Lerp size
      setCurrentCellSize((prev) => {
        const next = prev + (targetCellSize - prev) * 0.15;
        return Math.abs(next - targetCellSize) < 0.05 ? targetCellSize : next;
      }); // Lerp base offset only when NOT dragging
      if (!draggingRef.current) {
        setOffset((prev) => {
          const tx = targetOffsetRef.current.x;
          const ty = targetOffsetRef.current.y;
          const nx = prev.x + (tx - prev.x) * 0.15;
          const ny = prev.y + (ty - prev.y) * 0.15;
          return { x: Math.abs(nx - tx) < 0.1 ? tx : nx, y: Math.abs(ny - ty) < 0.1 ? ty : ny };
        });
      } // Inertia update (independent of base offset)
      if (inertiaEnabled && inertiaActiveRef.current) {
        // exponential friction scaled to dt (~60fps baseline)
        const f = Math.pow(throwFriction, dt * 60);
        velocityRef.current.x *= f;
        velocityRef.current.y *= f;
        const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y);
        if (speed < 1) {
          // Instead of stopping completely, give it a very small infinite movement
          const direction = Math.atan2(velocityRef.current.y, velocityRef.current.x);
          velocityRef.current.x = Math.cos(direction) * 1e-4;
          velocityRef.current.y = Math.sin(direction) * 1e-4;
        }
        setInertia((prev) => ({
          x: prev.x + velocityRef.current.x * dt,
          y: prev.y + velocityRef.current.y * dt,
        }));
      } // Eased parallax (independent of drag/zoom)
      if (parallaxEnabled && (parallaxWhileDragging || !draggingRef.current)) {
        setMouseOffset((prev) => {
          const tx = targetMouseOffsetRef.current.x;
          const ty = targetMouseOffsetRef.current.y;
          const nx = prev.x + (tx - prev.x) * parallaxEase;
          const ny = prev.y + (ty - prev.y) * parallaxEase; // snap when close to avoid micro-diff churn
          return { x: Math.abs(nx - tx) < 0.1 ? tx : nx, y: Math.abs(ny - ty) < 0.1 ? ty : ny };
        });
      } else {
        // Ease back to zero when disabled or dragging (unless parallaxWhileDragging = true)
        setMouseOffset((prev) => {
          const nx = prev.x + (0 - prev.x) * parallaxEase;
          const ny = prev.y + (0 - prev.y) * parallaxEase;
          return { x: Math.abs(nx) < 0.1 ? 0 : nx, y: Math.abs(ny) < 0.1 ? 0 : ny };
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    inertiaEnabled,
    throwFriction,
    targetCellSize,
    parallaxEnabled,
    parallaxWhileDragging,
    parallaxEase,
  ]); // When cellSize prop changes externally, keep the view stable:
  useEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const pivot = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 }; // Use visible offset for pinning
    const visibleOffset = {
      x: offsetRef.current.x + (inertiaRef.current?.x || 0),
      y: offsetRef.current.y + (inertiaRef.current?.y || 0),
    };
    const newTargetOffset = computePinnedOffset(currentCellSize, cellSize, pivot, visibleOffset);
    setTargetCellSize(cellSize);
    setTargetOffset(newTargetOffset);
  }, [cellSize]);
  // Replace mouse handlers with pointer handlers
  const handlePointerDown = useCallback(
    (e) => {
      // Commit any running inertia first to avoid a jump
      if (
        inertiaActiveRef?.current ||
        (inertiaRef.current?.x || 0) !== 0 ||
        (inertiaRef.current?.y || 0) !== 0
      ) {
        commitInertiaToBase();
      }
      pointerIdRef.current = e.pointerId;
      e.currentTarget.setPointerCapture(e.pointerId);
      isPressingRef.current = true;
      setIsDragging(false); // record starting move state
      lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      velocityRef.current = { x: 0, y: 0 }; // Record where the press happened and the current visual offset
      pressPosRef.current = { x: e.clientX, y: e.clientY };
      startOffsetRef.current = offsetRef.current; // Schedule zoom-out ONLY if press is held (prevents fighting during quick drags)
      if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = window.setTimeout(() => {
        if (!draggingRef.current && isPressingRef.current) {
          const rect = containerRef.current?.getBoundingClientRect();
          const pivot = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
          const newSize = cellSize * props.zoomValue; // Use visible offset for pinning
          const visibleOffset = {
            x: offsetRef.current.x + (inertiaRef.current?.x || 0),
            y: offsetRef.current.y + (inertiaRef.current?.y || 0),
          };
          const pinned = computePinnedOffset(currentCellSize, newSize, pivot, visibleOffset);
          setTargetCellSize(newSize);
          setTargetOffset(pinned); // NOTE: offset will tween to pinned because we're not dragging yet
        }
      }, PRESS_ZOOM_DELAY);
    },
    [cellSize, props.zoomValue, currentCellSize, commitInertiaToBase],
  );
  const handlePointerMove = useCallback(
    (e) => {
      // Velocity tracking (only while pressing/dragging)
      if (isPressingRef.current) {
        const now = performance.now();
        const dt = Math.max(0.001, (now - lastMoveRef.current.t) / 1e3);
        const dx = e.clientX - lastMoveRef.current.x;
        const dy = e.clientY - lastMoveRef.current.y; // instantaneous velocity (px/s), smoothed EMA
        const vx = clamp((dx / dt) * throwVelocityScale, -throwMaxSpeed, throwMaxSpeed);
        const vy = clamp((dy / dt) * throwVelocityScale, -throwMaxSpeed, throwMaxSpeed); // smoother (0.6 new / 0.4 old)
        velocityRef.current.x = vx * 0.6 + velocityRef.current.x * 0.4;
        velocityRef.current.y = vy * 0.6 + velocityRef.current.y * 0.4;
        lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now };
      } // Disable parallax while pressing/dragging to avoid "yank"
      const suppressParallax = isPressingRef.current || isDragging; // Update the parallax TARGET only (no direct setMouseOffset here)
      if (
        parallaxEnabled &&
        (parallaxWhileDragging || !draggingRef.current) &&
        containerRef.current &&
        !suppressParallax
      ) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const reverseX = (centerX - mouseX) * parallaxStrength; // reverse axis
        const reverseY = (centerY - mouseY) * parallaxStrength;
        setTargetMouseOffset({ x: reverseX, y: reverseY });
      }
      if (!isPressingRef.current) return;
      const dx = e.clientX - pressPosRef.current.x;
      const dy = e.clientY - pressPosRef.current.y; // Start actual drag only after threshold; baseline is the *current visual* offset
      if (!isDragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        setIsDragging(true);
        draggingRef.current = true; // Align drag baseline with the current, possibly pinned/tweened offset
        startOffsetRef.current = offsetRef.current;
      }
      if (draggingRef.current) {
        const nx = startOffsetRef.current.x + dx;
        const ny = startOffsetRef.current.y + dy; // While dragging, keep targets in sync and freeze tween (RAF respects draggingRef)
        startTransition(() => {
          setOffset({ x: nx, y: ny });
          setTargetOffset({ x: nx, y: ny });
        });
      }
    },
    [
      isDragging,
      parallaxEnabled,
      parallaxWhileDragging,
      parallaxStrength,
      throwVelocityScale,
      throwMaxSpeed,
    ],
  );
  const handlePointerUp = useCallback(() => {
    isPressingRef.current = false;
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    } // Start inertia only if fast enough
    const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y);
    if (inertiaEnabled && speed >= throwMinSpeed) {
      inertiaActiveRef.current = true;
    } else {
      inertiaActiveRef.current = false;
      setInertia({ x: 0, y: 0 });
    }
    setIsDragging(false);
    draggingRef.current = false; // Zoom back in, center-pinned
    const rect = containerRef.current?.getBoundingClientRect();
    const pivot = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 }; // Use visible offset for pinning
    const visibleOffset = {
      x: offsetRef.current.x + (inertiaRef.current?.x || 0),
      y: offsetRef.current.y + (inertiaRef.current?.y || 0),
    };
    const pinnedBack = computePinnedOffset(currentCellSize, cellSize, pivot, visibleOffset);
    setTargetMouseOffset({ x: 0, y: 0 });
    startTransition(() => {
      setTargetCellSize(cellSize);
      setTargetOffset(pinnedBack);
    });
  }, [cellSize, currentCellSize, inertiaEnabled, throwMinSpeed]);
  const handlePointerLeave = useCallback(() => {
    setTargetMouseOffset({ x: 0, y: 0 });
  }, []); // Generate grid cells
  const gridCells = [];
  const gridSize = 20; // 20x20 grid for infinite feel
  const cellWithGap = currentCellSize;
  const startX = Math.floor(-offset.x / cellWithGap) - 5;
  const startY = Math.floor(-offset.y / cellWithGap) - 5;
  for (let y = startY; y < startY + gridSize; y++) {
    for (let x = startX; x < startX + gridSize; x++) {
      const itemIndex = Math.abs((x + y * 3) % items.length);
      const item = items[itemIndex]; // In the grid loop, when creating each tile, compute its 3D transform:
      const tileLeft = x * cellWithGap + offset.x + mouseOffset.x + inertia.x;
      const tileTop = y * cellWithGap + offset.y + mouseOffset.y + inertia.y;
      const tileW = currentCellSize;
      const tileH = currentCellSize;
      const cellCenterX = tileLeft + tileW / 2;
      const cellCenterY = tileTop + tileH / 2;
      const { z, yawDeg, pitchDeg, edgeFactor } = calcArcTransform({
        cellCenterX,
        cellCenterY,
        viewportW: viewport.w || 1,
        viewportH: viewport.h || 1,
        arcAxis,
        arcMaxAngleDeg,
        arcAmount,
      }); // optional polish: fade/scale slightly at edges
      const scale = 1 - edgeFade * (edgeFactor * edgeFactor);
      const opacity = 1 - 0.4 * (edgeFactor * arcAmount);
      gridCells.push(
        /*#__PURE__*/ _jsxs(
          "div",
          {
            style: {
              position: "absolute",
              left: tileLeft,
              top: tileTop,
              width: tileW,
              height: tileH,
              borderTop: border.showTop
                ? `${border.width}px ${border.style} ${border.color}`
                : "none",
              borderLeft: border.showLeft
                ? `${border.width}px ${border.style} ${border.color}`
                : "none",
              borderRight: border.showRight
                ? `${border.width}px ${border.style} ${border.color}`
                : "none",
              borderBottom: border.showBottom
                ? `${border.width}px ${border.style} ${border.color}`
                : "none",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              display: "flex",
              flexDirection: "column",
              padding: `${cellPadding}px`,
              boxSizing: "border-box",
              transformStyle: "preserve-3d",
              transform: `translate3d(0, 0, ${z}px) rotateY(${yawDeg}deg) rotateX(${pitchDeg}deg) scale(${scale})`,
              opacity,
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = props.hoverColor || "#FF5588";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
            },
            children: [
              /*#__PURE__*/ _jsx("div", {
                style: {
                  flex: 1,
                  backgroundImage: `url(${item?.image?.src || "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: `${gap}px`,
                  borderRadius: "4px",
                },
              }),
              /*#__PURE__*/ _jsxs("div", {
                style: {
                  color: textColor,
                  fontSize: "12px",
                  fontFamily: "monospace",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
                children: [
                  /*#__PURE__*/ _jsx("span", {
                    style: { fontWeight: "bold", textTransform: "uppercase" },
                    children: item?.title || "Project",
                  }),
                  /*#__PURE__*/ _jsx("span", { children: item?.year || 2024 }),
                ],
              }),
            ],
          },
          `${x}-${y}`,
        ),
      );
    }
  }
  return /*#__PURE__*/ _jsxs("div", {
    ref: containerRef,
    style: {
      width: "100%",
      height: "100%",
      backgroundColor,
      position: "relative",
      overflow: "hidden",
      touchAction: "none",
      cursor: isDragging ? "grabbing" : "grab",
      userSelect: "none",
      perspective: "1000px",
      transformStyle: "preserve-3d",
    },
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    onPointerLeave: handlePointerLeave,
    children: [
      /*#__PURE__*/ _jsx("div", {
        style: {
          position: "absolute",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        },
        children: gridCells,
      }),
      /*#__PURE__*/ _jsx("div", {
        style: {
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.8) 90%, rgba(0,0,0,1) 100%)`,
        },
      }),
    ],
  });
}

export function PhantomInfiniteGallery(props: PhantomInfiniteGalleryProps) {
  return _jsx(PhantomInfiniteGalleryImpl, mergeProps(props));
}

PhantomInfiniteGallery.displayName = "PhantomInfiniteGallery";

export default PhantomInfiniteGallery;
