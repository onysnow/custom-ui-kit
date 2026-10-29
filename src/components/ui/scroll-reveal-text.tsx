/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL TEXT — LINES / WORDS / CHARACTERS ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT THIS COMPONENT DOES:
// A scroll-linked and on-load text reveal component that splits text into
// lines, words, or characters, then animates each unit with staggered
// opacity, color, blur, scale, and 3D transforms.
//
// WHY CODE IS REQUIRED:
// - Per-character/word/line text splitting with individual animation.
// - Masked line reveal (overflow hidden + translateY) requires DOM
//   measurement and dynamic restructuring not possible natively.
// - Real-time color interpolation via CSS color-mix per unit.
// - Per-unit blur, scale, 3D perspective transforms during scroll.
// - Stagger timing calculated per animation unit requires custom logic.
// - Direct DOM manipulation via refs for 60FPS scroll performance.
// - IntersectionObserver-gated animation to avoid off-screen CPU waste.
//
// KEY FEATURES:
// - Split Modes: Lines (masked reveal), Words, or Characters.
// - Trigger: Scroll-linked or On Load (fires when element appears).
// - Staggered Reveal: Each unit delays after the previous for wave effect.
// - Color Transition: Smooth CSS color-mix from hidden to revealed color.
// - Blur Effect: Hidden text starts blurred and sharpens on reveal.
// - Scale Entrance: Units grow from configurable scale to full size.
// - 3D Perspective: Optional rotateX tilt with configurable perspective.
// - HTML Tag: Semantic tag (h1-h6, p, div, span) for SEO/accessibility.
// - Presets: 12 one-click presets + full Custom mode.
// - Dark Mode: CSS color-mix respects Framer design tokens automatically.
// - High Performance: Direct DOM updates, no React re-renders during anim.
//
// ═══════════════════════════════════════════════════════════════════════════
// Created by AliThemes.com
// Powered by Framer
// ═══════════════════════════════════════════════════════════════════════════
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useEffect, useMemo, useState } from "react";
const DEFAULT_TEXT =
  "Scroll down and watch each character come alive with smooth, staggered animation.";
