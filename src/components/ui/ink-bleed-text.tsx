/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
const RenderTarget = {
  canvas: "CANVAS",
  thumbnail: "THUMBNAIL",
  export: "EXPORT",
  preview: "PREVIEW",
  current: () => "PREVIEW",
};

/**
 * Ink Bleed Text
 * Each word (or letter) soaks into the page like ink on paper:
 * it spreads out from soft, fibrous edges and dries into crisp type.
 *
 * @framerIntrinsicWidth 720
 * @framerIntrinsicHeight 160
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */ const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const EASE = {
  soak: (x) => 1 - Math.pow(1 - x, 3),
  slow: (x) => 1 - Math.pow(1 - x, 5),
  smooth: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  linear: (x) => x,
};
const FONT_DEFAULT = {
  fontFamily: "'Libre Caslon Text', Georgia, serif",
  fontSize: 96,
  fontWeight: 400,
  letterSpacing: "-0.03em",
  lineHeight: "1.05em",
};
function InkBleedTextImpl(props) {
  const {
    text,
    tag,
    font,
    color,
    align,
    sizing,
    split,
    spread,
    roughness,
    grain,
    halo,
    trigger,
    replay,
    duration,
    delay,
    stagger,
    easing,
    order,
    hoverBleed,
    hoverStrength,
    loop,
    loopPause,
    style,
  } = { ...DEFAULT_PROPS, ...props };
  const sz = { ...DEFAULT_PROPS.sizing, ...(sizing || {}) };
  const isCanvas = RenderTarget.current() === RenderTarget.canvas;
  const rootRef = useRef(null);
  const uid = (React.useId ? React.useId() : "ib").replace(/[^a-zA-Z0-9]/g, "");
  const units = useRef([]);
  const hovers = useRef({});
  const t0 = useRef(null);
  const [width, setWidth] = useState(0);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const animate = !isCanvas && !reduced; // ----- split text -----
  const words = useMemo(
    () =>
      String(text || "")
        .split(/\s+/)
        .filter(Boolean),
    [text],
  );
  let count = 0;
  const layout = words.map((w) => {
    const u = split === "word" ? count++ : -1;
    return {
      w,
      u,
      letters: Array.from(w).map((ch) => ({ ch, u: split === "letter" ? count++ : -1 })),
    };
  });
  const total = count;
  const orderIndex = useMemo(() => {
    const idx = Array.from({ length: total }, (_, i) => i);
    if (order === "reverse") idx.reverse();
    if (order === "center") {
      const mid = (total - 1) / 2;
      idx.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
    }
    if (order === "random") {
      let s = total * 9301 + 49297;
      for (let i = idx.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
    }
    const rank = [];
    idx.forEach((u, r) => (rank[u] = r));
    return rank;
  }, [total, order]); // ----- responsive width -----
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const baseSize = parseFloat(font?.fontSize) || FONT_DEFAULT.fontSize;
  const fontSize =
    sz.mode === "fluid" && width > 0
      ? clamp((width * sz.scale) / 100, sz.min, sz.max)
      : sz.mode === "fluid"
        ? clamp(baseSize, sz.min, sz.max)
        : baseSize; // ----- collect units -----
  const live = useRef({
    spread,
    roughness,
    grain,
    halo,
    duration,
    delay,
    stagger,
    easing,
    hoverStrength,
    loop,
    loopPause,
    fontSize,
    orderIndex,
  });
  live.current = {
    spread,
    roughness,
    grain,
    halo,
    duration,
    delay,
    stagger,
    easing,
    hoverStrength,
    loop,
    loopPause,
    fontSize,
    orderIndex,
  };
  const restart = () => {
    t0.current = performance.now();
    hovers.current = {};
    units.current.forEach((u) => {
      u.done = false;
      u.el.style.opacity = "0";
      u.el.style.filter = `url(#${u.fid})`;
    });
  };
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    units.current = Array.from(root.querySelectorAll("[data-u]"))
      .filter((el) => +el.dataset.u >= 0)
      .map((el) => {
        const fid = `${uid}-ink-${el.dataset.u}`;
        const f = root.querySelector(`#${CSS.escape(fid)}`);
        return {
          el,
          fid,
          done: !animate,
          turb: f.querySelector("feTurbulence"),
          disp: f.querySelector("feDisplacementMap"),
          blur: f.querySelector("feGaussianBlur"),
          ink: f.querySelector("[data-k=ink]"),
          halo: f.querySelector("[data-k=halo]"),
        };
      });
    if (!animate) {
      units.current.forEach((u) => {
        u.el.style.opacity = "1";
        u.el.style.filter = "none";
      });
      return;
    }
    t0.current = null;
    units.current.forEach((u) => {
      u.el.style.opacity = "0";
      u.el.style.filter = `url(#${u.fid})`;
    });
    if (trigger === "load") restart();
  }, [text, split, animate, uid]); // ----- in-view trigger -----
  useEffect(() => {
    if (!animate || trigger !== "inView") return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      restart();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (t0.current === null || replay) restart();
        } else if (replay) {
          t0.current = null;
          units.current.forEach((u) => {
            u.done = false;
            u.el.style.opacity = "0";
          });
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animate, trigger, replay, text, split]); // ----- animation loop -----
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const step = () => {
      raf = requestAnimationFrame(step);
      if (t0.current === null) return;
      const c = live.current;
      const now = performance.now();
      const ease = EASE[c.easing] || EASE.soak;
      const fsz = c.fontSize;
      const n = units.current.length;
      const cycle = c.delay + c.duration + Math.max(0, n - 1) * c.stagger;
      let elapsed = (now - t0.current) / 1e3;
      if (c.loop && elapsed > cycle + c.loopPause) {
        restart();
        elapsed = 0;
      }
      units.current.forEach((u, k) => {
        const local = elapsed - c.delay - (c.orderIndex[k] ?? k) * c.stagger;
        let e = ease(clamp(local / c.duration));
        const hs = hovers.current[k];
        if (hs !== undefined) {
          const h = (now - hs) / 1100;
          if (h >= 1) delete hovers.current[k];
          else {
            const wet =
              c.hoverStrength * (h < 0.18 ? EASE.soak(h / 0.18) : 1 - EASE.soak((h - 0.18) / 0.82));
            e = Math.min(e, 1 - wet);
          }
        }
        if (e >= 1 && local > 0) {
          if (!u.done) {
            u.done = true;
            u.el.style.filter = "none";
            u.el.style.opacity = "1";
          }
          return;
        }
        if (u.done) {
          u.done = false;
          u.el.style.filter = `url(#${u.fid})`;
        }
        const q = 1 - e;
        u.el.style.opacity = String(clamp(local / Math.max(0.05, c.duration * 0.12)));
        u.turb.setAttribute("baseFrequency", ((9 * c.grain) / fsz).toFixed(4));
        u.disp.setAttribute("scale", ((q * c.roughness * fsz) / 60).toFixed(2));
        u.blur.setAttribute("stdDeviation", ((q * c.spread * fsz) / 100).toFixed(2));
        u.ink.setAttribute("slope", (1 + q * 16).toFixed(3));
        u.ink.setAttribute("intercept", (-q * 6).toFixed(3));
        u.halo.setAttribute("slope", (q * c.halo * 1.1).toFixed(3));
      });
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animate]);
  const onEnter = (e) => {
    if (!hoverBleed || !animate) return;
    const idx = units.current.findIndex((u) => u.el === e.currentTarget);
    if (idx >= 0 && units.current[idx].done && hovers.current[idx] === undefined)
      hovers.current[idx] = performance.now();
  };
  const onRootEnter = () => {
    if (animate && trigger === "hover") restart();
  };
  const Tag = tag || "h1";
  const justify = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  return /*#__PURE__*/ _jsxs(Tag, {
    ref: rootRef,
    "aria-label": text,
    onPointerEnter: onRootEnter,
    style: {
      ...style,
      position: "relative",
      margin: 0,
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: justify,
      columnGap: "0.24em",
      rowGap: 0,
      color,
      textAlign: align,
      ...FONT_DEFAULT,
      ...font,
      fontSize,
    },
    children: [
      /*#__PURE__*/ _jsx("svg", {
        width: 0,
        height: 0,
        "aria-hidden": true,
        style: { position: "absolute" },
        children: /*#__PURE__*/ _jsx("defs", {
          children: Array.from({ length: total }, (_, i) =>
            /*#__PURE__*/ _jsxs(
              "filter",
              {
                id: `${uid}-ink-${i}`,
                x: "-40%",
                y: "-60%",
                width: "180%",
                height: "220%",
                colorInterpolationFilters: "sRGB",
                children: [
                  /*#__PURE__*/ _jsx("feTurbulence", {
                    type: "fractalNoise",
                    baseFrequency: "0.08",
                    numOctaves: 2,
                    seed: i * 7 + 3,
                    result: "noise",
                  }),
                  /*#__PURE__*/ _jsx("feDisplacementMap", {
                    in: "SourceGraphic",
                    in2: "noise",
                    scale: 0,
                    xChannelSelector: "R",
                    yChannelSelector: "G",
                    result: "d",
                  }),
                  /*#__PURE__*/ _jsx("feGaussianBlur", { in: "d", stdDeviation: 0, result: "b" }),
                  /*#__PURE__*/ _jsx("feComponentTransfer", {
                    in: "b",
                    result: "halo",
                    children: /*#__PURE__*/ _jsx("feFuncA", {
                      "data-k": "halo",
                      type: "linear",
                      slope: 0,
                      intercept: 0,
                    }),
                  }),
                  /*#__PURE__*/ _jsx("feComponentTransfer", {
                    in: "b",
                    result: "ink",
                    children: /*#__PURE__*/ _jsx("feFuncA", {
                      "data-k": "ink",
                      type: "linear",
                      slope: 1,
                      intercept: 0,
                    }),
                  }),
                  /*#__PURE__*/ _jsxs("feMerge", {
                    children: [
                      /*#__PURE__*/ _jsx("feMergeNode", { in: "halo" }),
                      /*#__PURE__*/ _jsx("feMergeNode", { in: "ink" }),
                    ],
                  }),
                ],
              },
              i,
            ),
          ),
        }),
      }),
      layout.map((w, wi) =>
        /*#__PURE__*/ _jsx(
          "span",
          {
            "aria-hidden": true,
            "data-u": w.u,
            onPointerEnter: split === "word" ? onEnter : undefined,
            style: {
              display: "inline-flex",
              whiteSpace: "nowrap",
              opacity: animate && split === "word" ? 0 : 1,
            },
            children: w.letters.map((l, li) =>
              /*#__PURE__*/ _jsx(
                "span",
                {
                  "data-u": l.u,
                  onPointerEnter: split === "letter" ? onEnter : undefined,
                  style: {
                    display: "inline-block",
                    padding: "0.06em 0",
                    opacity: animate && split === "letter" ? 0 : 1,
                  },
                  children: l.ch,
                },
                li,
              ),
            ),
          },
          wi,
        ),
      ),
    ],
  });
}

