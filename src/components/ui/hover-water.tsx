import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Hover Water: an image or a background video becomes a liquid surface. The pointer (mouse or
 * finger) stirs it; the wake swirls, breaks up and lingers, refracting the picture, splitting its
 * colours and catching glints.
 *
 * Our own WebGL2 stable-fluids solver (semi-Lagrangian advection, vorticity confinement, Jacobi
 * pressure projection) running on half-float framebuffers:
 *
 *   per frame: curl -> vorticity confinement -> divergence -> pressure (N Jacobi iterations)
 *              -> subtract pressure gradient -> advect velocity -> advect "dye"
 *
 * The dye is not a colour: it carries a displacement vector (rg) and an intensity (b). The pointer
 * splats its own velocity into the velocity field and its stroke direction into the dye, so the
 * flow drags the displacement around and tears it into eddies. The display pass offsets the media
 * lookup by that displacement plus the live velocity (refraction), reads red, green and blue at
 * different offsets (chromatic aberration) and lights the slopes of the disturbed surface (glints).
 *
 * Defaults follow the settings of the public preview (real-result-504144.framer.app: curl 40,
 * pressure iterations 50, pressure dissipation 0, velocity dissipation 99, splat radius 3,
 * refraction 100, chromatic aberration 100, highlight 200), mapped onto this solver's units and
 * tuned against captures of the same pointer stroke.
 */
export interface HoverWaterProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Image or video URL shown under the liquid. */
  src?: string;
  /** "image" or "video". Inferred from the file extension when left out. */
  mediaType?: "image" | "video";
  /** Accessible description of the media. Empty string marks it decorative. */
  alt?: string;
  /** Vorticity confinement: how hard the wake curls into eddies (0 to 80). */
  curl?: number;
  /** Jacobi iterations of the pressure solve (more = more incompressible swirl, more GPU). */
  pressureIterations?: number;
  /** Share of last frame's pressure kept as the solver's starting guess (0 to 1). */
  pressureDissipation?: number;
  /** Share of the velocity kept per 60 fps frame (0.9 stops fast, 0.995 keeps drifting). */
  velocityDissipation?: number;
  /** Share of the distortion ("dye") kept per 60 fps frame: how long the wake lingers. */
  dyeDissipation?: number;
  /** Pointer splat radius, in % of the box's shorter side. */
  splatRadius?: number;
  /** How much of the pointer's speed is pushed into the liquid. */
  splatForce?: number;
  /** How strongly the disturbed liquid bends the picture (0 to 3). */
  distortion?: number;
  /** Colour split in the distorted areas (0 to 3). */
  chromaticAmount?: number;
  /** Glints on the disturbed surface (0 to 3). */
  highlight?: number;
  /** Media fit inside the box. */
  fit?: "cover" | "contain";
  /** Colour behind the media (shows with `fit="contain"` and while loading). */
  background?: string;
}

/** Demo media of the original preview (Framer's own sample assets). */
const DEFAULT_IMAGE =
  "https://framerusercontent.com/images/2exoQxYNf3YECaAWoYDz4CfJQPI.png?scale-down-to=2048";

/** Longest side of the velocity grid and of the dye (distortion) grid, in cells. */
const VELOCITY_RES = 192;
const DYE_RES = 768;

