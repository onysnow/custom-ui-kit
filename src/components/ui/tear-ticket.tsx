/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-expressions, no-empty, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {
  motion,
  animate,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect; // ─────────────────────────────────────────────────────────────
// Motion presets: card stock is light but stiff. Nothing bounces.
// ─────────────────────────────────────────────────────────────
const HEAVY = { type: "spring", stiffness: 260, damping: 32, mass: 1.2 };
const SETTLE = { type: "spring", stiffness: 190, damping: 27, mass: 1 };
const FALL = { duration: 0.85, ease: [0.55, 0, 0.85, 0.4] };
const QUICK = { duration: 0.2, ease: "easeOut" }; // Foil presets. Highlights stop short of pure white, darks short of black.
const FOILS = {
  gold: "linear-gradient(100deg, #6b4d1e 0%, #a8813a 12%, #e9cf86 24%, #fbf0c8 31%, #c39a45 40%, #7a5822 52%, #b88f3e 62%, #f3dd9a 72%, #fdf3d2 77%, #b38a3c 87%, #6e5020 100%)",
  silver:
    "linear-gradient(100deg, #5d6168 0%, #8f959d 12%, #d5d9de 24%, #f3f4f6 31%, #aab0b8 40%, #666b72 52%, #9aa0a8 62%, #e1e4e8 72%, #f5f6f7 77%, #9ca2aa 87%, #5f636a 100%)",
  rose: "linear-gradient(100deg, #7c4237 0%, #b26f60 12%, #e8b3a2 24%, #fbe3d8 31%, #c88676 40%, #84493d 52%, #b97a6a 62%, #f0c5b5 72%, #fde9df 77%, #b47567 87%, #7a4136 100%)",
  pumpkin:
    "linear-gradient(100deg, #b8400a 0%, #e0601a 12%, #ff9a4d 24%, #ffd2a6 31%, #f07424 40%, #c04a0e 52%, #ec6c20 62%, #ffad6b 72%, #ffdcbc 77%, #e86a1e 87%, #b8400a 100%)",
  copper:
    "linear-gradient(100deg, #5e2f16 0%, #94522a 12%, #d9915c 24%, #f6c99d 31%, #b06a37 40%, #6a3519 52%, #a65f31 62%, #e8a875 72%, #f9d7b4 77%, #a35d30 87%, #5c2e15 100%)",
}; // Tiled SVG noise as data URIs: fine grain + long paper fibers.
const GRAIN_TILE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const FIBER_TILE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.38' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>")`; // Worn ink mask for the stamp, so it reads as pressed rather than printed by a machine.
const WORN_MASK = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.4 2.05'/></filter><rect width='100%' height='100%' filter='url(%23w)'/></svg>")`; // ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function mix(color, pct, other = "transparent") {
  return `color-mix(in srgb, ${color} ${pct}%, ${other})`;
}
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 1831565813) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function parseBox(v, fb) {
  if (typeof v === "number" && isFinite(v)) return [v, v, v, v];
  const n = String(v ?? "")
    .trim()
    .split(/\s+/)
    .map((p) => parseFloat(p))
    .filter((x) => !isNaN(x));
  if (n.length === 0) return [fb, fb, fb, fb];
  if (n.length === 1) return [n[0], n[0], n[0], n[0]];
  if (n.length === 2) return [n[0], n[1], n[0], n[1]];
  if (n.length === 3) return [n[0], n[1], n[2], n[1]];
  return [n[0], n[1], n[2], n[3]];
} // Framer injects font color both as `color` and `--framer-font-color`. Strip both, set ours.
// `scale` shrinks the font for narrow frames, never below `min` of its size.
function fontWith(font, color, scale = 1, min = 0) {
  const { color: _c, ["--framer-font-color"]: _v, ...rest } = font || {};
  const out = { ...rest, color, ["--framer-font-color"]: color };
  if (scale !== 1) {
    const px = typeof rest.fontSize === "number" ? rest.fontSize : parseFloat(rest.fontSize);
    if (isFinite(px)) out.fontSize = Math.max(min, px * scale) + "px";
  }
  return out;
}
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
} // Perforated edge mask: two corner notches + half-holes along the tear line.
// Each piece carries half of every hole, so joined they read as full punches
// and once torn each edge is properly scalloped.
function perfMask(side, notch, hole, spacing) {
  const x = side === "right" ? "100%" : "0%";
  const toward = side === "right" ? "to left" : "to right";
  const n = Math.max(0, notch);
  const h = Math.max(0.5, hole);
  const s = Math.max(h * 2 + 2, spacing);
  const images = [
    `radial-gradient(circle at ${x} 0%, transparent ${n}px, #000 ${n + 0.6}px)`,
    `radial-gradient(circle at ${x} 100%, transparent ${n}px, #000 ${n + 0.6}px)`,
    `radial-gradient(circle at ${x} 50%, transparent ${h}px, #000 ${h + 0.6}px)`,
    `linear-gradient(${toward}, transparent ${h * 2}px, #000 ${h * 2}px)`,
  ].join(", ");
  const sizes = `100% 100%, 100% 100%, ${h * 2}px ${s}px, 100% 100%`;
  const positions = `0 0, 0 0, ${x} 50%, 0 0`;
  const repeats = "no-repeat, no-repeat, repeat-y, no-repeat";
  return {
    WebkitMaskImage: images,
    maskImage: images,
    WebkitMaskSize: sizes,
    maskSize: sizes,
    WebkitMaskPosition: positions,
    maskPosition: positions,
    WebkitMaskRepeat: repeats,
    maskRepeat: repeats,
    WebkitMaskComposite: "source-in, source-in, source-over, source-over",
    maskComposite: "intersect, intersect, add, add",
  };
} // ── Sound: synthesized paper, no audio files ──
let audioCtx = null;
function getAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}
function noiseBurst(ctx, dur, f0, f1, gain, q = 1.2) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    // Crackly: sparse impulses over a thin bed of noise, like fibres giving way.
    const r = Math.random();
    d[i] =
      (r > 0.82 ? Math.random() * 2 - 1 : (Math.random() * 2 - 1) * 0.25) *
      Math.pow(1 - i / len, 1.6);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = q;
  const t = ctx.currentTime;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start();
} // ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
// Torn paper fibers. Plain divs, revealed top to bottom as the tear runs.
function Fibers({ side, seed, inset, reach, core, alt, reveal, notch = 0 }) {
  const strands = useMemo(() => {
    const rand = seeded(seed);
    const out = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      out.push({
        y: ((i + rand()) / count) * 100,
        x: rand() * inset,
        len: 1.5 + rand() * reach,
        angle: (rand() - 0.5) * 70,
        w: 0.4 + rand() * 0.6,
        o: 0.45 + rand() * 0.5,
        alt: rand() > 0.72,
      });
    }
    return out;
  }, [seed, inset, reach]);
  const mask = useTransform(reveal, (v) => {
    const p = v * 100;
    return `linear-gradient(to bottom, #000 ${p - 3}%, transparent ${p + 1}%)`;
  });
  const width = inset + reach + 2;
  const flip = side === "left";
  return /*#__PURE__*/ _jsx(motion.div, {
    "aria-hidden": true,
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width,
      left: flip ? undefined : "100%",
      right: flip ? "100%" : undefined,
      marginLeft: flip ? 0 : -inset,
      marginRight: flip ? -inset : 0,
      scaleX: flip ? -1 : 1,
      pointerEvents: "none",
      WebkitMaskImage: mask,
      maskImage: mask,
    },
    children: /*#__PURE__*/ _jsx("div", {
      style: {
        position: "absolute",
        inset: 0,
        ...(notch > 0
          ? {
              WebkitMaskImage: `linear-gradient(to bottom, transparent ${notch + 1}px, #000 ${notch + 4}px, #000 calc(100% - ${notch + 4}px), transparent calc(100% - ${notch + 1}px))`,
              maskImage: `linear-gradient(to bottom, transparent ${notch + 1}px, #000 ${notch + 4}px, #000 calc(100% - ${notch + 4}px), transparent calc(100% - ${notch + 1}px))`,
            }
          : null),
      },
      children: strands.map((f, i) =>
        /*#__PURE__*/ _jsx(
          "div",
          {
            style: {
              position: "absolute",
              top: `${f.y}%`,
              left: f.x,
              width: f.len,
              height: f.w,
              borderRadius: f.w,
              background: f.alt ? alt : core,
              opacity: f.o,
              transformOrigin: "0% 50%",
              transform: `rotate(${f.angle}deg)`,
            },
          },
          i,
        ),
      ),
    }),
  });
}
function Foil({ children, font, foil, position }) {
  return (
    // Deboss lives on the wrapper: light from top left, so pressed-in foil
    // gets a shadow on the upper edge and a highlight on the lower.
    /*#__PURE__*/ _jsx("span", {
      style: {
        display: "inline-block",
        filter:
          "drop-shadow(0.5px 1px 0 rgba(255,255,255,0.35)) drop-shadow(0 -0.5px 0 rgba(0,0,0,0.3))",
      },
      children: /*#__PURE__*/ _jsx(motion.span, {
        style: {
          ...fontWith(font, "transparent"),
          display: "inline-block", // background-clip: text only paints inside the box. Pad it so
          // descenders, overshoots and tracking never get cut, then pull
          // the layout back with negative margins.
          padding: "0.18em 0.12em 0.24em 0.06em",
          margin: "-0.18em -0.12em -0.24em -0.06em",
          backgroundImage: foil,
          backgroundSize: "260% 100%",
          backgroundPosition: position,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
        children: children,
      }),
    })
  );
}
function HoloStrip({
  width,
  intensity,
  side,
  offset,
  hx,
  hy,
  gx,
  gy,
  microtext,
  microFont,
  radius,
}) {
  const position = useMotionTemplate`0% 0%, ${hx}% ${hy}%, 0% 0%`;
  const glare = useMotionTemplate`radial-gradient(120px 90px at ${gx}% ${gy}%, rgba(255,252,240,0.55), transparent 70%)`;
  const micro = useMemo(
    () =>
      Array(16)
        .fill(microtext || "")
        .join("  \xb7  "),
    [microtext],
  );
  const {
    fontSize: _fs,
    lineHeight: _lh,
    letterSpacing: _ls,
    ...microBase
  } = fontWith(microFont, "rgba(40,36,70,0.38)");
  return /*#__PURE__*/ _jsxs(motion.div, {
    "aria-hidden": true,
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      [side]: offset,
      width,
      opacity: intensity / 100,
      overflow: "hidden",
      borderRadius: radius,
      backgroundImage: [
        "repeating-linear-gradient(72deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 0.6px, transparent 0.6px, transparent 2.4px)", // Mostly silver with a narrow, low-saturation iridescent band,
        // closer to a real security foil than a rainbow sticker.
        "linear-gradient(135deg, #d9dcdf 0%, #d9dcdf 30%, #e3d7df 38%, #d6e0dd 46%, #d5dbe6 54%, #e2ddce 62%, #d9dcdf 70%, #d9dcdf 100%)",
        "linear-gradient(180deg, #e4e6e8 0%, #a9aeb4 50%, #e8e9eb 100%)",
      ].join(", "),
      backgroundSize: "100% 100%, 300% 300%, 100% 100%",
      backgroundPosition: position,
      backgroundBlendMode: "overlay, multiply, normal",
      boxShadow: "inset 0 0 0 0.5px rgba(30,24,40,0.16), inset 1px 0 0 rgba(255,255,255,0.4)",
      pointerEvents: "none",
    },
    children: [
      /*#__PURE__*/ _jsx(motion.div, {
        style: { position: "absolute", inset: 0, background: glare, mixBlendMode: "screen" },
      }),
      /*#__PURE__*/ _jsx("div", {
        style: {
          ...microBase,
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-rl",
          whiteSpace: "nowrap",
          fontSize: 4.5,
          lineHeight: 1,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          userSelect: "none",
        },
        children: micro,
      }),
    ],
  });
}
function Barcode({ value, color, height }) {
  const { bars, total } = useMemo(() => {
    const rand = seeded(hashString(value || "0"));
    const widths = [0.7, 1, 1.6, 2.2];
    let x = 0;
    const out = [];
    for (let i = 0; i < 52; i++) {
      const w = widths[Math.floor(rand() * widths.length)];
      if (i % 2 === 0) out.push({ x, w });
      x += w;
    }
    return { bars: out, total: x };
  }, [value]);
  return /*#__PURE__*/ _jsx("svg", {
    "aria-hidden": true,
    viewBox: `0 0 ${total} 10`,
    preserveAspectRatio: "none",
    width: "100%",
    height: height,
    style: { display: "block", opacity: 0.86 },
    children: bars.map((b, i) =>
      /*#__PURE__*/ _jsx("rect", { x: b.x, y: 0, width: b.w, height: 10, fill: color }, i),
    ),
  });
} // ─────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────
const DEFAULTS = {
  event: {
    edition: "07",
    kicker: "Halden Quartet \xb7 Winter tour",
    name: "Low Light",
    tagline: "Slow piano and strings, played in the round. One night only.",
    dateLabel: "When",
    date: "Fri 14.11",
    timeLabel: "Doors",
    time: "19:30",
    venueLabel: "Where",
    venue: "Kesselhaus, Berlin",
  },
  stub: {
    entry: "214",
    admit: "Admit one",
    seatLabel: "Row F",
    seat: "Seat 12",
    number: "No. 0214 / 1200",
    hint: "Tear to enter",
    torn: "Enjoy the show",
  },
  layout: {
    padding: "28px 32px 28px 32px",
    stubSide: "right",
    stubWidth: 168,
    radius: "14px 14px 14px 14px",
    notch: 12,
    hole: 2.5,
    spacing: 11,
  }, // Light palette (kept under the original "appearance" key so saved values carry over)
  appearance: {
    paper: "rgb(243, 242, 237)",
    ink: "rgb(24, 24, 22)",
    muted: "rgb(120, 119, 114)",
    stubFill: "rgb(37, 37, 36)",
    stubInk: "rgb(236, 235, 230)",
    edge: "rgb(214, 212, 205)",
    shadow: "rgb(28, 28, 30)",
    stamp: "rgb(36, 36, 34)",
  }, // Dark swaps the two stocks: graphite body, paper stub.
  dark: {
    paper: "rgb(37, 37, 36)",
    ink: "rgb(236, 235, 230)",
    muted: "rgb(142, 141, 135)",
    stubFill: "rgb(238, 236, 230)",
    stubInk: "rgb(24, 24, 22)",
    edge: "rgb(12, 12, 12)",
    shadow: "rgb(0, 0, 0)",
    stamp: "rgb(236, 235, 230)",
  },
  finish: { foil: "silver", holo: true, holoWidth: 18, holoIntensity: 85, grain: 7 },
  typography: {
    title: {
      textAlign: "left",
      fontSize: 44,
      letterSpacing: "-0.035em",
      lineHeight: 1,
      variant: "Semibold",
    },
    body: {
      textAlign: "left",
      fontSize: 14,
      letterSpacing: "-0.005em",
      lineHeight: 1.4,
      variant: "Medium",
    },
    label: {
      textAlign: "left",
      fontSize: 11,
      letterSpacing: "0.01em",
      lineHeight: 1.2,
      variant: "Medium",
    },
  },
  behavior: {
    tearDistance: 140,
    tilt: 5,
    afterTear: "keep",
    autoReset: false,
    resetDelay: 4,
    canvasState: "intact",
    sound: true,
    haptics: true,
  },
};
/**
 * @framerDisableUnlink
 *
 * @framerIntrinsicWidth 640
 * @framerIntrinsicHeight 280
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
function TearTicketImpl(props) {
  const { style } = props;
  const ev = { ...DEFAULTS.event, ...props.event };
  const st = { ...DEFAULTS.stub, ...props.stub };
  const lay = { ...DEFAULTS.layout, ...props.layout };
  const light = { ...DEFAULTS.appearance, ...props.appearance };
  const darkPal = { ...DEFAULTS.dark, ...props.dark }; // Older instances kept finish settings under "appearance"; read those as a fallback.
  const fin = { ...DEFAULTS.finish, ...pickFinish(props.appearance), ...props.finish };
  const ty = { ...DEFAULTS.typography, ...props.typography };
  const beh = { ...DEFAULTS.behavior, ...props.behavior };
  const theme = props.theme || "light";
  const isOnCanvas = false;
  const isStatic = false;
  const still = isOnCanvas || isStatic;
  const reduced = !!useReducedMotion(); // Theme
  const [prefersDark, setPrefersDark] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setPrefersDark(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const isDark = theme === "dark" || (theme === "auto" && prefersDark);
  const ap = isDark ? darkPal : light; // Size: everything scales from the 640px design width so phones never overflow.
  const rootRef = useRef(null);
  const [w, setW] = useState(640);
  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const ow = el.offsetWidth;
      if (ow) setW((p) => (Math.abs(p - ow) < 1 ? p : ow));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const k = clamp(w / 640, 0.6, 1);
  const compact = w < 480;
  const sign = lay.stubSide === "left" ? -1 : 1;
  const mainEdge = sign === 1 ? "right" : "left";
  const stubEdge = sign === 1 ? "left" : "right";
  const initialTorn = isOnCanvas && beh.canvasState === "torn";
  const [torn, setTorn] = useState(initialTorn);
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false); // Refs keep the latest values available inside timers and pointer handlers.
  const tornRef = useRef(initialTorn);
  const maxRef = useRef(initialTorn ? 1 : 0);
  const drag = useRef({ active: false, id: -1, sx: 0, sy: 0, p: 0, ticked: 0 });
  const behRef = useRef(beh);
  behRef.current = beh;
  const propsRef = useRef(props);
  propsRef.current = props;
  const signRef = useRef(sign);
  signRef.current = sign;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced; // ── Pointer light (mouse only) ──
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spx = useSpring(px, HEAVY);
  const spy = useSpring(py, HEAVY);
  const tiltAmt = still || reduced ? 0 : beh.tilt;
  const rotateX = useTransform(spy, (v) => (0.5 - v) * 2 * tiltAmt);
  const rotateY = useTransform(spx, (v) => (v - 0.5) * 2 * tiltAmt); // Reflections move opposite to the tilt.
  const foilPos = useTransform(spx, (v) => `${(1 - v) * 100}% 50%`);
  const hx = useTransform(spx, (v) => 20 + (1 - v) * 60);
  const hy = useTransform(spy, (v) => (1 - v) * 100);
  const gx = useTransform(spx, (v) => (1 - v) * 100);
  const gy = useTransform(spy, (v) => (1 - v) * 100); // ── Tear state ──
  const restX = 28 * k;
  const stubX = useMotionValue(initialTorn ? sign * restX : 0);
  const stubY = useMotionValue(initialTorn ? 6 : 0);
  const stubRot = useMotionValue(initialTorn ? sign * 5 : 0);
  const stubOpacity = useMotionValue(1);
  const mainX = useMotionValue(0);
  const pull = useMotionValue(0);
  const tear = useMotionValue(initialTorn ? 1 : 0);
  const hintFade = useTransform(pull, [0, 0.25], [1, 0]);
  const run = (mv, to, transition) => animate(mv, to, reducedRef.current ? QUICK : transition);
  const buzz = (ms) => {
    if (!behRef.current.haptics) return;
    try {
      navigator.vibrate && navigator.vibrate(ms);
    } catch (_) {}
  }; // Canvas preview state, so designers can lay out either pose.
  useEffect(() => {
    if (!isOnCanvas) return;
    const t = beh.canvasState === "torn";
    tornRef.current = t;
    maxRef.current = t ? 1 : 0;
    setTorn(t);
    stubX.set(t ? sign * restX : 0);
    stubY.set(t ? 6 : 0);
    stubRot.set(t ? sign * 5 : 0);
    stubOpacity.set(1);
    tear.set(t ? 1 : 0);
    mainX.set(0);
    pull.set(0);
  }, [isOnCanvas, beh.canvasState, sign, restX]);
  const completeTear = () => {
    if (tornRef.current) return;
    const s = signRef.current;
    tornRef.current = true;
    maxRef.current = 1;
    setTorn(true);
    setDragging(false);
    animate(tear, 1, { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] });
    animate(pull, 0, QUICK);
    run(mainX, 0, SETTLE);
    if (behRef.current.afterTear === "drop") {
      run(stubX, s * 36, FALL);
      run(stubY, 220, FALL);
      run(stubRot, s * 24, FALL);
      run(stubOpacity, 0, { duration: 0.8, ease: [0.7, 0, 1, 0.6] });
    } else {
      run(stubX, s * restX, HEAVY);
      run(stubY, 6, HEAVY);
      run(stubRot, s * 5, HEAVY);
    }
    if (behRef.current.sound) {
      const ctx = getAudio();
      if (ctx) noiseBurst(ctx, 0.17, 1800, 5200, 0.55, 0.9);
    }
    buzz(10);
    propsRef.current.onTear && propsRef.current.onTear();
  };
  const reattach = () => {
    if (!tornRef.current) return;
    tornRef.current = false;
    maxRef.current = 0;
    setTorn(false);
    animate(tear, 0, { duration: 0.35, ease: "easeOut" });
    if (behRef.current.afterTear === "drop") {
      stubX.set(0);
      stubY.set(-10);
      stubRot.set(0);
      stubOpacity.set(0);
      run(stubY, 0, HEAVY);
      run(stubOpacity, 1, { duration: 0.5, ease: "easeOut" });
    } else {
      run(stubX, 0, HEAVY);
      run(stubY, 0, HEAVY);
      run(stubRot, 0, HEAVY);
    }
    propsRef.current.onReattach && propsRef.current.onReattach();
  }; // Auto reset: a timer, so it never runs in the editor.
  useEffect(() => {
    if (still || !torn || !beh.autoReset) return;
    const t = setTimeout(reattach, Math.max(0.5, beh.resetDelay) * 1e3);
    return () => clearTimeout(t);
  }, [still, torn, beh.autoReset, beh.resetDelay]); // ── Handlers ──
  const onRootMove = (e) => {
    // Tilt follows a mouse only. Touch never tilts, and nothing tilts mid-tear.
    if (still || reduced || e.pointerType !== "mouse" || drag.current.active) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width || !r.height) return;
    px.set(clamp((e.clientX - r.left) / r.width, 0, 1));
    py.set(clamp((e.clientY - r.top) / r.height, 0, 1));
  };
  const onRootLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };
  const onStubDown = (e) => {
    if (still || tornRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    if (behRef.current.sound) getAudio();
    drag.current = {
      active: true,
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      p: 0,
      ticked: maxRef.current,
    };
    setDragging(true); // Level the ticket while tearing, so the hand and the paper agree.
    px.set(0.5);
    py.set(0.5);
  };
  const onStubMove = (e) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    const s = signRef.current; // Pulling outward tears; pulling down helps a little, like a real stub.
    const proj = (e.clientX - d.sx) * s + Math.max(0, e.clientY - d.sy) * 0.35;
    const p = clamp(proj / Math.max(40, behRef.current.tearDistance * k), 0, 1);
    if (p >= 1) {
      d.active = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      completeTear();
      return;
    }
    d.p = p;
    pull.set(p);
    stubRot.set(s * Math.max(p * 9, maxRef.current * 1.2));
    stubX.set(s * p * 4);
    mainX.set(s * p * 1.5); // Paper stretches first, then the tear starts running down the perforation.
    const r = Math.max(0, (p - 0.12) / 0.88);
    if (r > maxRef.current) {
      maxRef.current = r;
      tear.set(r); // Fibres give way in small steps: a soft crackle and a tiny tick per step.
      if (r - d.ticked > 0.07) {
        d.ticked = r;
        if (behRef.current.sound) {
          const ctx = getAudio();
          if (ctx) noiseBurst(ctx, 0.028, 2600 + Math.random() * 1600, 4200, 0.16, 1.6);
        }
        buzz(4);
      }
    }
  };
  const onStubUp = (e) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    d.active = false;
    setDragging(false);
    if (d.p >= 0.86) {
      completeTear();
      return;
    } // A partial tear stays partial: the stub settles back with a slight droop.
    const s = signRef.current;
    run(stubRot, s * maxRef.current * 1.2, SETTLE);
    run(stubX, 0, SETTLE);
    run(stubY, 0, SETTLE);
    run(mainX, 0, SETTLE);
    run(pull, 0, SETTLE);
  };
  const onStubKey = (e) => {
    if (still) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (tornRef.current) reattach();
      else completeTear();
    }
  }; // ── Derived styling ──
  const [tl, tr, br, bl] = parseBox(lay.radius, 14);
  const leftRadius = `${tl}px 0px 0px ${bl}px`;
  const rightRadius = `0px ${tr}px ${br}px 0px`;
  const mainRadius = sign === 1 ? leftRadius : rightRadius;
  const stubRadius = sign === 1 ? rightRadius : leftRadius;
  const hole = Math.max(0.5, lay.hole);
  const showHolo = fin.holo && !compact;
  const holoW = fin.holoWidth * k;
  const holoSpace = showHolo ? holoW + 24 * k : 8;
  const [pt0, pr0, pb0, pl0] = parseBox(lay.padding, 28);
  const pt = pt0 * k,
    pr = pr0 * k,
    pb = pb0 * k,
    pl = pl0 * k;
  const perfSidePad = 16 * k + hole * 2 + holoSpace;
  const mainPad =
    sign === 1
      ? `${pt}px ${perfSidePad}px ${pb}px ${pl}px`
      : `${pt}px ${pr}px ${pb}px ${perfSidePad}px`;
  const sp = Math.min(pl, pr, 22 * k);
  const stubPad =
    sign === 1
      ? `${pt}px ${sp}px ${pb}px ${sp + hole * 2 + 4}px`
      : `${pt}px ${sp + hole * 2 + 4}px ${pb}px ${sp}px`; // On phones the stub keeps enough room for the seat line on one row.
  const stubW = Math.max(compact ? 132 : 96, lay.stubWidth * Math.max(k, 0.7));
  const tint = ap.shadow; // Flat stock with only a whisper of falloff. Print, not render.
  const fill = (c) =>
    `linear-gradient(170deg, ${mix(c, 97, "#ffffff")} 0%, ${c} 50%, ${mix(c, 97, "#000000")} 100%)`;
  const paperFill = fill(ap.paper);
  const stubFill = fill(ap.stubFill);
  const surface = (edge, radius, bg, stock) => ({
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    overflow: "hidden",
    background: bg,
    boxShadow: `inset 0 1px 0 ${mix(stock, 82, "#ffffff")}, inset 0 -1px 0 ${mix(tint, 10)}`,
    ...perfMask(edge, lay.notch, hole, lay.spacing),
  }); // Light from top left: every shadow falls down and slightly right.
  const pieceShadow = [
    `drop-shadow(1px 1px 1px ${mix(tint, isDark ? 60 : 32)})`,
    `drop-shadow(3px 6px 8px ${mix(tint, isDark ? 36 : 16)})`,
    `drop-shadow(8px 20px 24px ${mix(tint, isDark ? 32 : 12)})`,
  ].join(" "); // Card thickness along the bottom, drawn behind each piece. Its notches and holes are cut a little
  // larger than the face, so no sliver of edge colour shows inside the cut-outs on dark pages.
  const edgeLayer = (edge, radius, color) =>
    /*#__PURE__*/ _jsx("div", {
      "aria-hidden": true,
      style: {
        position: "absolute",
        inset: 0,
        transform: "translateY(1.5px)",
        borderRadius: radius,
        background: color,
        pointerEvents: "none",
        ...perfMask(edge, lay.notch > 0 ? lay.notch + 2.5 : 0, hole + 0.75, lay.spacing),
      },
    });
  const grainLayer =
    fin.grain > 0 &&
    /*#__PURE__*/ _jsx("div", {
      "aria-hidden": true,
      style: {
        position: "absolute",
        inset: 0,
        backgroundImage: `${GRAIN_TILE}, ${FIBER_TILE}`,
        backgroundSize: "160px 160px, 320px 320px",
        mixBlendMode: "multiply", // Grain belongs to light stock; on dark card it stays a whisper.
        opacity: (fin.grain / 100) * (isDark ? 0.35 : 1),
        pointerEvents: "none",
      },
    }); // Ambient occlusion where the paper is scored along the perforation.
  const occlusion = (edge) =>
    /*#__PURE__*/ _jsx("div", {
      "aria-hidden": true,
      style: {
        position: "absolute",
        top: 0,
        bottom: 0,
        [edge]: 0,
        width: 18,
        background: `linear-gradient(${edge === "right" ? "to left" : "to right"}, ${mix(tint, isDark ? 22 : 7)}, transparent)`,
        pointerEvents: "none",
      },
    }); // Torn fibres show the core of each stock: lighter than the face on dark card.
  const fibre = (c) => mix(c, 78, "#ffffff");
  const fibreAlt = (c) => mix(c, 86, "#9a9890");
  const fiberCore = fibre(ap.paper);
  const fiberAlt = fibreAlt(ap.paper);
  const stubFiberCore = fibre(ap.stubFill);
  const stubFiberAlt = fibreAlt(ap.stubFill);
  const foil = FOILS[fin.foil] || FOILS.silver;
  const foilPosition = reduced || still ? "35% 50%" : foilPos;
  const tk = k; // title scale
  const bk = Math.max(k, 0.86);
  const lk = Math.max(k, 0.9);
  const label = { ...fontWith(ty.label, ap.muted, lk, 9), margin: 0 };
  const body = { ...fontWith(ty.body, ap.muted, bk, 12), margin: 0 };
  const value = {
    ...fontWith(ty.body, ap.ink, bk, 12),
    margin: 0,
    fontVariantNumeric: "tabular-nums",
  }; // Stub is printed in a solid spot color, so its type uses the stub ink.
  const stubLabelColor = mix(ap.stubInk, 68, ap.stubFill);
  const stubLabel = { ...label, color: stubLabelColor, ["--framer-font-color"]: stubLabelColor };
  const stubValue = { ...value, color: ap.stubInk, ["--framer-font-color"]: ap.stubInk };
  const meta = [
    [ev.dateLabel, ev.date],
    [ev.timeLabel, ev.time],
    [ev.venueLabel, ev.venue],
  ].filter(([, v]) => v);
  const interactive = !still && !torn; // Logo: any image, printed in the ink colour through a mask.
  const logoSrc = typeof ev.logo === "string" ? ev.logo : ev.logo?.src || "";
  const logoAlt = (typeof ev.logo === "object" && ev.logo?.alt) || "Logo";
  const logoRatio = clamp(Number(ev.logoRatio) || 1, 0.25, 6);
  return /*#__PURE__*/ _jsx("div", {
    ref: rootRef,
    style: {
      ...style,
      position: "relative",
      display: "flex",
      overflow: "visible",
      fontSize: 0,
      lineHeight: 0,
      userSelect: "none",
      WebkitUserSelect: "none",
      WebkitTapHighlightColor: "transparent",
    },
    onPointerMove: onRootMove,
    onPointerLeave: onRootLeave,
    children: /*#__PURE__*/ _jsxs(motion.div, {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: sign === 1 ? "row" : "row-reverse",
        rotateX,
        rotateY,
        transformPerspective: 1100,
      },
      children: [
        /*#__PURE__*/ _jsxs(motion.div, {
          style: {
            position: "relative",
            flex: 1,
            minWidth: 0,
            display: "flex",
            x: mainX,
            filter: pieceShadow,
          },
          children: [
            edgeLayer(mainEdge, mainRadius, ap.edge),
            /*#__PURE__*/ _jsxs("div", {
              style: surface(mainEdge, mainRadius, paperFill, ap.paper),
              children: [
                ev.edition &&
                  /*#__PURE__*/ _jsx("div", {
                    "aria-hidden": true,
                    style: {
                      ...fontWith(ty.title, mix(ap.ink, isDark ? 7 : 5), 1),
                      position: "absolute",
                      [mainEdge]: hole * 2 + holoSpace + 4 * k,
                      bottom: 0,
                      fontSize: 205 * k,
                      fontWeight: 300,
                      lineHeight: 0.74,
                      letterSpacing: "-0.06em",
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                      pointerEvents: "none", // a faint deboss so the numeral reads as pressed into the card
                      textShadow: `0 1px 0 ${mix("#ffffff", isDark ? 4 : 55)}, 0 -1px 0 ${mix(tint, isDark ? 30 : 6)}`,
                    },
                    children: ev.edition,
                  }),
                grainLayer,
                occlusion(mainEdge),
                showHolo &&
                  /*#__PURE__*/ _jsx(HoloStrip, {
                    width: holoW,
                    intensity: fin.holoIntensity,
                    side: mainEdge,
                    offset: hole * 2 + 12 * k,
                    hx: hx,
                    hy: hy,
                    gx: gx,
                    gy: gy,
                    microtext: st.number,
                    microFont: ty.label,
                    radius: 1,
                  }),
              ],
            }),
            /*#__PURE__*/ _jsx(Fibers, {
              side: mainEdge,
              seed: 11,
              inset: hole * 1.6,
              reach: 6,
              core: fiberCore,
              alt: fiberAlt,
              reveal: tear,
              notch: lay.notch,
            }),
            /*#__PURE__*/ _jsxs("div", {
              style: {
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                padding: mainPad,
              },
              children: [
                /*#__PURE__*/ _jsxs("div", {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12 * k,
                  },
                  children: [
                    (logoSrc || ev.kicker) &&
                      /*#__PURE__*/ _jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: 8 * k, minWidth: 0 },
                        children: [
                          logoSrc &&
                            /*#__PURE__*/ _jsx("div", {
                              role: "img",
                              "aria-label": logoAlt,
                              style: {
                                height: Math.round(16 * lk),
                                aspectRatio: logoRatio,
                                flexShrink: 0,
                                background: ap.ink,
                                WebkitMaskImage: `url("${logoSrc}")`,
                                maskImage: `url("${logoSrc}")`,
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskPosition: "left center",
                                maskPosition: "left center",
                              },
                            }),
                          ev.kicker &&
                            /*#__PURE__*/ _jsx("p", { style: label, children: ev.kicker }),
                        ],
                      }),
                    st.number &&
                      !compact &&
                      /*#__PURE__*/ _jsx("p", {
                        style: { ...label, whiteSpace: "nowrap" },
                        children: st.number,
                      }),
                  ],
                }),
                ev.name &&
                  /*#__PURE__*/ _jsx("div", {
                    style: { marginTop: 14 * k },
                    children: /*#__PURE__*/ _jsx(Foil, {
                      font: fontWith(ty.title, "transparent", tk, 24),
                      foil: foil,
                      position: foilPosition,
                      children: ev.name,
                    }),
                  }),
                ev.tagline &&
                  /*#__PURE__*/ _jsx("p", {
                    style: { ...body, marginTop: 10 * k, maxWidth: "36ch", textWrap: "balance" },
                    children: ev.tagline,
                  }),
                meta.length > 0 &&
                  /*#__PURE__*/ _jsx("div", {
                    style: {
                      display: "flex",
                      flexWrap: "wrap",
                      gap: `${12 * k}px ${28 * k}px`,
                      marginTop: "auto",
                      paddingTop: 20 * k,
                    },
                    children: meta.map(([l, v], i) =>
                      /*#__PURE__*/ _jsxs(
                        "div",
                        {
                          style: { display: "flex", flexDirection: "column", gap: 4 },
                          children: [
                            l && /*#__PURE__*/ _jsx("p", { style: label, children: l }),
                            /*#__PURE__*/ _jsx("p", { style: value, children: v }),
                          ],
                        },
                        i,
                      ),
                    ),
                  }),
              ],
            }),
            st.torn &&
              /*#__PURE__*/ _jsx(motion.div, {
                "aria-hidden": !torn,
                initial: false,
                animate: { opacity: torn ? 0.9 : 0, scale: torn ? 1 : 1.14 },
                transition: reduced ? QUICK : { ...HEAVY, delay: torn ? 0.15 : 0 },
                style: {
                  position: "absolute",
                  top: "50%",
                  [mainEdge]: hole * 2 + holoSpace + 10 * k,
                  y: "-50%",
                  rotate: -9,
                  pointerEvents: "none",
                  mixBlendMode: isDark ? "screen" : "multiply",
                  WebkitMaskImage: WORN_MASK,
                  maskImage: WORN_MASK,
                  WebkitMaskSize: "140px 140px",
                  maskSize: "140px 140px",
                },
                children: /*#__PURE__*/ _jsx("div", {
                  style: {
                    ...fontWith(ty.body, ap.stamp, bk, 12),
                    margin: 0,
                    padding: `${7 * k}px ${13 * k}px`,
                    whiteSpace: "nowrap",
                    letterSpacing: "0.02em",
                    border: `1.5px solid ${ap.stamp}`,
                    borderRadius: 4,
                    boxShadow: `inset 0 0 0 2.5px ${ap.paper}, inset 0 0 0 3.5px ${ap.stamp}`,
                  },
                  children: st.torn,
                }),
              }),
          ],
        }),
        /*#__PURE__*/ _jsxs(motion.div, {
          role: "button",
          tabIndex: still ? -1 : 0,
          "aria-label": torn
            ? `${st.torn || "Torn"}. Press Enter to reattach the stub`
            : `${st.hint || "Tear"}: ${ev.name}`,
          "aria-pressed": torn,
          onPointerDown: onStubDown,
          onPointerMove: onStubMove,
          onPointerUp: onStubUp,
          onPointerCancel: onStubUp,
          onPointerEnter: (e) => e.pointerType === "mouse" && setHover(true),
          onPointerLeave: () => setHover(false),
          onKeyDown: onStubKey,
          onFocus: (e) => {
            try {
              setFocused(e.currentTarget.matches(":focus-visible"));
            } catch (_) {
              setFocused(true);
            }
          },
          onBlur: () => setFocused(false),
          style: {
            position: "relative",
            width: stubW,
            flexShrink: 0,
            display: "flex",
            x: stubX,
            y: stubY,
            rotate: stubRot,
            opacity: stubOpacity,
            originX: sign === 1 ? 0 : 1,
            originY: 1,
            filter: pieceShadow,
            cursor: !interactive ? "default" : dragging ? "grabbing" : "grab",
            touchAction: "pan-y",
            outline: focused ? `2px solid ${mix(ap.ink, 40)}` : "none",
            outlineOffset: 4,
            borderRadius: stubRadius,
          },
          children: [
            edgeLayer(stubEdge, stubRadius, mix(ap.stubFill, 82, "#000000")),
            /*#__PURE__*/ _jsxs("div", {
              style: surface(stubEdge, stubRadius, stubFill, ap.stubFill),
              children: [grainLayer, occlusion(stubEdge)],
            }),
            /*#__PURE__*/ _jsx(Fibers, {
              side: stubEdge,
              seed: 29,
              inset: hole * 1.6,
              reach: 6,
              core: stubFiberCore,
              alt: stubFiberAlt,
              reveal: tear,
              notch: lay.notch,
            }),
            /*#__PURE__*/ _jsxs("div", {
              style: {
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14 * k,
                padding: stubPad,
              },
              children: [
                st.admit && /*#__PURE__*/ _jsx("p", { style: stubLabel, children: st.admit }),
                /*#__PURE__*/ _jsxs("div", {
                  style: { display: "flex", flexDirection: "column", gap: 6 * k },
                  children: [
                    st.entry &&
                      /*#__PURE__*/ _jsx("div", {
                        children: /*#__PURE__*/ _jsx(Foil, {
                          font: {
                            ...fontWith(ty.title, "transparent", 1),
                            fontSize: Math.max(34, 60 * k) + "px",
                            fontWeight: 300,
                            letterSpacing: "-0.05em",
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                          },
                          foil: foil,
                          position: foilPosition,
                          children: st.entry,
                        }),
                      }),
                    (st.seatLabel || st.seat) &&
                      /*#__PURE__*/ _jsx("p", {
                        style: {
                          ...stubValue,
                          color: stubLabelColor,
                          ["--framer-font-color"]: stubLabelColor,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                        children: [st.seatLabel, st.seat].filter(Boolean).join(" \xb7 "),
                      }),
                  ],
                }),
                /*#__PURE__*/ _jsxs("div", {
                  style: { display: "flex", flexDirection: "column", gap: 6 },
                  children: [
                    /*#__PURE__*/ _jsx(Barcode, {
                      value: st.number || ev.name,
                      color: mix(ap.stubInk, 80),
                      height: Math.round(22 * Math.max(k, 0.75)),
                    }),
                    st.hint &&
                      /*#__PURE__*/ _jsx(motion.div, {
                        style: { opacity: hintFade },
                        children: /*#__PURE__*/ _jsxs(motion.div, {
                          initial: false,
                          animate: { opacity: torn ? 0 : 1 },
                          transition: QUICK,
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexDirection: sign === 1 ? "row" : "row-reverse",
                            justifyContent: "flex-start",
                          },
                          children: [
                            /*#__PURE__*/ _jsx("p", {
                              style: { ...stubLabel, whiteSpace: "nowrap" },
                              children: st.hint,
                            }),
                            /*#__PURE__*/ _jsx(motion.svg, {
                              "aria-hidden": true,
                              width: 12,
                              height: 10,
                              viewBox: "0 0 12 10",
                              initial: false,
                              animate: { x: hover && interactive && !reduced ? sign * 3 : 0 },
                              transition: HEAVY,
                              style: { flexShrink: 0, scaleX: sign },
                              children: /*#__PURE__*/ _jsx("path", {
                                d: "M1 5h9.5M6.5 1.5 10.5 5l-4 3.5",
                                fill: "none",
                                stroke: stubLabelColor,
                                strokeWidth: 1.3,
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                              }),
                            }),
                          ],
                        }),
                      }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
TearTicket.displayName = "Tear Ticket";
function pickFinish(a) {
  if (!a) return {};
  const out = {};
  for (const key of ["foil", "holo", "holoWidth", "holoIntensity", "grain"])
    if (a[key] !== undefined) out[key] = a[key];
  return out;
} // ─────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────
const colorControls = (d) => ({
  paper: {
    type: ControlType.Color,
    title: "Paper",
    defaultValue: d.paper,
    description: "Card stock colour. Fibres at the tear are derived from it.",
  },
  ink: {
    type: ControlType.Color,
    title: "Ink",
    defaultValue: d.ink,
    description: "Values and barcode.",
  },
  muted: {
    type: ControlType.Color,
    title: "Muted",
    defaultValue: d.muted,
    description: "Labels and tagline on the main body.",
  },
  stubFill: {
    type: ControlType.Color,
    title: "Stub",
    defaultValue: d.stubFill,
    description:
      "Spot colour the stub is printed in. Set it to the paper colour for a single-tone ticket.",
  },
  stubInk: {
    type: ControlType.Color,
    title: "Stub ink",
    defaultValue: d.stubInk,
    description: "Text and barcode on the stub. Labels use a tint of it.",
  },
  edge: {
    type: ControlType.Color,
    title: "Edge",
    defaultValue: d.edge,
    description: "Visible thickness of the card stock along the bottom.",
  },
  shadow: {
    type: ControlType.Color,
    title: "Shadow",
    defaultValue: d.shadow,
    description: "Tint for every shadow layer. Match it to the surface the ticket sits on.",
  },
  stamp: {
    type: ControlType.Color,
    title: "Stamp",
    defaultValue: d.stamp,
    description: "Ink colour of the stamp after tearing.",
  },
});

const DEFAULT_PROPS = {
  event: {
    edition: DEFAULTS.event.edition,
    logoRatio: 1,
    kicker: DEFAULTS.event.kicker,
    name: DEFAULTS.event.name,
    tagline: DEFAULTS.event.tagline,
    dateLabel: DEFAULTS.event.dateLabel,
    date: DEFAULTS.event.date,
    timeLabel: DEFAULTS.event.timeLabel,
    time: DEFAULTS.event.time,
    venueLabel: DEFAULTS.event.venueLabel,
    venue: DEFAULTS.event.venue,
  },
  stub: {
    entry: DEFAULTS.stub.entry,
    admit: DEFAULTS.stub.admit,
    seatLabel: DEFAULTS.stub.seatLabel,
    seat: DEFAULTS.stub.seat,
    number: DEFAULTS.stub.number,
    hint: DEFAULTS.stub.hint,
    torn: DEFAULTS.stub.torn,
  },
  layout: {
    padding: DEFAULTS.layout.padding,
    stubSide: DEFAULTS.layout.stubSide,
    stubWidth: DEFAULTS.layout.stubWidth,
    radius: DEFAULTS.layout.radius,
    notch: DEFAULTS.layout.notch,
    hole: DEFAULTS.layout.hole,
    spacing: DEFAULTS.layout.spacing,
  },
  theme: "light",
  finish: {
    foil: DEFAULTS.finish.foil,
    holo: DEFAULTS.finish.holo,
    holoWidth: DEFAULTS.finish.holoWidth,
    holoIntensity: DEFAULTS.finish.holoIntensity,
    grain: DEFAULTS.finish.grain,
  },
  typography: {
    title: DEFAULTS.typography.title,
    body: DEFAULTS.typography.body,
    label: DEFAULTS.typography.label,
  },
  behavior: {
    tearDistance: DEFAULTS.behavior.tearDistance,
    tilt: DEFAULTS.behavior.tilt,
    afterTear: DEFAULTS.behavior.afterTear,
    autoReset: DEFAULTS.behavior.autoReset,
    resetDelay: DEFAULTS.behavior.resetDelay,
    canvasState: DEFAULTS.behavior.canvasState,
    sound: DEFAULTS.behavior.sound,
    haptics: DEFAULTS.behavior.haptics,
  },
};

const GROUP_KEYS = [
  "event",
  "stub",
  "layout",
  "appearance",
  "dark",
  "finish",
  "typography",
  "behavior",
];

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

export interface TearTicketProps {
  event?: {
    edition?: string;
    logo?: { src?: string; srcSet?: string; alt?: string };
    logoRatio?: number;
    kicker?: string;
    name?: string;
    tagline?: string;
    dateLabel?: string;
    date?: string;
    timeLabel?: string;
    time?: string;
    venueLabel?: string;
    venue?: string;
  };
  stub?: {
    entry?: string;
    admit?: string;
    seatLabel?: string;
    seat?: string;
    number?: string;
    hint?: string;
    torn?: string;
  };
  layout?: {
    padding?: string;
    stubSide?: "left" | "right";
    stubWidth?: number;
    radius?: string;
    notch?: number;
    hole?: number;
    spacing?: number;
  };
  theme?: "light" | "dark" | "auto";
  appearance?: Record<string, unknown>;
  dark?: Record<string, unknown>;
  finish?: {
    foil?: "gold" | "silver" | "rose" | "copper" | "pumpkin";
    holo?: boolean;
    holoWidth?: number;
    holoIntensity?: number;
    grain?: number;
  };
  typography?: {
    title?: React.CSSProperties;
    body?: React.CSSProperties;
    label?: React.CSSProperties;
  };
  behavior?: {
    tearDistance?: number;
    tilt?: number;
    afterTear?: "keep" | "drop";
    autoReset?: boolean;
    resetDelay?: number;
    canvasState?: "intact" | "torn";
    sound?: boolean;
    haptics?: boolean;
  };
  onTear?: (...args: unknown[]) => void;
  onReattach?: (...args: unknown[]) => void;
  style?: React.CSSProperties;
}

export function TearTicket(props: TearTicketProps) {
  return _jsx(TearTicketImpl, mergeProps(props));
}

TearTicket.displayName = "TearTicket";

export default TearTicket;