const PRESETS = {
  Default: {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.2,
    xOffset: 7,
    yOffset: 0,
    blur: 0,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  "Fade In Up": {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.15,
    xOffset: 0,
    yOffset: 25,
    blur: 0,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  "Blur Reveal": {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.2,
    xOffset: 0,
    yOffset: 0,
    blur: 8,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  Cinematic: {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.12,
    xOffset: 10,
    yOffset: 20,
    blur: 4,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  "3D Flip": {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.15,
    xOffset: 0,
    yOffset: 0,
    blur: 2,
    rotateX: 45,
    perspective: 800,
    scale: 1,
  },
  "Wave RTL": {
    splitMode: "Characters",
    revealDirection: "Right to Left",
    stagger: 0.1,
    xOffset: 5,
    yOffset: 15,
    blur: 0,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  Typewriter: {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.4,
    xOffset: 0,
    yOffset: 0,
    blur: 0,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  "Glitch Rise": {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.08,
    xOffset: 15,
    yOffset: 40,
    blur: 10,
    rotateX: 30,
    perspective: 600,
    scale: 1,
  },
  "Soft Words": {
    splitMode: "Words",
    revealDirection: "Left to Right",
    stagger: 0.3,
    xOffset: 0,
    yOffset: 12,
    blur: 3,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  "Cascade Down": {
    splitMode: "Characters",
    revealDirection: "Right to Left",
    stagger: 0.12,
    xOffset: 0,
    yOffset: -30,
    blur: 5,
    rotateX: -20,
    perspective: 900,
    scale: 1,
  },
  "Masked Lines": {
    splitMode: "Lines",
    revealDirection: "Left to Right",
    stagger: 0.15,
    xOffset: 0,
    yOffset: 0,
    blur: 0,
    rotateX: 0,
    perspective: 800,
    scale: 1,
  },
  "Scale Pop": {
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.1,
    xOffset: 0,
    yOffset: 15,
    blur: 2,
    rotateX: 0,
    perspective: 800,
    scale: 0.5,
  },
};
const DEFAULT_FONT = {
  fontSize: "62px",
  fontWeight: 600,
  letterSpacing: "-0.02em",
  lineHeight: "1.4em",
};

const DEFAULT_PROPS = {
  preset: "Default",
  text: DEFAULT_TEXT,
  font: DEFAULT_FONT,
  htmlTag: "div",
  colorRevealed: "#111827",
  colorHidden: "#9ca3af",
  trigger: "Scroll",
  onLoadDuration: 1.5,
  splitMode: "Characters",
  revealDirection: "Left to Right",
  stagger: 0.2,
  xOffset: 7,
  yOffset: 0,
  scale: 1,
  blur: 0,
  rotateX: 0,
  perspective: 800,
  offsetStart: 80,
  offsetEnd: 20,
};

export type ScrollRevealTextPreset =
  | "Default"
  | "Fade In Up"
  | "Blur Reveal"
  | "Cinematic"
  | "3D Flip"
  | "Wave RTL"
  | "Typewriter"
  | "Glitch Rise"
  | "Soft Words"
  | "Cascade Down"
  | "Masked Lines"
  | "Scale Pop"
  | "Custom";

export interface ScrollRevealTextProps {
  /** One of the 12 presets, or "Custom" to use the individual animation props below. */
  preset?: ScrollRevealTextPreset;
  text?: string;
  font?: React.CSSProperties;
  htmlTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
  colorRevealed?: string;
  colorHidden?: string;
  trigger?: "Scroll" | "On Load";
  /** Seconds, for the "On Load" trigger. */
  onLoadDuration?: number;
  splitMode?: "Characters" | "Words" | "Lines";
  revealDirection?: "Left to Right" | "Right to Left";
  stagger?: number;
  xOffset?: number;
  yOffset?: number;
  scale?: number;
  blur?: number;
  rotateX?: number;
  perspective?: number;
  /** Viewport position (%) where the scroll reveal begins. */
  offsetStart?: number;
  /** Viewport position (%) where the scroll reveal completes. */
  offsetEnd?: number;
  style?: React.CSSProperties;
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function ScrollRevealText(rawProps: ScrollRevealTextProps) {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const containerRef = useRef(null);
  const spanRefs = useRef([]);
  const lineRefs = useRef([]);
  const isVisible = useRef(false);
  const rafId = useRef(0);
  const scheduled = useRef(false);
  const [lineGroups, setLineGroups] = useState(null);
  const isStatic = false;
  const preset = props.preset !== "Custom" ? PRESETS[props.preset] : null;
  const {
    text,
    font,
    colorHidden,
    colorRevealed,
    htmlTag,
    trigger,
    onLoadDuration,
    offsetStart,
    offsetEnd,
    style,
  } = props;
  const splitMode = preset?.splitMode ?? props.splitMode;
  const revealDirection = preset?.revealDirection ?? props.revealDirection;
  const stagger = preset?.stagger ?? props.stagger;
  const xOffset = preset?.xOffset ?? props.xOffset;
  const yOffset = preset?.yOffset ?? props.yOffset;
  const blur = preset?.blur ?? props.blur;
  const rotateX = preset?.rotateX ?? props.rotateX;
  const perspective = preset?.perspective ?? props.perspective;
  const scale = preset?.scale ?? props.scale;
  const isLinesMode = splitMode === "Lines"; // Build word groups and animation unit indices
  const { allSpans, unitCount, wordGroups } = useMemo(() => {
    const tokens = String(text).split(/(\s+)/);
    const spans = [];
    let unitIdx = 0;
    tokens.forEach((token) => {
      const isSpace = /^\s+$/.test(token);
      const chars = Array.from(token);
      if (isSpace) {
        chars.forEach((ch) => spans.push({ char: ch, unit: -1, isSpace: true }));
      } else if (splitMode === "Words" || splitMode === "Lines") {
        const idx = unitIdx++;
        chars.forEach((ch) => spans.push({ char: ch, unit: idx, isSpace: false }));
      } else {
        chars.forEach((ch) => spans.push({ char: ch, unit: unitIdx++, isSpace: false }));
      }
    });
    const groups = [];
    let current = null;
    spans.forEach((span, i) => {
      if (span.isSpace) {
        if (current) {
          groups.push(current);
          current = null;
        }
        groups.push({ type: "space", spans: [{ ...span, idx: i }] });
      } else {
        if (!current) current = { type: "word", spans: [] };
        current.spans.push({ ...span, idx: i });
      }
    });
    if (current) groups.push(current);
    if (revealDirection === "Right to Left" && !isLinesMode) {
      const max = unitIdx - 1;
      spans.forEach((s) => {
        if (!s.isSpace) s.unit = max - s.unit;
      });
    }
    return { allSpans: spans, unitCount: unitIdx, wordGroups: groups };
  }, [text, splitMode, revealDirection, isLinesMode]); // Lines mode: detect line breaks after render
  useEffect(() => {
    if (!isLinesMode || isStatic) {
      if (lineGroups !== null) setLineGroups(null);
      return;
    }
    const detect = () => {
      const container = containerRef.current;
      if (!container) return;
      const wordEls = container.querySelectorAll("[data-wg]");
      if (wordEls.length === 0) return;
      const positions = [];
      wordEls.forEach((el) => {
        positions.push({
          gi: parseInt(el.dataset.wg),
          top: Math.round(el.getBoundingClientRect().top),
        });
      });
      const lineWordGis = [];
      let currentLine = [];
      let lastTop = -Infinity;
      positions.forEach(({ gi, top }) => {
        if (currentLine.length > 0 && Math.abs(top - lastTop) > 3) {
          lineWordGis.push([...currentLine]);
          currentLine = [];
        }
        currentLine.push(gi);
        lastTop = top;
      });
      if (currentLine.length > 0) lineWordGis.push([...currentLine]);
      const lines = lineWordGis.map((wordGis, li) => {
        const start = wordGis[0];
        const end = li < lineWordGis.length - 1 ? lineWordGis[li + 1][0] : wordGroups.length;
        return Array.from({ length: end - start }, (_, k) => start + k);
      });
      if (revealDirection === "Right to Left") lines.reverse();
      setLineGroups(lines);
    };
    requestAnimationFrame(() => requestAnimationFrame(detect));
  }, [text, splitMode, revealDirection, font, isLinesMode, wordGroups.length]); // ── Animation engine ───────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isLinesMode && !lineGroups) return;
    const totalUnits = isLinesMode ? lineGroups.length : unitCount;
    if (totalUnits === 0) return;
    if (!isLinesMode) {
      spanRefs.current = spanRefs.current.slice(0, allSpans.length);
    }
    const dur = 0.7;
    const totalTime = dur + (totalUnits - 1) * stagger;
    const applyProgress = (scrollP) => {
      const time = scrollP * totalTime;
      if (isLinesMode) {
        lineRefs.current.forEach((el, lineIdx) => {
          if (!el) return;
          const p =
            totalUnits <= 1 ? scrollP : Math.max(0, Math.min(1, (time - lineIdx * stagger) / dur));
          const ty = ((1 - p) * 100).toFixed(1);
          let tf = `translateY(${ty}%)`;
          if (rotateX !== 0) {
            tf = `perspective(${perspective}px) rotateX(${(rotateX * (1 - p)).toFixed(1)}deg) ${tf}`;
          }
          if (scale < 1) {
            tf += ` scale(${(scale + (1 - scale) * p).toFixed(3)})`;
          }
          el.style.transform = tf;
          el.style.opacity = `${0.3 + p * 0.7}`;
          el.style.filter = blur > 0 ? `blur(${(blur * (1 - p)).toFixed(1)}px)` : "";
          const pct = Math.round(p * 100);
          el.style.color = `color-mix(in srgb, ${colorRevealed} ${pct}%, ${colorHidden})`;
        });
      } else {
        spanRefs.current.forEach((el, i) => {
          if (!el) return;
          const span = allSpans[i];
          if (!span || span.isSpace) return;
          const p =
            totalUnits <= 1
              ? scrollP
              : Math.max(0, Math.min(1, (time - span.unit * stagger) / dur));
          el.style.opacity = `${0.3 + p * 0.7}`;
          const tx = (-xOffset + xOffset * p).toFixed(1);
          const ty = (yOffset * (1 - p)).toFixed(1);
          let tf = "";
          if (rotateX !== 0) {
            tf = `perspective(${perspective}px) rotateX(${(rotateX * (1 - p)).toFixed(1)}deg) `;
          }
          tf += `translateX(${tx}px) translateY(${ty}px)`;
          if (scale < 1) {
            tf += ` scale(${(scale + (1 - scale) * p).toFixed(3)})`;
          }
          el.style.transform = tf;
          el.style.filter = blur > 0 ? `blur(${(blur * (1 - p)).toFixed(1)}px)` : "";
          const pct = Math.round(p * 100);
          el.style.color = `color-mix(in srgb, ${colorRevealed} ${pct}%, ${colorHidden})`;
        });
      }
    }; // Framer canvas: show text fully visible, skip animation
    if (isStatic) {
      applyProgress(1);
      return;
    }
    if (trigger === "On Load") {
      let started = false;
      applyProgress(0);
      const startAnimation = () => {
        if (started) return;
        started = true;
        const startTime = performance.now();
        const animate = (now) => {
          const elapsed = (now - startTime) / 1e3;
          const rawP = Math.min(1, elapsed / onLoadDuration);
          applyProgress(1 - Math.pow(1 - rawP, 3));
          if (rawP < 1) rafId.current = requestAnimationFrame(animate);
        };
        rafId.current = requestAnimationFrame(animate);
      };
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            startAnimation();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(container);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(rafId.current);
      };
    } // Scroll-based animation
    const startFrac = offsetStart / 100;
    const endFrac = offsetEnd / 100;
    const update = () => {
      const vh = window.innerHeight;
      const rect = container.getBoundingClientRect();
      const range = (startFrac - endFrac) * vh;
      let scrollP;
      if (isLinesMode) {
        scrollP = 1;
        if (range > 0) {
          scrollP = Math.max(0, Math.min(1, (startFrac * vh - rect.top) / range));
          if (scrollP === 0 && rect.top < vh && rect.bottom > 0) scrollP = 1;
        }
      } else {
        if (range <= 0) return;
        scrollP = Math.max(0, Math.min(1, (startFrac * vh - rect.top) / range));
      }
      applyProgress(scrollP);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) update();
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);
    const onScroll = () => {
      if (!isVisible.current || scheduled.current) return;
      scheduled.current = true;
      rafId.current = requestAnimationFrame(() => {
        update();
        scheduled.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [
    allSpans,
    unitCount,
    lineGroups,
    isLinesMode,
    isStatic,
    stagger,
    xOffset,
    yOffset,
    blur,
    rotateX,
    perspective,
    scale,
    trigger,
    onLoadDuration,
    offsetStart,
    offsetEnd,
    colorHidden,
    colorRevealed,
  ]); // ── Render ─────────────────────────────────────────────────────────────
  const Tag = htmlTag || "div";
  const containerStyle = { display: "inline-block", ...font, ...style };
  const renderWordGroup = (group, gi) => {
    if (group.type === "word") {
      return /*#__PURE__*/ _jsx(
        "span",
        {
          "data-wg": gi,
          style: { whiteSpace: "nowrap", display: "inline" },
          children: group.spans.map(({ char, idx }) =>
            /*#__PURE__*/ _jsx(
              "span",
              {
                ref: (el) => {
                  spanRefs.current[idx] = el;
                },
                style: {
                  display: "inline-block",
                  willChange: isLinesMode ? undefined : "transform, opacity, color, filter",
                },
                children: char,
              },
              idx,
            ),
          ),
        },
        `w-${gi}`,
      );
    }
    return group.spans.map(({ char, idx }) =>
      /*#__PURE__*/ _jsx(
        "span",
        { style: { display: "inline-block" }, children: char === " " ? "\xa0" : char },
        idx,
      ),
    );
  }; // Lines mode with detected lines → render with overflow-hidden wrappers
  if (isLinesMode && lineGroups) {
    return /*#__PURE__*/ _jsx(Tag, {
      ref: containerRef,
      style: containerStyle,
      children: lineGroups.map((groupIndices, lineIdx) =>
        /*#__PURE__*/ _jsx(
          "div",
          {
            style: { overflow: "hidden", display: "block" },
            children: /*#__PURE__*/ _jsx("div", {
              ref: (el) => {
                lineRefs.current[lineIdx] = el;
              },
              style: { display: "block", willChange: "transform, opacity, filter" },
              children: groupIndices.map((gi) => renderWordGroup(wordGroups[gi], gi)),
            }),
          },
          lineIdx,
        ),
      ),
    });
  } // Characters / Words mode (or Lines measurement phase)
  return /*#__PURE__*/ _jsx(Tag, {
    ref: containerRef,
    style: containerStyle,
    children: wordGroups.map((group, gi) => renderWordGroup(group, gi)),
  });
} // ── Defaults ───────────────────────────────────────────────────────────────
ScrollRevealText.defaultProps = {
  preset: "Default",
  text: DEFAULT_TEXT,
  font: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 62,
    lineHeight: "1.4em",
    letterSpacing: "-0.02em",
  },
  colorHidden: "#9ca3af",
  colorRevealed: "#111827",
  htmlTag: "div",
  trigger: "Scroll",
  onLoadDuration: 1.5,
  splitMode: "Characters",
  revealDirection: "Left to Right",
  stagger: 0.2,
  xOffset: 7,
  yOffset: 0,
  blur: 0,
  rotateX: 0,
  perspective: 800,
  scale: 1,
  offsetStart: 80,
  offsetEnd: 20,
}; // ── Property Controls ──────────────────────────────────────────────────────
const isCustom = (p) => p.preset === "Custom";

ScrollRevealText.displayName = "ScrollRevealText";

export default ScrollRevealText;
