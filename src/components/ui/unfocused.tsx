/*
 * Unfocused: an image or video seen through a directional, progressive lens blur with chromatic
 * dispersion and film grain. The blur is strongest at an origin point and fades out along an
 * angle, so one side of the picture is soft and colour-split while the other stays sharp.
 *
 * Our own WebGL implementation (no OGL, no dependency). The blur algorithm follows
 * "Unfocused+" by Jayzhushi (Reveals.cool, x.com/jayzhushi), licensed under the BSD License:
 * 24 jittered samples on a disc whose radius follows the falloff curve, red and blue channels
 * sampled with an offset across the blur direction, and static luminance-weighted noise.
 */
import { animate, useInView, useReducedMotion, useScroll } from "framer-motion";
import type { Transition } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Default image of the original ("arch_dark" placeholder). */
const DEFAULT_IMAGE = {
  src: "https://framerusercontent.com/images/kW9tNTLiYRYp7LGxfxbuywTR4I.jpg",
  alt: "A white sphere suspended among curved black metallic ribbons.",
};
const DEFAULT_VIDEO = "https://framerusercontent.com/assets/Jhocnrz23GM4PK1CT7mBiwAu5U.mp4";

export type UnfocusedFalloffType = "linear" | "quadratic" | "cubic" | "square";
export type UnfocusedNoiseBlend = "none" | "lighter" | "darker" | "both";

export interface UnfocusedAdvanced {
  /** Shape of the fade from blurred to sharp. "linear" is a smoothstep, as in the original. */
  falloffType?: UnfocusedFalloffType;
  /** Where the blur is strongest, 0–1 from the left. */
  originX?: number;
  /** Where the blur is strongest, 0–1 from the bottom. */
  originY?: number;
  /** Radial lens distortion, -1 (pinch) … 1 (bulge). */
  scale?: number;
  /** Red/blue split across the blur direction, scaled by the blur. */
  dispersion?: number;
  /** Grain amount, 0–1. */
  noise?: number;
  /** Which tones the grain shows on. */
  noiseBlend?: UnfocusedNoiseBlend;
}

/** Values the effect animates to when `animation.custom` is used. */
export interface UnfocusedCustomTarget {
  blur?: number;
  angle?: number;
  falloff?: number;
  scale?: number;
  dispersion?: number;
  noise?: number;
}

export interface UnfocusedAnimation {
  /**
   * "appear": blurred on mount, then resolves.
   * "enter": resolves when it scrolls into view (and blurs again when it leaves if `replay`).
   * "transform": scroll-linked: blurred when entering, sharp as it passes the viewport line.
   * "variant": prop changes animate with `transition` instead of jumping.
   * "disable": the effect holds as set, with no animation.
   */
  type?: "disable" | "appear" | "enter" | "transform" | "variant";
  /** "enter" only: play again every time it re-enters. */
  replay?: boolean;
  /** "enter" only: how much must be visible, 0 (any pixel) … 1 (all). */
  amount?: number;
  /** "transform" only: which part of the viewport drives the progress. */
  viewport?: "top" | "center" | "bottom";
  /**
   * With `enable`, animate from the base values to these targets instead of animating the blur
   * amount down to zero.
   */
  custom?: UnfocusedCustomTarget & { enable?: boolean };
}

export interface UnfocusedProps extends Omit<React.ComponentProps<"div">, "onLoad" | "onError"> {
  media?: "image" | "video";
  /** Image source (image media). */
  image?: string;
  alt?: string;
  /** Video source (video media). */
  video?: string;
  loop?: boolean;
  fit?: "cover" | "contain";
  /** Blur strength in media pixels at the origin (0–1000). */
  blur?: number;
  /** Direction the blur fades out towards, in degrees (0 = to the right, 90 = up). */
  angle?: number;
  /** 0: uniform blur, 1: full fade from origin to sharp. */
  falloff?: number;
  advanced?: UnfocusedAdvanced;
  animation?: UnfocusedAnimation;
  /** Timing of every animation (framer-motion transition). */
  transition?: Transition;
  /** Accessible label for the rendered canvas (defaults to `alt` for images). */
  ariaLabel?: string;
  /** Render a plain <img>/<video> without the effect. */
  compatibility?: boolean;
  /**
   * Show the plain media when the visitor prefers reduced motion. The original defaults to
   * ignoring the preference; ours respects it unless this is set to false.
   */
  respectReducedMotion?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  onVideoEnd?: () => void;
  onAnimationComplete?: () => void;
}