const DEFAULT_PROPS = {
  text: "Every word leaves a mark.",
  tag: "h1",
  font: FONT_DEFAULT,
  color: "#1B1A17",
  align: "center",
  sizing: { mode: "fluid", min: 36, max: 120, scale: 9 },
  split: "word",
  spread: 12,
  roughness: 10,
  grain: 1,
  halo: 0.5,
  trigger: "inView",
  replay: false,
  duration: 1.6,
  delay: 0.2,
  stagger: 0.14,
  order: "forward",
  easing: "soak",
  hoverBleed: true,
  hoverStrength: 0.55,
  loop: false,
  loopPause: 2,
};

const GROUP_KEYS = ["sizing"];

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

export interface InkBleedTextProps {
  text?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  font?: React.CSSProperties;
  color?: string;
  align?: "left" | "center" | "right";
  sizing?: { mode?: "fluid" | "fixed"; scale?: number; min?: number; max?: number };
  split?: "word" | "letter";
  spread?: number;
  roughness?: number;
  grain?: number;
  halo?: number;
  trigger?: "inView" | "load" | "hover";
  replay?: boolean;
  duration?: number;
  delay?: number;
  stagger?: number;
  order?: "forward" | "reverse" | "center" | "random";
  easing?: "soak" | "slow" | "smooth" | "linear";
  hoverBleed?: boolean;
  hoverStrength?: number;
  loop?: boolean;
  loopPause?: number;
  style?: React.CSSProperties;
}

export function InkBleedText(props: InkBleedTextProps) {
  return _jsx(InkBleedTextImpl, mergeProps(props));
}

InkBleedText.displayName = "InkBleedText";

export default InkBleedText;
