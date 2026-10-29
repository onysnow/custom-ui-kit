/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Framer Code Component: Lorenzo Interactive Portrait (Exact Replica)
//
// This is an exact recreation of the Three.js animation from the Lorenzo
// Motocross landing page. It uses Three.js loaded from CDN.
//
// SETUP INSTRUCTIONS:
// 1. Host your images on Vercel (or any CDN)
// 2. Set the baseImageUrl and revealImageUrl props to your hosted image URLs
// 3. The component will load Three.js automatically from CDN
//
// Example Vercel URLs:
// - https://your-project.vercel.app/images/hero-off.png
// - https://your-project.vercel.app/images/hero-on.png
// @framerDisableUnlink
// @framerIntrinsicWidth 250
// @framerIntrinsicHeight 250
function _define_property(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
import * as React from "react";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react"; // Helper function to parse vec3 string format "1.0,1.0,1.0"
function parseVec3(vec3String) {
  const parts = vec3String.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    return [parts[0], parts[1], parts[2]];
  }
  return [1, 1, 1]; // Default to white if parsing fails
}
const DEFAULT_PROPS = {
  backgroundColor: "#FFFFFF",
  blobRadius: 0.35,
  blobFadeSpeed: 2.5,
  colorBgVec3: "1.0,1.0,1.0",
  colorSoftShapeVec3: "0.961,0.961,0.961",
  colorLineVec3: "0.91,0.91,0.91",
  mobileBreakpoint: 768,
  mobileImagePosition: "bottom",
  fadeInDelay: 0.2,
  fadeInDuration: 0.8,
};

const GROUP_KEYS = [];

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

export interface LorenzoInteractivePortraitProps {
  baseImageUrl?: string;
  revealImageUrl?: string;
  backgroundColor?: string;
  blobRadius?: number;
  blobFadeSpeed?: number;
  colorBgVec3?: string;
  colorSoftShapeVec3?: string;
  colorLineVec3?: string;
  mobileBreakpoint?: number;
  mobileImagePosition?: "bottom" | "center" | "top";
  fadeInDelay?: number;
  fadeInDuration?: number;
}

/**
 * Advanced Torn Paper Transition Component
 * @framerDisableUnlink
 *
 * Creates a realistic torn paper reveal effect on scroll with organic edges
 * Similar to Shopify's Renaissance Edition transitions
 *
 * @author Mrframer
 */
