/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
// fetched from a third-party CDN at runtime — Framer resolves and bundles
// these at publish time, so no external code is loaded on the live site.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
const RenderTarget = {
  canvas: "CANVAS",
  thumbnail: "THUMBNAIL",
  export: "EXPORT",
  preview: "PREVIEW",
  current: () => "PREVIEW",
};

function FullscreenScrollSliderImpl(props) {
  const {
    slides,
    introText,
    outroText,
    navLabel,
    showIntroOutro,
    showIndices,
    vhPerSlide,
    overlayOpacity,
    accentColor,
    backgroundColor,
    textColor,
    titleFont,
    captionFont,
    enableSmoothScroll,
  } = props;
  const rootRef = useRef(null);
  const sliderSectionRef = useRef(null);
  const imagesWrapRef = useRef(null);
  const titleWrapRef = useRef(null);
  const indicesWrapRef = useRef(null);
  const progressRef = useRef(null);
  const isCanvas = RenderTarget.current() === RenderTarget.canvas; // True during thumbnail generation, image export, PDF export, etc.
  // No scroll exists in that context, so ScrollTrigger/Lenis must not run.
  const isStatic = false;
  const disableAnimation = isCanvas || isStatic; // Spread the whole Font control object (fontFamily, fontSize, fontWeight,
  // lineHeight, letterSpacing, textAlign, etc.) so every field set in the
  // Framer panel actually takes effect, not just the family. Computed here
  // (before the effect) so the effect always closes over the latest value.
  const titleFontStyle = titleFont ? { ...titleFont } : {};
  const captionFontStyle = captionFont ? { ...captionFont } : {};
  const titleFontKey = JSON.stringify(titleFontStyle);
  useEffect(() => {
    if (disableAnimation || slides.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    let lenis = null;
    let rafId = null;
    let lenisObserver = null;
    function startRaf() {
      if (rafId !== null) return;
      const raf = (time) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }
    function stopRaf() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
    const ctx = gsap.context(() => {
      // ---- optional smooth scroll (off by default to avoid
      // conflicting with Framer's own scroll / other components) ----
      if (enableSmoothScroll) {
        lenis = new Lenis();
        lenis.on("scroll", ScrollTrigger.update); // Only run the rAF loop while the component is actually
        // on screen — pause it when scrolled out of view, resume
        // when it scrolls back in, instead of ticking forever.
        lenisObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              startRaf();
            } else {
              stopRaf();
            }
          },
          { threshold: 0 },
        );
        if (rootRef.current) lenisObserver.observe(rootRef.current);
      }
      gsap.ticker.lagSmoothing(0);
      const imagesWrap = imagesWrapRef.current;
      const titleWrap = titleWrapRef.current;
      const indicesWrap = indicesWrapRef.current;
      const progressEl = progressRef.current;
      if (!imagesWrap || !titleWrap || !indicesWrap || !progressEl) return;
      let activeSlide = 0; // ---- build the index list on the right ----
      indicesWrap.innerHTML = "";
      slides.forEach((_, index) => {
        const num = (index + 1).toString().padStart(2, "0");
        const el = document.createElement("p");
        el.style.cssText =
          "display:flex;align-items:center;gap:0.75rem;margin:0;font-size:0.75rem;letter-spacing:0.05em;";
        el.innerHTML = `<span class="fs-marker" style="display:inline-block;width:0.75rem;height:1px;background:${accentColor};transform-origin:right;transform:scaleX(${index === 0 ? 1 : 0});"></span><span class="fs-index" style="opacity:${index === 0 ? 1 : 0.35};color:${textColor};">${num}</span>`;
        indicesWrap.appendChild(el);
      });
      function animateIndicators(index) {
        const items = indicesWrap.querySelectorAll("p");
        items.forEach((item, i) => {
          const marker = item.querySelector(".fs-marker");
          const idxEl = item.querySelector(".fs-index");
          gsap.to(idxEl, { opacity: i === index ? 1 : 0.35, duration: 0.3, ease: "power2.out" });
          gsap.to(marker, { scaleX: i === index ? 1 : 0, duration: 0.3, ease: "power2.out" });
        });
      } // ---- word-by-word title reveal (no paid SplitText needed) ----
      function animateNewTitle(index) {
        titleWrap.innerHTML = "";
        const h1 = document.createElement("h1");
        h1.style.margin = "0";
        h1.style.color = textColor; // Apply the full Font control (size, weight, line-height,
        // letter-spacing, family) directly on the element — browsers
        // give <h1> its own default font-size/line-height, which
        // would otherwise win over an inherited value from a parent.
        Object.assign(h1.style, titleFontStyle);
        const words = slides[index].title.split(" ");
        words.forEach((word, i) => {
          const mask = document.createElement("span");
          mask.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;";
          const inner = document.createElement("span");
          inner.style.cssText = "display:inline-block;";
          inner.textContent = word + (i < words.length - 1 ? "\xa0" : "");
          mask.appendChild(inner);
          h1.appendChild(mask);
          gsap.set(inner, { yPercent: 100, opacity: 0 });
          gsap.to(inner, {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.02,
            ease: "power3.out",
          });
        });
        titleWrap.appendChild(h1);
      }
      function animateNewSlide(index) {
        const img = document.createElement("img");
        img.src = slides[index].image;
        img.alt = `Slide ${index + 1}`;
        img.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:center;will-change:transform,opacity;";
        gsap.set(img, { opacity: 0, scale: 1.1 });
        imagesWrap.appendChild(img);
        gsap.to(img, { opacity: 1, duration: 0.5, ease: "power2.out" });
        gsap.to(img, { scale: 1, duration: 1, ease: "power2.out" });
        const allImages = imagesWrap.querySelectorAll("img");
        if (allImages.length > 3) {
          const removeCount = allImages.length - 3;
          for (let i = 0; i < removeCount; i++) {
            imagesWrap.removeChild(allImages[i]);
          }
        }
        animateNewTitle(index);
        animateIndicators(index);
      } // paint the first slide immediately
      animateNewSlide(0);
      const pinDistance = window.innerHeight * slides.length * (vhPerSlide / 100);
      const st = ScrollTrigger.create({
        trigger: sliderSectionRef.current,
        start: "top top",
        end: `+=${pinDistance}px`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          gsap.set(progressEl, { scaleY: self.progress });
          const current = Math.min(Math.floor(self.progress * slides.length), slides.length - 1);
          if (activeSlide !== current) {
            activeSlide = current;
            animateNewSlide(activeSlide);
          }
        },
      });
      return () => st.kill();
    }, rootRef);
    return () => {
      ctx.revert();
      stopRaf();
      if (lenisObserver) lenisObserver.disconnect();
      if (lenis) lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [
    disableAnimation,
    slides,
    vhPerSlide,
    accentColor,
    textColor,
    titleFontKey,
    enableSmoothScroll,
  ]);
  return /*#__PURE__*/ _jsxs("div", {
    ref: rootRef,
    style: { width: "100%", position: "relative", ...captionFontStyle },
    children: [
      /*#__PURE__*/ _jsx("nav", {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2rem",
          zIndex: 2,
          pointerEvents: "none",
        },
        children: /*#__PURE__*/ _jsx("p", {
          style: {
            textTransform: "uppercase",
            fontSize: "0.75rem",
            color: "#fff",
            margin: 0,
            ...captionFontStyle,
          },
          children: navLabel,
        }),
      }),
      showIntroOutro &&
        /*#__PURE__*/ _jsx("section", {
          style: {
            position: "relative",
            width: "100%",
            height: "100vh",
            display: "grid",
            placeItems: "center",
            background: backgroundColor,
            color: textColor,
            padding: "2rem",
            boxSizing: "border-box",
          },
          children: /*#__PURE__*/ _jsx("h1", {
            style: {
              width: "50%",
              textAlign: "center",
              margin: "0 auto",
              fontSize: "3rem",
              fontWeight: 400,
              letterSpacing: "-0.05em",
              lineHeight: 1.2,
              ...titleFontStyle,
            },
            children: introText,
          }),
        }),
      /*#__PURE__*/ _jsxs("section", {
        ref: sliderSectionRef,
        style: { position: "relative", width: "100%", height: "100vh", overflow: "hidden" },
        children: [
          /*#__PURE__*/ _jsx("div", {
            ref: imagesWrapRef,
            style: { position: "absolute", inset: 0, width: "100%", height: "100%" },
            children: /*#__PURE__*/ _jsx("div", {
              style: {
                position: "absolute",
                inset: 0,
                background: `rgba(0,0,0,${overlayOpacity})`,
                zIndex: 1,
              },
            }),
          }),
          /*#__PURE__*/ _jsx("div", {
            ref: titleWrapRef,
            style: {
              position: "absolute",
              top: "50%",
              left: "2rem",
              transform: "translateY(-50%)",
              width: "50%",
              zIndex: 2,
              fontSize: "3rem",
              fontWeight: 400,
              letterSpacing: "-0.05em",
              lineHeight: 1.2,
              ...titleFontStyle,
            },
          }),
          showIndices &&
            /*#__PURE__*/ _jsxs("div", {
              style: {
                position: "absolute",
                top: "50%",
                right: "2rem",
                transform: "translateY(-50%)",
                zIndex: 2,
              },
              children: [
                /*#__PURE__*/ _jsx("div", {
                  ref: indicesWrapRef,
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                  },
                }),
                /*#__PURE__*/ _jsx("div", {
                  style: {
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "1px",
                    height: "100%",
                    background: "rgba(255,255,255,0.35)",
                  },
                  children: /*#__PURE__*/ _jsx("div", {
                    ref: progressRef,
                    style: {
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%) scaleY(0)",
                      width: "3px",
                      height: "100%",
                      background: accentColor,
                      transformOrigin: "top",
                    },
                  }),
                }),
              ],
            }),
          disableAnimation &&
            slides.length > 0 &&
            /*#__PURE__*/ _jsxs("div", {
              style: {
                position: "absolute",
                inset: 0,
                zIndex: 3,
                background: `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), url(${slides[0].image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              },
              children: [
                /*#__PURE__*/ _jsx("h1", {
                  style: {
                    position: "absolute",
                    top: "50%",
                    left: "2rem",
                    transform: "translateY(-50%)",
                    width: "50%",
                    margin: 0,
                    fontSize: "3rem",
                    fontWeight: 400,
                    letterSpacing: "-0.05em",
                    lineHeight: 1.2,
                    color: textColor,
                    ...titleFontStyle,
                  },
                  children: slides[0].title,
                }),
                isCanvas &&
                  /*#__PURE__*/ _jsx("p", {
                    style: {
                      position: "absolute",
                      bottom: "1rem",
                      right: "1rem",
                      margin: 0,
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.6)",
                      ...captionFontStyle,
                    },
                    children: "Scroll animation plays in Preview / Live",
                  }),
              ],
            }),
        ],
      }),
      showIntroOutro &&
        /*#__PURE__*/ _jsx("section", {
          style: {
            position: "relative",
            width: "100%",
            height: "100vh",
            display: "grid",
            placeItems: "center",
            background: backgroundColor,
            color: textColor,
            padding: "2rem",
            boxSizing: "border-box",
          },
          children: /*#__PURE__*/ _jsx("h1", {
            style: {
              width: "50%",
              textAlign: "center",
              margin: "0 auto",
              fontSize: "3rem",
              fontWeight: 400,
              letterSpacing: "-0.05em",
              lineHeight: 1.2,
              ...titleFontStyle,
            },
            children: outroText,
          }),
        }),
    ],
  });
}

const DEFAULT_PROPS = {
  slides: [
    {
      image: "https://picsum.photos/seed/fsslide1/1600/1000",
      title: "Replace this caption with your own story for slide one.",
    },
    {
      image: "https://picsum.photos/seed/fsslide2/1600/1000",
      title: "Every slide pairs one image with one short line of text.",
    },
    {
      image: "https://picsum.photos/seed/fsslide3/1600/1000",
      title: "Add, remove, or reorder slides from the property panel.",
    },
    {
      image: "https://picsum.photos/seed/fsslide4/1600/1000",
      title: "Drop in your own photography to replace these placeholders.",
    },
    {
      image: "https://picsum.photos/seed/fsslide5/1600/1000",
      title: "Scrolling advances the story one frame at a time.",
    },
  ],
  showIntroOutro: true,
  introText:
    "Scroll to explore the rhythm of still images that move quietly between story and sensation.",
  outroText:
    "As the sequence slows the silence takes over, holding the last traces of motion in the air.",
  navLabel: "[ Scroll Motion Slider ]",
  showIndices: true,
  vhPerSlide: 100,
  overlayOpacity: 0.35,
  accentColor: "#ffffff",
  backgroundColor: "#0f0f0f",
  textColor: "#ffffff",
  titleFont: { fontFamily: "Inter" },
  captionFont: { fontFamily: "Inter" },
  enableSmoothScroll: false,
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

export interface FullscreenScrollSliderProps {
  slides?: { image?: string; title?: string }[];
  showIntroOutro?: boolean;
  introText?: string;
  outroText?: string;
  navLabel?: string;
  showIndices?: boolean;
  vhPerSlide?: number;
  overlayOpacity?: number;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  titleFont?: React.CSSProperties;
  captionFont?: React.CSSProperties;
  enableSmoothScroll?: boolean;
}

export function FullscreenScrollSlider(props: FullscreenScrollSliderProps) {
  return _jsx(FullscreenScrollSliderImpl, mergeProps(props));
}

FullscreenScrollSlider.displayName = "FullscreenScrollSlider";

export default FullscreenScrollSlider;
