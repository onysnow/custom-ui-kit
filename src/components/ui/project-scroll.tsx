/* eslint-disable @typescript-eslint/ban-ts-comment, no-empty */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Project Scroll: an infinite, centre-snapping project index.
// Wheel, drag, arrow keys or a click on a name move the image stack; the
// project in the middle is shown in colour and described on the centre line.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
const RATIOS = {
  "1:1": 1,
  "4:5": 4 / 5,
  "3:4": 3 / 4,
  "2:3": 2 / 3,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
};
const SIZES = { S: 0.68, M: 0.85, L: 1 };
const FALLBACK_IMAGES = [
  {
    src: "https://framerusercontent.com/images/fnzonyAbobZ7d9k3tdvv2eBVDA.jpg",
    alt: "Warm minimal living room",
  },
  {
    src: "https://framerusercontent.com/images/dMwHsImPwXmUdSRWz47Jy4irpY.jpg",
    alt: "Alphabet type specimen poster",
  },
  {
    src: "https://framerusercontent.com/images/uReb9e0PRoHXkSEdd0tBuxvI.jpg",
    alt: "Black concept car with red accents",
  },
  {
    src: "https://framerusercontent.com/images/OeZx4A36M6ZvwFIoVi0IEpRyE.jpg",
    alt: "White skincare tube on glass",
  },
  {
    src: "https://framerusercontent.com/images/q56Zsrnkpkp4i2BSc7AnvHgqDwo.jpg",
    alt: "Black and silver turntable",
  },
  {
    src: "https://framerusercontent.com/images/s6XkG2WOvGOYWPh8jCNerlKlf1A.jpg",
    alt: "Silver and black analog watch",
  },
  {
    src: "https://framerusercontent.com/images/XK8PwUSjz0dTOOCHYw7ScdvHdNc.jpg",
    alt: "Observatory dome under a starry sky",
  },
  {
    src: "https://framerusercontent.com/images/OY3zgpxqRyMYdEz6yGKAfRaesc.jpg",
    alt: "Abstract arrangement of pale cubes",
  },
  {
    src: "https://framerusercontent.com/images/cZlfz9yGJ4fWQFtETRSPomf3CTg.jpg",
    alt: "Concrete museum facade",
  },
  {
    src: "https://framerusercontent.com/images/IgZEuhMXgtSeVBciBSd7m3KbDU.jpg",
    alt: "Black and orange audio device",
  },
  {
    src: "https://framerusercontent.com/images/JzdRUIUWNkvn2fBZRkGv4XI13k.jpg",
    alt: "Fashion portrait in a black turtleneck",
  },
  {
    src: "https://framerusercontent.com/images/WTSu15jjgTJDSu4JkwEiIWo47Uk.jpg",
    alt: "Ceramic vases in neutral tones",
  },
];
const DEFAULT_PROJECTS = [
  {
    title: "Casa Sol\xe8ne",
    category: "Hospitality, Interior",
    services: "Concept, Web Design/Dev",
    ratio: "1:1",
    size: "M",
  },
  {
    title: "Monolith Type",
    category: "Typography, Side Project",
    services: "Identity, Editorial",
    ratio: "2:3",
    size: "S",
  },
  {
    title: "Arcto Mobility",
    category: "Automotive",
    services: "Web Design/Dev, 3D",
    ratio: "16:9",
    size: "L",
  },
  {
    title: "Ostara Skincare",
    category: "Beauty",
    services: "Packaging, Art Direction",
    ratio: "2:3",
    size: "S",
  },
  {
    title: "Tidewater Radio",
    category: "Music, Culture",
    services: "Identity, Motion",
    ratio: "1:1",
    size: "M",
  },
  {
    title: "Kairos Watches",
    category: "Product, Luxury",
    services: "Creative Direction, Web Design/Dev",
    ratio: "3:2",
    size: "L",
  },
  {
    title: "Lumen Observatory",
    category: "Science, Education",
    services: "Concept, Web Design/Dev",
    ratio: "2:3",
    size: "S",
  },
  {
    title: "Brutal Gardens",
    category: "Art, 3D",
    services: "Art Direction, Motion",
    ratio: "1:1",
    size: "M",
  },
  {
    title: "Halden Museum",
    category: "Culture, Architecture",
    services: "Identity, Web Design/Dev",
    ratio: "4:5",
    size: "M",
  },
  {
    title: "Nordlys Audio",
    category: "Product, Technology",
    services: "Art Direction, 3D",
    ratio: "1:1",
    size: "S",
  },
  {
    title: "Atelier Moreau",
    category: "Fashion, Photography",
    services: "Creative Direction",
    ratio: "3:4",
    size: "M",
  },
  {
    title: "Kiln & Clay",
    category: "Craft, E-commerce",
    services: "Branding, Web Design/Dev",
    ratio: "3:2",
    size: "L",
  },
];
const BASE_CSS = `
.fx-ps-root{outline:none}
.fx-ps-root:focus-visible{outline:2px solid currentColor;outline-offset:-2px}
.fx-ps-row{opacity:var(--ps-text-dim);cursor:pointer}
.fx-ps-row:hover{opacity:var(--ps-text-hover)}
.fx-ps-row[data-active="true"]{opacity:1}
.fx-ps-item{opacity:var(--ps-img-dim);filter:var(--ps-img-filter)}
.fx-ps-item[data-active="true"]{opacity:1;filter:none}
`; // Transitions are left out on the canvas and in exports, and switched off
// for visitors who prefer reduced motion
const MOTION_CSS = `
.fx-ps-row{transition:opacity .35s ease}
.fx-ps-item{transition:opacity .5s ease,filter .5s ease}
.fx-ps-fade{transition:opacity .6s ease}
.fx-ps-marker{transition:width .6s cubic-bezier(.22,1,.36,1),height .6s cubic-bezier(.22,1,.36,1)}
@media (prefers-reduced-motion: reduce){.fx-ps-row,.fx-ps-item,.fx-ps-fade,.fx-ps-marker{transition:none}}
`;
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
function mod(value, total) {
  return ((value % total) + total) % total;
} // Wraps a value into [-total / 2, total / 2)
function wrap(value, total) {
  return mod(value + total / 2, total) - total / 2;
}
function toPx(value, fallback) {
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}
function lineHeightPx(value, fontSize) {
  if (typeof value === "number") return value * fontSize;
  const text = String(value ?? "");
  const parsed = parseFloat(text);
  if (!Number.isFinite(parsed)) return fontSize * 1.2;
  if (text.endsWith("px")) return parsed;
  if (text.endsWith("%")) return (parsed / 100) * fontSize;
  return parsed * fontSize;
}
function buildLayout(projects, imageWidth, gap, scale, viewportHeight) {
  const count = projects.length;
  const sizes = projects.map((project) => {
    const width = Math.round(imageWidth * scale * (SIZES[project.size] ?? 1));
    const height = Math.round(width / (RATIOS[project.ratio] ?? 1));
    return { width, height };
  });
  const centers = [];
  let cursor = 0;
  sizes.forEach((size, index) => {
    if (index > 0) cursor += sizes[index - 1].height / 2 + gap + size.height / 2;
    centers.push(cursor);
  });
  const period = sizes.reduce((sum, size) => sum + size.height + gap, 0);
  const maxHeight = sizes.reduce((max, size) => Math.max(max, size.height), 0);
  const maxWidth = sizes.reduce((max, size) => Math.max(max, size.width), 0); // Enough copies that a wrapping item is always outside the viewport
  const copies = period > 0 ? Math.max(1, Math.ceil((viewportHeight + maxHeight * 2) / period)) : 1;
  const slots = [];
  for (let copy = 0; copy < copies; copy++) {
    for (let index = 0; index < count; index++) {
      slots.push({ project: index, base: copy * period + centers[index] });
    }
  }
  return { count, sizes, centers, period, total: copies * period, slots, maxWidth };
} // Centre of the n-th item on the endless track (n may be any integer)
function centerAt(layout, n) {
  const { count, centers, period } = layout;
  return centers[mod(n, count)] + Math.floor(n / count) * period;
}
function nearestItem(layout, position) {
  const { count, period } = layout;
  const start = Math.floor(position / period) * count;
  let best = start;
  let bestDistance = Infinity;
  for (let n = start; n <= start + count; n++) {
    const distance = Math.abs(centerAt(layout, n) - position);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = n;
    }
  }
  return best;
} // Position expressed as a fractional project index in [0, count)
function floatIndex(layout, position) {
  const { count, centers, period } = layout;
  const local = mod(position, period);
  let index = 0;
  while (index < count - 1 && local >= centers[index + 1]) index++;
  const from = centers[index];
  const to = index === count - 1 ? period : centers[index + 1];
  return index + (local - from) / (to - from);
}
function slotTransform(layout, slot, position) {
  const y = wrap(layout.slots[slot].base - position, layout.total);
  return `translate3d(-50%, calc(-50% + ${y.toFixed(2)}px), 0)`;
}
function rowTransform(row, index, count, lineHeight) {
  const y = wrap((row - index) * lineHeight, count * 2 * lineHeight);
  return `translate3d(0, calc(-50% + ${y.toFixed(2)}px), 0)`;
}
function activeSlot(layout, position) {
  let best = 0;
  let bestDistance = Infinity;
  layout.slots.forEach((slot, index) => {
    const distance = Math.abs(wrap(slot.base - position, layout.total));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}
const swapVariants = {
  enter: (direction) => ({ y: direction >= 0 ? "100%" : "-100%" }),
  center: { y: "0%" },
  exit: (direction) => ({ y: direction >= 0 ? "-100%" : "100%" }),
};
function SwapText({ text, direction }) {
  const isStatic = false;
  const reducedMotion = useReducedMotion();
  if (isStatic) {
    return /*#__PURE__*/ _jsx("span", {
      style: { whiteSpace: "nowrap" },
      children: text || "\xa0",
    });
  }
  return /*#__PURE__*/ _jsx("span", {
    style: {
      position: "relative",
      display: "inline-block",
      overflow: "hidden",
      verticalAlign: "top",
      whiteSpace: "nowrap",
    },
    children: /*#__PURE__*/ _jsx(AnimatePresence, {
      initial: false,
      mode: "popLayout",
      custom: direction,
      children: /*#__PURE__*/ _jsx(
        motion.span,
        {
          custom: direction,
          variants: swapVariants,
          initial: "enter",
          animate: "center",
          exit: "exit",
          transition: reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          style: { display: "block" },
          children: text || "\xa0",
        },
        text,
      ),
    }),
  });
} // A frame that resizes to hug the active image: four corner marks, or a
// pair of square brackets when the vertical strokes run the full height
function Marker({ width, height, color, size, weight, brackets }) {
  const stroke = `${weight}px solid ${color}`;
  const corners = [
    { top: 0, left: 0, borderTop: stroke, borderLeft: stroke },
    { top: 0, right: 0, borderTop: stroke, borderRight: stroke },
    { bottom: 0, left: 0, borderBottom: stroke, borderLeft: stroke },
    { bottom: 0, right: 0, borderBottom: stroke, borderRight: stroke },
  ];
  return /*#__PURE__*/ _jsx("div", {
    "aria-hidden": "true",
    className: "fx-ps-marker",
    style: {
      position: "absolute",
      top: "50%",
      left: "50%",
      width,
      height,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    },
    children: corners.map((corner, index) =>
      /*#__PURE__*/ _jsx(
        "div",
        {
          style: {
            position: "absolute",
            boxSizing: "border-box",
            width: size,
            height: brackets ? "50%" : size,
            ...corner,
          },
        },
        index,
      ),
    ),
  });
}
const DEFAULT_PROPS = {
  projects: DEFAULT_PROJECTS,
  showList: true,
  showDetails: true,
  imageWidth: 230,
  gap: 6,
  radius: 0,
  padding: 12,
  marker: "corners",
  markerColor: "#000000",
  markerSize: 16,
  markerWeight: 2,
  markerInset: 14,
  font: {
    fontSize: "13px",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    lineHeight: "1.2em",
  },
  textColor: "#000000",
  textDim: 0.25,
  backgroundColor: "#FFFFFF",
  grayscale: true,
  imageDim: 0.45,
  captureScroll: true,
  speed: 1,
  smoothness: 5,
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

export interface ProjectScrollProps {
  projects?: {
    title?: string;
    category?: string;
    services?: string;
    image?: { src?: string; srcSet?: string; alt?: string };
    ratio?: "1:1" | "4:5" | "3:4" | "2:3" | "4:3" | "3:2" | "16:9";
    size?: "S" | "M" | "L";
    link?: string;
  }[];
  showList?: boolean;
  showDetails?: boolean;
  imageWidth?: number;
  gap?: number;
  radius?: number;
  padding?: number;
  marker?: "corners" | "brackets" | "none";
  markerColor?: string;
  markerSize?: number;
  markerWeight?: number;
  markerInset?: number;
  font?: React.CSSProperties;
  textColor?: string;
  textDim?: number;
  backgroundColor?: string;
  grayscale?: boolean;
  imageDim?: number;
  captureScroll?: boolean;
  speed?: number;
  smoothness?: number;
  style?: React.CSSProperties;
}

/**
 * Project Scroll
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function ProjectScrollImpl(props) {
  const {
    imageWidth = 230,
    gap = 6,
    radius = 0,
    grayscale = true,
    imageDim = 0.45,
    showList = true,
    showDetails = true,
    marker = "corners",
    markerColor = "#000000",
    markerSize = 16,
    markerWeight = 2,
    markerInset = 14,
    font,
    textColor = "#000000",
    textDim = 0.25,
    backgroundColor = "#FFFFFF",
    padding = 12,
    captureScroll = true,
    speed = 1,
    smoothness = 5,
  } = props;
  const projects = props.projects && props.projects.length > 0 ? props.projects : DEFAULT_PROJECTS;
  const isStatic = false;
  const reducedMotion = useReducedMotion();
  const rootRef = useRef(null);
  const slotRefs = useRef([]);
  const rowRefs = useRef([]);
  const [viewport, setViewport] = useState({ width: 1200, height: 900 });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState({ slot: 0, direction: 1 });
  const motionState = useRef({
    position: 0,
    target: 0,
    frame: 0,
    lastTime: 0,
    snapTimer: 0,
    slot: 0,
    dragEndedAt: -1e3,
  });
  const drag = useRef({ id: -1, startY: 0, lastY: 0, lastTime: 0, velocity: 0, moved: false });
  const compact = viewport.width < 640;
  const wide = viewport.width >= 1200;
  const scale = compact ? 0.72 : 1;
  const fontSize = toPx(font?.fontSize, 13);
  const lineHeight = lineHeightPx(font?.lineHeight, fontSize);
  const layout = useMemo(
    () => buildLayout(projects, imageWidth, gap, scale, viewport.height),
    [projects, imageWidth, gap, scale, viewport.height],
  );
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const lineHeightRef = useRef(lineHeight);
  lineHeightRef.current = lineHeight;
  const count = layout.count;
  const rowCount = count * 2;
  const visibleRows = count % 2 === 0 ? Math.max(1, count - 1) : count;
  const apply = useCallback(() => {
    const state = motionState.current;
    const current = layoutRef.current;
    for (let index = 0; index < current.slots.length; index++) {
      const element = slotRefs.current[index];
      if (element) {
        element.style.transform = slotTransform(current, index, state.position);
      }
    }
    const fractional = floatIndex(current, state.position);
    for (let row = 0; row < current.count * 2; row++) {
      const element = rowRefs.current[row];
      if (element) {
        element.style.transform = rowTransform(
          row,
          fractional,
          current.count,
          lineHeightRef.current,
        );
      }
    }
    const slot = activeSlot(current, state.position);
    if (slot !== state.slot) {
      state.slot = slot;
      const direction = state.target >= state.position ? 1 : -1;
      startTransition(() => setActive({ slot, direction }));
    }
  }, []);
  const tick = useCallback(
    (now) => {
      const state = motionState.current;
      const delta = Math.min(0.05, (now - state.lastTime) / 1e3);
      state.lastTime = now;
      const distance = state.target - state.position;
      if (Math.abs(distance) < 0.05) {
        state.position = state.target;
        state.frame = 0;
        apply();
        return;
      }
      const stiffness = reducedMotion ? 60 : 14 - smoothness;
      state.position += distance * (1 - Math.exp(-delta * stiffness));
      apply();
      state.frame = requestAnimationFrame(tick);
    },
    [apply, smoothness, reducedMotion],
  );
  const run = useCallback(() => {
    const state = motionState.current;
    if (state.frame || typeof window === "undefined") return;
    state.lastTime = performance.now();
    state.frame = requestAnimationFrame(tick);
  }, [tick]);
  const snap = useCallback(() => {
    const state = motionState.current;
    const current = layoutRef.current;
    state.target = centerAt(current, nearestItem(current, state.target));
    run();
  }, [run]);
  const scheduleSnap = useCallback(
    (delay) => {
      const state = motionState.current;
      window.clearTimeout(state.snapTimer);
      state.snapTimer = window.setTimeout(snap, delay);
    },
    [snap],
  );
  const step = useCallback(
    (amount) => {
      const state = motionState.current;
      const current = layoutRef.current;
      window.clearTimeout(state.snapTimer);
      state.target = centerAt(current, nearestItem(current, state.target) + amount);
      run();
    },
    [run],
  ); // Measure the component itself to pick the layout and the number of copies
  useIsomorphicLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const measure = () => {
      const width = Math.round(element.clientWidth);
      const height = Math.round(element.clientHeight);
      if (!width || !height) return;
      setViewport((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
    };
    measure();
    setReady(true);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => startTransition(measure));
    observer.observe(element);
    return () => observer.disconnect();
  }, []); // Keep the current project centred when the layout changes
  useIsomorphicLayoutEffect(() => {
    const state = motionState.current;
    const slot = Math.min(state.slot, layout.slots.length - 1);
    state.position = state.target = layout.slots[slot]?.base ?? 0;
  }, [layout]); // A render writes the transforms it was computed with; bring them back
  // to the live position before the browser paints
  useIsomorphicLayoutEffect(() => {
    apply();
  });
  useEffect(() => {
    const element = rootRef.current;
    if (!element || isStatic || !captureScroll) return;
    const onWheel = (event) => {
      event.preventDefault();
      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= element.clientHeight;
      motionState.current.target += delta * speed;
      run();
      scheduleSnap(140);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [isStatic, captureScroll, speed, run, scheduleSnap]);
  useEffect(() => {
    const state = motionState.current;
    return () => {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      window.clearTimeout(state.snapTimer);
    };
  }, []);
  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = {
      id: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    };
  };
  const onPointerMove = (event) => {
    const current = drag.current;
    if (current.id !== event.pointerId) return;
    if (!current.moved) {
      if (Math.abs(event.clientY - current.startY) < 6) return;
      current.moved = true;
      window.clearTimeout(motionState.current.snapTimer);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}
    }
    const deltaY = event.clientY - current.lastY;
    const deltaTime = Math.max(1, event.timeStamp - current.lastTime);
    current.velocity = 0.7 * (deltaY / deltaTime) + 0.3 * current.velocity;
    current.lastY = event.clientY;
    current.lastTime = event.timeStamp;
    const state = motionState.current;
    state.target -= deltaY;
    state.position = state.target;
    apply();
  };
  const onPointerEnd = (event) => {
    const current = drag.current;
    if (current.id !== event.pointerId) return;
    current.id = -1;
    if (!current.moved) return;
    const state = motionState.current;
    state.dragEndedAt = event.timeStamp;
    const fling = Math.max(-900, Math.min(900, current.velocity * 260));
    state.target -= fling;
    snap();
  };
  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      step(-1);
    }
  };
  const wasDragged = (event) => event.timeStamp - motionState.current.dragEndedAt < 80;
  const onSlotClick = (event, slot) => {
    const state = motionState.current;
    if (wasDragged(event)) {
      event.preventDefault();
      return;
    }
    const offset = wrap(layout.slots[slot].base - state.position, layout.total);
    const centred = slot === state.slot && Math.abs(offset) < 2;
    if (centred && projects[layout.slots[slot].project].link) return;
    event.preventDefault();
    window.clearTimeout(state.snapTimer);
    state.target = state.position + offset;
    run();
  };
  const onRowClick = (event, row) => {
    if (wasDragged(event)) return;
    const state = motionState.current;
    const fractional = floatIndex(layout, state.position);
    const offset = Math.round(wrap(row - fractional, rowCount));
    window.clearTimeout(state.snapTimer);
    state.target = centerAt(layout, nearestItem(layout, state.position) + offset);
    run();
  };
  if (count === 0) return null;
  const position = motionState.current.position;
  const fractional = floatIndex(layout, position);
  const activeSlotIndex = Math.min(active.slot, layout.slots.length - 1);
  const activeIndex = layout.slots[activeSlotIndex].project;
  const activeProject = projects[activeIndex];
  const number = String(activeIndex + 1).padStart(2, "0");
  const activeSize = layout.sizes[activeIndex];
  const inset = markerInset * (compact ? 0.7 : 1);
  const column = (index) => `calc(${padding}px + (100% - ${padding * 2}px) * ${index} / 12)`;
  const centerLine = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    whiteSpace: "nowrap",
  };
  return /*#__PURE__*/ _jsxs("div", {
    ref: rootRef,
    className: "fx-ps-root",
    role: "region",
    "aria-roledescription": "carousel",
    "aria-label": "Projects",
    tabIndex: 0,
    onKeyDown: isStatic ? undefined : onKeyDown,
    onPointerDown: isStatic ? undefined : onPointerDown,
    onPointerMove: isStatic ? undefined : onPointerMove,
    onPointerUp: isStatic ? undefined : onPointerEnd,
    onPointerCancel: isStatic ? undefined : onPointerEnd,
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      userSelect: "none",
      WebkitUserSelect: "none",
      touchAction: captureScroll ? "none" : "pan-y",
      overscrollBehavior: captureScroll ? "contain" : undefined,
      backgroundColor,
      color: textColor,
      fontSize: 13,
      lineHeight: 1.2,
      ...font,
      "--ps-text-dim": textDim,
      "--ps-text-hover": Math.min(1, textDim + 0.35),
      "--ps-img-dim": imageDim,
      "--ps-img-filter": grayscale ? "grayscale(1)" : "none",
    },
    children: [
      /*#__PURE__*/ _jsx("style", { children: isStatic ? BASE_CSS : BASE_CSS + MOTION_CSS }),
      /*#__PURE__*/ _jsxs("div", {
        className: "fx-ps-fade",
        style: { position: "absolute", inset: 0, opacity: ready || isStatic ? 1 : 0 },
        children: [
          layout.slots.map((slot, index) => {
            const project = projects[slot.project];
            const size = layout.sizes[slot.project];
            const image = project.image?.src
              ? project.image
              : FALLBACK_IMAGES[slot.project % FALLBACK_IMAGES.length];
            const isActive = index === activeSlotIndex;
            return /*#__PURE__*/ _jsx(
              "a",
              {
                ref: (element) => {
                  slotRefs.current[index] = element;
                },
                className: "fx-ps-item",
                "data-active": isActive,
                href: project.link || undefined,
                "aria-label": project.title,
                "aria-hidden": isActive ? undefined : true,
                tabIndex: -1,
                draggable: false,
                onClick: (event) => onSlotClick(event, index),
                style: {
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: size.width,
                  height: size.height,
                  display: "block",
                  overflow: "hidden",
                  borderRadius: radius,
                  cursor: "pointer",
                  willChange: "transform",
                  transform: slotTransform(layout, index, position),
                },
                children: /*#__PURE__*/ _jsx("img", {
                  src: image.src,
                  srcSet: image.srcSet,
                  sizes: `${size.width}px`,
                  alt: image.alt ?? "",
                  draggable: false,
                  style: { display: "block", width: "100%", height: "100%", objectFit: "cover" },
                }),
              },
              index,
            );
          }),
          marker !== "none" &&
            /*#__PURE__*/ _jsx(Marker, {
              width: activeSize.width + inset * 2, // Horizontal strokes sit in the middle of the gap so
              // they never cross the neighbouring images
              height: activeSize.height + gap + markerWeight,
              color: markerColor,
              size: markerSize,
              weight: markerWeight,
              brackets: marker === "brackets",
            }),
          showList &&
            !compact &&
            /*#__PURE__*/ _jsx("nav", {
              "aria-label": "Project list",
              style: {
                position: "absolute",
                top: "50%",
                left: padding,
                width: wide ? `calc((100% - ${padding * 2}px) * 2 / 12 - 12px)` : "30%",
                height: visibleRows * lineHeight,
                transform: "translateY(-50%)",
                overflow: "hidden",
              },
              children: Array.from({ length: rowCount }, (_, row) => {
                const index = row % count;
                return /*#__PURE__*/ _jsx(
                  "div",
                  {
                    ref: (element) => {
                      rowRefs.current[row] = element;
                    },
                    className: "fx-ps-row",
                    "data-active": index === activeIndex,
                    role: "button",
                    "aria-current": index === activeIndex ? "true" : undefined,
                    onClick: (event) => onRowClick(event, row),
                    style: {
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      maxWidth: "100%",
                      height: lineHeight,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      willChange: "transform",
                      transform: rowTransform(row, fractional, count, lineHeight),
                    },
                    children: projects[index].title,
                  },
                  row,
                );
              }),
            }),
          showDetails &&
            wide &&
            /*#__PURE__*/ _jsxs(_Fragment, {
              children: [
                /*#__PURE__*/ _jsx("div", {
                  style: { ...centerLine, left: column(2) },
                  children: /*#__PURE__*/ _jsx(SwapText, {
                    text: activeProject.category,
                    direction: active.direction,
                  }),
                }),
                /*#__PURE__*/ _jsx("div", {
                  style: { ...centerLine, left: column(9) },
                  children: /*#__PURE__*/ _jsx(SwapText, {
                    text: activeProject.services,
                    direction: active.direction,
                  }),
                }),
              ],
            }),
          showDetails &&
            !compact &&
            /*#__PURE__*/ _jsx("div", {
              style: { ...centerLine, right: padding },
              children: /*#__PURE__*/ _jsx(SwapText, { text: number, direction: active.direction }),
            }),
          showDetails &&
            !wide &&
            /*#__PURE__*/ _jsxs("div", {
              style: {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding, // On phones the stack runs behind the caption
                backgroundColor: compact ? backgroundColor : undefined,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 16,
                whiteSpace: "nowrap",
              },
              children: [
                /*#__PURE__*/ _jsxs("div", {
                  style: { display: "flex", flexDirection: "column", minWidth: 0 },
                  children: [
                    compact &&
                      /*#__PURE__*/ _jsx(SwapText, {
                        text: activeProject.title,
                        direction: active.direction,
                      }),
                    /*#__PURE__*/ _jsx("span", {
                      style: { opacity: compact ? 0.5 : 1 },
                      children: /*#__PURE__*/ _jsx(SwapText, {
                        text: activeProject.category,
                        direction: active.direction,
                      }),
                    }),
                  ],
                }),
                /*#__PURE__*/ _jsx(SwapText, {
                  text: compact ? number : activeProject.services,
                  direction: active.direction,
                }),
              ],
            }),
        ],
      }),
    ],
  });
}

export function ProjectScroll(props: ProjectScrollProps) {
  return _jsx(ProjectScrollImpl, mergeProps(props));
}

ProjectScroll.displayName = "ProjectScroll";

export default ProjectScroll;