const FALLOFF_TYPES: Record<UnfocusedFalloffType, number> = {
  linear: 0,
  quadratic: 1,
  cubic: 2,
  square: 3,
};
const NOISE_BLENDS: Record<UnfocusedNoiseBlend, number> = {
  none: 0,
  lighter: 1,
  darker: 2,
  both: 3,
};

const ADVANCED_DEFAULTS: Required<UnfocusedAdvanced> = {
  falloffType: "linear",
  originX: 0,
  originY: 0.5,
  scale: 0,
  dispersion: 0.2,
  noise: 1,
  noiseBlend: "none",
};
const CUSTOM_DEFAULTS: Required<UnfocusedCustomTarget> & { enable: boolean } = {
  enable: false,
  blur: 40,
  angle: 0,
  falloff: 1,
  scale: 0,
  dispersion: 0.2,
  noise: 1,
};
const DEFAULT_TRANSITION: Transition = { ease: "linear", duration: 2 };

const VERTEX = `
attribute vec2 aPosition;
uniform vec2 uMediaSize;
uniform vec2 uPanelSize;
uniform vec2 uPlaneScale;
uniform int uFitMode;
varying vec2 vUv;
varying vec2 vTextureCoord;
void main() {
  vec2 uv = aPosition * 0.5 + 0.5;
  vUv = uv;
  if (uFitMode == 1) {
    // Cover: crop the texture to the panel's aspect.
    vec2 ratio = vec2(
      min((uPanelSize.x / uPanelSize.y) / (uMediaSize.x / uMediaSize.y), 1.0),
      min((uPanelSize.y / uPanelSize.x) / (uMediaSize.y / uMediaSize.x), 1.0)
    );
    vTextureCoord = (uv - 0.5) * ratio + 0.5;
  } else {
    vTextureCoord = uv;
  }
  gl_Position = vec4(aPosition * uPlaneScale, 0.0, 1.0);
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
uniform vec2 uMediaSize;
uniform vec2 uPanelSize;
uniform float uBlur;
uniform float uFalloff;
uniform float uFalloffType;
uniform float uAngle;
uniform float uDispersion;
uniform float uNoise;
uniform float uNoiseBlend;
uniform float uScale;
uniform vec2 uOrigin;
varying vec2 vUv;
varying vec2 vTextureCoord;

const float PI2 = 6.28318530718;
const int SAMPLES = 24;
const float INV_SAMPLES = 1.0 / 24.0;
const vec3 LUMA = vec3(0.299, 0.587, 0.114);
const float MAX_DIST = 0.70710678118;

float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 uv) { return rand(uv) * 2.0 - 1.0; }

vec2 radialScale(vec2 uv, float s) {
  vec2 d = uv - 0.5;
  float len = length(d);
  if (len < 0.001) return uv;
  return 0.5 + normalize(d) * pow(len * 1.41421356237, s) * MAX_DIST;
}

float falloffCurve(float t, int kind) {
  if (kind == 1) return t * t;
  if (kind == 2) return t * t * t;
  if (kind == 3) return sqrt(t);
  return smoothstep(0.0, 1.0, t);
}

float noiseLuminanceFactor(float lum, int mode) {
  if (mode == 0) return 1.0;
  float s = smoothstep(0.2, 0.8, lum);
  if (mode == 1) return 1.0 - s * s;
  if (mode == 2) return s * s;
  return max(pow(1.0 - abs(lum - 0.5) * 2.0, 1.5), 0.1);
}

void main() {
  if (uBlur <= 0.0) {
    gl_FragColor = texture2D(uTexture, vTextureCoord);
    return;
  }
  vec2 base = radialScale(vTextureCoord, 1.0 + uScale * 0.2);
  vec2 dir = vec2(cos(uAngle), sin(uAngle));
  // Distance from the origin along the blur direction; 0.7 of the panel fades fully to sharp.
  float along = clamp(max(dot(vUv - uOrigin, dir), 0.0) / 0.7, 0.0, 1.0);
  float reversed = 1.0 - falloffCurve(along, int(uFalloffType + 0.5));
  float f = clamp(uFalloff, 0.0, 1.0);
  float strength = mix(uBlur, reversed * uBlur, f);
  float dispersion = mix(uDispersion, reversed * uDispersion, f) * strength * 0.5;

  vec2 texel = 1.0 / uMediaSize;
  vec2 panelRatio = uPanelSize / uMediaSize;
  float radius = strength * max(texel.x, texel.y) * max(panelRatio.x, panelRatio.y) * 0.5;
  vec2 across = vec2(-sin(uAngle), cos(uAngle));
  vec2 redOffset = across * dispersion * texel * -0.7;
  vec2 blueOffset = across * dispersion * texel * 0.7;

  vec3 sum = vec3(0.0);
  float total = 0.0;
  bool grain = uNoise > 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float fi = float(i);
    float a = fi * INV_SAMPLES * PI2;
    float jitter = rand(vec2(fi, vUv.x + vUv.y)) * 0.5 + 0.5;
    if (grain) jitter += noise(vUv + vec2(fi * 0.1)) * uNoise * 0.3;
    jitter = clamp(jitter, 0.1, 1.0);
    vec2 offset = vec2(cos(a), sin(a)) * radius * jitter;
    float w = 1.0 - smoothstep(0.0, 1.0, length(offset) / radius);
    if (grain) w *= 1.0 + noise(vUv + vec2(fi * 0.05 + 13.7)) * uNoise * 0.2;
    w = max(w, 0.0);
    vec2 c = clamp(base + offset, 0.0, 1.0);
    vec4 g = texture2D(uTexture, c);
    vec4 r = texture2D(uTexture, clamp(c + redOffset, 0.0, 1.0));
    vec4 b = texture2D(uTexture, clamp(c + blueOffset, 0.0, 1.0));
    sum += vec3(r.r * r.a, g.g * g.a, b.b * b.a) * w;
    total += w;
  }
  vec4 fallback = texture2D(uTexture, base);
  vec3 color = total > 0.0 ? sum / total : fallback.rgb * fallback.a;

  if (grain) {
    float n = noise(vUv * 10.0 + vec2(31.4, 17.2));
    float lum = dot(color, LUMA);
    int mode = int(uNoiseBlend + 0.5);
    float amount = uNoise * noiseLuminanceFactor(lum, mode);
    if (mode == 3) {
      if (lum > 0.8) n = abs(n) * sign(n) * 0.3;
      else if (lum < 0.2) n *= 0.5;
    }
    color = clamp(color + vec3(n * amount * 0.1), 0.0, 1.0);
  }
  gl_FragColor = vec4(color, max(fallback.a, min(strength * 0.01, 1.0)));
}
`;

