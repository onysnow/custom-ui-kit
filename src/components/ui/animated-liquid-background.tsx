/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/exhaustive-deps, react-hooks/rules-of-hooks */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useMemo } from "react";
import {
  getShaderColorFromString,
  warpFragmentShader,
  PatternShapes,
  ShaderMount as ShaderMountVanilla,
} from "@paper-design/shaders";
import { cubicBezier, useInView } from "framer-motion";
/** Framer resolved colour tokens here; plain CSS colours pass straight through. */
const useColors = (...colors) => colors;
const speedEase = cubicBezier(0.65, 0, 0.88, 0.77);
const templates = {
  Prism: {
    color1: "#050505",
    color2: "#66B3FF",
    color3: "#FFFFFF",
    rotation: -50,
    proportion: 1,
    scale: 0.01,
    speed: 30,
    distortion: 0,
    swirl: 50,
    swirlIterations: 16,
    softness: 47,
    offset: -299,
    shape: "Checks",
    shapeSize: 45,
  },
  Lava: {
    color1: "#FF9F21",
    color2: "#FF0303",
    color3: "#000000",
    rotation: 114,
    proportion: 100,
    scale: 0.52,
    speed: 30,
    distortion: 7,
    swirl: 18,
    swirlIterations: 20,
    softness: 100,
    offset: 717,
    shape: "Edge",
    shapeSize: 12,
  },
  Plasma: {
    color1: "#B566FF",
    color2: "#000000",
    color3: "#000000",
    rotation: 0,
    proportion: 63,
    scale: 0.75,
    speed: 30,
    distortion: 5,
    swirl: 61,
    swirlIterations: 5,
    softness: 100,
    offset: -168,
    shape: "Checks",
    shapeSize: 28,
  },
  Pulse: {
    color1: "#66FF85",
    color2: "#000000",
    color3: "#000000",
    rotation: -167,
    proportion: 92,
    scale: 0,
    speed: 20,
    distortion: 54,
    swirl: 75,
    swirlIterations: 3,
    softness: 28,
    offset: -813,
    shape: "Checks",
    shapeSize: 79,
  },
  Vortex: {
    color1: "#000000",
    color2: "#FFFFFF",
    color3: "#000000",
    rotation: 50,
    proportion: 41,
    scale: 0.4,
    speed: 20,
    distortion: 0,
    swirl: 100,
    swirlIterations: 3,
    softness: 5,
    offset: -744,
    shape: "Stripes",
    shapeSize: 80,
  },
  Mist: {
    color1: "#050505",
    color2: "#FF66B8",
    color3: "#050505",
    rotation: 0,
    proportion: 33,
    scale: 0.48,
    speed: 39,
    distortion: 4,
    swirl: 65,
    swirlIterations: 5,
    softness: 100,
    offset: -235,
    shape: "Edge",
    shapeSize: 48,
  },
};
const DEFAULT_PROPS = {
  preset: Object.keys(templates)[0],
  preview: false,
  colorMode: "preset",
  color1: "#262626",
  color2: "#75c1f0",
  color3: "#ffffff",
  noise: { opacity: 0.5, scale: 1 },
  rotation: 0,
  proportion: 35,
  scale: 1,
  speed: 25,
  distortion: 12,
  swirl: 80,
  swirlIterations: 10,
  softness: 100,
  offset: 0,
  shape: "Checks",
  shapeSize: 10,
  radius: "0px",
};

const GROUP_KEYS = ["noise"];

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

