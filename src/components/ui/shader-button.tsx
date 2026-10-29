import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Liquid gradient shader
 *
 * A turbulence-warped wave pattern mapped onto a colour palette. The palette is blended in OKLCH so
 * transitions between stops keep their brightness, then exposure/contrast/saturation are applied
 * and out-of-gamut colours are compressed back into sRGB. The original was a Framer "shader"; this
 * is a small WebGL2 host plus a re-implementation of the same maths (the repo's
 * `@paper-design/shaders` has no equivalent program, so it is not used here).
 * -----------------------------------------------------------------------------------------------*/

const VERTEX_SOURCE = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SOURCE = `#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_pixelRatio;
uniform vec3 u_colors[8];
uniform int u_colorCount;
uniform float u_seed;
uniform float u_speed;
uniform float u_scale;
uniform float u_amplitude;
uniform float u_frequency;
uniform int u_definition;
uniform float u_bands;
uniform float u_bias;
uniform float u_dither;
uniform float u_exposure;
uniform float u_contrast;
uniform float u_saturation;

const float TAU = 6.28318530718;
const float GOLDEN_ANGLE = 2.3999632;

// Integer hash (PCG family) used to turn the seed into a few stable pseudo-random offsets.
uvec3 hash3(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}

vec3 seedRandom(float s) {
  uvec3 bits = uvec3(floatBitsToUint(s), floatBitsToUint(s * 1.5 + 7.31), floatBitsToUint(s * 2.7 + 13.37));
  return vec3(hash3(bits)) / 4294967295.0;
}

// Colour space helpers: sRGB (gamma 2.2) <-> linear <-> OKLab/OKLCH.
vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(0.4545)); }

vec3 linearToOklab(vec3 c) {
  float l = pow(max(0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b, 0.0), 1.0 / 3.0);
  float m = pow(max(0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b, 0.0), 1.0 / 3.0);
  float s = pow(max(0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  );
}

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

// Blend two OKLab colours through hue (shortest way round); greys borrow the other colour's hue.
vec3 mixLch(vec3 a, vec3 b, float t) {
  vec3 lchA = vec3(a.x, length(a.yz), atan(a.z, a.y));
  vec3 lchB = vec3(b.x, length(b.yz), atan(b.z, b.y));
  if (lchA.y < 0.05) lchA.z = lchB.z;
  if (lchB.y < 0.05) lchB.z = lchA.z;
  float dh = lchB.z - lchA.z;
  if (dh > 3.14159265) dh -= TAU;
  if (dh < -3.14159265) dh += TAU;
  float L = mix(lchA.x, lchB.x, t);
  float C = mix(lchA.y, lchB.y, t);
  float h = lchA.z + dh * t;
  return vec3(L, C * cos(h), C * sin(h));
}

// Position t in [0,1] along the palette, as linear RGB.
vec3 samplePalette(float t) {
  if (u_colorCount < 2) return toLinear(u_colors[0]);
  float segments = float(u_colorCount - 1);
  float scaled = clamp(t, 0.0, 1.0) * segments;
  int index = min(int(floor(scaled)), u_colorCount - 2);
  float local = clamp(scaled - float(index), 0.0, 1.0);
  vec3 a = linearToOklab(toLinear(u_colors[index]));
  vec3 b = linearToOklab(toLinear(u_colors[index + 1]));
  return oklabToLinear(mixLch(a, b, local));
}

// Interleaved gradient noise: cheap, smooth-looking ordered dither.
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

// Compress chroma of out-of-gamut colours instead of hard clipping them.
vec3 softGamut(vec3 rgb) {
  if (min(rgb.r, min(rgb.g, rgb.b)) >= 0.0 && max(rgb.r, max(rgb.g, rgb.b)) <= 1.0) return rgb;
  vec3 lab = linearToOklab(max(rgb, 0.0));
  float L = clamp(lab.x, 0.0, 1.0);
  float C = length(lab.yz);
  float h = atan(lab.z, lab.y);
  float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));
  float knee = maxChroma * 0.7;
  if (C > knee) C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
  return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
}

void main() {
  vec2 fragCoord = v_uv * u_resolution;
  vec2 p = (fragCoord * 2.0 - u_resolution) / u_resolution.y;

  float time = u_time * 0.3 * u_speed;
  vec3 offsetA = seedRandom(u_seed);
  vec3 offsetB = seedRandom(u_seed + 100.0);
  vec2 phase = (offsetB.xy - 0.5) * TAU;

  // The seed also rotates the whole field.
  float angle = u_seed * GOLDEN_ANGLE;
  float cs = cos(angle);
  float sn = sin(angle);
  p = vec2(cs * p.x + sn * p.y, -sn * p.x + cs * p.y);

  float freq = max(u_frequency, 0.01);

  // Four warped layers; the two middle ones dominate (weights 0, 0.5, 1, 0.5).
  float total = 0.0;
  for (int i = 0; i < 4; i++) {
    float layer = float(i);
    float weight = layer == 0.0 ? 0.0 : (layer == 2.0 ? 1.0 : 0.5);
    vec2 q = p * u_scale;
    float a = phase.x;
    float d = phase.y;
    for (int j = 2; j < 13; j++) {
      if (j >= u_definition) break;
      float fj = float(j);
      q += u_amplitude * sin(q.yx * freq * fj + time + vec2(a, d) + offsetA.xy * fj) / fj;
      a += cos(fj + d * 1.2 + q.x * 2.0 - time + offsetB.z);
      d += sin(fj * q.y + a + offsetA.z + time + offsetB.y);
    }
    total += (0.5 + 0.5 * sin(length(q.yx + vec2(a, d) * 0.2) * u_bands + layer * layer + offsetA.x)) * weight;
  }

  float value = clamp((total / 2.0 - 0.3) / 0.4, 0.0, 1.0);
  value = pow(value, exp(-u_bias));
  value = clamp(value + (ign(floor(fragCoord / u_pixelRatio)) - 0.5) * u_dither, 0.0, 1.0);

  vec3 color = samplePalette(value) * u_exposure;
  vec3 lab = linearToOklab(color);
  float chroma = length(lab.yz) * u_saturation;
  float hue = atan(lab.z, lab.y);
  lab.x = clamp((lab.x - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  color = oklabToLinear(vec3(lab.x, chroma * cos(hue), chroma * sin(hue)));

  outColor = vec4(toSrgb(softGamut(color)), 1.0);
}`;

