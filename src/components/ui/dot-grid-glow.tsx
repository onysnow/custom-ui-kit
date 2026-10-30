import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Dot Grid Glow: a faint grid of dots on black. Dots within reach of the pointer light up,
 * grow, and swing out of the grid on small tilted 3D orbits, so the area around the pointer
 * reads as a loose, shimmering cluster of white points; when the pointer leaves, the cluster
 * eases back into the grid.
 *
 * The resting grid is painted once into an offscreen layer; per frame only the dots near the
 * pointer are redrawn, so cost stays flat however large the surface is.
 *
 * Defaults reproduce the demo at dotgridbg.framer.website.
 */
export interface DotGridGlowProps extends React.ComponentProps<"div"> {
  /** Dot colour (any canvas colour string). */
  dotColor?: string;
  /** Surface colour behind the dots. */
  backgroundColor?: string;
  /** Resting dot diameter, px. */
  dotSize?: number;
  /** Distance between dots, px. */
  spacing?: number;
  /** Opacity of a resting dot, 0–1. */
  restOpacity?: number;
  /** Reach of the pointer, px. */
  radius?: number;
  /** Size multiplier of a dot right under the pointer. */
  scale?: number;
  /** Let dots near the pointer swing out on 3D orbits (false: they only light up and grow). */
  orbit?: boolean;
  /** Orbit speed, radians per second (each dot varies ±30 % around it). */
  orbitSpeed?: number;
  /** How far an orbit can reach, as a fraction of `spacing`. */
  orbitReach?: number;
  /** Seconds for the cluster to settle back after the pointer leaves. */
  fadeOut?: number;
  /**
   * After a touch ends, keep the cluster where the finger lifted (as mobile Safari does for the
   * original, which listens to emulated mouse events) instead of fading it out.
   */
  touchLinger?: boolean;
  /** Cap on device pixel ratio. */
  maxDpr?: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** Stable pseudo-random value in [0, 1) for dot `i`, channel `k` (so orbits survive resizes). */
function hash(i: number, k: number) {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function DotGridGlow({
  dotColor = "rgb(255, 255, 255)",
  backgroundColor = "#000",
  dotSize = 3,
  spacing = 30,
  restOpacity = 0.3,
  radius = 100,
  scale = 1.8,
  orbit = true,
  orbitSpeed = 5,
  orbitReach = 0.7,
  fadeOut = 2 / 3,
  touchLinger = true,
  maxDpr = 2,
  className,
  style,
  ...rest
}: DotGridGlowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const opts = {
    dotColor,
    dotSize,
    spacing,
    restOpacity,
    radius,
    scale,
    orbit,
    orbitSpeed,
    orbitReach,
    fadeOut,
    touchLinger,
    maxDpr,
  };
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const rebuildRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    rebuildRef.current?.();
  }, [dotColor, dotSize, spacing, restOpacity, maxDpr]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let layer: HTMLCanvasElement | null = null;

    let px = -1e4;
    let py = -1e4;
    let inside = false;
    let leftAt = 0;
    let angle = 0;
    let raf = 0;
    let last = -1;
    let visible = true;
    let drewCluster = false;

    const build = () => {
      const o = optsRef.current;
      const rect = root.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      // One spare column/row so the grid runs off the far edges.
      cols = Math.ceil(width / o.spacing) + 2;
      rows = Math.ceil(height / o.spacing) + 2;

      layer = document.createElement("canvas");
      layer.width = canvas.width;
      layer.height = canvas.height;
      const l = layer.getContext("2d")!;
      l.setTransform(dpr, 0, 0, dpr, 0, 0);
      l.fillStyle = o.dotColor;
      l.globalAlpha = o.restOpacity;
      l.beginPath();
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          l.moveTo(c * o.spacing + o.dotSize / 2, r * o.spacing);
          l.arc(c * o.spacing, r * o.spacing, o.dotSize / 2, 0, Math.PI * 2);
        }
      l.fill();
      draw(0);
    };

