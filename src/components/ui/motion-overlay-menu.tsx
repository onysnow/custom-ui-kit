/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
const RenderTarget = {
  canvas: "CANVAS",
  thumbnail: "THUMBNAIL",
  export: "EXPORT",
  current: () => "PREVIEW",
};
const configuredHref = (value) => value?.trim() || undefined;
const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_IN = [0.4, 0, 1, 1];
const EASE_SMOOTH = [0.65, 0, 0.35, 1];
const ICON_MS = 520; // Keep the live overlay above page chrome without covering custom cursors.
const DEFAULT_OVERLAY_Z_INDEX = 1e4;
const DEFAULT_LINKS = [
  { label: "Work" },
  { label: "Studio" },
  { label: "Journal" },
  { label: "Contact" },
];
const DEFAULT_SECONDARY = [{ label: "Instagram" }, { label: "LinkedIn" }, { label: "X" }];
const CSS = [
  "[data-smo-static], [data-smo-static] * { animation: none !important; transition: none !important; }",
  "[data-smo-static] { pointer-events: none; }",
  ".smo-link, .smo-btn, .smo-brand, .smo-sec { -webkit-tap-highlight-color: transparent; }",
  ".smo-link:focus, .smo-btn:focus, .smo-brand:focus, .smo-sec:focus { outline: none; }",
  ".smo-link:focus-visible, .smo-brand:focus-visible, .smo-sec:focus-visible {",
  "  outline: 2px solid currentColor; outline-offset: 6px; border-radius: 6px;",
  "}",
  ".smo-btn:focus-visible .smo-icon { box-shadow: 0 0 0 2px currentColor; }",
  ".smo-sec .smo-ul { transform: scaleX(0); transform-origin: left; transition: transform .4s cubic-bezier(.22,1,.36,1); }",
  ".smo-sec[href]:hover .smo-ul, .smo-sec:focus-visible .smo-ul { transform: scaleX(1); }",
  ".smo-brand[href]:hover .smo-mark { transform: rotate(180deg); }",
  ".smo-mark { transition: transform .6s cubic-bezier(.65,0,.35,1); }",
  ".smo-nav { scrollbar-width: none; }",
  ".smo-nav::-webkit-scrollbar { display: none; }",
  "@media (prefers-reduced-motion: reduce) {",
  "  .smo-sec .smo-ul, .smo-mark { transition: none; }",
  "}",
].join(" ");
function splitFont(font, fallbackSize) {
  const f = font && typeof font === "object" ? { ...font } : {};
  const raw = f.fontSize;
  const size = typeof raw === "number" ? raw : parseFloat(raw) || fallbackSize;
  delete f.fontSize;
  delete f.textAlign;
  return { fontStyle: f, size };
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function mix(color, pct) {
  return "color-mix(in srgb, " + color + " " + pct + "%, transparent)";
}
function Mark({ size }) {
  return /*#__PURE__*/ _jsxs("svg", {
    className: "smo-mark",
    width: size,
    height: size,
    viewBox: "0 0 20 20",
    "aria-hidden": "true",
    style: { display: "block", flex: "none" },
    children: [
      /*#__PURE__*/ _jsx("circle", {
        cx: "10",
        cy: "10",
        r: "8.25",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      /*#__PURE__*/ _jsx("path", {
        d: "M10 1.75 A8.25 8.25 0 0 1 10 18.25 Z",
        fill: "currentColor",
      }),
    ],
  });
}
function TopBar({
  logo,
  logoImage,
  logoSize,
  brand,
  brandHref,
  brandNewTab,
  brandFontStyle,
  brandSize,
  color,
  background,
  border,
  radius,
  shadow,
  blur,
  padding,
  open,
  menuLabel,
  closeLabel,
  showLabel,
  ariaLabel,
  onToggle,
  buttonRef,
  barRef,
  fromClosed,
  reduce,
}) {
  const isStatic = [RenderTarget.canvas, RenderTarget.thumbnail, RenderTarget.export].includes(
    RenderTarget.current(),
  );
  const [hover, setHover] = useState(false);
  const line = {
    display: "block",
    height: 2,
    borderRadius: 2,
    background: "currentColor",
    transformOrigin: "center",
  };
  const active = (!isStatic && hover) || open; // Two-phase morph: lines meet in the middle, then rotate into an X.
  // Closing plays the same path in reverse.
  const dur = isStatic || reduce ? 0 : ICON_MS / 1e3;
  const phase = { duration: dur, times: [0, 0.5, 1], ease: EASE_SMOOTH }; // Variants only re-run when the open/closed state flips, so hovering
  // (which only changes the bottom line width via CSS) never replays the morph.
  const topVariants = {
    open: { y: [null, 3.5, 3.5], rotate: [null, 0, 45], transition: phase },
    closed: { y: [null, 3.5, 0], rotate: [null, 0, 0], transition: phase },
  };
  const bottomVariants = {
    open: { y: [null, -3.5, -3.5], rotate: [null, 0, -45], transition: phase },
    closed: { y: [null, -3.5, 0], rotate: [null, 0, 0], transition: phase },
  };
  const state = open ? "open" : "closed";
  const widthTransition = reduce ? undefined : "width 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
  const labelTransition = { duration: dur, ease: EASE_SMOOTH };
  const labelBase = { gridArea: "1 / 1", whiteSpace: "nowrap", display: "block" };
  const showImage = logo === "image" && logoImage && logoImage.src;
  return /*#__PURE__*/ _jsxs("div", {
    ref: barRef,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      boxSizing: "border-box",
      padding,
      color,
      background,
      border: "1px solid " + border,
      borderRadius: radius,
      boxShadow: shadow
        ? "0 12px 32px -14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.35)"
        : undefined,
      backdropFilter: blur ? "blur(" + blur + "px) saturate(160%)" : undefined,
      WebkitBackdropFilter: blur ? "blur(" + blur + "px) saturate(160%)" : undefined,
      flex: "none",
    },
    children: [
      /*#__PURE__*/ _jsxs("a", {
        className: "smo-brand",
        href: brandHref,
        target: brandNewTab ? "_blank" : undefined,
        rel: brandNewTab ? "noopener noreferrer" : undefined,
        style: {
          ...brandFontStyle,
          fontSize: brandSize,
          color: "inherit",
          textDecoration: "none",
          cursor: brandHref ? "pointer" : "default",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        },
        children: [
          logo === "mark" && /*#__PURE__*/ _jsx(Mark, { size: logoSize }),
          showImage &&
            /*#__PURE__*/ _jsx("img", {
              src: logoImage.src,
              srcSet: logoImage.srcSet,
              alt: logoImage.alt || "",
              style: { height: logoSize, width: "auto", display: "block", flex: "none" },
            }),
          brand && /*#__PURE__*/ _jsx("span", { className: "smo-brand-text", children: brand }),
        ],
      }),
      /*#__PURE__*/ _jsxs("button", {
        ref: buttonRef,
        type: "button",
        className: "smo-btn",
        "aria-label": ariaLabel,
        "aria-expanded": open,
        onClick: isStatic ? undefined : onToggle,
        onPointerEnter: (e) => {
          if (!isStatic && e.pointerType === "mouse") setHover(true);
        },
        onPointerLeave: () => setHover(false),
        style: {
          appearance: "none",
          WebkitAppearance: "none",
          background: "none",
          border: 0,
          padding: 0,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          color: "inherit",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        },
        children: [
          showLabel &&
            /*#__PURE__*/ _jsxs("span", {
              "aria-hidden": "true",
              style: {
                ...brandFontStyle,
                fontSize: Math.round(brandSize * 0.82),
                letterSpacing: "0.02em",
                lineHeight: 1,
                display: "grid",
                justifyItems: "end",
                overflow: "hidden",
                padding: "3px 0",
                margin: "-3px 0",
                opacity: active ? 1 : 0.7,
                transition: reduce ? undefined : "opacity 0.3s",
              },
              children: [
                /*#__PURE__*/ _jsx(motion.span, {
                  style: labelBase,
                  initial: !isStatic && fromClosed ? { y: 0, opacity: 1 } : false,
                  animate: { y: open ? -12 : 0, opacity: open ? 0 : 1 },
                  transition: labelTransition,
                  children: menuLabel,
                }),
                /*#__PURE__*/ _jsx(motion.span, {
                  style: labelBase,
                  initial: !isStatic && fromClosed ? { y: 12, opacity: 0 } : false,
                  animate: { y: open ? 0 : 12, opacity: open ? 1 : 0 },
                  transition: labelTransition,
                  children: closeLabel,
                }),
              ],
            }),
          /*#__PURE__*/ _jsxs("span", {
            className: "smo-icon",
            style: {
              width: 40,
              height: 40,
              borderRadius: 999,
              background: active ? mix(color, 14) : mix(color, 7),
              transition: reduce ? undefined : "background-color 0.35s ease",
              border: "1px solid " + mix(color, 12),
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 5,
              boxSizing: "border-box",
              padding: "0 11px",
              flex: "none",
            },
            children: [
              /*#__PURE__*/ _jsx(motion.span, {
                style: { ...line, width: 18 },
                variants: isStatic
                  ? { open: { y: 3.5, rotate: 45 }, closed: { y: 0, rotate: 0 } }
                  : topVariants,
                transition: isStatic ? { duration: 0 } : undefined,
                initial: !isStatic && fromClosed ? "closed" : false,
                animate: state,
              }),
              /*#__PURE__*/ _jsx(motion.span, {
                style: { ...line, width: open || hover ? 18 : 11, transition: widthTransition },
                variants: isStatic
                  ? { open: { y: -3.5, rotate: -45 }, closed: { y: 0, rotate: 0 } }
                  : bottomVariants,
                transition: isStatic ? { duration: 0 } : undefined,
                initial: !isStatic && fromClosed ? "closed" : false,
                animate: state,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
/**
 * Motion Overlay Menu
 * Floating glass header that opens a full-screen overlay. Links reveal with a
 * staggered blur + slide, hover shifts the active link and dims the others.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 66
 * @framerDisableUnlink
 */
export interface MotionOverlayMenuLink {
  label?: string;
  link?: string;
  newTab?: boolean;
}

export interface MotionOverlayMenuProps {
  logo?: "mark" | "image" | "none";
  logoImage?: { src: string; alt?: string };
  logoSize?: number;
  brand?: string;
  brandLink?: string;
  brandNewTab?: boolean;
  links?: MotionOverlayMenuLink[];
  note?: string;
  noteLink?: string;
  noteNewTab?: boolean;
  secondary?: MotionOverlayMenuLink[];
  menuLabel?: string;
  closeLabel?: string;
  showLabel?: boolean;
  showNumbers?: boolean;
  align?: "left" | "center";
  reveal?: "circle" | "wipe" | "fade";
  /** Milliseconds between link reveals. */
  stagger?: number;
  /** Seconds. */
  duration?: number;
  hoverShift?: number;
  dimOthers?: boolean;
  brandFont?: React.CSSProperties;
  linkFont?: React.CSSProperties;
  headerColor?: string;
  barBackground?: string;
  barBorder?: string;
  overlayBackground?: string;
  overlayZIndex?: number;
  overlayText?: string;
  overlayBar?: string;
  accent?: string;
  glow?: string;
  barRadius?: string;
  barShadow?: boolean;
  barBlur?: number;
  blur?: number;
  headerPadding?: string;
  overlayPadding?: string;
  canvasHeight?: number;
  openOnCanvas?: boolean;
  style?: React.CSSProperties;
}

export function MotionOverlayMenu(props: MotionOverlayMenuProps) {
  const {
    logo = "mark",
    logoImage,
    logoSize = 22,
    brand = "Meridian",
    brandLink,
    brandNewTab = false,
    links = DEFAULT_LINKS,
    note = "\xa9 Made by Matt",
    noteLink,
    noteNewTab = false,
    secondary = DEFAULT_SECONDARY,
    menuLabel = "Menu",
    closeLabel = "Close",
    showLabel = true,
    showNumbers = true,
    align = "left",
    reveal = "circle",
    stagger = 70,
    duration = 0.8,
    hoverShift = 16,
    dimOthers = true,
    brandFont,
    linkFont,
    headerColor = "#111111",
    barBackground = "rgba(255, 255, 255, 0.62)",
    barBorder = "rgba(0, 0, 0, 0.08)",
    overlayBackground = "rgba(10, 10, 11, 0.94)",
    overlayZIndex = DEFAULT_OVERLAY_Z_INDEX,
    overlayText = "#FAFAFA",
    overlayBar = "rgba(255, 255, 255, 0.06)",
    accent = "#8A8A8E",
    glow = "rgba(255, 255, 255, 0.08)",
    barRadius = "999px",
    barShadow = true,
    barBlur = 16,
    blur = 20,
    headerPadding = "12px 12px 12px 24px",
    overlayPadding = "40px 32px 40px 32px",
    canvasHeight = 800,
    openOnCanvas = false,
    style,
  } = props;
  const isStaticRenderer = false;
  const target = RenderTarget.current();
  const isCanvas =
    isStaticRenderer ||
    target === RenderTarget.canvas ||
    target === RenderTarget.thumbnail ||
    target === RenderTarget.export;
  const reduceMotion = useReducedMotion();
  const reduce = isCanvas || !!reduceMotion;
  const [openState, setOpenState] = useState(false);
  const [closing, setClosing] = useState(false);
  const open = isCanvas ? !!openOnCanvas : openState;
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [barRect, setBarRect] = useState(null);
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const toggleRef = useRef(null);
  const overlayRef = useRef(null);
  const wasOpen = useRef(false);
  const closeTimer = useRef(null);
  const origin = useRef("calc(100% - 44px) 36px");
  useEffect(() => {
    setMounted(true);
  }, []); // Measure only this component's own bar. The portal, menu and footer use
  // one horizontal grid even when Framer constrains the instance with maxWidth.
  const measure = useCallback(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar || typeof window === "undefined") return;
    const r = root.getBoundingClientRect(); // Keep the circular reveal anchored to this bar's button after resize.
    // Read both bounds together before committing the updated layout.
    const button = toggleRef.current;
    if (button) {
      const buttonRect = button.getBoundingClientRect();
      origin.current =
        Math.round(buttonRect.right - 20) +
        "px " +
        Math.round(buttonRect.top + buttonRect.height / 2) +
        "px";
    }
    const computed = window.getComputedStyle(bar);
    const brandNode = bar.querySelector(".smo-brand");
    const brandText = bar.querySelector(".smo-brand-text");
    const next = {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      layoutWidth: root.offsetWidth,
      insetLeft:
        (parseFloat(computed.paddingLeft) || 0) + (parseFloat(computed.borderLeftWidth) || 0),
      insetRight:
        (parseFloat(computed.paddingRight) || 0) + (parseFloat(computed.borderRightWidth) || 0), // offsetLeft uses local layout coordinates, including on a scaled
      // or rotated canvas; both elements share the same offsetParent.
      brandOffset:
        brandNode && brandText ? Math.max(0, brandText.offsetLeft - brandNode.offsetLeft) : 0,
    };
    setNarrow(next.layoutWidth < 640);
    setBarRect((previous) =>
      previous && Object.keys(next).every((key) => previous[key] === next[key]) ? previous : next,
    );
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    measure();
    const ro = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    if (rootRef.current) ro?.observe(rootRef.current);
    if (barRef.current) {
      ro?.observe(barRef.current);
      const brandNode = barRef.current.querySelector(".smo-brand");
      if (brandNode) ro?.observe(brandNode);
    } // A centered max-width bar can move without changing its own width.
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, headerPadding, logo, logoSize, logoImage?.src, brand, brandFont]);
  const openMenu = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const el = toggleRef.current;
    if (el && typeof window !== "undefined") {
      const r = el.getBoundingClientRect();
      origin.current =
        Math.round(r.left + r.width - 20) + "px " + Math.round(r.top + r.height / 2) + "px";
    }
    measure();
    setHovered(null);
    setClosing(false);
    setOpenState(true);
  }, [measure]); // Close: morph the icon back first, then let the overlay leave.
  const closeMenu = useCallback(() => {
    if (closeTimer.current) return;
    setClosing(true);
    const wait = reduce ? 0 : ICON_MS * 0.35;
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setClosing(false);
      setOpenState(false);
    }, wait);
  }, [reduce]);
  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  ); // Escape key, scroll lock and re-measure while open (live only)
  useEffect(() => {
    if (!open || isCanvas || typeof document === "undefined") return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    measure();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, isCanvas, closeMenu, measure]); // Focus management: dialog on open, back to the toggle on close
  useEffect(() => {
    if (isCanvas) return;
    if (open) {
      wasOpen.current = true;
      const t = window.setTimeout(() => {
        // Announce the dialog without highlighting a menu item on open.
        // Actual Tab navigation still gives links their visible focus ring.
        overlayRef.current?.focus({ preventScroll: true });
      }, 80);
      return () => window.clearTimeout(t);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [open, isCanvas]);
  const onOverlayKeyDown = (e) => {
    if (e.key !== "Tab" || !overlayRef.current) return;
    const nodes = overlayRef.current.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])',
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (active === overlayRef.current) {
      e.preventDefault();
      const initialLink = overlayRef.current.querySelector(".smo-link[href]");
      (e.shiftKey ? last : initialLink || first).focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };
  const { fontStyle: brandFontStyle, size: brandSize } = splitFont(brandFont, 15);
  const { fontStyle: linkFontStyle, size: linkSize } = splitFont(linkFont, 72);
  const d = isCanvas ? 0 : reduce ? 0.2 : Math.max(0.1, duration || 0.8);
  const staggerS = reduce ? 0 : Math.max(0, stagger || 0) / 1e3;
  const brandHref = configuredHref(brandLink);
  const noteHref = configuredHref(noteLink);
  const iconOpen = open && !closing;
  const smallSize = Math.max(12, Math.round(brandSize * 0.86));
  const circleAt = isCanvas ? "calc(100% - 44px) 36px" : origin.current;
  const bgVariants =
    reveal === "wipe"
      ? {
          hidden: { clipPath: "inset(0 0 100% 0)" },
          visible: { clipPath: "inset(0 0 0% 0)", transition: { duration: d, ease: EASE_OUT } },
          exit: { clipPath: "inset(0 0 100% 0)", transition: { duration: d, ease: EASE_IN } },
        }
      : reveal === "circle"
        ? {
            hidden: { clipPath: "circle(0% at " + circleAt + ")" },
            visible: {
              clipPath: "circle(150% at " + circleAt + ")",
              transition: { duration: d * 1.1, ease: EASE_OUT },
            },
            exit: {
              clipPath: "circle(0% at " + circleAt + ")",
              transition: { duration: d * 1.1, ease: EASE_IN },
            },
          }
        : {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: d * 0.6, ease: EASE_OUT } },
            exit: { opacity: 0, transition: { duration: d * 0.6, ease: EASE_IN } },
          };
  const itemVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : 28, filter: reduce ? "blur(0px)" : "blur(12px)" },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: d, ease: EASE_OUT, delay: d * 0.3 + i * staggerS },
    }),
    exit: {
      opacity: 0,
      y: reduce ? 0 : -10,
      filter: reduce ? "blur(0px)" : "blur(8px)",
      transition: { duration: d * 0.35, ease: EASE_IN },
    },
  };
  const footerDelay = isCanvas ? 0 : d * 0.3 + links.length * staggerS + 0.05;
  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: d, ease: EASE_OUT, delay: footerDelay },
    },
    exit: { opacity: 0, transition: { duration: d * 0.3, ease: EASE_IN } },
  };
  const footerVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    visible: (j) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: d * 0.8,
        ease: EASE_OUT,
        delay: isCanvas ? 0 : footerDelay + 0.1 + j * 0.06,
      },
    }),
    exit: { opacity: 0, transition: { duration: d * 0.3, ease: EASE_IN } },
  };
  const fixedBar = !isCanvas && barRect;
  const overlayBarBorder = mix(overlayText, 14);
  const hasFooter = !!note || secondary.length > 0;
  const contentLeft = barRect?.insetLeft ?? 25;
  const contentRight = barRect?.insetRight ?? 13;
  const brandOffset =
    barRect?.brandOffset ??
    (logo === "mark" || (logo === "image" && logoImage?.src) ? logoSize + 10 : 0);
  const leftAligned = align !== "center" || narrow;
  const numberWidth = brandOffset || Math.max(20, linkSize * 0.36);
  const menuWidth = isCanvas ? barRect?.layoutWidth : barRect?.width;
  const overlayLayer = Number.isFinite(overlayZIndex)
    ? Math.min(2147483647, Math.max(1, Math.round(overlayZIndex)))
    : DEFAULT_OVERLAY_Z_INDEX;
  const overlay = /*#__PURE__*/ _jsxs(motion.div, {
    ref: overlayRef,
    "data-smo-static": isCanvas ? "" : undefined,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Menu",
    tabIndex: -1,
    onKeyDown: onOverlayKeyDown,
    variants: bgVariants,
    initial: isCanvas ? false : "hidden",
    animate: "visible",
    exit: isCanvas ? undefined : "exit",
    style: {
      position: isCanvas ? "absolute" : "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: isCanvas ? canvasHeight : "100%",
      zIndex: overlayLayer,
      outline: "none",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: overlayBackground,
      backdropFilter: blur ? "blur(" + blur + "px)" : undefined,
      WebkitBackdropFilter: blur ? "blur(" + blur + "px)" : undefined,
      color: overlayText,
      willChange: "clip-path, opacity",
    },
    children: [
      /*#__PURE__*/ _jsx("div", {
        "aria-hidden": "true",
        style: {
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(720px 520px at 88% 12%, " + glow + ", transparent 70%)",
        },
      }),
      /*#__PURE__*/ _jsx("div", {
        style: fixedBar
          ? {
              position: "absolute",
              top: barRect.top,
              left: barRect.left,
              width: barRect.width,
              zIndex: 2,
            }
          : { position: "relative", width: "100%", zIndex: 2 },
        children: /*#__PURE__*/ _jsx(TopBar, {
          logo: logo,
          logoImage: logoImage,
          logoSize: logoSize,
          brand: brand,
          brandHref: brandHref,
          brandNewTab: brandNewTab,
          brandFontStyle: brandFontStyle,
          brandSize: brandSize,
          color: overlayText,
          background: overlayBar,
          border: overlayBarBorder,
          radius: barRadius,
          shadow: false,
          blur: 0,
          padding: headerPadding,
          open: iconOpen,
          menuLabel: menuLabel,
          closeLabel: closeLabel,
          showLabel: showLabel,
          ariaLabel: "Close menu",
          onToggle: closeMenu,
          fromClosed: true,
          reduce: reduce,
        }),
      }),
      fixedBar &&
        /*#__PURE__*/ _jsx("div", {
          style: { flex: "none", height: barRect.top + barRect.height },
        }),
      /*#__PURE__*/ _jsxs("div", {
        className: "smo-nav",
        style: {
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column", // Preserve vertical overlay padding; horizontal content
          // follows the bar's logo and close-button inner edges.
          padding: overlayPadding,
          paddingLeft: contentLeft,
          paddingRight: contentRight,
          width: fixedBar ? barRect.width : "100%",
          marginLeft: fixedBar ? barRect.left : 0,
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
        },
        children: [
          /*#__PURE__*/ _jsx("nav", {
            "aria-label": "Main",
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: narrow ? "flex-start" : "center",
              paddingTop: narrow ? "6vh" : 0,
              paddingBottom: hasFooter ? 32 : 0,
            },
            children: /*#__PURE__*/ _jsx("ul", {
              style: {
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: align === "center" && !narrow ? "center" : "flex-start",
                gap: narrow ? "0.22em" : "0.1em",
                ...linkFontStyle,
                fontSize: menuWidth
                  ? Math.min(linkSize, menuWidth * (narrow ? 0.13 : 0.11))
                  : "min(" + linkSize + "px, " + (narrow ? 13 : 11) + "vw)",
              },
              children: links.map((item, i) => {
                const isHovered = hovered === i;
                const dimmed = dimOthers && hovered !== null && !isHovered;
                const href = configuredHref(item.link);
                return /*#__PURE__*/ _jsx(
                  motion.li,
                  {
                    custom: i,
                    variants: itemVariants,
                    style: { margin: 0, padding: 0, willChange: "transform, opacity, filter" },
                    children: /*#__PURE__*/ _jsxs(motion.a, {
                      className: "smo-link",
                      href: href,
                      target: item.newTab ? "_blank" : undefined,
                      rel: item.newTab ? "noopener noreferrer" : undefined,
                      "data-smo-first": i === 0 ? "" : undefined,
                      onPointerEnter: (e) => {
                        if (!isCanvas && href && e.pointerType === "mouse") setHovered(i);
                      },
                      onPointerLeave: () => setHovered((h) => (h === i ? null : h)),
                      onClick: () => {
                        if (href && !isCanvas) closeMenu();
                      },
                      animate: {
                        x: isHovered && !reduce ? hoverShift : 0,
                        opacity: dimmed ? 0.32 : 1,
                      },
                      transition: isCanvas
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 320, damping: 28, mass: 0.7 },
                      style: {
                        display: "inline-flex",
                        alignItems: "baseline",
                        gap: leftAligned ? 0 : "0.28em",
                        color: "inherit",
                        textDecoration: "none",
                        cursor: href ? "pointer" : "default",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        touchAction: "manipulation",
                        padding: "0.02em 0",
                        paddingLeft: leftAligned && !showNumbers ? brandOffset : undefined,
                      },
                      children: [
                        showNumbers &&
                          /*#__PURE__*/ _jsx("span", {
                            "aria-hidden": "true",
                            style: {
                              fontSize: "max(11px, 0.18em)",
                              fontWeight: 500,
                              letterSpacing: "0.08em",
                              lineHeight: 1,
                              color: accent,
                              fontVariantNumeric: "tabular-nums",
                              transform: "translateY(-0.9em)",
                              display: "inline-block",
                              flex: "none",
                              width: leftAligned ? numberWidth : undefined,
                              marginLeft:
                                leftAligned && !brandOffset
                                  ? -Math.min(contentLeft, numberWidth)
                                  : undefined,
                            },
                            children: pad(i + 1),
                          }),
                        /*#__PURE__*/ _jsx("span", { children: item.label }),
                      ],
                    }),
                  },
                  i,
                );
              }),
            }),
          }),
          hasFooter &&
            /*#__PURE__*/ _jsxs("div", {
              style: { flex: "none" },
              children: [
                /*#__PURE__*/ _jsx(motion.div, {
                  variants: dividerVariants,
                  style: {
                    height: 1,
                    background: mix(overlayText, 14),
                    transformOrigin: "left",
                    marginBottom: 20,
                  },
                }),
                /*#__PURE__*/ _jsxs("div", {
                  style: {
                    display: "flex",
                    flexDirection: narrow ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: narrow ? "flex-start" : "center",
                    gap: narrow ? 16 : 24,
                    ...brandFontStyle,
                    fontSize: smallSize,
                    lineHeight: 1.4,
                  },
                  children: [
                    note
                      ? /*#__PURE__*/ _jsx(motion.div, {
                          custom: 0,
                          variants: footerVariants,
                          style: { maxWidth: 420 },
                          children: /*#__PURE__*/ _jsxs("a", {
                            className: "smo-sec",
                            href: noteHref,
                            target: noteNewTab ? "_blank" : undefined,
                            rel: noteNewTab ? "noopener noreferrer" : undefined,
                            onClick: () => {
                              if (noteHref && !isCanvas) closeMenu();
                            },
                            style: {
                              color: accent,
                              textDecoration: "none",
                              display: "inline-block",
                              paddingBottom: 3,
                              position: "relative",
                              cursor: noteHref ? "pointer" : "default",
                            },
                            children: [
                              note,
                              /*#__PURE__*/ _jsx("span", {
                                className: "smo-ul",
                                "aria-hidden": "true",
                                style: {
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  height: 1,
                                  background: "currentColor",
                                },
                              }),
                            ],
                          }),
                        })
                      : /*#__PURE__*/ _jsx("span", {}),
                    secondary.length > 0 &&
                      /*#__PURE__*/ _jsx("ul", {
                        "aria-label": "Secondary",
                        style: {
                          listStyle: "none",
                          margin: 0,
                          padding: 0,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px 24px",
                          alignSelf: narrow ? "flex-start" : undefined,
                          justifyContent: narrow ? "flex-start" : "flex-end",
                        },
                        children: secondary.map((item, j) =>
                          /*#__PURE__*/ _jsx(
                            motion.li,
                            {
                              custom: j + 1,
                              variants: footerVariants,
                              style: { margin: 0, padding: 0 },
                              children: /*#__PURE__*/ _jsxs("a", {
                                className: "smo-sec",
                                href: configuredHref(item.link),
                                target: item.newTab ? "_blank" : undefined,
                                rel: item.newTab ? "noopener noreferrer" : undefined,
                                onClick: () => {
                                  if (configuredHref(item.link) && !isCanvas) closeMenu();
                                },
                                style: {
                                  color: "inherit",
                                  textDecoration: "none",
                                  display: "inline-block",
                                  paddingBottom: 3,
                                  position: "relative",
                                  cursor: configuredHref(item.link) ? "pointer" : "default",
                                },
                                children: [
                                  item.label,
                                  /*#__PURE__*/ _jsx("span", {
                                    className: "smo-ul",
                                    "aria-hidden": "true",
                                    style: {
                                      position: "absolute",
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      height: 1,
                                      background: "currentColor",
                                    },
                                  }),
                                ],
                              }),
                            },
                            j,
                          ),
                        ),
                      }),
                  ],
                }),
              ],
            }),
        ],
      }),
    ],
  });
  const presence = isCanvas
    ? open
      ? overlay
      : null
    : /*#__PURE__*/ _jsx(AnimatePresence, { children: open ? overlay : null });
  const usePortal = !isCanvas && mounted && typeof document !== "undefined";
  return /*#__PURE__*/ _jsxs("div", {
    ref: rootRef,
    "data-smo-static": isCanvas ? "" : undefined,
    style: {
      ...style,
      position: "relative",
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",
    },
    children: [
      /*#__PURE__*/ _jsx("style", { children: CSS }),
      /*#__PURE__*/ _jsx(TopBar, {
        logo: logo,
        logoImage: logoImage,
        logoSize: logoSize,
        brand: brand,
        brandHref: brandHref,
        brandNewTab: brandNewTab,
        brandFontStyle: brandFontStyle,
        brandSize: brandSize,
        color: headerColor,
        background: barBackground,
        border: barBorder,
        radius: barRadius,
        shadow: barShadow,
        blur: barBlur,
        padding: headerPadding,
        open: iconOpen,
        menuLabel: menuLabel,
        closeLabel: closeLabel,
        showLabel: showLabel,
        ariaLabel: "Open menu",
        onToggle: open ? closeMenu : openMenu,
        buttonRef: toggleRef,
        barRef: barRef,
        reduce: reduce,
      }),
      usePortal ? /*#__PURE__*/ createPortal(presence, document.body) : presence,
    ],
  });
}

MotionOverlayMenu.displayName = "MotionOverlayMenu";

export default MotionOverlayMenu;