export interface LiquidGradientOptions {
  /** Palette stops from darkest to lightest, any CSS colour (2 to 8). */
  colors: string[];
  seed: number;
  /** Animation speed multiplier; 0 freezes the pattern. */
  speed: number;
  /** Zoom of the pattern; smaller is larger blobs. */
  scale: number;
  /** How far each turbulence step pushes the pattern. */
  amplitude: number;
  /** Turbulence frequency. */
  frequency: number;
  /** Turbulence iterations (3 to 10); more is more detailed. */
  definition: number;
  /** Number of colour bands. */
  bands: number;
  /** Shifts which palette end is favoured, -1 to 1. */
  bias?: number;
  /** Strength of the ordered dither that hides banding, 0 to 0.2. */
  dither?: number;
  exposure?: number;
  contrast?: number;
  saturation?: number;
}

/** Resolves any CSS colour to 0..1 sRGB components using the browser's own parser. */
function parseColor(color: string): [number, number, number] {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return [0, 0, 0];
  context.fillStyle = "#000";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Canvas that fills its (positioned) parent with the animated liquid gradient. Pauses while off
 * screen and renders a single still frame when the user prefers reduced motion.
 * Calls `onUnsupported` when WebGL2 is unavailable so the caller can show a static fallback.
 */
export function LiquidGradient({
  className,
  style,
  onUnsupported,
  ...options
}: LiquidGradientOptions & {
  className?: string;
  style?: React.CSSProperties;
  onUnsupported?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Options change by identity on every render of the parent; the render loop reads the latest.
  const latest = useRef(options);
  latest.current = options;
  const paletteKey = options.colors.join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    const program = gl?.createProgram();
    if (!gl || !vertex || !fragment || !program) {
      onUnsupported?.();
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      onUnsupported?.();
      return;
    }
    gl.useProgram(program);

    // One oversized triangle covers the viewport.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const palette = latest.current.colors.slice(0, 8).map(parseColor);
    const flatPalette = new Float32Array(24);
    palette.forEach((rgb, index) => flatPalette.set(rgb, index * 3));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    let visible = true;
    let frame = 0;
    let elapsed = 0;
    let last = performance.now();

    const resize = () => {
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const draw = () => {
      const o = latest.current;
      resize();
      gl.uniform2f(uniform("u_resolution"), canvas.width, canvas.height);
      gl.uniform1f(uniform("u_time"), elapsed);
      gl.uniform1f(uniform("u_pixelRatio"), pixelRatio);
      gl.uniform3fv(uniform("u_colors"), flatPalette);
      gl.uniform1i(uniform("u_colorCount"), palette.length);
      gl.uniform1f(uniform("u_seed"), o.seed);
      gl.uniform1f(uniform("u_speed"), o.speed);
      gl.uniform1f(uniform("u_scale"), o.scale);
      gl.uniform1f(uniform("u_amplitude"), o.amplitude);
      gl.uniform1f(uniform("u_frequency"), o.frequency);
      gl.uniform1i(uniform("u_definition"), Math.round(o.definition));
      gl.uniform1f(uniform("u_bands"), o.bands);
      gl.uniform1f(uniform("u_bias"), o.bias ?? 0);
      gl.uniform1f(uniform("u_dither"), o.dither ?? 0.2);
      gl.uniform1f(uniform("u_exposure"), o.exposure ?? 1.1);
      gl.uniform1f(uniform("u_contrast"), o.contrast ?? 1.1);
      gl.uniform1f(uniform("u_saturation"), o.saturation ?? 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      elapsed += (now - last) / 1000;
      last = now;
      draw();
      frame = requestAnimationFrame(loop);
    };
    const play = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      if (visible && !reducedMotion.matches && !document.hidden)
        frame = requestAnimationFrame(loop);
      else draw();
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      visible = entry.isIntersecting;
      play();
    });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", play);
    reducedMotion.addEventListener("change", play);
    play();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", play);
      reducedMotion.removeEventListener("change", play);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // The palette is baked into the program setup; everything else is read live from `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteKey]);

  return <canvas ref={canvasRef} aria-hidden className={className} style={style} />;
}

/* -------------------------------------------------------------------------------------------------
 * Shader button
 * -----------------------------------------------------------------------------------------------*/

/** Easing and duration of the hover dim. */
const TRANSITION = "0.4s cubic-bezier(0.4, 0, 0.6, 1)";

/** Palette of the original: near-black green through lime. */
const DEFAULT_COLORS = [
  "rgb(10, 18, 2)",
  "rgb(26, 46, 5)",
  "rgb(101, 163, 13)",
  "rgb(163, 230, 53)",
];

export interface ShaderButtonBorder {
  color?: string;
  width?: number;
  style?: React.CSSProperties["borderStyle"];
}

export interface ShaderButtonProps extends Omit<React.ComponentProps<"a">, "title"> {
  /** Button label. */
  title?: string;
  /** Label size in px. */
  fontSize?: number;
  /** Label colour. */
  fontColor?: string;
  /** Arrow icon colour. */
  iconColor?: string;
  /** Border drawn over the shader. */
  border?: ShaderButtonBorder;
  /** CSS border radius. */
  radius?: string;
  /** CSS padding. */
  padding?: string;
  /** Open the link in a new tab (the original's default). */
  newTab?: boolean;
  /** Shader palette, darkest to lightest. */
  colors?: string[];
  seed?: number;
  /** 0 to 2. */
  speed?: number;
  /** 0.1 to 2. */
  scale?: number;
  /** 0 to 1. */
  amplitude?: number;
  /** 0.1 to 2. */
  frequency?: number;
  /** Turbulence iterations, 3 to 10. */
  definition?: number;
  /** 0.1 to 5. */
  bands?: number;
}

/** "Arrow Square Right" glyph of the original icon set (24px grid, round caps). */
function ArrowSquareRight({ color, strokeWidth = 1.2 }: { color: string; strokeWidth?: number }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="block aspect-square w-6 shrink-0">
      {/* The source places the square at y=27.75, outside its own 24px grid; it is drawn at y=3.75
          here so the glyph reads as a square with an arrow, like its name. */}
      <path
        {...common}
        transform="translate(3.75 3.75)"
        d="M 0 0.75 C 0 0.336 0.336 0 0.75 0 L 15.75 0 C 16.164 0 16.5 0.336 16.5 0.75 L 16.5 15.75 C 16.5 16.164 16.164 16.5 15.75 16.5 L 0.75 16.5 C 0.336 16.5 0 16.164 0 15.75 Z"
      />
      <path {...common} transform="translate(8.25 12)" d="M 0 0 L 7.5 0" />
      <path {...common} transform="translate(12.75 9)" d="M 0 0 L 3 3 L 0 6" />
    </svg>
  );
}

/**
 * Pill link over a live liquid-gradient fill with an inner lime glow. Hovering dims the shader and
 * the glow to 40% so the label stays legible.
 *
 * Original font: Geist 300 (Google Fonts).
 */
export function ShaderButton({
  title = "Shader Button",
  fontSize = 18,
  fontColor = "rgb(255, 255, 255)",
  iconColor = "rgb(255, 255, 255)",
  border = { color: "rgba(255, 255, 255, 0.24)", width: 2, style: "solid" },
  radius = "48px",
  padding = "0px 48px 0px 48px",
  newTab = true,
  colors = DEFAULT_COLORS,
  seed = 32,
  speed = 1.6,
  scale = 0.4,
  amplitude = 0.6,
  frequency = 0.1,
  definition = 4,
  bands = 2.4,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: ShaderButtonProps) {
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(true);
  const dim = active ? 0.4 : 1;

  return (
    <a
      {...props}
      target={newTab ? "_blank" : props.target}
      rel={newTab ? "noopener noreferrer" : props.rel}
      className={cn(
        "relative inline-flex w-min cursor-pointer items-center justify-center no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className,
      )}
      style={{
        minHeight: 72,
        columnGap: 4,
        rowGap: 8,
        padding,
        overflow: "hidden",
        borderRadius: radius,
        backgroundColor: colors[0] ?? "rgb(10, 18, 2)",
        ...style,
      }}
      onPointerEnter={(event) => {
        setActive(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setActive(false);
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setActive(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setActive(false);
        onBlur?.(event);
      }}
    >
      {/* The shader and glow overshoot the border box by 2px so no seam shows under the border. */}
      <span
        aria-hidden
        className="absolute"
        style={{
          inset: -2,
          zIndex: 0,
          opacity: dim,
          transition: `opacity ${TRANSITION}`,
          background: supported ? undefined : `linear-gradient(135deg, ${colors.join(", ")})`,
        }}
      >
        <LiquidGradient
          className="block h-full w-full"
          colors={colors}
          seed={seed}
          speed={speed}
          scale={scale}
          amplitude={amplitude}
          frequency={frequency}
          definition={definition}
          bands={bands}
          onUnsupported={() => setSupported(false)}
        />
      </span>
      <span
        aria-hidden
        className="absolute"
        style={{
          inset: -2,
          zIndex: 0,
          mixBlendMode: "hard-light",
          backgroundColor: "rgba(10, 18, 2, 0.02)",
          boxShadow: "inset 0px 0px 16px 0px rgba(217, 249, 157, 0.64)",
          opacity: dim,
          transition: `opacity ${TRANSITION}`,
        }}
      />

      <span
        className="relative whitespace-pre"
        style={{
          fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
          fontFeatureSettings: "'blwf' on, 'cv09' on, 'cv03' on, 'cv04' on, 'cv11' on",
          fontSize,
          fontWeight: 300,
          letterSpacing: "0.016em",
          lineHeight: "1.6em",
          color: fontColor,
        }}
      >
        {title}
      </span>
      <span className="relative">
        <ArrowSquareRight color={iconColor} />
      </span>

      {/* Border sits above everything, like the ::after rule of the original. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          borderStyle: border.style ?? "solid",
          borderColor: border.color ?? "rgba(255, 255, 255, 0.24)",
          borderWidth: border.width ?? 2,
        }}
      />
    </a>
  );
}

export default ShaderButton;
