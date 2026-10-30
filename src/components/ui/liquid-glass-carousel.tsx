/*
 * Liquid Glass Carousel: an endless strip of media cards seen through a curved sheet of glass.
 * Cards in the middle are flat and sharp; towards the sides the glass bends them (the top edge
 * sweeps up, the bottom a little down), softens them and splits their colours, so every card
 * edge out there carries a blue rim outside and a warm rim inside. Drag or swipe with momentum
 * and snapping, or use the glass pager, the dots or the arrow keys.
 *
 * Built after Saadat Ali's "Liquid Glass Carousel" for Framer (liquid-carousel.framer.website):
 * the layout, type, pager styles and timings are measured from that page; the WebGL lens is our
 * own (raw WebGL, no dependency).
 */
import { animate, motion, useReducedMotion } from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface LiquidGlassSlide {
  image: string;
  /** Natural size of the image; cards take its aspect ratio. Read from the file when omitted. */
  width?: number;
  height?: number;
  title: string;
  subtitle?: string;
  /** Small label above the title, e.g. "Vol. 01 — Architecture". */
  tag?: string;
  alt?: string;
  href?: string;
}

const IMG = "https://framerusercontent.com/images/";
/** Demo content of the original page. */
const DEFAULT_SLIDES: LiquidGlassSlide[] = [
  {
    image: `${IMG}tpPyYpeAlz4uWG0hQNpQrtlRhg.jpg?scale-down-to=1024`,
    width: 1400,
    height: 933,
    title: "Aura Pavilion",
    subtitle: "Spatial Light & Brutalist Forms",
    tag: "Vol. 01 — Architecture",
  },
  {
    image: `${IMG}CTMoGaEEof1LPwYLhuqLVIoQYCc.png?width=800&height=843`,
    width: 800,
    height: 843,
    title: "Nordic Fjord",
    subtitle: "Glacial Basin Morning Study",
    tag: "Vol. 02 — Landscape",
  },
  {
    image: `${IMG}dLpUlEG4uOtE97FwlSfqsz1IXoc.jpg?scale-down-to=1024`,
    width: 1400,
    height: 935,
    title: "Monolith Interior",
    subtitle: "Tactile Concrete & Daylight",
    tag: "Vol. 03 — Space",
  },
  {
    image: `${IMG}4BAlA2jHxMusEOGQG545GH7s4Y.jpg?scale-down-to=1024`,
    width: 1400,
    height: 834,
    title: "Highland Mist",
    subtitle: "Atmospheric Cloud Formations",
    tag: "Vol. 04 — Horizon",
  },
  {
    image: `${IMG}llGVGHTJSpoS0qKekXIPQD6GEH4.jpg?scale-down-to=1024`,
    width: 1400,
    height: 929,
    title: "Obsidian Villa",
    subtitle: "Minimalist Geometry & Water",
    tag: "Vol. 05 — Structure",
  },
  {
    image: `${IMG}0J0mONXAoNRus0ItXaVweT7Rb4.jpg?scale-down-to=1024`,
    width: 1400,
    height: 931,
    title: "Pacific Shoreline",
    subtitle: "Tidal Motion & Coastal Light",
    tag: "Vol. 06 — Oceanic",
  },
  {
    image: `${IMG}pvBBY6iPcMyzhiEwu8O84XWYc.jpg?scale-down-to=1024`,
    width: 1322,
    height: 933,
    title: "Solitude Ridge",
    subtitle: "Summit Approach & Alpine Air",
    tag: "Vol. 07 — Alpine",
  },
  {
    image: `${IMG}cWDSLTt7oPILDBDsCaWD00v0F4.jpg?scale-down-to=1024`,
    width: 1400,
    height: 1503,
    title: "Dune Horizon",
    subtitle: "Warm Winds & Desert Curves",
    tag: "Vol. 08 — Dunes",
  },
];