    /** How strongly the pointer is present: 1 while inside, eased to 0 after it leaves. */
    const presence = (now: number) => {
      if (inside) return 1;
      const fade = Math.max(0.01, optsRef.current.fadeOut);
      return smoothstep(1 - (now - leftAt) / 1000 / fade);
    };

    const draw = (pres: number) => {
      if (!layer) return;
      const o = optsRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(layer, 0, 0);
      if (pres <= 0) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sp = o.spacing;
      const c0 = Math.max(0, Math.floor((px - o.radius) / sp));
      const c1 = Math.min(cols - 1, Math.ceil((px + o.radius) / sp));
      const r0 = Math.max(0, Math.floor((py - o.radius) / sp));
      const r1 = Math.min(rows - 1, Math.ceil((py + o.radius) / sp));
      const swing = o.orbit && !reducedMotion.matches;

      // Lift the affected resting dots out of the base layer first...
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      for (let r = r0; r <= r1; r++)
        for (let c = c0; c <= c1; c++) {
          const d = Math.hypot(c * sp - px, r * sp - py);
          if (d >= o.radius || d === 0) continue;
          ctx.moveTo(c * sp + o.dotSize / 2 + 0.75, r * sp);
          ctx.arc(c * sp, r * sp, o.dotSize / 2 + 0.75, 0, Math.PI * 2);
        }
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // ...then draw them displaced, larger and brighter.
      ctx.fillStyle = o.dotColor;
      for (let r = r0; r <= r1; r++)
        for (let c = c0; c <= c1; c++) {
          const bx = c * sp;
          const by = r * sp;
          const d = Math.hypot(bx - px, by - py);
          if (d >= o.radius || d === 0) continue;
          const t = d / o.radius;
          const pull = smoothstep(1 - t) * pres;
          let x = bx;
          let y = by;
          let depth = 1;
          if (swing) {
            const i = r * cols + c;
            // Each dot has its own orbit plane (tilt + rotation), phase and speed.
            const tilt = hash(i, 1) * Math.PI;
            const node = hash(i, 2) * Math.PI * 2;
            const theta = angle * (0.7 + hash(i, 4) * 0.6) + hash(i, 3) * Math.PI * 2;
            const ox = Math.cos(theta);
            const oy = Math.sin(theta) * Math.cos(tilt);
            const oz = Math.sin(theta) * Math.sin(tilt); // +1 toward the viewer
            // Dots nearer the pointer swing wider.
            const reach = (1 - t) * sp * o.orbitReach * pull;
            x += (ox * Math.cos(node) - oy * Math.sin(node)) * reach;
            y += (ox * Math.sin(node) + oy * Math.cos(node)) * reach;
            // Far side of the orbit: up to 25 % smaller and dimmer.
            depth = 0.75 + 0.25 * ((oz + 1) / 2);
          }
          const size = (o.dotSize / 2) * (1 + (o.scale - 1) * pull) * depth;
          ctx.globalAlpha = clamp01((o.restOpacity + (1 - o.restOpacity) * pull) * depth);
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      angle += optsRef.current.orbitSpeed * dt;
      const pres = presence(now);
      if (pres > 0 || drewCluster) draw(pres);
      drewCluster = pres > 0;
      // Keep animating while the cluster is visible; the orbit is perpetual motion.
      if (pres > 0) raf = requestAnimationFrame(tick);
      else last = -1;
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      inside = true;
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch" && optsRef.current.touchLinger) return;
      inside = false;
      leftAt = performance.now();
      wake();
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onMove);
    root.addEventListener("pointerenter", onMove);
    root.addEventListener("pointerleave", onLeave);

    const ro = new ResizeObserver(() => build());
    ro.observe(root);
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        last = -1;
        wake();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(root);
    const dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprQuery.addEventListener("change", build);
    rebuildRef.current = () => {
      build();
      wake();
    };
    build();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      dprQuery.removeEventListener("change", build);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onMove);
      root.removeEventListener("pointerenter", onMove);
      root.removeEventListener("pointerleave", onLeave);
      rebuildRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ backgroundColor, ...style }}
      {...rest}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" />
    </div>
  );
}

export default DotGridGlow;
