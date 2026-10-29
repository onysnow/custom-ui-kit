/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
/**
 * @framerIntrinsicWidth 500
 * @framerIntrinsicHeight 500
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */ export interface AnimatedGlowShapeProps {
  backgroundColor?: string;
  /** "0" | "1" | "2" */
  shapeType?: string;
  shapeWidth?: number;
  shapeHeight?: number;
  rotation?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  glowIntensity?: number;
  glowThickness?: number;
  blur?: number;
  innerGlow?: boolean;
  outerGlow?: boolean;
  glowSpeed?: number;
  /** "0" | "1" */
  glowDirection?: string;
  pulseEffect?: boolean;
  pulseSpeed?: number;
  /** "0" | "1" | "2" | "3" */
  blendMode?: string;
  interactive?: boolean;
  interactionStrength?: number;
  /** "0" | "1" | "3" */
  effectType?: string;
  grainyIntensity?: number;
  grainySpeed?: number;
}

const DEFAULT_PROPS = {
  backgroundColor: "#0a0a0a",
  shapeType: "0",
  shapeWidth: 0.5,
  shapeHeight: 0.5,
  rotation: 0,
  color1: "#ff006e",
  color2: "#8338ec",
  color3: "#3a86ff",
  glowIntensity: 1.2,
  glowThickness: 5,
  blur: 5,
  innerGlow: true,
  outerGlow: true,
  glowSpeed: 0.2,
  glowDirection: "0",
  pulseEffect: false,
  pulseSpeed: 1,
  blendMode: "1",
  interactive: true,
  interactionStrength: 1.5,
  effectType: "0",
  grainyIntensity: 1,
  grainySpeed: 1,
};