export interface LiquidGlassCarouselProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  slides?: LiquidGlassSlide[];
  /** Slide shown first. */
  initialIndex?: number;
  /** Card height as a fraction of the component height. */
  cardHeight?: number;
  /** Space between cards, px. */
  gap?: number;
  /** Corner radius of the cards, px. */
  radius?: number;
  /** 0–2: how strongly the glass bends the cards at the sides. */
  curve?: number;
  /** 0–2: colour split at the sides. */
  dispersion?: number;
  /** 0–2: softening at the sides. */
  blur?: number;
  /** 0–1: the original's darker, denser photo grade (0 shows the images untouched). */
  tone?: number;
  /** Page colour; the lens composites its colour fringes against it. */
  background?: string;
  /** Ink colour of the type and pager. */
  ink?: string;
  /** Advance by itself every n seconds (0 = off). Pauses while hovered or dragged. */
  autoplay?: number;
  showText?: boolean;
  showPager?: boolean;
  onIndexChange?: (index: number) => void;
}

/** Curve of the original's text and pager entrance and of the dot widths. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** Snap spring: settles in about 0.45 s with no visible overshoot, as measured. */
const SNAP = { type: "spring", stiffness: 260, damping: 34, mass: 1 } as const;
/** Fraction of the release velocity (px/s) added as momentum before snapping. */
const MOMENTUM = 0.27;
/** Mesh resolution of each card and the padding (px) the colour fringes can spill into. */
const GRID_X = 40;
const GRID_Y = 10;
const PAD = 28;

const VERTEX = `
attribute vec2 aGrid;
uniform vec2 uResolution;
uniform vec4 uRect;      // centre x, centre y, width, height (CSS px)
uniform float uHalf;     // half the viewport width
uniform float uCurve;
varying vec2 vCard;      // position inside the card, px from its top-left
varying float vEdge;     // 0 in the flat middle, 1 at the viewport edge
varying float vSide;     // -1 left, 1 right

float edge(float dx) {
  // Flat middle: 42% of the half width (210 px on a 1000 px page), at least 170 px so the middle
  // card stays flat on phones.
  float start = max(uHalf * 0.42, min(uHalf * 0.9, 170.0));
  return clamp((abs(dx) - start) / (uHalf - start), 0.0, 1.3);
}

void main() {
  vec2 size = uRect.zw + 2.0 * ${PAD.toFixed(1)};
  vec2 p = uRect.xy + (aGrid - 0.5) * size;
  vCard = p - (uRect.xy - uRect.zw * 0.5);
  float dx = p.x - uResolution.x * 0.5;
  float e = edge(dx);
  vEdge = e;
  vSide = sign(dx);
  // The glass lifts the top edge by up to ~0.17 of the half width (85 px on a 1000 px page),
  // pivoting near the bottom of the card so the bottom edge drops only a little.
  float lift = uCurve * 0.17 * uHalf * pow(e, 4.0);
  float pivot = uRect.y + uRect.w * 0.4;
  float scaleY = 1.0 + lift / (uRect.w * 0.9);
  p.y = pivot + (p.y - pivot) * scaleY;
  // ...and magnifies sideways: about 26 px extra at 90% of the half width on a 1000 px page.
  p.x += sign(dx) * uCurve * 0.076 * uHalf * e * e;
  vec2 clip = p / uResolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

const FRAGMENT = `
// Uniforms shared with the vertex shader must have the same (high) precision.
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTexture;
uniform vec4 uRect;
uniform vec3 uBackground;
uniform float uRadius;
uniform float uDispersion;
uniform float uBlur;
uniform float uTone;
varying vec2 vCard;
varying float vEdge;
varying float vSide;

float mask(vec2 p) {
  vec2 half_ = uRect.zw * 0.5;
  vec2 q = abs(p - half_) - (half_ - vec2(uRadius));
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  return clamp(0.5 - d, 0.0, 1.0);
}

vec4 tap(vec2 p) {
  vec2 uv = clamp(p / uRect.zw, 0.0, 1.0);
  return vec4(texture2D(uTexture, uv).rgb, mask(p));
}

