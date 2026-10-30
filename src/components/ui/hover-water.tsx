import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Hover Water: an image or a background video becomes a water surface. The pointer (mouse or
 * finger) drags through it and leaves physics-based ripples that refract the picture, split its
 * colours at the wave fronts and catch a specular glint.
 *
 * Our own WebGL implementation:
 * - a height field simulated on two ping-pong float framebuffers (discrete wave equation:
 *   next = (sum of 4 neighbours / 2 - previous) * damping), two sub-steps per frame;
 * - the pointer is splatted as a capsule from its previous to its current position, so fast
 *   strokes leave a continuous wake rather than a dotted line;
 * - the display pass turns the height gradient into a surface normal, offsets the media lookup
 *   by it (refraction), reads red, green and blue at different offsets (chromatic aberration) and
 *   adds a highlight where the surface faces the light.
 */
export interface HoverWaterProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Image or video URL shown under the water. */
  src?: string;
  /** "image" or "video". Inferred from the file extension when left out. */
  mediaType?: "image" | "video";
  /** Accessible description of the media. Empty string marks it decorative. */
  alt?: string;
  /** How far the cursor pushes the surface (0 to 2). */
  rippleStrength?: number;
  /** Radius of the cursor's splash, in CSS pixels. */
  rippleSize?: number;
  /** How long ripples live: 0.9 dies fast, 0.995 rings for seconds. */
  damping?: number;
  /** How strongly waves bend the picture (0 to 2). */
  refraction?: number;
  /** Colour split at the wave fronts (0 to 2). */
  chromaticAmount?: number;
  /** Specular glint on the wave crests (0 to 2). */
  highlight?: number;
  /** Media fit inside the box. */
  fit?: "cover" | "contain";
  /** Colour behind the media (shows with `fit="contain"` and while loading). */
  background?: string;
}

/** Demo media of the original preview (Framer's own sample assets). */
const DEFAULT_IMAGE =
  "https://framerusercontent.com/images/2exoQxYNf3YECaAWoYDz4CfJQPI.png?scale-down-to=2048";

/** The simulation runs at a fraction of the CSS size: waves look the same and cost a quarter. */
const SIM_SCALE = 0.6;
const SIM_MAX = 800;

