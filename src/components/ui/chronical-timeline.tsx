/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef } from "react";
const TABLET_MAX = 1199;
const PHONE_MAX = 809;
const DEFAULT_PROPS = {
  items: [
    {
      bg: "#151515",
      fg: "#f2f2f2",
      eyebrow: "01/ Origins of the web",
      desc: "A network of static, text-first pages connected by hyperlinks. No design system existed yet, just documents linked together.",
      year: "1991",
    },
    {
      bg: "#ff4433",
      fg: "#151515",
      eyebrow: "02/ First graphical browser",
      desc: "The release of Mosaic, the first widely used graphical web browser, made the internet accessible to non-technical users. Websites became visual and interactive.",
      year: "1993",
    },
    {
      bg: "#aeeaf6",
      fg: "#151515",
      eyebrow: "03/ Social media rise",
      desc: "The rise of social platforms redefined online interaction and content sharing. The internet evolved into a social space, connecting people worldwide.",
      year: "2004",
    },
    {
      bg: "#0b0b0b",
      fg: "#beeaf6",
      eyebrow: "04/ Smartphones and mobile web",
      desc: "The launch of smartphones revolutionized how people access the internet, putting powerful browsing and apps in everyone's pocket.",
      year: "2007",
    },
    {
      bg: "#7c5cff",
      fg: "#101014",
      eyebrow: "05/ AI-powered web",
      desc: "Generative interfaces and copilots began shaping how pages are built and browsed, turning static sites into responsive, conversational experiences.",
      year: "2023",
    },
  ],
  labelFont: {
    fontFamily: "JetBrains Mono",
    fontWeight: 400,
    fontSize: 12,
    letterSpacing: "0.14em",
    lineHeight: "1.2em",
  },
  labelSizeTablet: 12,
  labelSizePhone: 11,
  labelOpacity: 0.65,
  labelGap: 14,
  descFont: { fontFamily: "Inter", fontWeight: 500, fontSize: 16, lineHeight: "1.55em" },
  descSizeTablet: 15,
  descSizePhone: 14,
  yearFont: { fontFamily: "Archivo Black", fontWeight: 900, fontSize: 216, lineHeight: "0.78em" },
  yearSizeTablet: 132,
  yearSizePhone: 76,
  yearTrimX: -0.05,
  yearTrimY: -0.02,
  frameBackground: "#000000",
  cornerRadius: 28,
  cornerRadiusTablet: 22,
  cornerRadiusPhone: 16,
  frameInset: 24,
  frameInsetTablet: 16,
  frameInsetPhone: 10,
  panelPadding: "56px 56px 56px 56px",
  panelPaddingTablet: "40px 40px 40px 40px",
  panelPaddingPhone: "28px 24px 28px 24px",
  headerAlign: "right",
  headerAlignPhone: "left",
  headerOffset: 12,
  headerMaxWidth: 420,
  headerMaxWidthTablet: 380,
  headerMaxWidthPhone: 300,
  totalScrollHeight: "500vh",
  totalScrollHeightTablet: "450vh",
  totalScrollHeightPhone: "400vh",
  smoothing: 45,
  segmentEase: "inout",
  contentParallax: 64,
  revealDirection: "rtl",
  yearRotation: 90,
  canvasItem: 0,
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

export interface ChronicalTimelineProps {
  items?: { eyebrow?: string; desc?: string; year?: string; bg?: string; fg?: string }[];
  smoothing?: number;
  segmentEase?: "linear" | "inout" | "out" | "expo";
  contentParallax?: number;
  revealDirection?: "rtl" | "ltr" | "btt";
  yearRotation?: number;
  labelFont?: React.CSSProperties;
  labelSizeTablet?: number;
  labelSizePhone?: number;
  labelOpacity?: number;
  labelGap?: number;
  descFont?: React.CSSProperties;
  descSizeTablet?: number;
  descSizePhone?: number;
  yearFont?: React.CSSProperties;
  yearSizeTablet?: number;
  yearSizePhone?: number;
  yearTrimX?: number;
  yearTrimY?: number;
  frameBackground?: string;
  cornerRadius?: number;
  cornerRadiusTablet?: number;
  cornerRadiusPhone?: number;
  frameInset?: number;
  frameInsetTablet?: number;
  frameInsetPhone?: number;
  panelPadding?: string;
  panelPaddingTablet?: string;
  panelPaddingPhone?: string;
  headerAlign?: "left" | "right";
  headerAlignPhone?: "left" | "right";
  headerOffset?: number;
  headerMaxWidth?: number;
  headerMaxWidthTablet?: number;
  headerMaxWidthPhone?: number;
  totalScrollHeight?: string;
  totalScrollHeightTablet?: string;
  totalScrollHeightPhone?: string;
  canvasItem?: number;
}

function ChronicalTimelineImpl(props) {
  const {
    items,
    labelFont,
    labelSizeTablet,
    labelSizePhone,
    labelOpacity,
    labelGap,
    descFont,
    descSizeTablet,
    descSizePhone,
    yearFont,
    yearSizeTablet,
    yearSizePhone,
    yearTrimX,
    yearTrimY,
    frameBackground,
    cornerRadius,
    cornerRadiusTablet,
    cornerRadiusPhone,
    frameInset,
    frameInsetTablet,
    frameInsetPhone,
    panelPadding,
    panelPaddingTablet,
    panelPaddingPhone,
    headerAlign,
    headerAlignPhone,
    headerOffset,
    headerMaxWidth,
    headerMaxWidthTablet,
    headerMaxWidthPhone,
    totalScrollHeight,
    totalScrollHeightTablet,
    totalScrollHeightPhone,
    smoothing,
    segmentEase,
    contentParallax,
    revealDirection,
    yearRotation,
    canvasItem,
  } = props;
  const wrapRef = useRef(null);
  const isStatic = false;
  const scope = "st-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const sections = Array.isArray(items) ? items : [];
  const count = sections.length;
  /* --------------------------------------------------------------- */ /* Scroll engine                                                    */ /* --------------------------------------------------------------- */ useEffect(() => {
    if (isStatic) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const frame = wrap.querySelector(".frame");
    const panels = Array.from(wrap.querySelectorAll(".panel"));
    const n = panels.length;
    if (!frame || n === 0) return;
    const inners = panels.map((p) => p.querySelector(".panel-inner"));
    const years = panels.map((p) => p.querySelector(".year"));
    const reduce =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rot = Math.abs(yearRotation);
    const parallax = reduce ? 0 : Math.abs(contentParallax);
    const vertical = revealDirection === "btt"; // Exponential follow rate. 0 smoothing locks the reveal to the
    // scrollbar, higher values let it trail and settle.
    const amount = reduce ? 0 : Math.min(100, Math.max(0, smoothing));
    const rate = 24 - (amount / 100) * 21;
    const instant = amount <= 0;
    const ease = getEase(segmentEase);
    /* ---- geometry, measured only on resize ---- */ let stickyTop = 0;
    let travel = 1;
    function measure() {
      stickyTop = parseFloat(getComputedStyle(frame).top) || 0;
      travel = Math.max(1, wrap.offsetHeight - frame.offsetHeight);
    }
    /* ---- clip helpers ---- */ const hidden = vertical
      ? "inset(100% 0 0 0)"
      : revealDirection === "ltr"
        ? "inset(0 100% 0 0)"
        : "inset(0 0 0 100%)";
    function clipOut(v) {
      const g = r2((1 - v) * 100);
      if (vertical) return `inset(0 0 ${g}% 0)`;
      if (revealDirection === "ltr") return `inset(0 0 0 ${g}%)`;
      return `inset(0 ${g}% 0 0)`;
    }
    function clipIn(t) {
      const g = r2((1 - t) * 100);
      if (vertical) return `inset(${g}% 0 0 0)`;
      if (revealDirection === "ltr") return `inset(0 ${g}% 0 0)`;
      return `inset(0 0 0 ${g}%)`;
    }
    function shift(px) {
      const v = r2(px);
      return vertical ? `translate3d(0, ${v}px, 0)` : `translate3d(${v}px, 0, 0)`;
    } // Which way the content drifts, so it always trails the wipe.
    const dir = revealDirection === "ltr" ? -1 : 1;
    /* ---- paint ---- */ let paintedIdx = -1;
    let painted = -1;
    function apply(raw) {
      if (Math.abs(raw - painted) < 4e-4) return;
      painted = raw;
      const scaled = Math.min(n - 1, Math.max(0, raw));
      const idx = Math.min(Math.max(n - 2, 0), Math.floor(scaled));
      const t = n > 1 ? ease(scaled - idx) : 0; // will-change only on the two panels actually moving, so the
      // browser is not holding a compositor layer per milestone.
      if (idx !== paintedIdx) {
        for (let i = 0; i < n; i++) {
          panels[i].style.willChange = i === idx || i === idx + 1 ? "clip-path" : "auto";
        }
        paintedIdx = idx;
      }
      for (let i = 0; i < n; i++) {
        const panel = panels[i];
        const inner = inners[i];
        const year = years[i];
        if (i === idx) {
          panel.style.clipPath = clipOut(1 - t);
          if (year) year.style.transform = `rotate(${r2(-rot * t)}deg)`;
          if (inner && parallax) inner.style.transform = shift(-dir * parallax * t);
        } else if (i === idx + 1) {
          panel.style.clipPath = clipIn(t);
          if (year) year.style.transform = "rotate(0deg)";
          if (inner && parallax) inner.style.transform = shift(dir * parallax * (1 - t));
        } else {
          panel.style.clipPath = hidden;
          if (year) year.style.transform = i < idx ? `rotate(${-rot}deg)` : "rotate(0deg)";
          if (inner && parallax) inner.style.transform = shift(0);
        }
        panel.style.zIndex = String(i);
      }
    }
    /* ---- loop ---- */ let current = 0;
    let target = 0;
    let running = false;
    let raf = 0;
    let last = 0;
    function readTarget() {
      const top = wrap.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (stickyTop - top) / travel));
      target = p * Math.max(n - 1, 1);
    }
    function tick(now) {
      const dt = Math.min(0.064, (now - last) / 1e3 || 0.016);
      last = now;
      readTarget();
      if (instant) {
        current = target;
      } else {
        current += (target - current) * (1 - Math.exp(-rate * dt));
        if (Math.abs(target - current) < 3e-4) current = target;
      }
      apply(current);
      if (current !== target) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        raf = 0;
      }
    }
    function kick() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
    function onResize() {
      measure();
      painted = -1;
      kick();
    }
    measure();
    readTarget();
    current = target;
    apply(current);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(wrap);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [isStatic, count, revealDirection, yearRotation, smoothing, segmentEase, contentParallax]);
  /* --------------------------------------------------------------- */ /* Styles                                                           */ /* --------------------------------------------------------------- */ const {
    fontSize: labelSize,
    ...labelStyle
  } = labelFont || {};
  const { fontSize: descSize, ...descStyle } = descFont || {};
  const { fontSize: yearSize, ...yearStyle } = yearFont || {};
  const hiddenClip =
    revealDirection === "btt"
      ? "inset(100% 0 0 0)"
      : revealDirection === "ltr"
        ? "inset(0 100% 0 0)"
        : "inset(0 0 0 100%)";
  const css = `
.${scope}{
    position: relative;
    width: 100%;
    min-width: 100%;
    box-sizing: border-box;
    align-self: stretch;
    flex: 1 1 auto;
}
.${scope} .frame{
    position: sticky;
    overflow: hidden;
    background: ${frameBackground};
    contain: paint;
}
.${scope} .panel{
    position: absolute;
    inset: 0;
    clip-path: ${hiddenClip};
}
.${scope} .panel-inner{
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    will-change: transform;
}
.${scope} .panel-header{
    align-self: ${headerAlign === "left" ? "flex-start" : "flex-end"};
    text-align: left;
    margin-top: ${num(headerOffset)}px;
}
.${scope} .eyebrow{
    display: block;
    text-transform: uppercase;
    opacity: ${labelOpacity};
    margin: 0 0 ${Number(labelGap) || 0}px 0;
}
.${scope} .desc{ margin: 0; }
.${scope} .year{
    display: block;
    margin: 0;
    white-space: nowrap;
    transform-origin: left bottom;
    will-change: transform;
    backface-visibility: hidden;
    margin-left: ${num(yearTrimX)}em;
    margin-bottom: ${num(yearTrimY)}em;
}
${block(scope, { scrollHeight: totalScrollHeight, inset: frameInset, radius: cornerRadius, padding: panelPadding, headerMax: headerMaxWidth, labelSize: unit(labelSize, 12), descSize: unit(descSize, 16), yearSize: unit(yearSize, 216) })}
@media (max-width: ${TABLET_MAX}px){
${block(scope, { scrollHeight: totalScrollHeightTablet, inset: frameInsetTablet, radius: cornerRadiusTablet, padding: panelPaddingTablet, headerMax: headerMaxWidthTablet, labelSize: unit(labelSizeTablet, 12), descSize: unit(descSizeTablet, 15), yearSize: unit(yearSizeTablet, 132) })}
}
@media (max-width: ${PHONE_MAX}px){
${block(scope, { scrollHeight: totalScrollHeightPhone, inset: frameInsetPhone, radius: cornerRadiusPhone, padding: panelPaddingPhone, headerMax: headerMaxWidthPhone, labelSize: unit(labelSizePhone, 11), descSize: unit(descSizePhone, 14), yearSize: unit(yearSizePhone, 76) })}
.${scope} .panel-header{
    align-self: ${headerAlignPhone === "right" ? "flex-end" : "flex-start"};
}
}
`;
  /* --------------------------------------------------------------- */ /* Render                                                           */ /* --------------------------------------------------------------- */ if (
    count === 0
  ) {
    return /*#__PURE__*/ _jsx("div", {
      ref: wrapRef,
      style: emptyStyle,
      children: "Add timeline items in the properties panel.",
    });
  }
  const renderPanel = (s, i, forced) =>
    /*#__PURE__*/ _jsx(
      "section",
      {
        className: "panel",
        style: { background: s.bg, color: s.fg, ...(forced ? { clipPath: forced } : null) },
        children: /*#__PURE__*/ _jsxs("div", {
          className: "panel-inner",
          children: [
            /*#__PURE__*/ _jsxs("div", {
              className: "panel-header",
              children: [
                /*#__PURE__*/ _jsx("span", {
                  className: "eyebrow",
                  style: labelStyle,
                  children: s.eyebrow,
                }),
                /*#__PURE__*/ _jsx("p", { className: "desc", style: descStyle, children: s.desc }),
              ],
            }),
            /*#__PURE__*/ _jsx("h2", { className: "year", style: yearStyle, children: s.year }),
          ],
        }),
      },
      i,
    );
  if (isStatic) {
    const index = Math.min(Math.max(canvasItem, 0), count - 1);
    return /*#__PURE__*/ _jsxs("div", {
      ref: wrapRef,
      className: `timeline ${scope}`,
      children: [
        /*#__PURE__*/ _jsx("style", { children: css }),
        /*#__PURE__*/ _jsx("div", {
          className: "frame",
          children: renderPanel(sections[index], index, "inset(0 0 0 0)"),
        }),
      ],
    });
  }
  return /*#__PURE__*/ _jsxs("div", {
    ref: wrapRef,
    className: `timeline ${scope}`,
    children: [
      /*#__PURE__*/ _jsx("style", { children: css }),
      /*#__PURE__*/ _jsx("div", {
        className: "frame",
        children: sections.map((s, i) => renderPanel(s, i)),
      }),
    ],
  });
}
/* ------------------------------------------------------------------- */ /* Helpers                                                              */ /* ------------------------------------------------------------------- */
function getEase(kind) {
  if (kind === "out") return (t) => 1 - Math.pow(1 - t, 3);
  if (kind === "expo") return (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -9 * t));
  if (kind === "inout") return (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  return (t) => t;
}
function block(scope, c) {
  const i = Number(c.inset) || 0;
  return `
.${scope}{ height: ${c.scrollHeight}; }
.${scope} .frame{
    top: ${i}px;
    margin: 0 ${i}px;
    height: calc(100vh - ${i * 2}px);
    height: calc(100svh - ${i * 2}px);
    border-radius: ${Number(c.radius) || 0}px;
}
.${scope} .panel-inner{ padding: ${pad(c.padding)}; }
.${scope} .panel-header{ max-width: ${Number(c.headerMax) || 420}px; }
.${scope} .eyebrow{ font-size: ${c.labelSize}; }
.${scope} .desc{ font-size: ${c.descSize}; }
.${scope} .year{ font-size: ${c.yearSize}; }`;
}
function unit(value, fallback) {
  if (value == null || value === "") return `${fallback}px`;
  return typeof value === "number" ? `${value}px` : String(value);
} // Framer's Padding control normally hands back a string, but a number
// or a per-side object would silently render as an invalid value and
// drop the padding to zero. Normalize whatever arrives.
function pad(v) {
  if (typeof v === "number") return `${v}px`;
  if (v && typeof v === "object") {
    const t = num(v.paddingTop ?? v.top);
    const r = num(v.paddingRight ?? v.right);
    const b = num(v.paddingBottom ?? v.bottom);
    const l = num(v.paddingLeft ?? v.left);
    return `${t}px ${r}px ${b}px ${l}px`;
  }
  const s = String(v ?? "").trim();
  return s === "" ? "48px" : s;
}
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function r2(v) {
  return Math.round(v * 100) / 100;
}
const emptyStyle = {
  width: "100%",
  minHeight: 220,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px dashed rgba(0,0,0,0.25)",
  borderRadius: 12,
  color: "rgba(0,0,0,0.5)",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
};
/* ------------------------------------------------------------------- */ /* Defaults                                                             */ /* ------------------------------------------------------------------- */ ChronicalTimeline.defaultProps =
  {
    items: [
      {
        bg: "#151515",
        fg: "#f2f2f2",
        eyebrow: "01/ Origins of the web",
        desc: "A network of static, text-first pages connected by hyperlinks. No design system existed yet, just documents linked together.",
        year: "1991",
      },
      {
        bg: "#ff4433",
        fg: "#151515",
        eyebrow: "02/ First graphical browser",
        desc: "The release of Mosaic, the first widely used graphical web browser, made the internet accessible to non-technical users. Websites became visual and interactive.",
        year: "1993",
      },
      {
        bg: "#aeeaf6",
        fg: "#151515",
        eyebrow: "03/ Social media rise",
        desc: "The rise of social platforms redefined online interaction and content sharing. The internet evolved into a social space, connecting people worldwide.",
        year: "2004",
      },
      {
        bg: "#0b0b0b",
        fg: "#beeaf6",
        eyebrow: "04/ Smartphones and mobile web",
        desc: "The launch of smartphones revolutionized how people access the internet, putting powerful browsing and apps in everyone's pocket.",
        year: "2007",
      },
      {
        bg: "#7c5cff",
        fg: "#101014",
        eyebrow: "05/ AI-powered web",
        desc: "Generative interfaces and copilots began shaping how pages are built and browsed, turning static sites into responsive, conversational experiences.",
        year: "2023",
      },
    ],
    labelFont: {
      fontFamily: "JetBrains Mono",
      fontWeight: 400,
      fontSize: 12,
      letterSpacing: "0.14em",
      lineHeight: "1.2em",
    },
    labelSizeTablet: 12,
    labelSizePhone: 11,
    labelOpacity: 0.65,
    labelGap: 14,
    descFont: { fontFamily: "Inter", fontWeight: 500, fontSize: 16, lineHeight: "1.55em" },
    descSizeTablet: 15,
    descSizePhone: 14,
    yearFont: { fontFamily: "Archivo Black", fontWeight: 900, fontSize: 216, lineHeight: "0.78em" },
    yearSizeTablet: 132,
    yearSizePhone: 76,
    yearTrimX: -0.05,
    yearTrimY: -0.02,
    frameBackground: "#000000",
    cornerRadius: 28,
    cornerRadiusTablet: 22,
    cornerRadiusPhone: 16,
    frameInset: 24,
    frameInsetTablet: 16,
    frameInsetPhone: 10,
    panelPadding: "56px 56px 56px 56px",
    panelPaddingTablet: "40px 40px 40px 40px",
    panelPaddingPhone: "28px 24px 28px 24px",
    headerAlign: "right",
    headerAlignPhone: "left",
    headerOffset: 12,
    headerMaxWidth: 420,
    headerMaxWidthTablet: 380,
    headerMaxWidthPhone: 300,
    totalScrollHeight: "500vh",
    totalScrollHeightTablet: "450vh",
    totalScrollHeightPhone: "400vh",
    smoothing: 45,
    segmentEase: "inout",
    contentParallax: 64,
    revealDirection: "rtl",
    yearRotation: 90,
    canvasItem: 0,
  };
/* ------------------------------------------------------------------- */ /* Property controls                                                    */ /* ------------------------------------------------------------------- */

export function ChronicalTimeline(props: ChronicalTimelineProps) {
  return _jsx(ChronicalTimelineImpl, mergeProps(props));
}

ChronicalTimeline.displayName = "ChronicalTimeline";

export default ChronicalTimeline;