// Softened sample: a small disc of taps that widens towards the edges.
vec4 soft(vec2 p, float r) {
  vec4 acc = tap(p) * 2.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    acc += tap(p + vec2(cos(a), sin(a)) * r);
  }
  return acc / 10.0;
}

void main() {
  float e = vEdge;
  float e2 = e * e;
  float r = uBlur * 7.0 * e2;
  // Red is pulled outwards and blue inwards, so blue rims outside a card and warm rims inside.
  // Lateral colour: red is magnified most and blue least, so outer edges get cool rims and
  // inner edges warm ones; the vertical part follows the lifted top edge.
  vec2 shift = vec2(vSide * uDispersion * 12.0 * e2, -uDispersion * 5.0 * e2);
  vec4 red = soft(vCard - shift, r);
  vec4 green = soft(vCard - shift * 0.45, r);
  vec4 blue = soft(vCard + shift * 0.25, r);
  vec3 alpha = vec3(red.a, green.a, blue.a);
  vec3 card = vec3(red.r, green.g, blue.b);
  // The original grades its photos darker and denser (measured: out ≈ 0.95·c² + 0.03).
  card = mix(card, card * card * 0.95 + 0.03, uTone);
  // Frosted haze rises with the bend.
  card = mix(card, vec3(1.0), 0.1 * e);
  vec3 color = card * alpha + uBackground * (1.0 - alpha);
  float a = max(alpha.r, max(alpha.g, alpha.b));
  if (a <= 0.001) discard;
  // Un-composite so the canvas, drawn over the same background, shows exactly 'color'.
  vec3 outColor = clamp((color - uBackground * (1.0 - a)) / a, 0.0, 1.0);
  gl_FragColor = vec4(outColor * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("LiquidGlassCarousel shader:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function parseColor(color: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return [235 / 255, 235 / 255, 239 / 255];
  const n = parseInt(m[1] ?? "ebebef", 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

interface GlScene {
  draw: (
    cards: { tex: number; x: number; y: number; w: number; h: number }[],
    opts: {
      curve: number;
      dispersion: number;
      blur: number;
      radius: number;
      tone: number;
      bg: [number, number, number];
    },
  ) => void;
  setTexture: (i: number, img: HTMLImageElement) => void;
  resize: (w: number, h: number, dpr: number) => void;
  dispose: () => void;
}

function createScene(canvas: HTMLCanvasElement): GlScene | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  // One shared grid mesh; every card is drawn with it and its own uniforms.
  const verts: number[] = [];
  for (let y = 0; y < GRID_Y; y++) {
    for (let x = 0; x < GRID_X; x++) {
      const x0 = x / GRID_X;
      const x1 = (x + 1) / GRID_X;
      const y0 = y / GRID_Y;
      const y1 = (y + 1) / GRID_Y;
      verts.push(x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1);
    }
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const aGrid = gl.getAttribLocation(program, "aGrid");
  gl.enableVertexAttribArray(aGrid);
  gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0);
  const vertexCount = verts.length / 2;

  const u = (n: string) => gl.getUniformLocation(program, n);
  const loc = {
    resolution: u("uResolution"),
    rect: u("uRect"),
    half: u("uHalf"),
    curve: u("uCurve"),
    background: u("uBackground"),
    radius: u("uRadius"),
    dispersion: u("uDispersion"),
    blur: u("uBlur"),
    tone: u("uTone"),
  };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const textures: (WebGLTexture | null)[] = [];
  let css = { w: 1, h: 1 };

  return {
    setTexture(i, img) {
      const tex = textures[i] ?? gl.createTexture();
      textures[i] = tex;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    },
    resize(w, h, dpr) {
      css = { w, h };
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
    },
    draw(cards, o) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(loc.resolution, css.w, css.h);
      gl.uniform1f(loc.half, css.w / 2);
      gl.uniform1f(loc.curve, o.curve);
      gl.uniform3f(loc.background, o.bg[0], o.bg[1], o.bg[2]);
      gl.uniform1f(loc.radius, o.radius);
      gl.uniform1f(loc.dispersion, o.dispersion);
      gl.uniform1f(loc.blur, o.blur);
      gl.uniform1f(loc.tone, o.tone);
      for (const c of cards) {
        const tex = textures[c.tex];
        if (!tex) continue;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform4f(loc.rect, c.x, c.y, c.w, c.h);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
      }
    },
    dispose() {
      textures.forEach((t) => t && gl.deleteTexture(t));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polyline
        points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LiquidGlassCarousel({
  slides = DEFAULT_SLIDES,
  initialIndex = 0,
  cardHeight = 0.372,
  gap = 42,
  radius = 4,
  curve = 1,
  dispersion = 1,
  blur = 1,
  tone = 1,
  background = "#ebebef",
  ink = "#051a1c",
  autoplay = 0,
  showText = true,
  showPager = true,
  onIndexChange,
  className,
  style,
  ...rest
}: LiquidGlassCarouselProps) {
  const n = slides.length;
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<GlScene | null>(null);
  const [size, setSize] = useState({ w: 1000, h: 650 });
  const [aspects, setAspects] = useState<number[]>(() =>
    slides.map((s) => (s.width && s.height ? s.width / s.height : 1.5)),
  );
  const [index, setIndex] = useState(() => ((initialIndex % n) + n) % n);

  // Card geometry along an endless strip: centre of each card, in px, and the strip length.
  const cardH = Math.min(size.h * cardHeight, size.w * 0.5);
  const layout = useMemo(() => {
    const widths = aspects.map((a) => cardH * Math.min(2.2, Math.max(0.5, a)));
    const centres: number[] = [];
    let x = 0;
    widths.forEach((w, i) => {
      if (i > 0) x += (widths[i - 1] ?? 0) / 2 + gap + w / 2;
      centres.push(x);
    });
    const length = Math.max(1, x + (widths[n - 1] ?? 0) / 2 + gap + (widths[0] ?? 0) / 2);
    return { widths, centres, length };
  }, [aspects, cardH, gap, n]);

  /** Strip offset (px) that centres card `i` on lap `lap`. */
  const offsetOf = useCallback(
    (i: number, lap: number) => (layout.centres[i] ?? 0) + lap * layout.length,
    [layout],
  );
  /** Nearest card to a strip offset, with its lap. */
  const nearest = useCallback(
    (pos: number) => {
      const lap = Math.floor(pos / layout.length);
      let best = { i: 0, lap, d: Infinity };
      for (const l of [lap - 1, lap, lap + 1]) {
        layout.centres.forEach((c, i) => {
          const d = Math.abs(c + l * layout.length - pos);
          if (d < best.d) best = { i, lap: l, d };
        });
      }
      return best;
    },
    [layout],
  );

  const pos = useRef(layout.centres[index] ?? 0);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const velocity = useRef(0);
  const opts = useRef({ curve, dispersion, blur, radius, tone, bg: parseColor(background) });
  opts.current = { curve, dispersion, blur, radius, tone, bg: parseColor(background) };

  const render = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const cx = size.w / 2;
    const cy = size.h / 2;
    const cards: { tex: number; x: number; y: number; w: number; h: number }[] = [];
    const reach = size.w / 2 + 400;
    for (let i = 0; i < n; i++) {
      // Every lap position of this card that falls on screen.
      const base = (layout.centres[i] ?? 0) - pos.current;
      const first = Math.ceil((-reach - base) / layout.length);
      for (let lap = first; base + lap * layout.length < reach; lap++) {
        cards.push({
          tex: i,
          x: cx + base + lap * layout.length,
          y: cy,
          w: layout.widths[i] ?? cardH,
          h: cardH,
        });
      }
    }
    scene.draw(cards, opts.current);
    const near = nearest(pos.current).i;
    setIndex((prev) => (prev === near ? prev : near));
  }, [size, layout, n, cardH, nearest]);
  const renderRef = useRef(render);
  renderRef.current = render;

  // GL lifetime and sizing.
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const scene = createScene(canvas);
    if (!scene) return;
    sceneRef.current = scene;
    const resize = () => {
      const w = root.clientWidth || 1;
      const h = root.clientHeight || 1;
      scene.resize(w, h, Math.min(window.devicePixelRatio || 1, 2));
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
      renderRef.current();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    return () => {
      ro.disconnect();
      controls.current?.stop();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Textures; natural aspect ratios fill in for slides that do not state their size.
  useEffect(() => {
    let cancelled = false;
    slides.forEach((s, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        sceneRef.current?.setTexture(i, img);
        if (!(s.width && s.height)) {
          setAspects((a) => a.map((v, k) => (k === i ? img.naturalWidth / img.naturalHeight : v)));
        }
        renderRef.current();
      };
      img.src = s.image;
    });
    return () => {
      cancelled = true;
    };
  }, [slides]);

  // Redraw when the geometry or the look changes (keyed on values, not callback identity).
  useEffect(() => {
    renderRef.current();
  }, [size.w, size.h, cardH, layout, curve, dispersion, blur, radius, tone, background]);

  useEffect(() => onIndexChange?.(index), [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const glideTo = useCallback(
    (target: number, fromVelocity = 0) => {
      controls.current?.stop();
      if (reduceMotion) {
        pos.current = target;
        renderRef.current();
        return;
      }
      controls.current = animate(pos.current, target, {
        ...SNAP,
        velocity: fromVelocity,
        onUpdate: (v) => {
          pos.current = v;
          renderRef.current();
        },
      });
    },
    [reduceMotion],
  );

  /** Step by `delta` cards, taking the short way round. */
  const go = useCallback(
    (delta: number) => {
      const cur = nearest(pos.current);
      let i = cur.i + delta;
      let lap = cur.lap;
      while (i >= n) {
        i -= n;
        lap += 1;
      }
      while (i < 0) {
        i += n;
        lap -= 1;
      }
      glideTo(offsetOf(i, lap));
    },
    [nearest, n, glideTo, offsetOf],
  );

  const goToIndex = (i: number) => {
    const cur = nearest(pos.current);
    let delta = i - cur.i;
    if (delta > n / 2) delta -= n;
    if (delta < -n / 2) delta += n;
    go(delta);
  };

  // Drag / swipe with momentum.
  const drag = useRef<{
    id: number;
    x: number;
    start: number;
    samples: { t: number; x: number }[];
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button,a")) return;
    controls.current?.stop();
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      start: pos.current,
      samples: [{ t: e.timeStamp, x: e.clientX }],
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    pos.current = d.start - (e.clientX - d.x);
    d.samples.push({ t: e.timeStamp, x: e.clientX });
    if (d.samples.length > 6) d.samples.shift();
    renderRef.current();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    // Release velocity from the last 100 ms of movement (none if the pointer had stopped).
    const recent = d.samples.filter((s) => e.timeStamp - s.t < 100);
    const a = recent[0];
    const b = recent[recent.length - 1];
    const dt = a && b ? (b.t - a.t) / 1000 : 0;
    velocity.current = a && b && dt > 0 ? -(b.x - a.x) / dt : 0; // strip px/s
    const projected = pos.current + velocity.current * MOMENTUM;
    const snap = nearest(projected);
    glideTo(offsetOf(snap.i, snap.lap), velocity.current);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  // Autoplay, paused while hovered, focused within or dragged.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!autoplay || paused || dragging || reduceMotion) return;
    const id = setInterval(() => go(1), autoplay * 1000);
    return () => clearInterval(id);
  }, [autoplay, paused, dragging, reduceMotion, go]);

  const slide = slides[index];
  const enter = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 3, ease: EASE_OUT_EXPO },
      };
  const pill = {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: 999,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  } as const;
  const fontStack = 'Inter, "Inter Placeholder", system-ui, sans-serif';

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={cn(
        "relative select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-black/30",
        className,
      )}
      style={{
        width: "100%",
        height: 650,
        backgroundColor: background,
        touchAction: "pan-y",
        cursor: dragging ? "grabbing" : "grab",
        // Original loads Inter from Framer's font CDN; we use the same family with a fallback.
        fontFamily: fontStack,
        ...style,
      }}
      {...rest}
    >
      {/* Soft shade the glass casts around the middle card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          // Measured: about 6% darker behind the middle card, gone ~1 card height sideways.
          background: `radial-gradient(${cardH * 0.95}px ${cardH * 1.45}px at 50% 50%, rgba(0,0,0,0.064), rgba(0,0,0,0.045) 40%, rgba(0,0,0,0))`,
        }}
      />
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" />

      {showText && slide && (
        <motion.div
          {...enter}
          className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
          style={{ top: size.h / 2 - cardH / 2 - 125, padding: "0 20px", gap: 6 }}
        >
          {/* The old text goes at once and the new one fades in (no crossfade), as measured. */}
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.12 }}
            className="flex flex-col items-center text-center"
            style={{ gap: 6 }}
            aria-live="polite"
          >
            {slide.tag && (
              <div
                className="flex items-center"
                style={{
                  ...pill,
                  gap: 6,
                  padding: "4px 14px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.32,
                  lineHeight: "13.2px",
                  color: ink,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ink }} />
                {slide.tag}
              </div>
            )}
            <h2
              className="m-0"
              style={{
                fontSize: 40,
                fontWeight: 600,
                letterSpacing: -1,
                lineHeight: "46px",
                color: "#0f0f12",
              }}
            >
              {slide.href ? (
                <a
                  href={slide.href}
                  className="pointer-events-auto outline-none focus-visible:underline"
                >
                  {slide.title}
                </a>
              ) : (
                slide.title
              )}
            </h2>
            {slide.subtitle && (
              <p
                className="m-0"
                style={{
                  fontSize: 15,
                  letterSpacing: 0.15,
                  lineHeight: "19.5px",
                  color: "rgba(15, 15, 18, 0.65)",
                }}
              >
                {slide.subtitle}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}

      {showPager && (
        <motion.div
          {...enter}
          className="absolute left-1/2 flex items-center"
          style={{
            ...pill,
            top: Math.min(size.h - 64, size.h / 2 + cardH / 2 + 76),
            x: "-50%",
            padding: "6px 10px",
            gap: 8,
          }}
        >
          <PagerButton label="Previous Slide" ink={ink} onClick={() => go(-1)}>
            <Chevron direction="left" />
          </PagerButton>
          <div className="flex items-center" style={{ padding: "0 4px", gap: 5 }}>
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goToIndex(i)}
                className="cursor-pointer rounded-full border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                style={{ padding: "6px 2px" }}
              >
                <span
                  className="block"
                  style={{
                    width: i === index ? 22 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === index ? ink : "rgba(5, 26, 28, 0.25)",
                    transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s",
                  }}
                />
              </button>
            ))}
          </div>
          <PagerButton label="Next Slide" ink={ink} onClick={() => go(1)}>
            <Chevron direction="right" />
          </PagerButton>
        </motion.div>
      )}
      <span className="sr-only" aria-live="polite">
        {slide ? `Slide ${index + 1} of ${n}: ${slide.alt ?? slide.title}` : null}
      </span>
    </div>
  );
}

function PagerButton({
  label,
  ink,
  onClick,
  children,
}: {
  label: string;
  ink: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group relative flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent outline-none transition-[transform,background-color,color] duration-200 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-black/30"
      style={{ width: 34, height: 34, padding: "1px 6px", color: ink }}
    >
      <span
        className="pointer-events-none absolute rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ width: 34, height: 34, backgroundColor: "rgba(5, 26, 28, 0.1)" }}
      />
      <span className="relative flex opacity-[0.72] transition-opacity duration-200 group-hover:opacity-100">
        {children}
      </span>
    </button>
  );
}

export default LiquidGlassCarousel;