const VERTEX = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** Shared header: neighbour lookups for the grid passes. */
const GRID = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform vec2 u_texel;
vec2 L() { return v_uv - vec2(u_texel.x, 0.0); }
vec2 R() { return v_uv + vec2(u_texel.x, 0.0); }
vec2 B() { return v_uv - vec2(0.0, u_texel.y); }
vec2 T() { return v_uv + vec2(0.0, u_texel.y); }
`;

/** Adds a soft blob around the pointer. Velocity: pointer velocity. Dye: stroke direction. */
const SPLAT = `${GRID}
uniform sampler2D u_target;
uniform vec2 u_point;     // uv
uniform vec3 u_value;
uniform float u_radius;   // uv, measured along y
uniform float u_aspect;   // width / height
uniform float u_chop;     // 0 for velocity, > 0 breaks the dye splat into droplets
uniform vec2 u_seed;
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
void main() {
  vec2 d = v_uv - u_point;
  d.x *= u_aspect;
  float g = exp(-dot(d, d) / (u_radius * u_radius));
  vec2 cell = floor((v_uv * vec2(u_aspect, 1.0)) / (u_radius * 0.6) + u_seed);
  float chop = mix(1.0, 0.75 + 0.5 * hash(cell), u_chop);
  o = texture(u_target, v_uv) + vec4(u_value * g * chop, 0.0);
}`;

/** Semi-Lagrangian advection: fetch the value that flowed here during dt. */
const ADVECT = `${GRID}
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_velTexel;  // velocity is stored in velocity-grid cells per second
uniform float u_dt;
uniform float u_keep;
void main() {
  vec2 back = v_uv - u_dt * texture(u_velocity, v_uv).xy * u_velTexel;
  o = u_keep * texture(u_source, back);
}`;

const CURL = `${GRID}
uniform sampler2D u_velocity;
void main() {
  float c = texture(u_velocity, R()).y - texture(u_velocity, L()).y
          - texture(u_velocity, T()).x + texture(u_velocity, B()).x;
  o = vec4(0.5 * c, 0.0, 0.0, 1.0);
}`;

/** Vorticity confinement: push the flow around its eddies so they survive the coarse grid. */
const VORTICITY = `${GRID}
uniform sampler2D u_velocity;
uniform sampler2D u_curl;
uniform float u_curlStrength;
uniform float u_dt;
void main() {
  float cl = texture(u_curl, L()).x;
  float cr = texture(u_curl, R()).x;
  float cb = texture(u_curl, B()).x;
  float ct = texture(u_curl, T()).x;
  float c = texture(u_curl, v_uv).x;
  vec2 f = 0.5 * vec2(abs(ct) - abs(cb), abs(cr) - abs(cl));
  f /= length(f) + 1e-4;
  f *= u_curlStrength * c;
  f.y = -f.y;
  vec2 v = texture(u_velocity, v_uv).xy + f * u_dt;
  o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`;

const DIVERGENCE = `${GRID}
uniform sampler2D u_velocity;
void main() {
  float l = texture(u_velocity, L()).x;
  float r = texture(u_velocity, R()).x;
  float b = texture(u_velocity, B()).y;
  float t = texture(u_velocity, T()).y;
  vec2 c = texture(u_velocity, v_uv).xy;
  // Solid walls: the velocity reflects at the border.
  if (L().x < 0.0) l = -c.x;
  if (R().x > 1.0) r = -c.x;
  if (B().y < 0.0) b = -c.y;
  if (T().y > 1.0) t = -c.y;
  o = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}`;

const SCALE = `${GRID}
uniform sampler2D u_source;
uniform float u_value;
void main() { o = u_value * texture(u_source, v_uv); }`;

const PRESSURE = `${GRID}
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
void main() {
  float l = texture(u_pressure, L()).x;
  float r = texture(u_pressure, R()).x;
  float b = texture(u_pressure, B()).x;
  float t = texture(u_pressure, T()).x;
  float div = texture(u_divergence, v_uv).x;
  o = vec4(0.25 * (l + r + b + t - div), 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT = `${GRID}
uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
void main() {
  float l = texture(u_pressure, L()).x;
  float r = texture(u_pressure, R()).x;
  float b = texture(u_pressure, B()).x;
  float t = texture(u_pressure, T()).x;
  vec2 v = texture(u_velocity, v_uv).xy - 0.5 * vec2(r - l, t - b);
  o = vec4(v, 0.0, 1.0);
}`;

const DISPLAY = `${GRID}
uniform sampler2D u_dye;
uniform sampler2D u_velocity;
uniform sampler2D u_media;
uniform vec2 u_mediaScale;  // fit: media uv = (uv - 0.5) * scale + 0.5
uniform float u_distortion;
uniform float u_chroma;
uniform float u_highlight;
uniform vec3 u_bg;
uniform float u_ready;

vec3 media(vec2 uv) {
  vec2 m = (uv - 0.5) * u_mediaScale + 0.5;
  if (u_ready < 0.5) return u_bg;
  // Mirror at the edges so strong offsets never reveal a seam.
  m = 1.0 - abs(1.0 - mod(m, 2.0));
  return texture(u_media, vec2(m.x, 1.0 - m.y)).rgb;
}
float height(vec2 uv) {
  vec3 d = texture(u_dye, uv).xyz;
  return length(d.xy) * 3.5 + d.z * 0.4;
}

void main() {
  vec3 dye = texture(u_dye, v_uv).xyz;
  vec2 vel = texture(u_velocity, v_uv).xy;
  // Refraction offset: the advected displacement plus a share of the live flow.
  vec2 off = (dye.xy + vel * 0.00004) * u_distortion;
  float c = 0.12 * u_chroma;
  vec3 col;
  col.r = media(v_uv - off * (1.0 + c)).r;
  col.g = media(v_uv - off).g;
  col.b = media(v_uv - off * (1.0 - c)).b;

  // Glints: light the slopes of the disturbed surface; strongest on the broken-up edges.
  vec2 grad = vec2(height(R()) - height(L()), height(T()) - height(B()));
  vec3 n = normalize(vec3(-grad * 3.0, 1.0));
  vec3 h = normalize(normalize(vec3(-0.45, 0.6, 1.0)) + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, h), 0.0), 40.0) * smoothstep(0.02, 0.15, length(grad));
  float rim = smoothstep(0.08, 0.5, length(grad)) * 0.03;
  col += (spec * 0.35 + rim) * u_highlight;
  o = vec4(col, 1.0);
}`;

function isVideo(src: string) {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(src);
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  const channel = (s: string | undefined) => parseInt(s ?? "0", 16) / 255;
  return m ? [channel(m[1]), channel(m[2]), channel(m[3])] : [0, 0, 0];
}

type Program = { program: WebGLProgram; u: (name: string) => WebGLUniformLocation | null };

function makeProgram(gl: WebGL2RenderingContext, fragment: string): Program {
  const make = (type: number, source: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.warn("HoverWater shader:", gl.getShaderInfoLog(s));
    return s;
  };
  const vs = make(gl.VERTEX_SHADER, VERTEX);
  const fs = make(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "a_pos");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
    return cache.get(name) ?? null;
  };
  return { program, u };
}

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Pair = { read: Target; write: Target; swap: () => void };

export function HoverWater({
  src = DEFAULT_IMAGE,
  mediaType,
  alt = "",
  curl = 40,
  pressureIterations = 50,
  pressureDissipation = 0,
  velocityDissipation = 0.99,
  dyeDissipation = 0.985,
  splatRadius = 3,
  splatForce = 1,
  distortion = 1,
  chromaticAmount = 1,
  highlight = 2,
  fit = "cover",
  background = "#000000",
  className,
  style,
  ...rest
}: HoverWaterProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const video = mediaType ? mediaType === "video" : isVideo(src);
  const live = {
    curl,
    pressureIterations,
    pressureDissipation,
    velocityDissipation,
    dyeDissipation,
    splatRadius,
    splatForce,
    distortion,
    chromaticAmount,
    highlight,
    fit,
    background,
  };
  // Read by the render loop, so changing a prop never rebuilds the GL context.
  const params = useRef(live);
  params.current = live;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // A fresh canvas per effect run: the context is released on cleanup, and a released context
    // cannot be revived on the same element (React re-runs effects in development).
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "absolute inset-0 block h-full w-full";
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    // Half-float render targets: EXT_color_buffer_float, else EXT_color_buffer_half_float.
    // Without either the solver cannot run; the CSS background then shows the plain media.
    const halfFloat =
      !!gl.getExtension("EXT_color_buffer_float") ||
      !!gl.getExtension("EXT_color_buffer_half_float");
    if (!halfFloat) return;
    box.appendChild(canvas);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const progs = {
      splat: makeProgram(gl, SPLAT),
      advect: makeProgram(gl, ADVECT),
      curl: makeProgram(gl, CURL),
      vorticity: makeProgram(gl, VORTICITY),
      divergence: makeProgram(gl, DIVERGENCE),
      scale: makeProgram(gl, SCALE),
      pressure: makeProgram(gl, PRESSURE),
      gradient: makeProgram(gl, GRADIENT_SUBTRACT),
      display: makeProgram(gl, DISPLAY),
    };

    const targets: Target[] = [];
    const makeTarget = (w: number, h: number, internal: number, format: number): Target => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const t = { tex, fbo, w, h };
      targets.push(t);
      return t;
    };
    const makePair = (w: number, h: number, internal: number, format: number): Pair => {
      const pair = {
        read: makeTarget(w, h, internal, format),
        write: makeTarget(w, h, internal, format),
        swap() {
          const r = pair.read;
          pair.read = pair.write;
          pair.write = r;
        },
      };
      return pair;
    };
    const freeTargets = () => {
      targets.splice(0).forEach((t) => {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      });
    };

    let fields: {
      velocity: Pair;
      dye: Pair;
      pressure: Pair;
      divergence: Target;
      curl: Target;
    } | null = null;
    const gridSize = (max: number) => {
      const aspect = canvas.width / canvas.height;
      return aspect >= 1
        ? { w: max, h: Math.max(2, Math.round(max / aspect)) }
        : { w: Math.max(2, Math.round(max * aspect)), h: max };
    };
    const buildFields = () => {
      freeTargets();
      const v = gridSize(VELOCITY_RES);
      const cssMax = Math.max(box.clientWidth, box.clientHeight);
      const d = gridSize(Math.min(DYE_RES, Math.max(64, Math.round(cssMax * 0.75))));
      fields = {
        velocity: makePair(v.w, v.h, gl.RG16F, gl.RG),
        dye: makePair(d.w, d.h, gl.RGBA16F, gl.RGBA),
        pressure: makePair(v.w, v.h, gl.R16F, gl.RED),
        divergence: makeTarget(v.w, v.h, gl.R16F, gl.RED),
        curl: makeTarget(v.w, v.h, gl.R16F, gl.RED),
      };
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    // Media texture.
    const mediaTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, mediaTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    let mediaW = 0;
    let mediaH = 0;
    let ready = false;
    let disposed = false;
    let videoEl: HTMLVideoElement | null = null;
    const upload = (source: TexImageSource) => {
      gl.bindTexture(gl.TEXTURE_2D, mediaTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    };
    if (video) {
      videoEl = document.createElement("video");
      videoEl.crossOrigin = "anonymous";
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.preload = "auto";
      videoEl.src = src;
      videoEl.addEventListener("loadeddata", () => {
        if (disposed || !videoEl) return;
        mediaW = videoEl.videoWidth;
        mediaH = videoEl.videoHeight;
        upload(videoEl);
        ready = true;
        kick();
      });
      void videoEl.play().catch(() => {});
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        if (disposed) return;
        mediaW = img.naturalWidth;
        mediaH = img.naturalHeight;
        upload(img);
        ready = true;
        kick();
      };
      img.src = src;
    }

    let cssW = 1;
    let cssH = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(1, box.clientWidth);
      cssH = Math.max(1, box.clientHeight);
      const w = Math.round(cssW * dpr);
      const h = Math.round(cssH * dpr);
      if (w === canvas.width && h === canvas.height && fields) return;
      canvas.width = w;
      canvas.height = h;
      buildFields();
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(box);

    // Pointer: positions in uv (y up); splats are queued as segments so a fast stroke is not
    // a dotted line.
    type Splat = { x: number; y: number; dx: number; dy: number };
    const queue: Splat[] = [];
    const pointer = { x: 0, y: 0, inside: false };
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      if (pointer.inside) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        // Spread long moves over several splats at most ~a radius apart.
        const stepUv = Math.max(0.004, (params.current.splatRadius / 100) * 0.6);
        const len = Math.hypot(dx * (r.width / r.height), dy);
        const n = Math.min(12, Math.max(1, Math.ceil(len / stepUv)));
        for (let i = 1; i <= n; i++) {
          queue.push({
            x: pointer.x + (dx * i) / n,
            y: pointer.y + (dy * i) / n,
            dx: dx / n,
            dy: dy / n,
          });
        }
      }
      pointer.x = x;
      pointer.y = y;
      pointer.inside = true;
      kick();
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    // A lifted finger stops stirring; a mouse keeps hovering.
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerdown", onMove);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointercancel", onLeave);
    box.addEventListener("pointerup", onUp);

    const bindTex = (unit: number, t: Target) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      return unit;
    };
    const run = (p: Program, out: Target | null, set: (p: Program) => void) => {
      gl.useProgram(p.program);
      if (out) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, out.fbo);
        gl.viewport(0, 0, out.w, out.h);
        gl.uniform2f(p.u("u_texel"), 1 / out.w, 1 / out.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      set(p);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const splat = (s: Splat, dt: number) => {
      if (!fields) return;
      const p = params.current;
      const f = fields;
      const aspect = cssW / cssH;
      const radius = Math.max(0.002, (p.splatRadius / 100) * 1.6) * (aspect < 1 ? aspect : 1);
      // Pointer velocity in velocity-grid cells per second.
      const vx = (s.dx * f.velocity.read.w) / dt;
      const vy = (s.dy * f.velocity.read.h) / dt;
      const force = 0.35 * p.splatForce;
      run(progs.splat, f.velocity.write, (q) => {
        gl.uniform1i(q.u("u_target"), bindTex(0, f.velocity.read));
        gl.uniform2f(q.u("u_point"), s.x, s.y);
        gl.uniform3f(q.u("u_value"), vx * force, vy * force, 0);
        gl.uniform1f(q.u("u_radius"), radius);
        gl.uniform1f(q.u("u_aspect"), aspect);
        gl.uniform1f(q.u("u_chop"), 0);
        gl.uniform2f(q.u("u_seed"), 0, 0);
      });
      f.velocity.swap();
      // Dye: displacement along the stroke, in uv, plus intensity for the glints.
      const speed = Math.hypot(s.dx * aspect, s.dy);
      const push = 1.6 * p.splatForce;
      run(progs.splat, f.dye.write, (q) => {
        gl.uniform1i(q.u("u_target"), bindTex(0, f.dye.read));
        gl.uniform2f(q.u("u_point"), s.x, s.y);
        gl.uniform3f(q.u("u_value"), s.dx * push, s.dy * push, Math.min(1, speed * 25));
        gl.uniform1f(q.u("u_radius"), radius * 0.9);
        gl.uniform1f(q.u("u_aspect"), aspect);
        gl.uniform1f(q.u("u_chop"), 1);
        gl.uniform2f(q.u("u_seed"), Math.random() * 50, Math.random() * 50);
      });
      f.dye.swap();
    };

    const step = (dt: number) => {
      if (!fields) return;
      const p = params.current;
      const f = fields;
      const vt = f.velocity.read;
      run(progs.curl, f.curl, (q) => {
        gl.uniform1i(q.u("u_velocity"), bindTex(0, f.velocity.read));
      });
      run(progs.vorticity, f.velocity.write, (q) => {
        gl.uniform1i(q.u("u_velocity"), bindTex(0, f.velocity.read));
        gl.uniform1i(q.u("u_curl"), bindTex(1, f.curl));
        gl.uniform1f(q.u("u_curlStrength"), p.curl);
        gl.uniform1f(q.u("u_dt"), dt);
      });
      f.velocity.swap();
      run(progs.divergence, f.divergence, (q) => {
        gl.uniform1i(q.u("u_velocity"), bindTex(0, f.velocity.read));
      });
      run(progs.scale, f.pressure.write, (q) => {
        gl.uniform1i(q.u("u_source"), bindTex(0, f.pressure.read));
        gl.uniform1f(q.u("u_value"), Math.min(1, Math.max(0, p.pressureDissipation)));
      });
      f.pressure.swap();
      const iterations = Math.max(1, Math.min(120, Math.round(p.pressureIterations)));
      for (let i = 0; i < iterations; i++) {
        run(progs.pressure, f.pressure.write, (q) => {
          gl.uniform1i(q.u("u_pressure"), bindTex(0, f.pressure.read));
          gl.uniform1i(q.u("u_divergence"), bindTex(1, f.divergence));
        });
        f.pressure.swap();
      }
      run(progs.gradient, f.velocity.write, (q) => {
        gl.uniform1i(q.u("u_pressure"), bindTex(0, f.pressure.read));
        gl.uniform1i(q.u("u_velocity"), bindTex(1, f.velocity.read));
      });
      f.velocity.swap();
      // Dissipation is given per 60 fps frame; convert to this frame's dt.
      const frames = dt * 60;
      run(progs.advect, f.velocity.write, (q) => {
        gl.uniform1i(q.u("u_velocity"), bindTex(0, f.velocity.read));
        gl.uniform1i(q.u("u_source"), bindTex(1, f.velocity.read));
        gl.uniform2f(q.u("u_velTexel"), 1 / vt.w, 1 / vt.h);
        gl.uniform1f(q.u("u_dt"), dt);
        gl.uniform1f(q.u("u_keep"), Math.pow(Math.min(1, p.velocityDissipation), frames));
      });
      f.velocity.swap();
      run(progs.advect, f.dye.write, (q) => {
        gl.uniform1i(q.u("u_velocity"), bindTex(0, f.velocity.read));
        gl.uniform1i(q.u("u_source"), bindTex(1, f.dye.read));
        gl.uniform2f(q.u("u_velTexel"), 1 / vt.w, 1 / vt.h);
        gl.uniform1f(q.u("u_dt"), dt);
        gl.uniform1f(q.u("u_keep"), Math.pow(Math.min(1, p.dyeDissipation), frames));
      });
      f.dye.swap();
    };

    const render = () => {
      if (!fields) return;
      const p = params.current;
      const f = fields;
      if (videoEl && ready && videoEl.readyState >= 2) upload(videoEl);
      // Fit: scale the uv so the media covers (or fits inside) the box.
      const boxAspect = canvas.width / canvas.height;
      const mediaAspect = mediaW && mediaH ? mediaW / mediaH : boxAspect;
      const r = boxAspect / mediaAspect;
      const cover = p.fit === "cover";
      run(progs.display, null, (q) => {
        gl.uniform2f(q.u("u_texel"), 1 / f.dye.read.w, 1 / f.dye.read.h);
        gl.uniform1i(q.u("u_dye"), bindTex(0, f.dye.read));
        gl.uniform1i(q.u("u_velocity"), bindTex(1, f.velocity.read));
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, mediaTex);
        gl.uniform1i(q.u("u_media"), 2);
        gl.uniform2f(
          q.u("u_mediaScale"),
          cover ? Math.min(1, r) : Math.max(1, r),
          cover ? Math.min(1, 1 / r) : Math.max(1, 1 / r),
        );
        gl.uniform1f(q.u("u_distortion"), p.distortion);
        gl.uniform1f(q.u("u_chroma"), p.chromaticAmount);
        gl.uniform1f(q.u("u_highlight"), p.highlight);
        gl.uniform3f(q.u("u_bg"), ...hexToRgb(p.background));
        gl.uniform1f(q.u("u_ready"), ready ? 1 : 0);
      });
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let quietSeconds = 0;

    const loop = (now: number) => {
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000 || 1 / 60));
      last = now;
      const stirred = queue.length > 0 && !reduced.matches;
      if (reduced.matches) queue.length = 0;
      for (const s of queue.splice(0)) splat(s, dt);
      step(dt);
      render();
      quietSeconds = stirred ? 0 : quietSeconds + dt;
      // A still image lets the loop sleep once the wake has faded (dye below ~1e-3 of a splat).
      const p = params.current;
      const keep = Math.min(0.999, Math.max(0.5, p.dyeDissipation));
      const fade = Math.log(1e-3) / Math.log(keep) / 60;
      if (!videoEl && quietSeconds > fade) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    function kick() {
      if (disposed) return;
      if (running || !visible || document.hidden) {
        if (!running) render();
        return;
      }
      running = true;
      quietSeconds = 0;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (!visible) {
        stop();
        videoEl?.pause();
      } else {
        void videoEl?.play().catch(() => {});
        kick();
      }
    });
    io.observe(box);
    const onVisibility = () => (document.hidden ? stop() : kick());
    document.addEventListener("visibilitychange", onVisibility);
    kick();

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerdown", onMove);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointercancel", onLeave);
      box.removeEventListener("pointerup", onUp);
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute("src");
        videoEl.load();
      }
      freeTargets();
      gl.deleteTexture(mediaTex);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      Object.values(progs).forEach((p) => gl.deleteProgram(p.program));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [src, video]);

  return (
    <div
      ref={boxRef}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        // The plain media shows until the GL canvas has its first frame (and without WebGL2).
        background: video ? background : `${background} url("${src}") center / ${fit} no-repeat`,
        ...style,
      }}
      {...rest}
    />
  );
}

export default HoverWater;
