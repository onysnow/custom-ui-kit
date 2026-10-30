import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Tron Tiles: a full-bleed grid of soft white rounded tiles on light grey. Tiles under the
 * pointer rise toward the viewer (they grow, lift up and cast a soft shadow, leaving a faint
 * recess where they sat) and settle back as it leaves; a click or tap sends a ripple of rising
 * tiles across the grid. Everything is drawn on one 2D canvas: the resting grid is painted once
 * into an offscreen layer and only the tiles that are currently moving are drawn per frame.
 *
 * Default values reproduce the demo at tron-tiles.framer.website.
 */

type RGBA = [number, number, number, number];

export interface TronTilesProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Distance between tile centres, px. */
  cellSize?: number;
  /** Space between neighbouring tiles, px. */
  gap?: number;
  /** Tile corner radius, px. */
  cornerRadius?: number;
  /** Page colour behind the tiles. */
  backgroundColor?: string;
  /** Hairlines drawn along the cell boundaries. */
  lineColor?: string;
  /** Hairline width, px (0 hides them). */
  lineWidth?: number;
  /** Edge glow over the whole surface (CSS colour; "transparent" hides it). */
  vignetteColor?: string;
  /** Tile face colour (alpha is honoured: faces are translucent over the page). */
  faceColor?: string;
  /** Mixed into the top of each face. */
  faceLightColor?: string;
  /** Mixed into the bottom of each face. */
  faceShadeColor?: string;
  /** Rim highlight and top-edge line. */
  highlightColor?: string;
  /** Recess, bottom-edge line and dipped tiles. */
  shadeColor?: string;
  /** Lift under a resting pointer, 0–1.25 (1 = full rise). */
  hoverLift?: number;
  /** Standard deviation of the hover bump, px. */
  hoverRadius?: number;
  /** How quickly the hover bump follows the pointer, 0.02–0.95 per 16 ms frame. */
  hoverFollow?: number;
  /** How far a fully lifted tile moves up the screen, px. */
  raise?: number;
  /** How much a fully lifted tile grows (0.135 = 13.5 %). */
  growth?: number;
  /** Strength of the glint along the pointer-facing rim, 0–1. */
  cursorShine?: number;
  /** Extra whitening of strongly lifted faces, 0–1. */
  brighten?: number;
  /** Click / tap ripples. */
  ripples?: boolean;
  /** Peak lift of a ripple crest. */
  rippleAmplitude?: number;
  /** Depth of the trough that trails each crest. */
  rippleDip?: number;
  /** Lifetime of a ripple, seconds. */
  rippleDuration?: number;
  /** Ripple front speed, px/s. */
  rippleSpeed?: number;
  /** Distance over which a ripple's strength falls to 1/e, px. */
  rippleFalloff?: number;
  /** Momentary press-in at the point of contact. */
  rippleImpact?: number;
  /** Radius of the press-in, px. */
  pressRadius?: number;
  /** Ripples kept alive at once. */
  maxRipples?: number;
  /** Colour of the lifted tiles' shadow. */
  shadowColor?: string;
  /** Opacity of the tight contact shadow at full lift. */
  contactShadowOpacity?: number;
  /** Growth of the contact shadow at full lift. */
  contactShadowGrow?: number;
  /** Opacity of the wide ambient shadow at full lift. */
  ambientShadowOpacity?: number;
  /** Growth of the ambient shadow at full lift. */
  ambientShadowGrow?: number;
  /** Blur of the shadow sprite, px (0 = crisp stacked plates, as in the demo). */
  shadowBlur?: number;
  /** Darkness of the hole a lifted tile leaves behind. */
  recess?: number;
  /** Cap on device pixel ratio, for performance on dense screens. */
  maxDpr?: number;
  /**
   * Content laid over the grid. Leave undefined for the demo's intro card; pass `null` for none.
   * The overlay ignores the pointer except on its own interactive children.
   */
  children?: React.ReactNode;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Parses #rgb, #rrggbb(aa) and rgb()/rgba() strings; anything else reads as transparent black. */