function LorenzoInteractivePortraitImpl({
  baseImageUrl = "",
  revealImageUrl = "",
  backgroundColor = "#FFFFFF",
  blobRadius = 0.35,
  blobFadeSpeed = 2.5,
  mobileBreakpoint = 768,
  mobileImagePosition = "bottom",
  fadeInDelay = 0.2,
  fadeInDuration = 0.8,
  colorBgVec3 = "1.0,1.0,1.0",
  colorSoftShapeVec3 = "0.961,0.961,0.961",
  colorLineVec3 = "0.91,0.91,0.91",
}) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 }); // Watch for container size changes (important for Framer canvas)
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!containerRef.current) return;
    const loadThreeJS = async () => {
      if (window.THREE) {
        initScene(window.THREE);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if (window.THREE) {
          initScene(window.THREE);
        }
      };
      document.head.appendChild(script);
    };
    const initScene = (THREE) => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) {
        setTimeout(() => initScene(THREE), 50);
        return;
      } // Clean up previous instance if it exists
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      } // Check if mobile
      const isMobile = width < mobileBreakpoint; // Parse vec3 color strings
      const colorBgArray = parseVec3(colorBgVec3);
      const colorSoftShapeArray = parseVec3(colorSoftShapeVec3);
      const colorLineArray = parseVec3(colorLineVec3);
      const gu = { time: { value: 0 }, dTime: { value: 0 }, aspect: { value: width / height } };
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);
      const camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        0.1,
        1e3,
      );
      camera.position.z = 1;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement); // Trigger fade-in after delay
      setTimeout(() => {
        setIsReady(true);
      }, fadeInDelay * 1e3);
      class Blob {
        render() {
          this.renderer.setRenderTarget(this.rtOutput);
          this.renderer.render(this.rtScene, this.rtCamera);
          this.renderer.setRenderTarget(null);
          const temp = this.prevRenderTarget;
          this.prevRenderTarget = this.rtOutput;
          this.rtOutput = temp;
          this.uniforms.prevFrame.value = this.prevRenderTarget.texture;
        }
        constructor(renderer) {
          _define_property(this, "renderer", void 0);
          _define_property(this, "rtOutput", void 0);
          _define_property(this, "rtScene", void 0);
          _define_property(this, "rtCamera", void 0);
          _define_property(this, "uniforms", void 0);
          _define_property(this, "prevRenderTarget", void 0);
          this.renderer = renderer;
          this.rtOutput = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
          });
          this.prevRenderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
          });
          this.uniforms = {
            pointer: { value: new THREE.Vector2(10, 10) },
            pointerDown: { value: 1 },
            pointerRadius: { value: blobRadius },
            pointerDuration: { value: blobFadeSpeed },
            prevFrame: { value: this.prevRenderTarget.texture },
            time: gu.time,
            dTime: gu.dTime,
            aspect: gu.aspect,
          };
          const handleMouseMove = (event) => {
            const rect = container.getBoundingClientRect();
            this.uniforms.pointer.value.x = ((event.clientX - rect.left) / width) * 2 - 1;
            this.uniforms.pointer.value.y = -((event.clientY - rect.top) / height) * 2 + 1;
          };
          const handleTouchMove = (event) => {
            if (event.touches.length > 0) {
              const rect = container.getBoundingClientRect();
              const touch = event.touches[0];
              this.uniforms.pointer.value.x = ((touch.clientX - rect.left) / width) * 2 - 1;
              this.uniforms.pointer.value.y = -((touch.clientY - rect.top) / height) * 2 + 1;
            }
          };
          const handleMouseLeave = () => {
            this.uniforms.pointer.value.set(10, 10);
          };
          container.addEventListener("mousemove", handleMouseMove);
          container.addEventListener("touchmove", handleTouchMove);
          container.addEventListener("mouseleave", handleMouseLeave);
          container.addEventListener("touchend", handleMouseLeave);
          const blobMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                            varying vec2 vUv;
                            void main() {
                                vUv = uv;
                                gl_Position = vec4(position.xy, 0.0, 1.0);
                            }
                        `,
            fragmentShader: `
                            uniform float time, dTime, aspect, pointerDown, pointerRadius, pointerDuration;
                            uniform vec2 pointer;
                            uniform sampler2D prevFrame;
                            varying vec2 vUv;

                            float hash(vec2 p) { 
                                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); 
                            }
                            
                            float noise(vec2 p) {
                                vec2 i = floor(p); 
                                vec2 f = fract(p); 
                                f = f * f * (3.0 - 2.0 * f);
                                float a = hash(i); 
                                float b = hash(i + vec2(1.0, 0.0)); 
                                float c = hash(i + vec2(0.0, 1.0)); 
                                float d = hash(i + vec2(1.0, 1.0));
                                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                            }

                            void main() {
                                float rVal = texture2D(prevFrame, vUv).r;
                                rVal -= clamp(dTime / pointerDuration, 0.0, 0.05);
                                rVal = clamp(rVal, 0.0, 1.0);
                                
                                float f = 0.0;
                                if (pointerDown > 0.5) {
                                    vec2 uv = (vUv - 0.5) * 2.0 * vec2(aspect, 1.0);
                                    vec2 mouse = pointer * vec2(aspect, 1.0);
                                    vec2 toMouse = uv - mouse;
                                    float angle = atan(toMouse.y, toMouse.x);
                                    float dist = length(toMouse);
                                    
                                    float noiseVal = noise(vec2(angle * 3.0 + time * 0.5, dist * 5.0));
                                    float noiseVal2 = noise(vec2(angle * 5.0 - time * 0.3, dist * 3.0 + time));
                                    float radiusVariation = 0.7 + noiseVal * 0.5 + noiseVal2 * 0.3;
                                    float organicRadius = pointerRadius * radiusVariation;
                                    
                                    f = 1.0 - smoothstep(organicRadius * 0.05, organicRadius * 1.2, dist);
                                    f *= 0.8 + noiseVal * 0.2;
                                }
                                
                                rVal += f * 0.25;
                                rVal = clamp(rVal, 0.0, 1.0);
                                
                                gl_FragColor = vec4(vec3(rVal), 1.0);
                            }
                        `,
          });
          this.rtScene = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blobMaterial);
          this.rtCamera = new THREE.Camera();
        }
      }
      const blob = new Blob(renderer);
      const textureLoader = new THREE.TextureLoader();
      textureLoader.crossOrigin = "anonymous";
      let baseImage;
      let helmetImage;
      let bgPlane; // Function to calculate image position based on device
      const calculateImagePosition = (planeHeight, containerHeight, isMobileDevice) => {
        if (!isMobileDevice) {
          return 0; // Centered on desktop/tablet
        } // On mobile, position based on setting
        switch (mobileImagePosition) {
          case "bottom":
            return -(containerHeight / 2) + planeHeight / 2;
          case "top":
            return containerHeight / 2 - planeHeight / 2;
          case "center":
          default:
            return 0;
        }
      };
      const baseTexture = textureLoader.load(baseImageUrl, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        const img = texture.image;
        const imgAspect = img.width / img.height;
        const containerAspect = width / height; // True cover behavior: scale to fill, maintaining aspect ratio
        const scale = Math.max(width / img.width, height / img.height);
        const planeWidth = img.width * scale;
        const planeHeight = img.height * scale;
        baseImage.geometry.dispose();
        baseImage.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight); // Center the image
        baseImage.position.y = 0;
        baseImage.position.x = 0;
        if (helmetImage) {
          helmetImage.geometry.dispose();
          helmetImage.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          helmetImage.position.y = 0;
          helmetImage.position.x = 0;
        }
      });
      const helmetTexture = textureLoader.load(revealImageUrl, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
      });
      const baseImageMaterial = new THREE.MeshBasicMaterial({
        map: baseTexture,
        transparent: true,
      });
      baseImage = new THREE.Mesh(new THREE.PlaneGeometry(width, height), baseImageMaterial);
      scene.add(baseImage);
      const bgPlaneMaterial = new THREE.ShaderMaterial({
        uniforms: {
          texBlob: { value: blob.rtOutput.texture },
          time: gu.time,
          colorBg: { value: new THREE.Vector3(...colorBgArray) },
          colorSoftShape: { value: new THREE.Vector3(...colorSoftShapeArray) },
          colorLine: { value: new THREE.Vector3(...colorLineArray) },
        },
        vertexShader: `
                    varying vec2 vUv;
                    varying vec4 vPosProj;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        vPosProj = gl_Position;
                    }
                `,
        fragmentShader: `
                    uniform sampler2D texBlob;
                    uniform float time;
                    uniform vec3 colorBg;
                    uniform vec3 colorSoftShape;
                    uniform vec3 colorLine;
                    varying vec2 vUv;
                    varying vec4 vPosProj;

                    float hash(vec2 p) { 
                        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); 
                    }
                    
                    float noise(vec2 p) {
                        vec2 i = floor(p); 
                        vec2 f = fract(p); 
                        f = f * f * (3.0 - 2.0 * f);
                        float a = hash(i); 
                        float b = hash(i + vec2(1.0, 0.0)); 
                        float c = hash(i + vec2(0.0, 1.0)); 
                        float d = hash(i + vec2(1.0, 1.0));
                        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                    }
                    
                    float fbm(vec2 p) {
                        float value = 0.0;
                        float amplitude = 0.5;
                        for (int i = 0; i < 4; i++) {
                            value += amplitude * noise(p);
                            p *= 2.1;
                            amplitude *= 0.3;
                        }
                        return value;
                    }

                    void main() {
                        vec2 blobUV = ((vPosProj.xy / vPosProj.w) + 1.0) * 0.5;
                        vec4 blobData = texture2D(texBlob, blobUV);
                        
                        if (blobData.r < 0.02) discard;

                        vec2 uv = vUv * 3.5;
                        vec2 distortionField = vUv * 2.0;
                        float distortion = fbm(distortionField + time * 0.2);
                        float distortionStrength = 0.7;
                        vec2 warpedUv = uv + (distortion - 0.5) * distortionStrength;
                        float n = fbm(warpedUv);

                        float softShapeMix = smoothstep(0.1, 0.9, sin(n * 3.0));
                        vec3 baseColor = mix(colorBg, colorSoftShape, softShapeMix);
                        float linePattern = fract(n * 15.0);
                        float lineMix = 1.0 - smoothstep(0.49, 0.51, linePattern);
                        vec3 finalColor = mix(baseColor, colorLine, lineMix);

                        gl_FragColor = vec4(finalColor, 1.0);
                    }
                `,
        transparent: true,
      });
      bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), bgPlaneMaterial);
      scene.add(bgPlane);
      const helmetImageMaterial = new THREE.ShaderMaterial({
        uniforms: { texBlob: { value: blob.rtOutput.texture }, map: { value: helmetTexture } },
        vertexShader: `
                    varying vec2 vUv;
                    varying vec4 vPosProj;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        vPosProj = gl_Position;
                    }
                `,
        fragmentShader: `
                    uniform sampler2D texBlob;
                    uniform sampler2D map;
                    varying vec2 vUv;
                    varying vec4 vPosProj;

                    void main() {
                        vec2 blobUV = ((vPosProj.xy / vPosProj.w) + 1.0) * 0.5;
                        vec4 blobData = texture2D(texBlob, blobUV);
                        
                        if (blobData.r < 0.02) discard;

                        vec4 texColor = texture2D(map, vUv);
                        gl_FragColor = texColor;
                    }
                `,
        transparent: true,
      });
      helmetImage = new THREE.Mesh(new THREE.PlaneGeometry(width, height), helmetImageMaterial);
      scene.add(helmetImage);
      baseImage.position.z = 0;
      bgPlane.position.z = 0.05;
      helmetImage.position.z = 0.1;
      const clock = new THREE.Clock();
      let animationId;
      const animate = () => {
        const dt = clock.getDelta();
        gu.time.value += dt;
        gu.dTime.value = dt;
        bgPlaneMaterial.uniforms.texBlob.value = blob.rtOutput.texture;
        helmetImageMaterial.uniforms.texBlob.value = blob.rtOutput.texture;
        blob.render();
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();
      const handleResize = () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth === 0 || newHeight === 0) return;
        camera.left = newWidth / -2;
        camera.right = newWidth / 2;
        camera.top = newHeight / 2;
        camera.bottom = newHeight / -2;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
        gu.aspect.value = newWidth / newHeight;
        if (baseTexture.image) {
          const img = baseTexture.image; // True cover behavior: scale to fill, maintaining aspect ratio
          const scale = Math.max(newWidth / img.width, newHeight / img.height);
          const planeWidth = img.width * scale;
          const planeHeight = img.height * scale;
          baseImage.geometry.dispose();
          baseImage.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          helmetImage.geometry.dispose();
          helmetImage.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          bgPlane.geometry.dispose();
          bgPlane.geometry = new THREE.PlaneGeometry(newWidth, newHeight); // Center images
          baseImage.position.y = 0;
          baseImage.position.x = 0;
          helmetImage.position.y = 0;
          helmetImage.position.x = 0;
        }
      };
      window.addEventListener("resize", handleResize);
      cleanupRef.current = () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationId);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        baseTexture.dispose();
        helmetTexture.dispose();
        blob.rtOutput.dispose();
        blob.prevRenderTarget.dispose();
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((m) => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      };
    };
    loadThreeJS();
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [
    baseImageUrl,
    revealImageUrl,
    backgroundColor,
    blobRadius,
    blobFadeSpeed,
    mobileBreakpoint,
    mobileImagePosition,
    fadeInDelay,
    colorBgVec3,
    colorSoftShapeVec3,
    colorLineVec3,
    containerSize,
  ]);
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    style: {
      width: "100%",
      height: "100%",
      minWidth: 250,
      minHeight: 250,
      backgroundColor,
      cursor: "default",
      overflow: "hidden",
      touchAction: "none",
      position: "relative",
    },
    children: /*#__PURE__*/ _jsx("div", {
      style: {
        position: "absolute",
        inset: 0,
        backgroundColor: backgroundColor,
        opacity: isReady ? 0 : 1,
        transition: `opacity ${fadeInDuration}s ease-out`,
        pointerEvents: isReady ? "none" : "auto",
        zIndex: 10,
      },
    }),
  });
}

export function LorenzoInteractivePortrait(props: LorenzoInteractivePortraitProps) {
  return _jsx(LorenzoInteractivePortraitImpl, mergeProps(props));
}

LorenzoInteractivePortrait.displayName = "LorenzoInteractivePortrait";

export default LorenzoInteractivePortrait;
