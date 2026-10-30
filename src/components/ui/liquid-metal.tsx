import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Liquid Metal: a logo (any SVG or image with transparency, or a dark mark on a light background)
 * rendered as flowing chrome. Our own WebGL shader:
 *
 * 1. On load the logo is rasterised and turned into a "depth" map: the distance of every pixel
 *    from the logo's outline, normalised per separate shape and smoothed, so every piece of the
 *    logo gets a rounded bevel of its own.
 * 2. The fragment shader reads a reflection "phase" from that depth and from the position along
 *    a diagonal, so reflective bands travel across the logo from one corner to the other while
 *    rolling inward along the contours, as if the surface were a curved mirror.
 * 3. The phase runs through a chrome ramp (long slow brightening, white, a dark reflected horizon,
 *    a bright rebound); red, green and blue read the ramp at slightly different phases, which
 *    splits every hard light/dark step into a warm and a cool fringe (dispersion).
 *
 * Measured from the public preview (liquid-metal.framer.ai): one full cycle takes about 5 s at
 * speed 0.3, and roughly half a cycle spans the whole logo, so separate pieces of a mark light up
 * one after another.
 */
export interface LiquidMetalProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Logo image. SVG or a high resolution PNG with transparency works best. */
  src?: string;
  /** Accessible name of the logo. Empty string marks it decorative. */
  alt?: string;
  /** Colour split between red and blue reflections (0 to 0.06). */
  dispersion?: number;
  /** How strongly the bands follow the logo's contours rather than the straight diagonal (0 to 1). */
  edge?: number;
  /** Softness of the reflective bands (0 to 0.05). */
  patternBlur?: number;
  /** Wobble of the bands, a slow liquid distortion (0 to 1). */
  liquify?: number;
  /** Flow speed (0 to 1). 0 freezes the surface. */
  speed?: number;
  /** Band density: how many reflections fit across the logo (1 to 10). */
  patternScale?: number;
  /** Direction the reflections travel, in degrees (0 = left to right, 90 = bottom to top). */
  angle?: number;
  /** Pull of the pointer on the reflections (0 = none, 1 = strong). Works with mouse and touch. */
  pointerInfluence?: number;
  /** Space kept around the logo inside the box, as a fraction of its size. */
  padding?: number;
}

/** Our own sample mark (a squircle with an orbiting drop); replace it with your logo via `src`. */
const DEFAULT_LOGO =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">` +
      `<path fill="#000" fill-rule="evenodd" d="M150 40h100c70 0 110 40 110 110v100c0 70-40 110-110 110H150C80 360 40 320 40 250V150C40 80 80 40 150 40Zm50 85a75 75 0 1 0 0 150a75 75 0 1 0 0-150Z"/>` +
      `<circle cx="200" cy="200" r="34" fill="#000"/>` +
      `</svg>`,
  );

/** Longest side of the rasterised logo used for the depth map. */
const MASK_SIZE = 512;

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_mask;   // r: smoothed depth (0 outline, 1 deepest), g: coverage
uniform vec2 u_res;
uniform float u_maskAspect;
uniform float u_time;       // cycles elapsed
uniform float u_dispersion;
uniform float u_edge;
uniform float u_blur;
uniform float u_liquify;
uniform float u_scale;
uniform vec2 u_dir;
uniform vec3 u_pointer;     // xy in mask space (0..1), z strength

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Chrome ramp over one cycle. A point on the surface walks through it as time passes:
// slow brightening from the dark horizon, a long white highlight, a hard drop into the dark
// reflected horizon, a bright rebound, and a second drop that closes the cycle.
float ramp(float x, float w) {
  x = fract(x);
  float l = mix(0.12, 0.9, smoothstep(0.02, 0.6, x));
  l = mix(l, 0.985, smoothstep(0.5, 0.6, x));
  l = mix(l, 0.07, smoothstep(0.70 - w, 0.70 + w, x));
  l = mix(l, 1.0, smoothstep(0.83 - w, 0.83 + w, x));
  l = mix(l, 0.12, smoothstep(0.93 - w * 1.5, 0.97 + w * 0.5, x));
  return l;
}