const VERTEX = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** Wave step plus pointer splat. r = height now, g = height one step ago. */
const SIM = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_state;
uniform vec2 u_texel;
uniform float u_damping;
uniform vec2 u_from;      // splat capsule in sim pixels
uniform vec2 u_to;
uniform float u_radius;   // sim pixels
uniform float u_amount;   // 0 when the pointer is away
uniform vec2 u_seed;      // changes every frame: the chop pattern never repeats

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec4 s = texture(u_state, v_uv);
  float sum = texture(u_state, v_uv + vec2(u_texel.x, 0.0)).r
            + texture(u_state, v_uv - vec2(u_texel.x, 0.0)).r
            + texture(u_state, v_uv + vec2(0.0, u_texel.y)).r
            + texture(u_state, v_uv - vec2(0.0, u_texel.y)).r;
  float next = (sum * 0.5 - s.g) * u_damping;

  if (u_amount > 0.0) {
    vec2 px = v_uv / u_texel;
    vec2 seg = u_to - u_from;
    float h = clamp(dot(px - u_from, seg) / max(dot(seg, seg), 1e-4), 0.0, 1.0);
    float d = length(px - u_from - seg * h) / u_radius;
    // Dome pushed down (the cursor presses the water), broken up by a moving cell noise so the
    // wake is choppy like a hand dragged through water, not one smooth trough.
    float dome = (1.0 - smoothstep(0.0, 1.0, d));
    vec2 c = px * (1.6 / u_radius) + u_seed;
    float chop = hash(floor(c)) * 0.9 + 0.55 * hash(floor(c * 2.3 + 7.1));
    next -= u_amount * dome * dome * (0.35 + chop);
  }
  o = vec4(clamp(next, -4.0, 4.0), s.r, 0.0, 1.0);
}`;

const DISPLAY = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_state;
uniform sampler2D u_media;
uniform vec2 u_texel;
uniform vec2 u_mediaScale;  // fit: media uv = (uv - 0.5) * scale + 0.5
uniform float u_refraction;
uniform float u_chroma;
uniform float u_highlight;
uniform vec3 u_bg;
uniform float u_ready;

vec3 media(vec2 uv) {
  vec2 m = (uv - 0.5) * u_mediaScale + 0.5;
  if (m.x < 0.0 || m.y < 0.0 || m.x > 1.0 || m.y > 1.0 || u_ready < 0.5) return u_bg;
  return texture(u_media, vec2(m.x, 1.0 - m.y)).rgb;
}

void main() {
  float hl = texture(u_state, v_uv - vec2(u_texel.x, 0.0)).r;
  float hr = texture(u_state, v_uv + vec2(u_texel.x, 0.0)).r;
  float hd = texture(u_state, v_uv - vec2(0.0, u_texel.y)).r;
  float hu = texture(u_state, v_uv + vec2(0.0, u_texel.y)).r;
  vec2 grad = vec2(hr - hl, hu - hd);

  // Refraction: look through the tilted surface. Offset in uv, roughly 3% of the frame per unit
  // of slope at refraction 1.
  vec2 off = grad * 0.03 * u_refraction;
  // Chromatic aberration: red bends least, blue most, like light through water.
  float c = u_chroma * 0.35;
  vec3 col;
  col.r = media(v_uv + off * (1.0 - c)).r;
  col.g = media(v_uv + off).g;
  col.b = media(v_uv + off * (1.0 + c)).b;

  // Specular glint: surface normal against a light from the top left.
  vec3 n = normalize(vec3(-grad * 2.2, 1.0));
  vec3 l = normalize(vec3(-0.45, 0.6, 1.0));
  vec3 hv = normalize(l + vec3(0.0, 0.0, 1.0));
  float slope = length(grad);
  float spec = pow(max(dot(n, hv), 0.0), 36.0) * smoothstep(0.03, 0.3, slope);
  // Glancing light on steep crests: thin white crinkles that read even over black media.
  float sheen = smoothstep(0.25, 1.2, slope) * 0.35;
  col += (spec * 0.8 + sheen) * u_highlight;
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

function program(gl: WebGL2RenderingContext, fragment: string) {
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
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, "a_pos");
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return p;
}

export function HoverWater({
  src = DEFAULT_IMAGE,
  mediaType,
  alt = "",
  rippleStrength = 1,
  rippleSize = 22,
  damping = 0.985,
  refraction = 1,
  chromaticAmount = 1,
  highlight = 1,
  fit = "cover",
  background = "#000000",
  className,
  style,
  ...rest
}: HoverWaterProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const video = mediaType ? mediaType === "video" : isVideo(src);
  const params = useRef({
    rippleStrength,
    rippleSize,
    damping,
    refraction,
    chromaticAmount,
    highlight,
    fit,
    background,
  });
  params.current = {
    rippleStrength,
    rippleSize,
    damping,
    refraction,
    chromaticAmount,
    highlight,
    fit,
    background,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    // Float render targets are needed for a stable wave equation; without them, show the media
    // plainly (the <noscript>-like fallback below is the CSS background).
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return;
    const linearFloat = !!gl.getExtension("OES_texture_float_linear");

    const simProg = program(gl, SIM);
    const dispProg = program(gl, DISPLAY);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const su = (n: string) => gl.getUniformLocation(simProg, n);
    const du = (n: string) => gl.getUniformLocation(dispProg, n);
    const simLoc = {
      state: su("u_state"),
      texel: su("u_texel"),
      damping: su("u_damping"),
      from: su("u_from"),
      to: su("u_to"),
      radius: su("u_radius"),
      amount: su("u_amount"),
      seed: su("u_seed"),
    };
    const dispLoc = {
      state: du("u_state"),
      media: du("u_media"),
      texel: du("u_texel"),
      mediaScale: du("u_mediaScale"),
      refraction: du("u_refraction"),
      chroma: du("u_chroma"),
      highlight: du("u_highlight"),
      bg: du("u_bg"),
      ready: du("u_ready"),
    };

    // Ping-pong height field.
    type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer };
    let targets: Target[] = [];
    let simW = 0;
    let simH = 0;
    let cssToSim = SIM_SCALE;
    const makeTargets = (w: number, h: number) => {
      targets.forEach((t) => {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      });
      targets = [0, 1].map(() => {
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
        const filter = linearFloat ? gl.LINEAR : gl.NEAREST;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return { tex, fbo };
      });
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

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, box.clientWidth);
      const ch = Math.max(1, box.clientHeight);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      cssToSim = Math.min(SIM_SCALE, SIM_MAX / Math.max(cw, ch));
      const w = Math.max(2, Math.round(cw * cssToSim));
      const h = Math.max(2, Math.round(ch * cssToSim));
      if (w !== simW || h !== simH) {
        simW = w;
        simH = h;
        makeTargets(w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(box);

    // Pointer in sim pixels (y up). `prev` gives the capsule start for this frame's splat.
    const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false, moved: false };
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) * cssToSim;
      const y = (r.height - (e.clientY - r.top)) * cssToSim;
      if (!pointer.inside) {
        pointer.px = x;
        pointer.py = y;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.inside = true;
      pointer.moved = true;
      kick();
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerdown", onMove);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointercancel", onLeave);
    // A lifted finger stops stirring; a mouse keeps hovering.
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };
    box.addEventListener("pointerup", onUp);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;
    let visible = true;
    let quiet = 0; // frames without input; the loop sleeps once the water has settled
    let current = 0;

    const step = () => {
      const p = params.current;
      gl.useProgram(simProg);
      gl.viewport(0, 0, simW, simH);
      gl.uniform2f(simLoc.texel, 1 / simW, 1 / simH);
      gl.uniform1f(simLoc.damping, Math.min(0.999, Math.max(0.5, p.damping)));
      gl.uniform1f(simLoc.radius, Math.max(1.5, p.rippleSize * cssToSim));
      gl.uniform1i(simLoc.state, 0);
      // Two sub-steps per frame: waves travel two sim pixels per frame. The splat is spread over
      // both halves of the stroke.
      const splat = pointer.inside && pointer.moved && !reduced.matches;
      for (let i = 0; i < 2; i++) {
        const a = i / 2;
        const b = (i + 1) / 2;
        gl.uniform2f(
          simLoc.from,
          pointer.px + (pointer.x - pointer.px) * a,
          pointer.py + (pointer.y - pointer.py) * a,
        );
        gl.uniform2f(
          simLoc.to,
          pointer.px + (pointer.x - pointer.px) * b,
          pointer.py + (pointer.y - pointer.py) * b,
        );
        gl.uniform1f(simLoc.amount, splat ? 0.45 * p.rippleStrength : 0);
        gl.uniform2f(simLoc.seed, Math.random() * 97, Math.random() * 97);
        const src = targets[current];
        const dst = targets[1 - current];
        if (!src || !dst) break;
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src.tex);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        current = 1 - current;
      }
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.moved = false;
      return splat;
    };

    const render = () => {
      const p = params.current;
      const state = targets[current];
      if (!state) return;
      if (videoEl && ready && videoEl.readyState >= 2) upload(videoEl);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(dispProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, state.tex);
      gl.uniform1i(dispLoc.state, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, mediaTex);
      gl.uniform1i(dispLoc.media, 1);
      gl.uniform2f(dispLoc.texel, 1 / simW, 1 / simH);
      // Fit: scale the uv so the media covers (or fits inside) the box.
      const boxAspect = canvas.width / canvas.height;
      const mediaAspect = mediaW && mediaH ? mediaW / mediaH : boxAspect;
      const r = boxAspect / mediaAspect;
      const cover = p.fit === "cover";
      const sx = cover ? Math.min(1, r) : Math.max(1, r);
      const sy = cover ? Math.min(1, 1 / r) : Math.max(1, 1 / r);
      gl.uniform2f(dispLoc.mediaScale, sx, sy);
      gl.uniform1f(dispLoc.refraction, p.refraction);
      gl.uniform1f(dispLoc.chroma, p.chromaticAmount);
      gl.uniform1f(dispLoc.highlight, p.highlight);
      gl.uniform3f(dispLoc.bg, ...hexToRgb(p.background));
      gl.uniform1f(dispLoc.ready, ready ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      const touched = step();
      render();
      quiet = touched ? 0 : quiet + 1;
      // A video keeps the loop alive; a still image lets it sleep once ripples have died out
      // (damping^frames below ~1e-3).
      const settle = Math.ceil(
        Math.log(1e-3) / Math.log(Math.min(0.999, params.current.damping)) / 2,
      );
      if (!videoEl && quiet > settle) {
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
      quiet = 0;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (!visible) {
        running = false;
        cancelAnimationFrame(raf);
        videoEl?.pause();
      } else {
        void videoEl?.play().catch(() => {});
        kick();
      }
    });
    io.observe(box);
    const onVisibility = () =>
      document.hidden ? (cancelAnimationFrame(raf), (running = false)) : kick();
    document.addEventListener("visibilitychange", onVisibility);
    kick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
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
      targets.forEach((t) => {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      });
      gl.deleteTexture(mediaTex);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(simProg);
      gl.deleteProgram(dispProg);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
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
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" />
    </div>
  );
}

export default HoverWater;