export function AnimatedGlowShape(rawProps: AnimatedGlowShapeProps) {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const canvasRef = useRef(null);
  const isStatic = false;
  const [isInView, setIsInView] = useState(false);
  const isInViewRef = useRef(false);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);
  const targetMouse = useRef({ x: 0, y: 0, active: 0 });
  const currentMouse = useRef({ x: 0, y: 0, active: 0 });
  useEffect(() => {
    if (typeof window === "undefined" || isStatic) return;
    const handleMouseMove = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const minRes = Math.min(rect.width, rect.height);
      const localX = e.clientX - rect.left - rect.width / 2;
      const localY = (e.clientY - rect.top - rect.height / 2) * -1;
      targetMouse.current.x = (localX * 2) / minRes;
      targetMouse.current.y = (localY * 2) / minRes;
      targetMouse.current.active = 1;
    };
    const handleMouseLeave = () => {
      targetMouse.current.active = 0;
    };
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isStatic]);
  useEffect(() => {
    if (isStatic || !canvasRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [isStatic]);
  useEffect(() => {
    if (isStatic) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    let animationId;
    const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
    const fragmentShaderSource = `
            precision mediump float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform int u_shapeType;
            uniform vec2 u_shapeSize;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform vec3 u_color3;
            uniform float u_glowIntensity;
            uniform float u_glowSpeed;
            uniform float u_glowDirection;
            uniform int u_blendMode;
            uniform float u_glowThickness;
            uniform bool u_innerGlow;
            uniform bool u_outerGlow;
            uniform bool u_pulseEffect;
            uniform float u_pulseSpeed;
            uniform float u_rotation;
            uniform float u_blur;
            
            uniform vec3 u_mouse;
            uniform bool u_interactive;
            uniform float u_interactionStrength;
            
            uniform int u_effectType;
            uniform float u_grainyIntensity;
            uniform float u_grainySpeed;

            float sdCircle(vec2 p, float r) {
                return length(p) - r;
            }

            float sdBox(vec2 p, vec2 b) {
                vec2 d = abs(p) - b;
                return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
            }

            float sdTriangle(vec2 p, float r) {
                const float k = sqrt(3.0);
                p.x = abs(p.x) - r;
                p.y = p.y + r / k;
                if( p.x + k * p.y > 0.0 ) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
                p.x -= clamp( p.x, -2.0 * r, 0.0 );
                return -length(p) * sign(p.y);
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                
                float rotAngle = radians(u_rotation);
                float s = sin(rotAngle);
                float c = cos(rotAngle);
                mat2 rot = mat2(c, -s, s, c);
                vec2 p = rot * uv;

                float interactionIntensity = 0.0;
                if (u_interactive) {
                    vec2 rotatedMouse = rot * u_mouse.xy;
                    vec2 mouseDir = p - rotatedMouse;
                    float mouseDist = length(mouseDir);
                    
                    interactionIntensity = exp(-mouseDist * 5.0) * u_mouse.z;
                    p -= mouseDir * interactionIntensity * u_interactionStrength * 0.4;
                }

                float d = 0.0;
                if (u_shapeType == 0) {
                    d = sdCircle(p, u_shapeSize.x);
                } else if (u_shapeType == 1) {
                    d = sdBox(p, u_shapeSize);
                } else if (u_shapeType == 2) {
                    d = sdTriangle(p, u_shapeSize.x);
                }

                float gradAngle = atan(p.y, p.x) / 6.2831853 + 0.5; 
                float animAngle = fract(gradAngle - u_time * u_glowSpeed * u_glowDirection); 

                vec3 color;
                if (animAngle < 0.333) {
                    color = mix(u_color1, u_color2, smoothstep(0.0, 0.333, animAngle));
                } else if (animAngle < 0.666) {
                    color = mix(u_color2, u_color3, smoothstep(0.333, 0.666, animAngle));
                } else {
                    color = mix(u_color3, u_color1, smoothstep(0.666, 1.0, animAngle));
                }

                float pulse = u_pulseEffect ? 0.8 + 0.2 * sin(u_time * u_pulseSpeed * 3.14159) : 1.0;
                float blurAmount = u_blur * 0.05;
                float glowEdge = u_glowThickness * 0.01;
                
                float innerGlowValue = 0.0;
                float outerGlowValue = 0.0;
                float extraGlow = 0.0;
                
                // OUTER GLOW
                if (u_outerGlow && d > 0.0) {
                    if (u_effectType == 3) {
                        outerGlowValue = u_glowIntensity * pulse * exp(-d * (10.0 - u_blur * 0.8));
                    } else {
                        outerGlowValue = u_glowIntensity * pulse / (blurAmount + abs(d) * (10.0 - u_blur));
                        outerGlowValue *= exp(-d * (5.0 - u_blur * 0.5));
                        float maxGlowDistance = 0.3 + u_blur * 0.1;
                        outerGlowValue *= smoothstep(maxGlowDistance, 0.0, d);
                    }
                }
                
                if (u_innerGlow && d < 0.0) {
                    float innerEdgeThreshold = -glowEdge; 
                    if (d > innerEdgeThreshold) {
                        float innerFade = smoothstep(innerEdgeThreshold, 0.0, d);
                        innerFade = u_effectType == 3 ? pow(innerFade, 3.0) : pow(innerFade, 8.0); 
                        innerGlowValue = innerFade * u_glowIntensity * pulse * 0.5; 
                    }
                }

                if (u_effectType == 1) {
                    // GRAINY: Modulasi cahaya dengan noise temporal
                    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time * u_grainySpeed) * 43758.5453);
                    float grainMod = mix(1.0, grain * 2.0, u_grainyIntensity * 0.5);
                    outerGlowValue *= grainMod;
                    innerGlowValue *= grainMod;
                } 
                else if (u_effectType == 3) {
                    // SMOOTH GLOW: Already handled in outer glow calculation above
                }
                
                float glow = max(innerGlowValue, outerGlowValue);

                float hollowThreshold = -glowEdge;
                if (d < hollowThreshold) {
                    glow = 0.0;
                }

                if (u_interactive) {
                    glow += interactionIntensity * 0.4 * u_glowIntensity * pulse;
                    color = mix(color, vec3(1.0), interactionIntensity * 0.3);
                }
                
                glow = clamp(glow, 0.0, 1.0);

                vec3 finalColor = color * glow;
                float finalAlpha = glow;
                
                if (u_blendMode == 3) {
                    float overlayGlow = glow * 1.3;
                    finalColor = color * overlayGlow;
                    finalAlpha = overlayGlow;
                }

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `;
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const shapeTypeLocation = gl.getUniformLocation(program, "u_shapeType");
    const shapeSizeLocation = gl.getUniformLocation(program, "u_shapeSize");
    const color1Location = gl.getUniformLocation(program, "u_color1");
    const color2Location = gl.getUniformLocation(program, "u_color2");
    const color3Location = gl.getUniformLocation(program, "u_color3");
    const glowIntensityLocation = gl.getUniformLocation(program, "u_glowIntensity");
    const glowSpeedLocation = gl.getUniformLocation(program, "u_glowSpeed");
    const glowDirectionLocation = gl.getUniformLocation(program, "u_glowDirection");
    const blendModeLocation = gl.getUniformLocation(program, "u_blendMode");
    const glowThicknessLocation = gl.getUniformLocation(program, "u_glowThickness");
    const innerGlowLocation = gl.getUniformLocation(program, "u_innerGlow");
    const outerGlowLocation = gl.getUniformLocation(program, "u_outerGlow");
    const pulseEffectLocation = gl.getUniformLocation(program, "u_pulseEffect");
    const pulseSpeedLocation = gl.getUniformLocation(program, "u_pulseSpeed");
    const rotationLocation = gl.getUniformLocation(program, "u_rotation");
    const blurLocation = gl.getUniformLocation(program, "u_blur");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const interactiveLocation = gl.getUniformLocation(program, "u_interactive");
    const interactionStrengthLocation = gl.getUniformLocation(program, "u_interactionStrength");
    const effectTypeLocation = gl.getUniformLocation(program, "u_effectType");
    const grainyIntensityLocation = gl.getUniformLocation(program, "u_grainyIntensity");
    const grainySpeedLocation = gl.getUniformLocation(program, "u_grainySpeed");
    function parseColorToRgba(colorStr) {
      if (colorStr === "transparent") return [0, 0, 0, 0];
      if (colorStr.startsWith("rgba")) {
        const parts = colorStr.match(/[\d.]+/g);
        if (parts && parts.length >= 4) {
          return [
            parseFloat(parts[0]) / 255,
            parseFloat(parts[1]) / 255,
            parseFloat(parts[2]) / 255,
            parseFloat(parts[3]),
          ];
        }
      }
      if (colorStr.startsWith("rgb")) {
        const parts = colorStr.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
          return [
            parseFloat(parts[0]) / 255,
            parseFloat(parts[1]) / 255,
            parseFloat(parts[2]) / 255,
            1,
          ];
        }
      }
      const hex = colorStr.replace("#", "");
      if (hex.length === 3 || hex.length === 4) {
        return [
          parseInt(hex[0] + hex[0], 16) / 255,
          parseInt(hex[1] + hex[1], 16) / 255,
          parseInt(hex[2] + hex[2], 16) / 255,
          hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1,
        ];
      }
      if (hex.length >= 6) {
        return [
          parseInt(hex.substring(0, 2), 16) / 255,
          parseInt(hex.substring(2, 4), 16) / 255,
          parseInt(hex.substring(4, 6), 16) / 255,
          hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1,
        ];
      }
      return [0, 0, 0, 1];
    }
    let canvasWidth = canvas.clientWidth;
    let canvasHeight = canvas.clientHeight;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvasWidth = entry.contentRect.width;
        canvasHeight = entry.contentRect.height;
      }
    });
    resizeObserver.observe(canvas);
    const startTime = performance.now();
    function render(now) {
      if (!isInViewRef.current) {
        animationId = requestAnimationFrame(render);
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      if (canvas && (canvas.width !== canvasWidth * dpr || canvas.height !== canvasHeight * dpr)) {
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }
      const p = propsRef.current;
      const bgRgba = parseColorToRgba(p.backgroundColor);
      const c1 = parseColorToRgba(p.color1);
      const c2 = parseColorToRgba(p.color2);
      const c3 = parseColorToRgba(p.color3);
      currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * 0.1;
      currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * 0.1;
      currentMouse.current.active +=
        (targetMouse.current.active - currentMouse.current.active) * 0.05;
      gl.clearColor(bgRgba[0], bgRgba[1], bgRgba[2], bgRgba[3]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const time = (now - startTime) * 0.001;
      gl.uniform1f(timeLocation, time);
      gl.uniform1i(shapeTypeLocation, parseInt(p.shapeType));
      gl.uniform2f(shapeSizeLocation, p.shapeWidth, p.shapeHeight);
      gl.uniform1f(glowIntensityLocation, p.glowIntensity);
      gl.uniform1f(glowSpeedLocation, p.glowSpeed);
      gl.uniform1f(glowDirectionLocation, p.glowDirection === "0" ? 1 : -1);
      gl.uniform3f(color1Location, c1[0], c1[1], c1[2]);
      gl.uniform3f(color2Location, c2[0], c2[1], c2[2]);
      gl.uniform3f(color3Location, c3[0], c3[1], c3[2]);
      gl.uniform1i(blendModeLocation, parseInt(p.blendMode));
      gl.uniform1f(glowThicknessLocation, p.glowThickness);
      gl.uniform1i(innerGlowLocation, p.innerGlow ? 1 : 0);
      gl.uniform1i(outerGlowLocation, p.outerGlow ? 1 : 0);
      gl.uniform1i(pulseEffectLocation, p.pulseEffect ? 1 : 0);
      gl.uniform1f(pulseSpeedLocation, p.pulseSpeed);
      gl.uniform1f(rotationLocation, p.rotation);
      gl.uniform1f(blurLocation, p.blur);
      gl.uniform1i(interactiveLocation, p.interactive ? 1 : 0);
      gl.uniform1f(interactionStrengthLocation, p.interactionStrength);
      gl.uniform3f(
        mouseLocation,
        currentMouse.current.x,
        currentMouse.current.y,
        currentMouse.current.active,
      );
      gl.uniform1i(effectTypeLocation, parseInt(p.effectType));
      gl.uniform1f(grainyIntensityLocation, p.grainyIntensity);
      gl.uniform1f(grainySpeedLocation, p.grainySpeed);
      gl.enable(gl.BLEND);
      const blendModeInt = parseInt(p.blendMode);
      if (blendModeInt === 1) {
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      } else if (blendModeInt === 2) {
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
      } else {
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    }
    animationId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);
  if (isStatic) {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        width: "100%",
        height: "100%",
        backgroundColor: props.backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        fontFamily: "sans-serif",
      },
      children: "Animated Glow Preview",
    });
  }
  return /*#__PURE__*/ _jsx("canvas", {
    ref: canvasRef,
    style: { width: "100%", height: "100%", display: "block" },
  });
}

AnimatedGlowShape.displayName = "AnimatedGlowShape";

export default AnimatedGlowShape;