void main() {
  // Fit the mask inside the canvas (contain).
  float canvasAspect = u_res.x / u_res.y;
  vec2 uv = v_uv - 0.5;
  if (canvasAspect > u_maskAspect) uv.x *= canvasAspect / u_maskAspect;
  else uv.y *= u_maskAspect / canvasAspect;
  uv += 0.5;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec4 m = texture2D(u_mask, uv);
  float cover = m.g;
  if (cover < 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float depth = m.r;
  vec2 p = (uv - 0.5) * vec2(u_maskAspect, 1.0);

  // Bevel: depth rises fast near the outline and flattens inside, like a rounded pillow.
  float bevel = 1.0 - pow(1.0 - clamp(depth, 0.0, 1.0), 2.2);

  // Liquid wobble: two drifting octaves of value noise.
  float t = u_time;
  float n = noise(p * 2.6 + vec2(t * 0.35, -t * 0.22)) + 0.5 * noise(p * 5.3 - vec2(t * 0.28, t * 0.4));
  float wobble = (n - 0.75) * u_liquify * 1.6;

  // Phase: travels against the diagonal and is pushed ahead in the deep parts of each shape, so
  // bands are born inside a shape and roll out to its edges.
  float diag = dot(p, u_dir);
  float phase = (-diag * 0.9 + bevel * u_edge * 0.75) * u_scale * 0.5 + wobble + t;

  // Pointer: a soft dent that delays the phase around the pointer.
  vec2 dp = (uv - u_pointer.xy) * vec2(u_maskAspect, 1.0);
  phase -= u_pointer.z * 0.35 * exp(-dot(dp, dp) * 18.0);

  float w = 0.018 + u_blur * 2.0;
  // Dispersion: stronger where the surface turns (near the outline).
  float split = u_dispersion * (1.0 + 1.5 * (1.0 - bevel)) * 0.55;
  vec3 col = vec3(ramp(phase - split, w), ramp(phase, w), ramp(phase + split, w));

  // Dark parts of chrome reflect a navy horizon, not grey.
  float lum = dot(col, vec3(0.333));
  col = mix(col * vec3(0.78, 0.8, 1.0) + vec3(0.02, 0.02, 0.05), col, smoothstep(0.25, 0.8, lum));

  // Bright rim right on the outline where the surface turns away; a hair of shadow outside it.
  float rimBand = smoothstep(0.0, 0.02, depth) * (1.0 - smoothstep(0.02, 0.07, depth));
  col = mix(col, vec3(1.0), rimBand * 0.8 * (1.0 - lum) * (1.0 - lum));
  col *= mix(0.45, 1.0, smoothstep(0.0, 0.03, depth));

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col * cover, cover);
}`;

/** Typed-array read; every index below is in range by construction, this only satisfies TS. */
const at = (a: ArrayLike<number>, i: number) => a[i] ?? 0;

/** Exact 1D squared Euclidean distance transform (Felzenszwalb and Huttenlocher). */
function edt1d(f: Float32Array, n: number, d: Float32Array, v: Int32Array, z: Float32Array) {
  const parabola = (q: number, k: number) => {
    const vk = at(v, k);
    return (at(f, q) + q * q - (at(f, vk) + vk * vk)) / (2 * q - 2 * vk);
  };
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = parabola(q, k);
    while (s <= at(z, k)) {
      k--;
      s = parabola(q, k);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (at(z, k + 1) < q) k++;
    const vk = at(v, k);
    d[q] = (q - vk) * (q - vk) + at(f, vk);
  }
}

/** Distance (px) of every inside pixel to the nearest outside pixel. */
function insideDistance(inside: Uint8Array, w: number, h: number) {
  const INF = 1e10;
  const grid = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) grid[i] = inside[i] ? INF : 0;
  const n = Math.max(w, h);
  const f = new Float32Array(n);
  const d = new Float32Array(n);
  const v = new Int32Array(n);
  const z = new Float32Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = at(grid, y * w + x);
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = at(d, y);
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = at(grid, y * w + x);
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(at(d, x));
  }
  return grid;
}

/** Separable box blur, in place, `passes` times (three passes approximate a Gaussian). */
function boxBlur(src: Float32Array, w: number, h: number, r: number, passes: number) {
  const tmp = new Float32Array(w * h);
  const norm = 1 / (2 * r + 1);
  const cx = (x: number) => Math.min(w - 1, Math.max(0, x));
  const cy = (y: number) => Math.min(h - 1, Math.max(0, y));
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      let acc = 0;
      const row = y * w;
      for (let x = -r; x <= r; x++) acc += at(src, row + cx(x));
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc * norm;
        acc += at(src, row + cx(x + r + 1)) - at(src, row + cx(x - r));
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += at(tmp, cy(y) * w + x);
      for (let y = 0; y < h; y++) {
        src[y * w + x] = acc * norm;
        acc += at(tmp, cy(y + r + 1) * w + x) - at(tmp, cy(y - r) * w + x);
      }
    }
  }
}

/**
 * Rasterises the logo and builds the RGBA mask: r = smoothed depth (each separate shape
 * normalised to its own deepest point), g = antialiased coverage.
 */
function buildMask(img: HTMLImageElement, padding: number) {
  const iw = img.naturalWidth || 400;
  const ih = img.naturalHeight || 400;
  const fit = MASK_SIZE / ((1 + 2 * padding) * Math.max(iw, ih));
  const lw = Math.round(iw * fit);
  const lh = Math.round(ih * fit);
  const W = Math.max(8, Math.round(lw + 2 * padding * Math.max(lw, lh)));
  const H = Math.max(8, Math.round(lh + 2 * padding * Math.max(lw, lh)));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, (W - lw) / 2, (H - lh) / 2, lw, lh);
  const px = ctx.getImageData(0, 0, W, H).data;

  // Coverage from alpha; an image without transparency is read as a dark mark on a light ground.
  let transparent = false;
  for (let i = 3; i < px.length; i += 4 * 7) {
    if (at(px, i) < 250) {
      transparent = true;
      break;
    }
  }
  const cover = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (transparent) cover[i] = at(px, i * 4 + 3) / 255;
    else {
      const lum =
        (0.299 * at(px, i * 4) + 0.587 * at(px, i * 4 + 1) + 0.114 * at(px, i * 4 + 2)) / 255;
      cover[i] = Math.min(1, Math.max(0, (0.92 - lum) / 0.5));
    }
  }
  // A logo touching the frame is clipped by the outline, as if outside were empty.
  const inside = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1;
      inside[y * W + x] = !edge && at(cover, y * W + x) > 0.5 ? 1 : 0;
    }
  const dist = insideDistance(inside, W, H);

  // Label separate shapes (4-connected flood fill) and normalise each to its own deepest point.
  const label = new Int32Array(W * H).fill(-1);
  const maxByLabel: number[] = [];
  const stack = new Int32Array(W * H);
  for (let start = 0; start < W * H; start++) {
    if (!inside[start] || at(label, start) >= 0) continue;
    const id = maxByLabel.length;
    let top = 0;
    let max = 0;
    stack[top++] = start;
    label[start] = id;
    while (top > 0) {
      const i = at(stack, --top);
      max = Math.max(max, at(dist, i));
      const x = i % W;
      const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W];
      for (const j of nb) {
        if (j < 0 || j >= W * H || !inside[j] || at(label, j) >= 0) continue;
        label[j] = id;
        stack[top++] = j;
      }
    }
    maxByLabel.push(max);
  }
  const depth = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const id = at(label, i);
    if (id >= 0) depth[i] = at(dist, i) / Math.max(1, at(maxByLabel, id));
  }
  // Smooth away the creases a distance field has along each shape's spine.
  boxBlur(depth, W, H, Math.max(2, Math.round(Math.max(W, H) / 90)), 3);
  for (let i = 0; i < W * H; i++) if (!inside[i]) depth[i] = 0;

  const out = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    out[i * 4] = Math.round(Math.min(1, at(depth, i) * 1.15) * 255);
    out[i * 4 + 1] = Math.round(at(cover, i) * 255);
    out[i * 4 + 3] = 255;
  }
  return { data: out, width: W, height: H };
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("LiquidMetal shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function LiquidMetal({
  src = DEFAULT_LOGO,
  alt = "Logo",
  dispersion = 0.015,
  edge = 0.4,
  patternBlur = 0.005,
  liquify = 0.07,
  speed = 0.3,
  patternScale = 2,
  angle = 60,
  pointerInfluence = 0,
  padding = 0.06,
  className,
  style,
  ...rest
}: LiquidMetalProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Live values read by the render loop, so slider changes never rebuild the GL context.
  const params = useRef({
    dispersion,
    edge,
    patternBlur,
    liquify,
    speed,
    patternScale,
    angle,
    pointerInfluence,
  });
  params.current = {
    dispersion,
    edge,
    patternBlur,
    liquify,
    speed,
    patternScale,
    angle,
    pointerInfluence,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: true,
      alpha: true,
      antialias: true,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      res: u("u_res"),
      maskAspect: u("u_maskAspect"),
      time: u("u_time"),
      dispersion: u("u_dispersion"),
      edge: u("u_edge"),
      blur: u("u_blur"),
      liquify: u("u_liquify"),
      scale: u("u_scale"),
      dir: u("u_dir"),
      pointer: u("u_pointer"),
    };
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(u("u_mask"), 0);

    let maskAspect = 0;
    let disposed = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const mask = buildMask(img, padding);
      if (!mask) return;
      // Canvas rows run top-down, GL textures bottom-up.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        mask.width,
        mask.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        mask.data,
      );
      maskAspect = mask.width / mask.height;
      draw(performance.now());
    };
    img.src = src;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(box.clientWidth * dpr));
      const h = Math.max(1, Math.round(box.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now());
    });
    ro.observe(box);

    // Pointer, eased so the dent glides rather than jumps.
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, s: 0, ts: 0 };
    const toMask = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      let x = (e.clientX - r.left) / r.width - 0.5;
      let y = 1 - (e.clientY - r.top) / r.height - 0.5;
      const ca = r.width / r.height;
      if (maskAspect) {
        if (ca > maskAspect) x *= ca / maskAspect;
        else y *= maskAspect / ca;
      }
      pointer.tx = x + 0.5;
      pointer.ty = y + 0.5;
      pointer.ts = 1;
    };
    const leave = () => {
      pointer.ts = 0;
    };
    box.addEventListener("pointermove", toMask);
    box.addEventListener("pointerdown", toMask);
    box.addEventListener("pointerleave", leave);
    box.addEventListener("pointercancel", leave);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cycles = 0.15;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    let running = false;

    function draw(now: number) {
      if (!gl || !maskAspect) return;
      const p = params.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // Speed 0.3 = one cycle per 5 s, as measured on the original.
      if (!reduced.matches) cycles += dt * p.speed * (0.2 / 0.3);
      const k = 1 - Math.exp(-dt * 6);
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;
      pointer.s += (pointer.ts * p.pointerInfluence - pointer.s) * k;
      const a = (p.angle * Math.PI) / 180;
      gl.viewport(0, 0, canvas!.width, canvas!.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(loc.res, canvas!.width, canvas!.height);
      gl.uniform1f(loc.maskAspect, maskAspect);
      gl.uniform1f(loc.time, cycles);
      gl.uniform1f(loc.dispersion, p.dispersion);
      gl.uniform1f(loc.edge, p.edge);
      gl.uniform1f(loc.blur, p.patternBlur);
      gl.uniform1f(loc.liquify, p.liquify);
      gl.uniform1f(loc.scale, p.patternScale);
      gl.uniform2f(loc.dir, Math.cos(a), Math.sin(a));
      gl.uniform3f(loc.pointer, pointer.x, pointer.y, pointer.s);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const update = () => {
      const should = visible && !reduced.matches && !document.hidden;
      if (should && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
      if (!should) draw(performance.now());
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      update();
    });
    io.observe(box);
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      reduced.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      box.removeEventListener("pointermove", toMask);
      box.removeEventListener("pointerdown", toMask);
      box.removeEventListener("pointerleave", leave);
      box.removeEventListener("pointercancel", leave);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src, padding]);

  return (
    <div
      ref={boxRef}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("relative h-full w-full", className)}
      style={style}
      {...rest}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}

export default LiquidMetal;
