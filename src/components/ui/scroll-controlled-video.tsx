/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Created by 584.studio
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
const DEFAULT_PROPS = {
  scrollSpeed: 500,
  startAt: 0,
  endAt: 100,
  backgroundColor: "#000000",
  sourceType: "file",
  videoFile: "",
  videoUrl: "",
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

export interface ScrollControlledVideoProps {
  sourceType?: "file" | "url";
  videoFile?: string;
  videoUrl?: string;
  scrollSpeed?: number;
  startAt?: number;
  endAt?: number;
  backgroundColor?: string;
}

function ScrollControlledVideoImpl(props) {
  const { sourceType, videoFile, videoUrl, scrollSpeed, startAt, endAt, backgroundColor } = props;
  const isStaticRenderer = false;
  const containerRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const durationRef = React.useRef(0);
  const frameRef = React.useRef(null);
  const [autoHeight, setAutoHeight] = React.useState("100vh");
  const videoSource = sourceType === "file" ? videoFile : videoUrl;
  const mobileVideoSource = React.useMemo(() => {
    if (!videoSource) return "";
    const hashIndex = videoSource.indexOf("#");
    const baseSource = hashIndex >= 0 ? videoSource.slice(0, hashIndex) : videoSource;
    return `${baseSource}#t=0.001`;
  }, [videoSource]);
  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };
  const updateHeight = React.useCallback(() => {
    if (isStaticRenderer || typeof window === "undefined") return;
    const duration = durationRef.current;
    if (!duration || duration <= 0) {
      setAutoHeight("100vh");
      return;
    }
    const viewportHeight = window.innerHeight || 0;
    const scrollDistance = duration * scrollSpeed;
    const calculatedHeight = viewportHeight + scrollDistance;
    setAutoHeight(`${calculatedHeight}px`);
  }, [isStaticRenderer, scrollSpeed]);
  const updateVideoTime = React.useCallback(() => {
    if (isStaticRenderer || typeof window === "undefined") return;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !durationRef.current) return;
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollableDistance = rect.height - viewportHeight;
    if (scrollableDistance <= 0) return;
    const rawProgress = -rect.top / scrollableDistance;
    const progress = clamp(rawProgress, 0, 1);
    const startTime = (durationRef.current * startAt) / 100;
    const endTime = (durationRef.current * endAt) / 100;
    const targetTime = startTime + (endTime - startTime) * progress;
    if (Math.abs(video.currentTime - targetTime) > 0.03) {
      try {
        video.currentTime = targetTime;
      } catch {
        return;
      }
    }
  }, [isStaticRenderer, startAt, endAt]);
  React.useEffect(() => {
    if (isStaticRenderer || typeof window === "undefined") return;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;
    let isNearViewport = false;
    let isScrollListening = false;
    durationRef.current = 0;
    setAutoHeight("100vh");
    const scheduleUpdate = () => {
      if (!isNearViewport) return;
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        updateVideoTime();
      });
    };
    const handleScroll = () => {
      scheduleUpdate();
    };
    const startScrollTracking = () => {
      if (isScrollListening) {
        scheduleUpdate();
        return;
      }
      window.addEventListener("scroll", handleScroll, { passive: true });
      isScrollListening = true;
      scheduleUpdate();
    };
    const stopScrollTracking = () => {
      if (isScrollListening) {
        window.removeEventListener("scroll", handleScroll);
        isScrollListening = false;
      }
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
    const handleLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      updateHeight();
      scheduleUpdate();
    };
    const handleResize = () => {
      updateHeight();
      scheduleUpdate();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting;
        if (isNearViewport) {
          startScrollTracking();
        } else {
          stopScrollTracking();
        }
      },
      { root: null, rootMargin: "100% 0px 100% 0px", threshold: 0 },
    );
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    window.addEventListener("resize", handleResize);
    observer.observe(container);
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata();
    }
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("resize", handleResize);
      if (isScrollListening) {
        window.removeEventListener("scroll", handleScroll);
      }
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isStaticRenderer, videoSource, updateHeight, updateVideoTime]);
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    style: {
      width: "100vw",
      height: autoHeight,
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50vw",
      marginRight: "-50vw",
      backgroundColor,
      overflow: "visible",
    },
    children: /*#__PURE__*/ _jsx("div", {
      style: {
        position: "sticky",
        top: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor,
      },
      children: videoSource
        ? /*#__PURE__*/ _jsxs(
            "video",
            {
              ref: isStaticRenderer ? undefined : videoRef,
              muted: true,
              playsInline: true,
              preload: isStaticRenderer ? "metadata" : "auto",
              controls: false,
              style: {
                width: "100vw",
                height: "100vh",
                display: "block",
                objectFit: "cover",
                objectPosition: "center center",
              },
              children: [
                /*#__PURE__*/ _jsx("source", {
                  src: mobileVideoSource,
                  media: "(hover: none) and (pointer: coarse)",
                }),
                /*#__PURE__*/ _jsx("source", { src: videoSource }),
              ],
            },
            videoSource,
          )
        : /*#__PURE__*/ _jsx("div", {
            style: {
              width: "100%",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              opacity: 0.5,
              color: "#ffffff",
            },
            children: "Add a video file or URL",
          }),
    }),
  });
}
ScrollControlledVideo.defaultProps = {
  sourceType: "file",
  videoFile: "",
  videoUrl: "",
  scrollSpeed: 500,
  startAt: 0,
  endAt: 100,
  backgroundColor: "#000000",
};

export function ScrollControlledVideo(props: ScrollControlledVideoProps) {
  return _jsx(ScrollControlledVideoImpl, mergeProps(props));
}

ScrollControlledVideo.displayName = "ScrollControlledVideo";

export default ScrollControlledVideo;