interface Uniforms {
  blur: number;
  angle: number;
  falloff: number;
  scale: number;
  dispersion: number;
  noise: number;
}

const UNIFORM_KEYS: (keyof Uniforms)[] = [
  "blur",
  "angle",
  "falloff",
  "scale",
  "dispersion",
  "noise",
];

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Unfocused shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

interface Renderer {
  setMedia: (source: TexImageSource, width: number, height: number, mipmaps: boolean) => void;
  render: (u: Uniforms) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

/** Minimal WebGL renderer: one textured quad and the blur program. */
function createRenderer(
  canvas: HTMLCanvasElement,
  statics: () => { fit: number; falloffType: number; noiseBlend: number; origin: [number, number] },
): Renderer | null {
  const options: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
  };
  const gl2 = canvas.getContext("webgl2", options);
  const gl = (gl2 ?? canvas.getContext("webgl", options)) as WebGLRenderingContext | null;
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

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const loc = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    mediaSize: loc("uMediaSize"),
    panelSize: loc("uPanelSize"),
    planeScale: loc("uPlaneScale"),
    fitMode: loc("uFitMode"),
    blur: loc("uBlur"),
    falloff: loc("uFalloff"),
    falloffType: loc("uFalloffType"),
    angle: loc("uAngle"),
    dispersion: loc("uDispersion"),
    noise: loc("uNoise"),
    noiseBlend: loc("uNoiseBlend"),
    scale: loc("uScale"),
    origin: loc("uOrigin"),
  };

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let media: { source: TexImageSource; width: number; height: number; mipmaps: boolean } | null =
    null;
  let panel = { width: 1, height: 1 };

  return {
    setMedia(source, width, height, mipmaps) {
      media = { source, width, height, mipmaps: mipmaps && !!gl2 };
    },
    resize(width, height) {
      panel = { width, height };
    },
    render(values) {
      if (!media) return;
      const s = statics();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media.source);
      if (media.mipmaps) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      }
      // Contain shrinks the plane to the media's aspect; cover fills the panel and crops in UV.
      let sx = 1;
      let sy = 1;
      if (s.fit === 0) {
        const mediaAspect = media.width / media.height;
        const panelAspect = panel.width / panel.height;
        if (mediaAspect > panelAspect) sy = panelAspect / mediaAspect;
        else sx = mediaAspect / panelAspect;
      }
      gl.uniform2f(u.mediaSize, media.width, media.height);
      gl.uniform2f(u.panelSize, panel.width, panel.height);
      gl.uniform2f(u.planeScale, sx, sy);
      gl.uniform1i(u.fitMode, s.fit);
      gl.uniform1f(u.blur, values.blur);
      gl.uniform1f(u.angle, (values.angle * Math.PI) / 180);
      gl.uniform1f(u.falloff, values.falloff);
      gl.uniform1f(u.falloffType, s.falloffType);
      gl.uniform1f(u.dispersion, values.dispersion);
      gl.uniform1f(u.noise, values.noise);
      gl.uniform1f(u.noiseBlend, s.noiseBlend);
      gl.uniform1f(u.scale, values.scale);
      gl.uniform2f(u.origin, s.origin[0], s.origin[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

const SCROLL_OFFSETS = {
  top: ["start start", "end start"],
  center: ["start center", "end center"],
  bottom: ["start end", "start start"],
} as const;

export function Unfocused({
  media = "image",
  image = DEFAULT_IMAGE.src,
  alt = DEFAULT_IMAGE.alt,
  video = DEFAULT_VIDEO,
  loop = true,
  fit = "cover",
  blur = 200,
  angle = 45,
  falloff = 1,
  advanced,
  animation,
  transition = DEFAULT_TRANSITION,
  ariaLabel,
  compatibility = false,
  respectReducedMotion = true,
  onLoad,
  onError,
  onVideoEnd,
  onAnimationComplete,
  className,
  style,
  ...rest
}: UnfocusedProps) {
  const adv = { ...ADVANCED_DEFAULTS, ...advanced };
  const anim = {
    type: "appear" as const,
    replay: true,
    amount: 0,
    viewport: "center" as const,
    ...animation,
  };
  const custom = { ...CUSTOM_DEFAULTS, ...animation?.custom };
  const reduceMotion = useReducedMotion();
  const plain = compatibility || (respectReducedMotion && !!reduceMotion);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [ready, setReady] = useState(false);
  const videoPlaying = useRef(false);
  const visible = useRef(true);
  const callbacks = useRef({ onLoad, onError, onVideoEnd, onAnimationComplete });
  callbacks.current = { onLoad, onError, onVideoEnd, onAnimationComplete };

  const base: Uniforms = useMemo(
    () => ({
      blur,
      angle,
      falloff,
      scale: adv.scale,
      dispersion: adv.dispersion,
      noise: adv.noise,
    }),
    [blur, angle, falloff, adv.scale, adv.dispersion, adv.noise],
  );
  const target: Uniforms = useMemo(
    () => ({
      blur: custom.blur,
      angle: custom.angle,
      falloff: custom.falloff,
      scale: custom.scale,
      dispersion: custom.dispersion,
      noise: custom.noise,
    }),
    [custom.blur, custom.angle, custom.falloff, custom.scale, custom.dispersion, custom.noise],
  );

  // Values that do not animate are read at draw time.
  const staticsRef = useRef({
    fit: 1,
    falloffType: 0,
    noiseBlend: 0,
    origin: [0, 0.5] as [number, number],
  });
  staticsRef.current = {
    fit: fit === "cover" ? 1 : 0,
    falloffType: FALLOFF_TYPES[adv.falloffType],
    noiseBlend: NOISE_BLENDS[adv.noiseBlend],
    origin: [adv.originX, adv.originY],
  };

  /**
   * Animation state. Without `custom`, a single progress value runs 1 → 0 and scales blur,
   * noise and distortion (so "appear" starts fully unfocused and resolves to the plain media).
   * With `custom`, each uniform runs from its base value to its custom target.
   */
  // 1 = fully unfocused (the props as given); "disable" holds it there without animating.
  const progress = useRef(1);
  const values = useRef<Uniforms>({ ...base });
  const uniformsNow = (): Uniforms => {
    if (anim.type === "variant" || custom.enable) return values.current;
    const p = progress.current;
    return { ...base, blur: base.blur * p, noise: base.noise * p, scale: base.scale * p };
  };

  const draw = () => {
    if (!rendererRef.current || !visible.current) return;
    rendererRef.current.render(uniformsNow());
  };
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // GL setup, resize and teardown.
  useEffect(() => {
    if (plain) return;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const renderer = createRenderer(canvas, () => staticsRef.current);
    if (!renderer) {
      callbacks.current.onError?.();
      return;
    }
    rendererRef.current = renderer;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = root;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      renderer.resize(w || 1, h || 1);
      drawRef.current();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry?.isIntersecting ?? true;
      if (visible.current) drawRef.current();
    });
    io.observe(root);
    return () => {
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
      rendererRef.current = null;
      setReady(false);
    };
  }, [plain]);

  // Media loading. Videos keep a rAF loop alive only while playing and on screen.
  useEffect(() => {
    if (plain) return;
    let cancelled = false;
    let raf = 0;
    if (media === "image") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        rendererRef.current?.setMedia(img, img.naturalWidth, img.naturalHeight, true);
        setReady(true);
        drawRef.current();
        callbacks.current.onLoad?.();
      };
      img.onerror = () => !cancelled && callbacks.current.onError?.();
      img.src = image;
      return () => {
        cancelled = true;
      };
    }
    const el = document.createElement("video");
    el.crossOrigin = "anonymous";
    el.muted = true;
    el.loop = loop;
    el.playsInline = true;
    el.autoplay = true;
    el.src = video;
    const tick = () => {
      drawRef.current();
      raf = videoPlaying.current ? requestAnimationFrame(tick) : 0;
    };
    const onData = () => {
      rendererRef.current?.setMedia(el, el.videoWidth, el.videoHeight, false);
      setReady(true);
      drawRef.current();
      callbacks.current.onLoad?.();
    };
    const onPlaying = () => {
      videoPlaying.current = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onStop = () => {
      videoPlaying.current = false;
    };
    const onEnded = () => {
      onStop();
      callbacks.current.onVideoEnd?.();
    };
    const onErr = () => callbacks.current.onError?.();
    el.addEventListener("loadeddata", onData, { once: true });
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onStop);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onErr);
    el.play().catch(() => {});
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      el.pause();
      el.removeAttribute("src");
      el.load();
      videoPlaying.current = false;
    };
  }, [plain, media, image, video, loop]);

  // Redraw on any prop that changes the picture.
  useEffect(() => {
    if (anim.type !== "variant" && custom.enable === false) values.current = { ...base };
    draw();
  });

  const isInView = useInView(rootRef, { once: !anim.replay, amount: anim.amount });
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: [...SCROLL_OFFSETS[anim.viewport]],
  });

  // Drive the animation. Every tween redraws on update and reports completion.
  useEffect(() => {
    if (plain || !ready) return;
    const done = () => callbacks.current.onAnimationComplete?.();
    const reduced = !!reduceMotion;

    if (anim.type === "variant") {
      const from = { ...values.current };
      const controls = animate(0, 1, {
        ...transition,
        onUpdate: (t) => {
          values.current = Object.fromEntries(
            UNIFORM_KEYS.map((k) => [k, from[k] + (base[k] - from[k]) * t]),
          ) as unknown as Uniforms;
          draw();
        },
        onComplete: done,
      });
      return () => controls.stop();
    }
    if (anim.type === "disable") {
      progress.current = 1;
      values.current = { ...base };
      draw();
      return;
    }
    if (anim.type === "transform") {
      // Scroll-linked: no tween, the scroll position is the timeline.
      const apply = (latest: number) => {
        const t = 1 - latest;
        progress.current = t;
        values.current = Object.fromEntries(
          UNIFORM_KEYS.map((k) => [k, base[k] + (target[k] - base[k]) * t]),
        ) as unknown as Uniforms;
        draw();
      };
      apply(scrollYProgress.get());
      return scrollYProgress.on("change", apply);
    }

    const resolved = anim.type === "appear" || isInView;
    if (custom.enable) {
      const goal = resolved ? target : base;
      const from = { ...values.current };
      const controls = animate(0, 1, {
        ...transition,
        ...(reduced ? { duration: 0 } : null),
        onUpdate: (t) => {
          values.current = Object.fromEntries(
            UNIFORM_KEYS.map((k) => [k, from[k] + (goal[k] - from[k]) * t]),
          ) as unknown as Uniforms;
          draw();
        },
        onComplete: done,
      });
      return () => controls.stop();
    }
    const controls = animate(progress.current, resolved ? 0 : 1, {
      ...transition,
      ...(reduced ? { duration: 0 } : null),
      onUpdate: (v) => {
        progress.current = v;
        draw();
      },
      onComplete: done,
    });
    return () => controls.stop();
    // base/target are compared by value through their memo deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plain, ready, anim.type, isInView, custom.enable, base, target, scrollYProgress]);

  const label = ariaLabel ?? (media === "image" ? alt : undefined);

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width: 600, height: 800, ...style }}
      {...rest}
    >
      {plain ? (
        media === "image" ? (
          <img
            src={image}
            alt={alt}
            className="block h-full w-full"
            style={{ objectFit: fit }}
            onLoad={onLoad}
            onError={onError}
          />
        ) : (
          <video
            src={video}
            autoPlay
            muted
            playsInline
            loop={loop}
            aria-label={ariaLabel}
            className="block h-full w-full"
            style={{ objectFit: fit }}
            onEnded={onVideoEnd}
          />
        )
      ) : (
        <canvas
          ref={canvasRef}
          role={media === "video" ? undefined : "img"}
          aria-label={label}
          className="block h-full w-full"
        />
      )}
    </div>
  );
}

export default Unfocused;
