/* eslint-disable @typescript-eslint/ban-ts-comment, no-empty, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
const loadRippleScript = (callback) => {
  if (!window.$) {
    const jq = document.createElement("script");
    jq.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js";
    jq.async = true;
    jq.onload = () => {
      const rp = document.createElement("script");
      rp.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery.ripples/0.5.3/jquery.ripples.min.js";
      rp.async = true;
      rp.onload = callback;
      document.body.appendChild(rp);
    };
    document.body.appendChild(jq);
  } else if (!window.$.fn?.ripples) {
    const rp = document.createElement("script");
    rp.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery.ripples/0.5.3/jquery.ripples.min.js";
    rp.async = true;
    rp.onload = callback;
    document.body.appendChild(rp);
  } else {
    callback();
  }
};
const DEFAULT_PROPS = {
  intensity: 3,
  rippleCount: 2,
  rippleInterval: 4e3,
  rippleSize: 30,
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

export interface WebGLWaterRipplesProps {
  image?: string;
  intensity?: number;
  rippleCount?: number;
  rippleInterval?: number;
  rippleSize?: number;
}

/**
 *
 * @framerIntrinsicWidth 1400
 * @framerIntrinsicHeight 1000
 *
 * @framerDisableUnlink
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function WebGLWaterRipplesImpl({ image, intensity, rippleCount, rippleInterval, rippleSize }) {
  const containerRef = useRef(null);
  useEffect(() => {
    // ── All cleanup state hoisted here so React's return can reach them ──
    let active = true;
    let intervalId = null;
    let observer = null;
    const stopInterval = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }; // Always clears first — prevents stacking if called multiple times
    const startInterval = () => {
      stopInterval();
      intervalId = setInterval(() => {
        if (!containerRef.current || !window.$?.fn?.ripples) return;
        const $el = window.$(containerRef.current);
        for (let i = 0; i < rippleCount; i++) {
          $el.ripples(
            "drop",
            Math.random() * $el.outerWidth(),
            Math.random() * $el.outerHeight(),
            rippleSize,
            0.02 + Math.random() * 0.02,
          );
        }
      }, rippleInterval);
    }; // Stop accumulating drops when tab is hidden, start fresh when visible again
    const handleVisibility = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    };
    loadRippleScript(() => {
      if (!active || !containerRef.current) return;
      if (!window.$ || typeof window.$.fn?.ripples !== "function") {
        console.error("Ripples.js failed to load.");
        return;
      }
      const $el = window.$(containerRef.current);
      try {
        $el.ripples("destroy");
      } catch (_) {}
      $el.ripples({
        resolution: 512,
        perturbance: 0.01 + (intensity / 100) * 0.05,
        interactive: true,
      }); // Only start if the tab is already visible
      if (!document.hidden) startInterval();
      document.addEventListener("visibilitychange", handleVisibility); // Also pause when scrolled out of view
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!document.hidden) startInterval();
          } else {
            stopInterval();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(containerRef.current);
    }); // React cleanup — always runs, always reaches these refs
    return () => {
      active = false;
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibility);
      observer?.disconnect();
      if (containerRef.current && window.$?.fn?.ripples) {
        try {
          window.$(containerRef.current).ripples("destroy");
        } catch (_) {}
      }
    };
  }, [intensity, rippleCount, rippleInterval, rippleSize, image]);
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    style: {
      width: "100%",
      height: "100%",
      backgroundImage: `url(${image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
  });
}

export function WebGLWaterRipples(props: WebGLWaterRipplesProps) {
  return _jsx(WebGLWaterRipplesImpl, mergeProps(props));
}

WebGLWaterRipples.displayName = "WebGLWaterRipples";

export default WebGLWaterRipples;