function parseColor(input: string): RGBA {
  const s = input.trim();
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join("");
    const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), hex.length >= 8 ? n(6) / 255 : 1];
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = (m[1] ?? "").split(/[\s,/]+/).map(parseFloat);
    return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, p[3] ?? 1];
  }
  return [0, 0, 0, 0];
}

/** CSS string for colour `c` with its alpha multiplied by `alpha`. */
function css(c: RGBA, alpha = 1): string {
  return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${clamp(c[3] * alpha, 0, 1).toFixed(3)})`;
}

/** Component-wise blend of two colours (alpha included). */
function mix(a: RGBA, b: RGBA, t: number): RGBA {
  const at = (i: 0 | 1 | 2 | 3) => a[i] + (b[i] - a[i]) * t;
  return [at(0), at(1), at(2), at(3)];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** An offscreen canvas of `w`×`h` CSS px at `dpr`, with its context pre-scaled. */
function offscreen(w: number, h: number, dpr: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(w * dpr));
  canvas.height = Math.max(1, Math.ceil(h * dpr));
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { canvas, ctx };
}

/** Sprites carry a 2 px margin so the rim strokes are never clipped. */
const PAD = 2;

interface Look {
  face: RGBA;
  light: RGBA;
  shade: RGBA;
  highlight: RGBA;
  rimShade: RGBA;
}

/**
 * Paints one tile face: a vertical gradient (lighter top, slightly blue-grey bottom), a soft
 * inner highlight ring, a diagonal rim that is bright at the top-left and fades toward the
 * bottom-right, and a faint grey outline. `lifted` faces are more opaque, brighter at the top
 * and carry a sheen, which is what makes a raised tile read as closer to the light.
 */
function paintFace(size: number, radius: number, dpr: number, look: Look, lifted: boolean) {
  const { canvas, ctx } = offscreen(size + PAD * 2, size + PAD * 2, dpr);
  const opacity = lifted ? 0.88 : 0.55;
  const fade = (c: RGBA): RGBA => [c[0], c[1], c[2], c[3] * opacity];
  const face = fade(look.face);
  const light = fade(look.light);
  const shade = fade(look.shade);

  const g = ctx.createLinearGradient(0, PAD, 0, PAD + size);
  g.addColorStop(0, css(mix(face, light, lifted ? 0.525 : 0.25)));
  g.addColorStop(lifted ? 0.5 : 0.55, css(lifted ? mix(face, light, 0.16) : face));
  g.addColorStop(1, css(mix(face, shade, 0.3)));
  ctx.fillStyle = g;
  roundRect(ctx, PAD, PAD, size, size, radius);
  ctx.fill();

  if (lifted) {
    const sheen = ctx.createLinearGradient(0, PAD, 0, PAD + size);
    sheen.addColorStop(0, css(look.highlight, 0.2));
    sheen.addColorStop(0.4, css(look.highlight, 0));
    ctx.fillStyle = sheen;
    roundRect(ctx, PAD, PAD, size, size, radius);
    ctx.fill();
  }

  // Inner highlight ring.
  ctx.lineWidth = 1.75;
  ctx.strokeStyle = css(look.highlight, lifted ? 0.128 : 0.07);
  roundRect(ctx, PAD + 1.5, PAD + 1.5, size - 3, size - 3, radius - 1.5);
  ctx.stroke();

  // Diagonal rim: light catches the top-left edge.
  const rim = lifted ? 0.95 : 0.5;
  const d = ctx.createLinearGradient(PAD, PAD, PAD + size, PAD + size);
  d.addColorStop(0, css(look.highlight, 0.95 * rim));
  d.addColorStop(0.3, css(look.highlight, 0.35 * rim));
  d.addColorStop(0.62, css(look.highlight, 0.12 * rim));
  d.addColorStop(1, css(look.highlight, 0.42 * rim));
  ctx.lineWidth = 1;
  ctx.strokeStyle = d;
  roundRect(ctx, PAD + 0.5, PAD + 0.5, size - 1, size - 1, radius - 0.5);
  ctx.stroke();

  // Hairline outline separating the face from the page.
  ctx.strokeStyle = css(look.rimShade, 0.14);
  roundRect(ctx, PAD - 0.5, PAD - 0.5, size + 1, size + 1, radius + 0.5);
  ctx.stroke();
  return canvas;
}

/** A tile-shaped plate in the shadow colour, with `margin` px of room for blur around it. */
function paintShadow(size: number, radius: number, blur: number, color: RGBA, dpr: number) {
  const margin = Math.max(blur * 2.5, 8);
  const total = size + margin * 2;
  const { canvas, ctx } = offscreen(total, total, dpr);
  ctx.fillStyle = css(color);
  ctx.shadowColor = css(color);
  // Two passes: a wide soft one and a tighter one, both dropped slightly downward.
  ctx.shadowBlur = blur * 1.2 * dpr;
  ctx.shadowOffsetY = blur * 0.3 * dpr;
  roundRect(ctx, margin, margin, size, size, radius);
  ctx.fill();
  ctx.shadowBlur = blur * 0.6 * dpr;
  ctx.shadowOffsetY = blur * 0.15 * dpr;
  roundRect(ctx, margin, margin, size, size, radius);
  ctx.fill();
  return { canvas, total };
}

interface Ripple {
  x: number;
  y: number;
  /** performance.now() at the press. */
  born: number;
}

function DefaultIntro() {
  return (
    <>
      {/* Original stacks the credit pill over the heading and byline in a min-content column
          (items centred, 12px gap), blended with `darken` so the tiles show through. */}
      <div
        className="absolute flex w-min flex-col items-center"
        style={{ top: 128, left: 73, gap: 12, mixBlendMode: "darken" }}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: 193, height: 34, borderRadius: 10, backgroundColor: "#d4d4d4" }}
        >
          <p
            className="m-0 whitespace-pre"
            style={{ fontSize: 11, lineHeight: 1.2, color: "#000" }}
          >
            developed by{" "}
            <em>
              <strong>Quzmo Studios</strong>
            </em>
          </p>
        </div>
        <div className="flex w-min flex-col items-start" style={{ gap: 2 }}>
          {/* Original webfont: "Stack Sans Headline Regular" (custom upload). */}
          <h1
            className="m-0 whitespace-pre font-normal"
            style={{
              fontFamily: '"Stack Sans Headline", "Stack Sans Text", Inter, system-ui, sans-serif',
              fontSize: 33,
              lineHeight: 1.1,
              color: "rgb(54, 54, 54)",
              mixBlendMode: "darken",
            }}
          >
            Cubic Depth
            <br />
            On Its Finest
          </h1>
          {/* Original webfont: Inter Display (Framer). */}
          <p
            className="m-0 whitespace-pre"
            style={{
              fontFamily: '"Inter Display", Inter, system-ui, sans-serif',
              fontSize: 14,
              lineHeight: 1.2,
              color: "rgb(87, 87, 87)",
              mixBlendMode: "darken",
            }}
          >
            add more depth to your UI and
            <br />
            create an everlasting impression
          </p>
        </div>
      </div>
      <a
        href="https://contra.com/payment-link/6ECX9JAv-tron-tiles-glass-tile-wave-grid"
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto absolute block outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#1f1f1f]"
        style={{ top: 295, left: 73, width: 113, height: 35, backgroundColor: "#1f1f1f" }}
      >
        {/* Label centre sits at 52 % / 52 % of the button in the original, not dead centre. */}
        <span
          className="absolute whitespace-pre"
          style={{
            top: "52%",
            left: "52%",
            transform: "translate(-50%, -50%)",
            fontSize: 12,
            fontWeight: 300,
            lineHeight: 1.2,
            color: "rgb(194, 194, 194)",
          }}
        >
          get {/* Original webfont: Stack Sans Notch 300 (Google Fonts). */}
          <span style={{ fontFamily: '"Stack Sans Notch", Inter, system-ui, sans-serif' }}>
            Tron
          </span>{" "}
          now
        </span>
      </a>
    </>
  );
}

export function TronTiles({
  cellSize = 80,
  gap = 10,
  cornerRadius = 19,
  backgroundColor = "rgb(242, 242, 242)",
  lineColor = "rgb(255, 255, 255)",
  lineWidth = 0.5,
  vignetteColor = "rgba(255, 255, 255, 0.35)",
  faceColor = "rgba(255, 255, 255, 0.67)",
  faceLightColor = "rgb(255, 255, 255)",
  faceShadeColor = "rgb(213, 218, 226)",
  highlightColor = "rgb(255, 255, 255)",
  shadeColor = "rgb(222, 222, 222)",
  hoverLift = 0.4,
  hoverRadius = 101,
  hoverFollow = 0.95,
  raise = 30,
  growth = 0.135,
  cursorShine = 0.72,
  brighten = 0.5,
  ripples = true,
  rippleAmplitude = 0.51,
  rippleDip = 0.22,
  rippleDuration = 3.7,
  rippleSpeed = 665,
  rippleFalloff = 900,
  rippleImpact = 0.35,
  pressRadius = 180,
  maxRipples = 8,
  shadowColor = "rgb(227, 227, 227)",
  contactShadowOpacity = 0.33,
  contactShadowGrow = 0.71,
  ambientShadowOpacity = 0.17,
  ambientShadowGrow = 1.05,
  shadowBlur = 0,
  recess = 0.3,
  maxDpr = 2,
  children,
  className,
  style,
  ...rest
}: TronTilesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Every visual option lives in one object the render loop reads each frame, so changing a
  // prop never restarts the loop; `look` changes simply invalidate the cached sprites.
  const opts = {
    cellSize,
    gap,
    cornerRadius,
    lineColor,
    lineWidth,
    faceColor,
    faceLightColor,
    faceShadeColor,
    highlightColor,
    shadeColor,
    hoverLift,
    hoverRadius,
    hoverFollow,
    raise,
    growth,
    cursorShine,
    brighten,
    ripples,
    rippleAmplitude,
    rippleDip,
    rippleDuration,
    rippleSpeed,
    rippleFalloff,
    rippleImpact,
    pressRadius,
    maxRipples,
    shadowColor,
    contactShadowOpacity,
    contactShadowGrow,
    ambientShadowOpacity,
    ambientShadowGrow,
    shadowBlur,
    recess,
    maxDpr,
  };
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const lookKey = JSON.stringify([
    cellSize,
    gap,
    cornerRadius,
    lineColor,
    lineWidth,
    faceColor,
    faceLightColor,
    faceShadeColor,
    highlightColor,
    shadeColor,
    shadowColor,
    shadowBlur,
    maxDpr,
  ]);
  const invalidateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    invalidateRef.current?.();
  }, [lookKey]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Layout and cached layers.
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let lift = new Float32Array(0);
    let staticLayer: HTMLCanvasElement | null = null;
    let restFace: HTMLCanvasElement | null = null;
    let liftFace: HTMLCanvasElement | null = null;
    let shadow: { canvas: HTMLCanvasElement; total: number } | null = null;
    let look: Look | null = null;

    // Pointer state: raw position, smoothed position and how "present" the hover is (0–1).
    let px = 0;
    let py = 0;
    let sx = 0;
    let sy = 0;
    let inside = false;
    let presence = 0;
    let snapSmoothed = true;
    const waves: Ripple[] = [];

    let raf = 0;
    let lastTime = -1;
    let visible = true;
    /** The last frame drew moving tiles, so one more clean frame is owed once motion stops. */
    let drewMotion = false;

    const buildLayers = () => {
      const o = optsRef.current;
      const size = o.cellSize - o.gap;
      look = {
        face: parseColor(o.faceColor),
        light: parseColor(o.faceLightColor),
        shade: parseColor(o.faceShadeColor),
        highlight: parseColor(o.highlightColor),
        rimShade: parseColor(o.shadeColor),
      };
      restFace = paintFace(size, o.cornerRadius, dpr, look, false);
      liftFace = paintFace(size, o.cornerRadius, dpr, look, true);
      shadow = paintShadow(size, o.cornerRadius, o.shadowBlur, parseColor(o.shadowColor), dpr);

      const layer = offscreen(width, height, dpr);
      const inset = o.gap / 2 - PAD;
      for (let r = 0; r <= rows; r++)
        for (let c = 0; c <= cols; c++)
          layer.ctx.drawImage(
            restFace,
            c * o.cellSize + inset,
            r * o.cellSize + inset,
            size + PAD * 2,
            size + PAD * 2,
          );
      if (o.lineWidth > 0) {
        layer.ctx.lineWidth = o.lineWidth;
        layer.ctx.strokeStyle = o.lineColor;
        layer.ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          layer.ctx.moveTo(c * o.cellSize + 0.5, 0);
          layer.ctx.lineTo(c * o.cellSize + 0.5, height);
        }
        for (let r = 0; r <= rows; r++) {
          layer.ctx.moveTo(0, r * o.cellSize + 0.5);
          layer.ctx.lineTo(width, r * o.cellSize + 0.5);
        }
        layer.ctx.stroke();
      }
      staticLayer = layer.canvas;
    };

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const o = optsRef.current;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      cols = Math.ceil(width / o.cellSize);
      rows = Math.ceil(height / o.cellSize);
      lift = new Float32Array((cols + 1) * (rows + 1));
      buildLayers();
      drawFrame(performance.now(), false);
    };

    const liftAt = (i: number) => lift[i] ?? 0;

    /** Height field at every cell centre: hover bump plus every live ripple. */
    const computeField = (now: number) => {
      const o = optsRef.current;
      const cell = o.cellSize;
      const falloff = Math.max(40, o.rippleFalloff);
      const speed = Math.max(60, o.rippleSpeed);
      const press2 = 2 * Math.max(10, o.pressRadius) ** 2;
      const hover2 = 2 * o.hoverRadius * o.hoverRadius;
      const hoverOn = presence > 0.01;
      let i = 0;
      for (let r = 0; r <= rows; r++) {
        const cy = r * cell + cell / 2;
        for (let c = 0; c <= cols; c++) {
          const cx = c * cell + cell / 2;
          let h = 0;
          for (const w of waves) {
            const age = (now - w.born) / 1000;
            const dist = Math.hypot(cx - w.x, cy - w.y);
            const strength = Math.exp(-dist / falloff) * clamp(1 - age / o.rippleDuration, 0, 1);
            // Time since the expanding front passed this tile.
            const since = age - dist / speed;
            if (since > 0) {
              // Fast rise (40 ms) and slower decay (400 ms) give each tile a quick pop and a
              // gentle settle; a gaussian trough 0.5 s after the crest pulls it slightly below rest.
              const crest = (1 - Math.exp(-since / 0.04)) * Math.exp(-since / 0.4);
              const trough = Math.exp(-((since - 0.5) ** 2) / (2 * 0.2 * 0.2));
              h += 2 * o.rippleAmplitude * strength * crest - o.rippleDip * strength * trough;
            }
            // The contact point is pushed in briefly (decays in ~70 ms).
            h -= o.rippleImpact * Math.exp(-(dist * dist) / press2) * Math.exp(-age * 14);
          }
          if (hoverOn) {
            const dx = cx - sx;
            const dy = cy - sy;
            h += o.hoverLift * presence * Math.exp(-(dx * dx + dy * dy) / hover2);
          }
          lift[i++] = clamp(h, -0.55, 1.25);
        }
      }
    };

    const drawFrame = (now: number, moving: boolean) => {
      if (!staticLayer || !restFace || !liftFace || !shadow || !look) return;
      const o = optsRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(staticLayer, 0, 0, width, height);
      if (!moving) return;

      computeField(now);
      const cell = o.cellSize;
      const size = cell - o.gap;
      const half = size / 2;
      const radius = o.cornerRadius;
      const stride = cols + 1;
      const shine = o.cursorShine > 0.01 && presence > 0.01;

      const raised: number[] = [];
      for (let i = 0; i < lift.length; i++) {
        const h = liftAt(i);
        if (h < -0.03) {
          // Dipped tiles just darken in place.
          const cx = (i % stride) * cell + cell / 2;
          const cy = ((i / stride) | 0) * cell + cell / 2;
          ctx.fillStyle = css(look.rimShade, -h * 0.26 * 0.9);
          roundRect(ctx, cx - half, cy - half, size, size, radius);
          ctx.fill();
        } else if (h > 0.03) {
          raised.push(i);
        } else if (shine) {
          const dx = (i % stride) * cell + cell / 2 - sx;
          const dy = ((i / stride) | 0) * cell + cell / 2 - sy;
          if (dx * dx + dy * dy < 120 * 120) raised.push(i);
        }
      }
      // Lowest first, so taller tiles overlap their neighbours.
      raised.sort((a, b) => liftAt(a) - liftAt(b));

      const centre = (i: number) =>
        [(i % stride) * cell + cell / 2, ((i / stride) | 0) * cell + cell / 2] as const;
      /** Where a tile with lift `h` is drawn: grown and moved up. */
      const placed = (i: number) => {
        const [cx, cy] = centre(i);
        const h = Math.max(0, liftAt(i));
        const s = size * (1 + o.growth * h);
        return { cx, cy, x: cx - s / 2, y: cy - s / 2 - o.raise * h, s, h };
      };

      // 1. Clear the resting tile out of each lifted cell, then darken the hole it leaves.
      for (const i of raised) {
        const h = liftAt(i);
        if (h <= 0.03) continue;
        const [cx, cy] = centre(i);
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = Math.min(1, h * 2.5);
        ctx.fillStyle = "#000";
        roundRect(ctx, cx - half - 1, cy - half - 1, size + 2, size + 2, radius + 1);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }

      // 2. Recess and shadows, all under every lifted face.
      for (const i of raised) {
        const h = liftAt(i);
        if (h <= 0.03) continue;
        const p = Math.min(1, h);
        const [cx, cy] = centre(i);
        if (o.recess > 0.001) {
          ctx.fillStyle = css(look.rimShade, o.recess * p);
          roundRect(ctx, cx - half, cy - half, size, size, radius);
          ctx.fill();
        }
        // Shadows soften (fade) as the tile climbs.
        const soften = 1 - 0.55 * p;
        const contact = shadow.total * (1 + o.contactShadowGrow * p);
        ctx.globalAlpha = o.contactShadowOpacity * p * soften;
        ctx.drawImage(shadow.canvas, cx - contact / 2, cy - contact / 2 + 1.5, contact, contact);
        const ambient = shadow.total * (1 + o.ambientShadowGrow * p);
        ctx.globalAlpha = o.ambientShadowOpacity * p * soften;
        ctx.drawImage(shadow.canvas, cx - ambient / 2, cy - ambient / 2, ambient, ambient);
        ctx.globalAlpha = 1;
      }

      // 3. Faces.
      const snap = (v: number) => Math.round(v * dpr) / dpr;
      for (const i of raised) {
        const { x, y, s, h } = placed(i);
        if (h > 0.03) {
          const p = Math.min(1, h);
          ctx.drawImage(restFace, x - PAD, y - PAD, s + PAD * 2, s + PAD * 2);
          ctx.globalAlpha = Math.min(1, h * 1.8);
          ctx.drawImage(liftFace, x - PAD, y - PAD, s + PAD * 2, s + PAD * 2);
          ctx.globalAlpha = 1;
          if (o.brighten > 0.001 && p > 0.2) {
            ctx.fillStyle = css(look.highlight, o.brighten * (p - 0.2) * 0.35);
            roundRect(ctx, x, y, s, s, radius);
            ctx.fill();
          }
          // Crisp light edge along the top and a shade edge along the bottom.
          ctx.lineWidth = 1;
          ctx.strokeStyle = css(look.highlight, 0.8 * p);
          ctx.beginPath();
          ctx.moveTo(x + radius, snap(y + 0.75));
          ctx.lineTo(x + s - radius, snap(y + 0.75));
          ctx.stroke();
          ctx.strokeStyle = css(look.rimShade, 0.26 * 0.8 * p);
          ctx.beginPath();
          ctx.moveTo(x + radius, snap(y + s - 0.75));
          ctx.lineTo(x + s - radius, snap(y + s - 0.75));
          ctx.stroke();
        }
      }

      // 4. Glint on the rim facing the pointer, within 120 px of it.
      if (shine) {
        for (const i of raised) {
          const { cx, cy, x, y, s, h } = placed(i);
          const dist = Math.hypot(cx - sx, cy - sy);
          const near = clamp(1 - dist / 120, 0, 1) ** 2;
          if (near <= 0.08) continue;
          const a = near * o.cursorShine * presence * (0.45 + 0.55 * clamp(h, 0, 1));
          if (a <= 0.02) continue;
          const ux = (sx - cx) / (dist || 1);
          const uy = (sy - cy) / (dist || 1);
          const g = ctx.createLinearGradient(
            cx + ux * s * 0.62,
            cy + uy * s * 0.62,
            cx - ux * s * 0.62,
            cy - uy * s * 0.62,
          );
          g.addColorStop(0, css(look.highlight, a * 0.9));
          g.addColorStop(0.45, css(look.highlight, a * 0.35));
          g.addColorStop(1, css(look.highlight, 0));
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.25;
          roundRect(ctx, x + 1, y + 1, s - 2, s - 2, radius - 1);
          ctx.stroke();
        }
      }
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const o = optsRef.current;
      const dt = lastTime < 0 ? 16 : Math.min(48, now - lastTime);
      lastTime = now;
      if (snapSmoothed) {
        sx = px;
        sy = py;
        snapSmoothed = false;
      }
      // Frame-rate independent exponential follow, specified per 16 ms frame.
      const follow = 1 - (1 - clamp(o.hoverFollow, 0.02, 0.95)) ** (dt / 16);
      sx += (px - sx) * follow;
      sy += (py - sy) * follow;
      presence += ((inside ? 1 : 0) - presence) * (1 - 0.85 ** (dt / 16));
      while (waves[0] && (now - waves[0].born) / 1000 >= o.rippleDuration) waves.shift();

      const moving = waves.length > 0 || presence > 0.01;
      if (moving || drewMotion) drawFrame(now, moving);
      drewMotion = moving;
      if (moving) raf = requestAnimationFrame(tick);
      else lastTime = -1;
    };

    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    const local = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top] as const;
    };
    const onMove = (e: PointerEvent) => {
      [px, py] = local(e);
      if (!inside && presence < 0.01) snapSmoothed = true;
      inside = true;
      wake();
    };
    const onLeave = () => {
      inside = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      const o = optsRef.current;
      onMove(e);
      if (!o.ripples || reducedMotion.matches) return;
      const [x, y] = local(e);
      waves.push({ x, y, born: performance.now() });
      while (waves.length > o.maxRipples) waves.shift();
      wake();
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerenter", onMove);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointercancel", onLeave);

    const ro = new ResizeObserver(() => resize());
    ro.observe(root);
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        lastTime = -1;
        wake();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(root);
    // Re-render sharp when the page moves between screens of different density.
    const dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprQuery.addEventListener("change", resize);

    invalidateRef.current = () => {
      resize();
      wake();
    };
    resize();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      dprQuery.removeEventListener("change", resize);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointercancel", onLeave);
      invalidateRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("relative h-full w-full cursor-pointer overflow-hidden select-none", className)}
      style={{ backgroundColor, ...style }}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 120% at 50% 50%, transparent 55%, ${vignetteColor} 100%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {children === undefined ? <DefaultIntro /> : children}
      </div>
    </div>
  );
}

export default TronTiles;