export interface AnimatedLiquidBackgroundProps {
  preset?: string | "custom";
  preview?: boolean;
  colorMode?: "preset" | "custom";
  color1?: string;
  color2?: string;
  color3?: string;
  noise?: { opacity?: number; scale?: number };
  rotation?: number;
  proportion?: number;
  scale?: number;
  speed?: number;
  distortion?: number;
  swirl?: number;
  swirlIterations?: number;
  softness?: number;
  offset?: number;
  shape?: string;
  shapeSize?: number;
  radius?: string;
  style?: React.CSSProperties;
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 *
 * @framerDisableUnlink
 *
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 400
 */
function AnimatedLiquidBackgroundImpl(props) {
  const isStaticRenderer = false;
  const isCanvas = false;
  const useCustomColors = props.preset === "custom" || props.colorMode === "custom";
  const values =
    props.preset === "custom" ? props : templates[props.preset] || Object.values(templates)[0];
  const [color1, color2, color3] = useColors(props.color1, props.color2, props.color3);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const currentSpeed = useMemo(() => {
    if (isCanvas && props.preview) return speedEase(props.speed / 100) * 5;
    if (!isStaticRenderer && isInView) return speedEase(props.speed / 100) * 5;
    return 0;
  }, [isInView, isStaticRenderer, props.speed, props.preview, isCanvas]);
  return /*#__PURE__*/ _jsxs("div", {
    ref: ref,
    style: { borderRadius: props.radius, overflow: "hidden", position: "relative", ...props.style },
    children: [
      /*#__PURE__*/ _jsx(Warp, {
        color1: useCustomColors ? color1 : values.color1,
        color2: useCustomColors ? color2 : values.color2,
        color3: useCustomColors ? color3 : values.color3,
        scale: values.scale,
        proportion: values.proportion / 100,
        distortion: values.distortion / 50,
        swirl: values.swirl / 100,
        swirlIterations: values.swirl === 0 ? 0 : values.swirlIterations,
        rotation: (values.rotation * Math.PI) / 180,
        speed: currentSpeed,
        seed: values.offset * 10,
        shape: PatternShapes[values.shape],
        shapeScale: values.shapeSize / 100,
        softness: values.softness / 100,
        style: props.style,
      }),
      props.noise &&
        props.noise.opacity > 0 &&
        /*#__PURE__*/ _jsx("div", {
          style: {
            position: "absolute",
            inset: 0,
            backgroundImage: `url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")`,
            backgroundSize: props.noise.scale * 200,
            backgroundRepeat: "repeat",
            opacity: props.noise.opacity / 2,
          },
        }),
    ],
  });
}
//////////////////////////////
const defaultPreset = {
  name: "Default",
  params: {
    scale: 1,
    rotation: 0,
    speed: 20,
    seed: 0,
    color1: "hsla(0, 0%, 15%, 1)",
    color2: "hsla(203, 80%, 70%, 1)",
    color3: "hsla(0, 0%, 100%, 1)",
    proportion: 0.35,
    softness: 1,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.1,
    shape: PatternShapes.Checks,
  },
}; // Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)
const Warp = (props) => {
  const uniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_rotation: props.rotation ?? defaultPreset.params.rotation,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color2),
      u_proportion: props.proportion ?? defaultPreset.params.proportion,
      u_softness: props.softness ?? defaultPreset.params.softness,
      u_distortion: props.distortion ?? defaultPreset.params.distortion,
      u_swirl: props.swirl ?? defaultPreset.params.swirl,
      u_swirlIterations: props.swirlIterations ?? defaultPreset.params.swirlIterations,
      u_shapeScale: props.shapeScale ?? defaultPreset.params.shapeScale,
      u_shape: props.shape ?? defaultPreset.params.shape,
    };
  }, [
    props.scale,
    props.rotation,
    props.color1,
    props.color2,
    props.color3,
    props.proportion,
    props.softness,
    props.distortion,
    props.swirl,
    props.swirlIterations,
    props.shapeScale,
    props.shape,
    props.speed,
  ]);
  return /*#__PURE__*/ _jsx(ShaderMount, {
    ...props,
    fragmentShader: warpFragmentShader,
    uniforms: uniforms,
  });
};
const ShaderMount = ({
  ref,
  fragmentShader,
  style,
  uniforms = {},
  webGlContextAttributes,
  speed = 1,
  seed = 0,
}) => {
  const canvasRef = ref ?? useRef(null);
  const shaderMountRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) {
      shaderMountRef.current = new ShaderMountVanilla(
        canvasRef.current,
        fragmentShader,
        uniforms,
        webGlContextAttributes,
        speed,
        seed,
      );
    }
    return () => {
      shaderMountRef.current?.dispose();
    };
  }, [fragmentShader, webGlContextAttributes]);
  useEffect(() => {
    shaderMountRef.current?.setUniforms(uniforms);
  }, [uniforms]);
  useEffect(() => {
    shaderMountRef.current?.setSpeed(speed);
  }, [speed]);
  useEffect(() => {
    shaderMountRef.current?.setSeed(seed);
  }, [seed]);
  return /*#__PURE__*/ _jsx("canvas", { ref: canvasRef, style: style });
};
function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
  if (fromLow === fromHigh) {
    return toLow;
  }
  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

export function AnimatedLiquidBackground(props: AnimatedLiquidBackgroundProps) {
  return _jsx(AnimatedLiquidBackgroundImpl, mergeProps(props));
}

AnimatedLiquidBackground.displayName = "AnimatedLiquidBackground";

export default AnimatedLiquidBackground;
