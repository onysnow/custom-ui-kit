/* eslint-disable @typescript-eslint/ban-ts-comment, no-empty, react-hooks/exhaustive-deps */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
// Timeline Slider
// A milestone timeline whose cards grow out of their own rail. Built on the "Appon Timeline"
// reference (Olia Gozha, Dribbble 2015), analysed frame by frame: a card grows out of its dot —
// first as a slim bud, then to its full size — and pushes the following milestones aside while
// its text arrives.
// Vertical: a thread of light runs down the rail at the reading position; when it reaches a dot,
// the dot ignites and its card unfolds, pushing the next dates down.
// Horizontal: a strip of its own that scrolls natively (swipe, drag, arrows, keys) under a light
// in the middle. The milestone at the light unfolds out of its dot, centred, while the others
// wait folded on either side; the rail runs in from the left and out to the right, and the edges
// fade, so the first and the last milestone rest in the same calm composition.
// Intro: when the timeline is in view on arrival, the first card unfolds by itself (horizontal:
// the light glides in along the rail first); everything after that follows the scroll, one card
// at a time. Click, tap and the keyboard open or close any card at any time.
// One animation loop drives sizes, the light and the rail together — no layout reads per frame
// and no React renders while scrolling. Canvas, thumbnails and export render a motionless state.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef } from "react";
/* ------------------------------------------------------------------------ */ /* Constants                                                                 */ const CREDIT =
  "Built by Matthias \xd6lschlegel 💪  \n[Explore more components](https://dub.sh/dsw13)";
const DOT_R = 5; // dot radius
const DOT_GAP = 5; // air between a dot and the rail segments
const RAIL_W = 2;
const BREAKPOINT = 560; // below this list width the dates move into the cards (vertical)
const RAIL_GAP_WIDE = 24; // date column -> rail
const CARD_GAP_WIDE = 30; // rail -> card
const RAIL_X_COMPACT = 7;
const CARD_GAP_COMPACT = 22;
const TITLE_GAP = 8; // space between title and text inside a card
const TAIL_W = 11;
const BUD = 14; // width of the bud next to the tail before it stretches across
const HYSTERESIS = 12; // px the light has to fall back behind a dot before its card folds again
const OPEN_SHARE = 0.82; // horizontal: a milestone slot (and its card) takes at most this share
const INTRO_DELAY = 450; // ms between arriving and the first card unfolding
// Horizontal. The light is drawn exactly on the dot of the milestone it rests on; it is detected a
// few pixels ahead so that rounding can never leave a resting milestone just outside it.
const H_EPS = 4; // "Unfolded: Current": a card unfolds once its dot is this close to the light and the strip has
// (almost) come to rest, and folds as soon as its dot has moved this far away again.
const ZONE_IN = 5;
const V_SLOW = 0.3; // px/ms: slower than this, the strip counts as arriving
// The milestone the strip is heading for starts to light up and unfold this share of a slot
// before it reaches the light, so the card is already opening while the strip settles.
const ANTICIPATE = 0.12; // How briskly the strip glides to a milestone (1/s). It moves like a critically damped spring:
// it takes over the speed of a flick or swipe and settles softly, never past the milestone.
const SPRING_W = 10.5;
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) break;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (!(t >= 0 && t <= 1) || Math.abs(sx(t) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      t = x;
      for (let i = 0; i < 30; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-6) break;
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return sy(t);
  };
} // The same curves the unfolding has always used.
const EASE_OUT = cubicBezier(0.22, 1, 0.36, 1);
const EASE_UNFOLD = cubicBezier(0.32, 0.72, 0, 1);
const EASE_FOLD = cubicBezier(0.4, 0, 0.2, 1);
const EASE_BUD_H = cubicBezier(0.33, 1, 0.68, 1); // horizontal: the bud stretches along the travel, calmer
const EASE_GLIDE = cubicBezier(0.45, 0, 0.15, 1); // horizontal intro: the light glides in and settles
const LINEAR = (x) => x;
const RATIOS = {
  "21:9": "21 / 9",
  "2:1": "2 / 1",
  "16:9": "16 / 9",
  "3:2": "3 / 2",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
}; // Contrast (WCAG): dark — text on card 8.1:1, dates on background 6.3:1, collapsed titles 7.0:1;
// light — text on card 6.6:1, dates 4.9:1, collapsed titles 5.1:1, link ink 5.6:1.
const THEMES = {
  dark: {
    background: "#11141A",
    card: "#1D222B",
    border: "rgba(255, 255, 255, 0.07)",
    rail: "#303744",
    title: "#F3F5F8",
    text: "#AEB6C3",
    date: "#8E97A6",
    dark: true,
  },
  light: {
    background: "#F4F5F7",
    card: "#FFFFFF",
    border: "rgba(15, 18, 23, 0.07)",
    rail: "#D2D8E0",
    title: "#0F1217",
    text: "#555E6B",
    date: "#646C79",
    dark: false,
  },
};
function sampleImage(file, alt) {
  const src = "https://framerusercontent.com/images/" + file;
  return {
    src,
    srcSet: `${src}?scale-down-to=512 512w, ${src}?scale-down-to=1024 1024w, ${src} 2000w`,
    alt,
  };
} // Sample photos (Unsplash licence): Nikita Kachanovsky, Takashi Miyazaki. Framer drops images
// from array defaults, so sample items carry a hidden key instead; "Samples" turns them off.
const SAMPLE_IMAGES = {
  desk: sampleImage(
    "IwMMgI5HL625c4VsIc3xZceB9g.jpg",
    "A calm desk at night with a laptop and a monitor",
  ),
  tokyo: sampleImage(
    "Y5U3cMvBzgO82l93LAtDeww9fKs.jpg",
    "Tokyo skyline at blue hour with Tokyo Tower",
  ),
};
const DEFAULT_ITEMS = [
  {
    date: "Feb 2021",
    title: "The first sketch",
    text: "A weekend idea became a paper prototype, a name and one promise: make it feel calm.",
    linkLabel: "Read more",
    newTab: false,
  },
  {
    date: "Sep 2021",
    title: "Founding team",
    text: "Three people, one shared desk and a clear goal for the year ahead.",
    linkLabel: "Read more",
    newTab: false,
  },
  {
    date: "Apr 2022",
    title: "Private beta",
    text: "The first two hundred users shaped every screen we shipped that spring.",
    sample: "desk",
    linkLabel: "Read more",
    newTab: false,
  },
  {
    date: "Jan 2023",
    title: "Version 1.0",
    text: "Public launch after fourteen months of listening, cutting and polishing.",
    linkLabel: "Read more",
    newTab: false,
  },
  {
    date: "Oct 2023",
    title: "Series A",
    text: "New partners, a bigger team and room to think in years instead of weeks.",
    linkLabel: "Read more",
    newTab: false,
  },
  {
    date: "Jun 2024",
    title: "Going global",
    text: "Studios in Berlin and Tokyo, and a product that now speaks eleven languages.",
    sample: "tokyo",
    linkLabel: "Read more",
    newTab: false,
  },
  {
    date: "Mar 2026",
    title: "Today",
    text: "Two million people start their day with it. The next chapter begins here.",
    linkLabel: "Read more",
    newTab: false,
  },
]; // Runs once while server-rendered markup is still being parsed (React never executes it when it
// renders on the client). It prepares the resting state before the first paint: cards that
// already sit behind the light open (unless the intro will unfold the first one), dots light up,
// the rail fills and photos get ready to fade in. Until it has run the markup stays invisible
// (a CSS fallback reveals it after 1.2 s), so even a paint that sneaks in mid-parse can never show
// cards jumping open.
const PRE =
  "(function(s){var r=s&&s.parentNode&&s.parentNode.parentNode;if(!r||!r.querySelector)return;try{" +
  'var A=function(k){return s.getAttribute("data-"+k)},c=A("c"),md=A("m"),h=A("d")==="h",q=+A("rl")/100,' +
  'G=+A("g"),it=A("i")==="1",i,d,b;' +
  'r.setAttribute("data-pre","1");r.setAttribute("data-still","");' +
  'var F=window.requestAnimationFrame;if(F)F(function(){F(function(){r.removeAttribute("data-still")})});' +
  'var I=r.querySelectorAll("."+c+"-media img");for(i=0;i<I.length;i++)(function(g){' +
  'var z=function(){g.setAttribute("data-loaded","1")};if(g.complete&&g.naturalWidth)z();' +
  'else g.addEventListener("load",function(){if(g.decode)g.decode().then(z,z);else z()})})(I[i]);' +
  'r.setAttribute("data-js","1");' +
  'var R=r.querySelectorAll("."+c+"-row"),n=R.length,W=function(k){return R[k].querySelector("."+c+"-wrap")};' +
  'for(i=0;i<n;i++)if(R[i].getAttribute("data-open")!=="true"){d=W(i);if(d)d.setAttribute("inert","")}' +
  'var t=r.querySelector("."+c+"-track");if(!n||!t||md!=="scroll")return;' +
  'var m=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);if(it&&!m)return;' +
  'var O=function(k){R[k].setAttribute("data-open","true");b=R[k].querySelector("."+c+"-head");' +
  'if(b)b.setAttribute("aria-expanded","true");d=W(k);if(d)d.removeAttribute("inert")},' +
  "kk=r.offsetWidth?r.getBoundingClientRect().width/r.offsetWidth:1;if(!(kk>0))kk=1;" +
  'var C=r.querySelector("."+c+"-comet"),o0,Z=0,L,y=[],' +
  'P=function(k){var g=R[k].querySelector("."+c+"-dot");if(!g)return 0;var u=g.getBoundingClientRect();' +
  "return (h?u.left+u.width/2:u.top+u.height/2)-o0};" +
  'if(h){var st=r.querySelector("."+c+"-stage");if(!st||!C)return;o0=st.getBoundingClientRect().left;Z=st.scrollLeft;' +
  "L=(C.getBoundingClientRect().left-o0)/kk+Z+" +
  H_EPS +
  "}" +
  "else{o0=t.getBoundingClientRect().top;L=((window.innerHeight||document.documentElement.clientHeight||800)*q-o0)/kk}" +
  "var j=-1;" +
  'if(h&&A("o")==="1"&&!m){for(i=0;i<n;i++){if(!(P(i)/kk+Z<=L+.5))break;j=i}' +
  "if(j>=0&&Math.abs(P(j)/kk+Z-L+" +
  H_EPS +
  ")<=" +
  ZONE_IN +
  ")O(j)}" +
  "else for(i=0;i<n;i++){if(!(m||P(i)/kk+Z<=L+.5))break;O(i)}" +
  'for(i=0;i<n;i++){y.push(P(i)/kk+Z);if(L>=y[i]-.5)R[i].setAttribute("data-lit","1")}' +
  "var V=h?L-" +
  H_EPS +
  ":L;" +
  'for(i=0;i<n-1;i++){d=R[i].querySelector("."+c+"-lit");if(d){var a=y[i]+G,l=Math.max(1,y[i+1]-y[i]-2*G),f=(V-a)/l;' +
  'f=f<0?0:f>1?1:f;d.style.transform=(h?"scaleX(":"scaleY(")+f.toFixed(4)+")"}}' +
  "if(C&&n>1){var S=function(p,e,v){var u=(v-p)/(e-p);u=u<0?0:u>1?1:u;return u*u*(3-2*u)},A0=y[0],B0=y[n-1];" +
  "if(h)C.style.opacity=(S(A0-26,A0-4,V)*(1-S(B0+40,B0+90,V))).toFixed(3);" +
  'else{var Q=L<A0?A0:L>B0?B0:L;C.style.transform="translate3d(0,"+Q.toFixed(2)+"px,0)";' +
  "C.style.opacity=(S(A0,A0+28,L)*(1-S(B0-36,B0,L))).toFixed(3)}}" +
  '}catch(e){}finally{r.removeAttribute("data-hold")}})(document.currentScript)';
/* ------------------------------------------------------------------------ */ /* Helpers                                                                   */ const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
function smoothstep(a, b, v) {
  if (b === a) return v >= b ? 1 : 0;
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
function toPx(v, fallback) {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    if (!isNaN(n)) {
      if (/r?em$/.test(v.trim())) return n * 16;
      return n;
    }
  }
  return fallback;
}
function lineHeightPx(font, fallbackSize, fallbackRatio) {
  const size = toPx(font && font.fontSize, fallbackSize);
  const lh = font ? font.lineHeight : undefined;
  if (typeof lh === "number" && isFinite(lh)) return lh * size;
  if (typeof lh === "string") {
    const s = lh.trim();
    const n = parseFloat(s);
    if (!isNaN(n)) {
      if (s.endsWith("px")) return n;
      if (s.endsWith("%")) return (n / 100) * size;
      if (s.endsWith("rem")) return n * 16;
      return (
        n * size // em or unitless
      );
    }
  }
  return fallbackRatio * size;
}
function parseBox(v, fallback) {
  if (typeof v === "number" && isFinite(v)) return [v, v, v, v];
  if (typeof v !== "string") return fallback;
  const p = v
    .trim()
    .split(/\s+/)
    .map((x) => parseFloat(x))
    .filter((x) => !isNaN(x));
  if (p.length === 1) return [p[0], p[0], p[0], p[0]];
  if (p.length === 2) return [p[0], p[1], p[0], p[1]];
  if (p.length === 3) return [p[0], p[1], p[2], p[1]];
  if (p.length >= 4) return [p[0], p[1], p[2], p[3]];
  return fallback;
} // Relative luminance of a colour string (hex, rgb[a], or a Framer token var(--x, fallback)).
function luminance(color) {
  if (!color) return null;
  let c = color.trim();
  const token = c.match(/^var\(\s*--[^,]+,\s*(.+)\)$/);
  if (token) c = token[1].trim();
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;
  const hex = c.match(/^#([0-9a-f]{3,8})$/i);
  const rgb = c.match(/^rgba?\(([^)]+)\)$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4)
      h = h
        .split("")
        .map((x) => x + x)
        .join("");
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
  } else if (rgb) {
    const p = rgb[1].split(/[\s,/]+/).filter(Boolean);
    r = parseFloat(p[0]);
    g = parseFloat(p[1]);
    b = parseFloat(p[2]);
    if (p[3] != null) a = p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
  } else return null;
  if (!(a >= 0.5)) return null;
  const f = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
} // Whether a colour is fully opaque ("transparent", rgba(…, .5), #RRGGBB80 are not). Formats it
// cannot read count as opaque.
function isOpaque(color) {
  if (!color) return false;
  let c = color.trim();
  const token = c.match(/^var\(\s*--[^,]+,\s*(.+)\)$/);
  if (token) c = token[1].trim();
  if (/^transparent$/i.test(c)) return false;
  const hex = c.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    const h = hex[1];
    if (h.length === 4) return parseInt(h[3] + h[3], 16) / 255 >= 0.98;
    if (h.length === 8) return parseInt(h.slice(6, 8), 16) / 255 >= 0.98;
    return true;
  }
  const fn = c.match(/^(?:rgba?|hsla?)\(([^)]+)\)$/i);
  if (fn) {
    const p = fn[1].split(/[\s,/]+/).filter(Boolean);
    if (p[3] == null) return true;
    const a = p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    return !(a < 0.98);
  }
  return true;
}
function fontStyle(font) {
  if (!font) return {};
  const { variant, ...rest } = font;
  return rest;
}
/* ------------------------------------------------------------------------ */ /* Text reveal                                                               */
function RevealText(props) {
  const { text, mode, cls } = props;
  if (mode === "fade" || mode === "none") return /*#__PURE__*/ _jsx(_Fragment, { children: text });
  const lines = text.split(/\r?\n/);
  const out = [];
  let i = 0;
  lines.forEach((line, li) => {
    if (li > 0) out.push(/*#__PURE__*/ _jsx("br", {}, "b" + li));
    line.split(/(\s+)/).forEach((tok, ti) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) {
        out.push(" ");
        i++;
        return;
      }
      if (mode === "typewriter") {
        out.push(
          /*#__PURE__*/ _jsx(
            "span",
            {
              className: cls + "-w",
              children: Array.from(tok).map((ch, ci) =>
                /*#__PURE__*/ _jsx(
                  "span",
                  { className: cls + "-c", style: { ["--i"]: i++ }, children: ch },
                  ci,
                ),
              ),
            },
            li + "-" + ti,
          ),
        );
      } else {
        out.push(
          /*#__PURE__*/ _jsx(
            "span",
            { className: cls + "-w", style: { ["--i"]: i++ }, children: tok },
            li + "-" + ti,
          ),
        );
      }
    });
  });
  return /*#__PURE__*/ _jsx(_Fragment, { children: out });
}
function Row(props) {
  const {
    cls,
    item,
    index,
    count,
    horizontal,
    open,
    lit,
    staticMode,
    u,
    pad,
    radius,
    innerRadius,
    ratio,
    reveal,
    titleTag,
    dateFont,
    titleFont,
    textFont,
    staticFill,
    showStaticComet,
    sampleImages,
    imgSizes,
    titleLinks,
    onToggle,
    onKey,
  } = props;
  const uid = cls + "-" + index;
  const headId = uid + "-h";
  const panelId = uid + "-p";
  const [pt, pr, pb, pl] = pad;
  const isLast = index === count - 1;
  const date = (item.date || "").trim();
  const title = (item.title || "").trim();
  const text = (item.text || "").trim();
  const image =
    item.image && item.image.src
      ? item.image
      : sampleImages && item.sample
        ? SAMPLE_IMAGES[item.sample] || null
        : null;
  const href = (item.link || "").trim();
  const hasLink = href.length > 0;
  const linkLabel = (item.linkLabel || "").trim() || "Read more";
  const TitleTag = titleTag || "h3";
  const cometAt = (staticFill || 0) * 100 + "%"; // The whole card is the click target. Folded: it unfolds (or, on the strip, comes to the
  // light). Open with a link: it follows the link, keeping the modifier keys (Cmd/Ctrl-click
  // opens a background tab). The title's keyboard activation (Enter/Space, detail 0) always
  // folds/unfolds, so the disclosure button keeps working for keyboard and screen readers.
  const onCardClick = (e) => {
    if (staticMode) return;
    const t = e.target;
    if (!t || typeof t.closest !== "function" || t.closest("a")) return;
    const card = e.currentTarget;
    const row = card.parentElement;
    const isOpen = !!row && row.getAttribute("data-open") === "true";
    const head = t.closest("button");
    if (isOpen && hasLink && (!head || (titleLinks && e.detail > 0))) {
      // Selecting text inside the card is not a click on it.
      try {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.anchorNode && card.contains(sel.anchorNode)) return;
      } catch (_) {}
      const a = card.querySelector("a");
      if (!a) return;
      e.preventDefault();
      a.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: 1,
          button: 0,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
        }),
      );
      return;
    }
    if (head || !isOpen) onToggle(index);
  };
  return /*#__PURE__*/ _jsxs("li", {
    className: cls + "-row",
    "data-open": open === undefined ? undefined : open ? "true" : "false",
    "data-lit": lit === undefined ? undefined : lit ? "1" : "0",
    "data-link": hasLink ? "" : undefined,
    suppressHydrationWarning: true,
    children: [
      /*#__PURE__*/ _jsx("span", {
        className: cls + "-date",
        "aria-hidden": "true",
        style: dateFont,
        onClick: () => onToggle(index),
        children: date,
      }),
      /*#__PURE__*/ _jsx("span", { className: cls + "-dot", "aria-hidden": "true" }),
      index === 0
        ? /*#__PURE__*/ _jsx("span", {
            className: cls + "-cap " + cls + "-cap-top",
            "aria-hidden": "true",
          })
        : null,
      isLast
        ? /*#__PURE__*/ _jsx("span", {
            className: cls + "-cap " + cls + "-cap-end",
            "aria-hidden": "true",
          })
        : null,
      !isLast
        ? /*#__PURE__*/ _jsxs("span", {
            className: cls + "-segbox",
            "aria-hidden": "true",
            children: [
              /*#__PURE__*/ _jsx("span", { className: cls + "-seg" }),
              /*#__PURE__*/ _jsxs("span", {
                className: cls + "-lit",
                style:
                  staticFill !== undefined
                    ? { transform: horizontal ? `scaleX(${staticFill})` : `scaleY(${staticFill})` }
                    : undefined,
                suppressHydrationWarning: true,
                children: [
                  /*#__PURE__*/ _jsx("span", { className: cls + "-glowline" }),
                  /*#__PURE__*/ _jsx("span", { className: cls + "-fill" }),
                ],
              }),
              showStaticComet
                ? /*#__PURE__*/ _jsxs("span", {
                    className: cls + "-comet " + cls + "-comet-static",
                    style: horizontal ? { left: cometAt } : { top: cometAt },
                    children: [
                      /*#__PURE__*/ _jsx("span", { className: cls + "-halo" }),
                      /*#__PURE__*/ _jsx("span", { className: cls + "-trail" }),
                      /*#__PURE__*/ _jsx("span", { className: cls + "-core" }),
                    ],
                  })
                : null,
            ],
          })
        : null,
      /*#__PURE__*/ _jsxs("div", {
        className: cls + "-card",
        onClick: onCardClick,
        children: [
          /*#__PURE__*/ _jsx("div", {
            className: cls + "-surface",
            style: { borderRadius: radius },
            "aria-hidden": "true",
            children: /*#__PURE__*/ _jsx(Tail, { cls: cls, up: horizontal }),
          }),
          /*#__PURE__*/ _jsx(TitleTag, {
            className: cls + "-h",
            children: /*#__PURE__*/ _jsxs("button", {
              type: "button",
              id: headId,
              className: cls + "-head",
              "aria-expanded": !!open,
              "aria-controls": panelId,
              "aria-labelledby": date ? `${uid}-d ${uid}-t` : `${uid}-t`,
              onKeyDown: (e) => onKey(index, e),
              suppressHydrationWarning: true,
              style: { padding: `${pt}px ${pr}px ${TITLE_GAP}px ${pl}px`, borderRadius: radius },
              children: [
                /*#__PURE__*/ _jsx("span", {
                  id: uid + "-d",
                  className: cls + "-eyebrow",
                  style: dateFont,
                  children: date,
                }),
                /*#__PURE__*/ _jsx("span", {
                  id: uid + "-t",
                  className: cls + "-title",
                  style: titleFont,
                  children: title,
                }),
              ],
            }),
          }),
          /*#__PURE__*/ _jsx("div", {
            id: panelId,
            className: cls + "-wrap",
            suppressHydrationWarning: true,
            children: /*#__PURE__*/ _jsxs("div", {
              className: cls + "-inner",
              style: {
                padding: `0px ${pr}px ${pb}px ${pl}px`,
                ["--b"]: (staticMode ? 0 : 0.26 * u).toFixed(3) + "s",
                ["--m"]: (0.36 * u).toFixed(3) + "s",
              },
              children: [
                text
                  ? /*#__PURE__*/ _jsx("p", {
                      className: cls + "-text " + cls + "-r-" + reveal,
                      style: textFont,
                      children: /*#__PURE__*/ _jsx(RevealText, {
                        text: text,
                        mode: reveal,
                        cls: cls,
                      }),
                    })
                  : null,
                image
                  ? /*#__PURE__*/ _jsx("div", {
                      className: cls + "-media",
                      style: { aspectRatio: ratio, borderRadius: innerRadius },
                      children: /*#__PURE__*/ _jsx(
                        "img",
                        {
                          src: image.src,
                          srcSet: image.srcSet,
                          sizes: imgSizes,
                          alt: image.alt || "",
                          loading: staticMode ? undefined : "lazy",
                          decoding: "async",
                          draggable: false,
                          suppressHydrationWarning: true,
                          style: {
                            objectPosition: `${image.positionX || "50%"} ${image.positionY || "50%"}`,
                          },
                        },
                        image.src,
                      ),
                    })
                  : null,
                hasLink
                  ? /*#__PURE__*/ _jsxs("a", {
                      className: cls + "-link",
                      href: href,
                      target: item.newTab ? "_blank" : undefined,
                      rel: item.newTab ? "noopener noreferrer" : undefined,
                      draggable: false,
                      style: textFont,
                      children: [
                        /*#__PURE__*/ _jsx("span", {
                          className: cls + "-link-label",
                          children: linkLabel,
                        }),
                        /*#__PURE__*/ _jsx("svg", {
                          className: cls + "-arrow",
                          width: "14",
                          height: "14",
                          viewBox: "0 0 14 14",
                          "aria-hidden": "true",
                          children: /*#__PURE__*/ _jsx("path", {
                            d: "M3 7h8M7.5 3.5 11 7l-3.5 3.5",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "1.6",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                          }),
                        }),
                      ],
                    })
                  : null,
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
function Tail(props) {
  if (props.up)
    return /*#__PURE__*/ _jsxs("svg", {
      className: props.cls + "-tail",
      width: "20",
      height: TAIL_W + 1,
      viewBox: "0 0 20 12",
      "aria-hidden": "true",
      children: [
        /*#__PURE__*/ _jsx("path", {
          d: "M0 12C5.2 12 7.9 8.2 9.1 2.6C9.4 1.2 10.6 1.2 10.9 2.6C12.1 8.2 14.8 12 20 12Z",
          fill: "var(--ut-card)",
        }),
        /*#__PURE__*/ _jsx("path", {
          d: "M0.5 12C5.2 12 7.9 8.2 9.1 2.6C9.4 1.2 10.6 1.2 10.9 2.6C12.1 8.2 14.8 12 19.5 12",
          fill: "none",
          stroke: "var(--ut-border)",
          strokeWidth: "1",
        }),
      ],
    });
  return /*#__PURE__*/ _jsxs("svg", {
    className: props.cls + "-tail",
    width: TAIL_W + 1,
    height: "20",
    viewBox: "0 0 12 20",
    "aria-hidden": "true",
    children: [
      /*#__PURE__*/ _jsx("path", {
        d: "M12 0C12 5.2 8.2 7.9 2.6 9.1C1.2 9.4 1.2 10.6 2.6 10.9C8.2 12.1 12 14.8 12 20Z",
        fill: "var(--ut-card)",
      }),
      /*#__PURE__*/ _jsx("path", {
        d: "M12 0.5C12 5.2 8.2 7.9 2.6 9.1C1.2 9.4 1.2 10.6 2.6 10.9C8.2 12.1 12 14.8 12 19.5",
        fill: "none",
        stroke: "var(--ut-border)",
        strokeWidth: "1",
      }),
    ],
  });
}
function tween(a, b, t0, d, e) {
  return { a, b, t0, d: Math.max(1, d), e };
}
function valueAt(tw, t) {
  if (t <= tw.t0) return tw.a;
  const x = (t - tw.t0) / tw.d;
  if (x >= 1) return tw.b;
  return tw.a + (tw.b - tw.a) * tw.e(x);
}
/* ------------------------------------------------------------------------ */ /* Component                                                                 */ /**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 960
 * @framerDisableUnlink
 */
function TimelineSliderImpl(rawProps) {
  // A control reset in Framer can arrive as null or "": treat both as "not set".
  const props = {};
  for (const key in rawProps) {
    const v = rawProps[key];
    if (v !== null && v !== "") props[key] = v;
  }
  const {
    style,
    items = DEFAULT_ITEMS,
    direction = "horizontal",
    trigger = "scroll",
    intro = "first",
    readingLine = 60,
    lineX = 50,
    unfolded = "current",
    snap = true,
    wheel = "page",
    arrows = true,
    autoplay = false,
    interval = 4,
    refold = true,
    openOnLoad = 1,
    theme = "dark",
    accent = "#7CC4F2",
    background = THEMES.dark.background,
    cardColor = THEMES.dark.card,
    borderColor = THEMES.dark.border,
    railColor = THEMES.dark.rail,
    titleColor = THEMES.dark.title,
    textColor = THEMES.dark.text,
    dateColor = THEMES.dark.date,
    dateFont,
    titleFont,
    textFont,
    titleTag = "h3",
    padding = "64px 32px 64px 32px",
    maxWidth = 760,
    dateWidth = 104,
    cardWidth = 340,
    spacing = 14,
    card = {},
    reveal = "words",
    speed = 0.7,
    canvasOpen = 3,
    glow = true,
    sampleImages = true,
  } = props;
  const isStatic = false;
  const live = !isStatic;
  const scrollMode = trigger !== "click";
  const horizontal = direction === "horizontal";
  const introFirst = scrollMode && intro !== "off"; // Horizontal, "Current": only the milestone at the light is unfolded.
  const one = horizontal && unfolded !== "passed";
  const rawId = useId();
  const cls = useMemo(() => "ut" + rawId.replace(/[^a-zA-Z0-9]/g, ""), [rawId]);
  const list = Array.isArray(items) ? items : [];
  const count = list.length;
  /* ---- palette ---- */ const palette =
    theme === "custom"
      ? {
          background,
          card: cardColor,
          border: borderColor,
          rail: railColor,
          title: titleColor,
          text: textColor,
          date: dateColor,
          dark: (luminance(cardColor) ?? luminance(background) ?? 0) < 0.4,
        }
      : THEMES[theme === "light" ? "light" : "dark"];
  const lineColor = palette.dark ? accent : `color-mix(in srgb, ${accent} 65%, #0B3B66)`;
  const inkColor = palette.dark ? accent : `color-mix(in srgb, ${accent} 45%, #06243F)`;
  /* ---- geometry ---- */ const cardOpts = card && typeof card === "object" ? card : {};
  const cardPadding = cardOpts.padding || "20px 24px 20px 24px";
  const radius = cardOpts.radius || "18px";
  const imageRatio = cardOpts.imageRatio || "2:1";
  const pad = parseBox(cardPadding, [20, 24, 20, 24]);
  const [pt, cpr, pb, cpl] = pad;
  const titleLH = lineHeightPx(titleFont, 18, 1.35);
  const dateLH = lineHeightPx(dateFont, 13, 1.4);
  const spacer = Math.max(0, pb - TITLE_GAP);
  const gap = Math.max(0, spacing);
  const dW = Math.max(0, dateWidth);
  const railXWide = dW + RAIL_GAP_WIDE;
  const clWide = railXWide + CARD_GAP_WIDE;
  const DWide = pt + titleLH / 2;
  const DCompact = pt + dateLH / 2;
  const corners = parseBox(radius, [18, 18, 18, 18]);
  const radiusPx = corners[0];
  const clipR = Math.max(0, Math.min.apply(null, corners));
  const innerRadius = Math.max(4, Math.round(radiusPx * 0.62));
  const ratio = RATIOS[imageRatio] || "2 / 1";
  const u = Math.max(0.05, speed);
  const cardW = Math.max(160, cardWidth);
  const [padT, padR, padB, padL] = parseBox(
    padding,
    [64, 32, 64, 32],
  ); /* ---- initial state (what React itself renders) ---- */ // Horizontal canvas: the strip rests on the "Preview"-th milestone, exactly as it does live.
  const staticActive = Math.max(0, Math.min(count, Math.max(0, canvasOpen)) - 1);
  const staticOpen = useMemo(
    () =>
      list.map((_, i) =>
        one && scrollMode ? canvasOpen > 0 && i === staticActive : i < Math.max(0, canvasOpen),
      ),
    [count, canvasOpen, one, scrollMode, staticActive],
  );
  const clickOpenInit = useMemo(
    () => list.map((_, i) => i < Math.max(0, openOnLoad)),
    [count, openOnLoad],
  );
  const rootRef = useRef(null); // Photos fade in once they are decoded instead of popping into an empty frame. Runs before the
  // engine so unloaded photos are hidden from the very first style pass.
  const imageKey = list
    .map((it) =>
      it && it.image && it.image.src
        ? it.image.src
        : sampleImages && it && it.sample
          ? it.sample
          : "",
    )
    .join("|");
  useIsoLayoutEffect(() => {
    if (!live || typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;
    const imgs = Array.prototype.slice.call(root.querySelectorAll("." + cls + "-media img"));
    const offs = [];
    imgs.forEach((img) => {
      if (img.hasAttribute("data-loaded")) return;
      const done = () => img.setAttribute("data-loaded", "1");
      if (img.complete && img.naturalWidth > 0) {
        done();
        return;
      }
      const onLoad = () => {
        if (typeof img.decode === "function") img.decode().then(done, done);
        else done();
      };
      img.addEventListener("load", onLoad);
      offs.push(() => img.removeEventListener("load", onLoad));
    });
    root.setAttribute("data-js", "1");
    return () => offs.forEach((f) => f());
  }, [live, cls, imageKey]); /* ---- engine ---- */ // One requestAnimationFrame loop owns every animated part: card sizes, the bud, the light and
  // the rail. It never reads layout while animating — sizes are measured once (and again when
  // content or width changes) and the current layout is computed, so each frame costs a rect
  // read or two plus a few style writes. React is not involved while scrolling or unfolding.
  // Vertical follows the page scroll. Horizontal is its own native scroller (swipe, trackpad,
  // drag, arrows, keys): the browser moves it on the compositor, so it stays smooth even when
  // the page is busy, and the component needs no extra page height.
  const params = useRef({ readingLine, refold, u, spacer, intro, wheel, autoplay, interval, one });
  params.current = { readingLine, refold, u, spacer, intro, wheel, autoplay, interval, one };
  const api = useRef(null);
  useIsoLayoutEffect(() => {
    if (!live || typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;
    const q = (s) => "." + cls + "-" + s;
    const track = root.querySelector(q("track"));
    if (!track) return;
    const stage = root.querySelector(q("stage"));
    const byScroll = scrollMode;
    const horiz = horizontal && !!stage;
    const navBtns = Array.prototype.slice.call(root.querySelectorAll(q("navbtn")));
    let rows = [];
    let heads = [];
    let wraps = [];
    let surfaces = [];
    let fills = [];
    let comet = null;
    const S = [];
    let headH = [];
    let innerH = [];
    let start0 = 0; // where the first item starts along the timeline (track space)
    let D = 0; // dot centre from the start of its item
    let rootW = -1;
    let boxW = -1;
    let gapPx = 0; // horizontal: every milestone has a fixed slot; the strip scrolls natively under a light
    // that stays in place, and it rests with one milestone at the light (snap positions k·slot)
    let ow = 0;
    let stageW = 0;
    let slot = 1;
    let maxScroll = 0;
    let lightX = 0; // where the light sits, from the stage's left edge
    let X = 0;
    let holdIntro = false; // horizontal intro: the first card waits until the timeline is seen
    let navIdx = -1;
    let navT = 0;
    let dragging = false;
    let lastUser = 0;
    let seen = false;
    let hovered = false;
    let navState = ""; // how fast the strip moves (from its own scroll events) and when it last moved
    let vX = 0;
    let lastScrollT = -1e9;
    let lastScrollX = 0;
    let lastWheelT = -1e9;
    let touching = false;
    let hSlow = true; // the strip is (almost) at rest and nobody is moving it by hand
    let navTarget = -1; // the milestone our own glide (arrows, keys, autoplay, a tap) heads for
    let hV = 0; // the strip's speed right now (px/ms, + = forward)
    // our own glide to a milestone (critically damped spring)
    let travel = null;
    let travelT = 0; // the frame time the strip was last placed at by that glide
    let travelX = 0; // …and where (so that frame needs no read-back of the scroll position)
    let dragX = 0; // where a mouse drag has put the strip
    // a two-finger swipe on a trackpad: one swipe = one milestone, glided like the arrows
    const tp = {
      on: false,
      fired: false,
      acc: 0,
      lastT: -1e9,
      lastD: 0,
      rise: 0,
      firedT: 0,
      dirF: 0,
      timer: 0,
    };
    let settleTimer = 0;
    let movingDir = "";
    let movingTimer = 0; // intro: the light glides in along the rail before the first card unfolds
    let glide = null;
    let cometTx = ""; // light
    let L = null;
    let lastT = 0;
    let first = true;
    let latched = false;
    let latchY = 0;
    let latchMax = 0;
    let latchOwn = 0;
    let scroller = null; // intro
    let introOn = false;
    let introPending = false;
    let introAt = 0;
    let raw0 = 0;
    let K0 = 0;
    let introF = 0;
    let introView = 1;
    const sticky = [];
    const lastAuto = [];
    const override = [];
    const clickOpen = [];
    const fv = [];
    let cometV = NaN;
    let cometA = NaN;
    let raf = 0;
    let alive = true;
    const pending = new Set();
    const timers = [];
    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let reduced = !!(mq && mq.matches);
    const nextFrame = (fn) => {
      const id = requestAnimationFrame(() => {
        pending.delete(id);
        fn();
      });
      pending.add(id);
    };
    const measure = () => {
      rows = Array.prototype.slice.call(root.querySelectorAll(q("row")));
      const n = rows.length;
      heads = rows.map((r) => r.querySelector(q("head")));
      wraps = rows.map((r) => r.querySelector(q("wrap")));
      surfaces = rows.map((r) => r.querySelector(q("surface")));
      fills = rows.map((r) => r.querySelector(q("lit")));
      comet = root.querySelector(q("comet"));
      const rr = root.getBoundingClientRect();
      rootW = root.offsetWidth;
      const box = stage || track;
      boxW = box.offsetWidth; // Scale of any transform above us (e.g. a zoomed preview), from the root's width,
      // which — unlike the track — never changes while cards unfold.
      const s = rootW > 0 && rr.width > 0 ? rr.width / rootW : 1;
      const tr = track.getBoundingClientRect();
      headH = [];
      innerH = [];
      for (let k = 0; k < n; k++) {
        const r = rows[k];
        const b = heads[k];
        const hEl = b ? b.parentElement : null;
        const inner = r.querySelector(q("inner"));
        headH.push(hEl ? hEl.getBoundingClientRect().height / s : 0);
        innerH.push(inner ? inner.getBoundingClientRect().height / s : 0);
        if (!S[k]) {
          const open = r.getAttribute("data-open") === "true";
          const v = open ? 1 : 0;
          S[k] = {
            open,
            a: v,
            b: v,
            o: v,
            ta: null,
            tb: null,
            to: null,
            styled: false,
            lit: r.getAttribute("data-lit") === "1",
            py: NaN,
            clip: "",
            op: NaN,
          };
          clickOpen[k] = open; // A folded card's text and link stay out of reach (focus, clicks) until it opens.
          const w0 = r.querySelector(q("wrap"));
          if (w0 && !open) w0.setAttribute("inert", "");
        }
      }
      S.length = n;
      if (!n) return;
      const r0 = rows[0].getBoundingClientRect();
      const d0 = rows[0].querySelector(q("dot"));
      const db = d0 ? d0.getBoundingClientRect() : null;
      if (horiz && stage) {
        // Positions in track space are independent of the scroll position.
        start0 = (r0.left - tr.left) / s;
        D = db ? (db.left + db.width / 2 - r0.left) / s : 0;
        gapPx = parseFloat(getComputedStyle(rows[0]).marginRight) || 0;
        stageW = stage.clientWidth;
        ow = rows[0].offsetWidth;
        slot = Math.max(1, ow + gapPx);
        maxScroll = Math.max(0, stage.scrollWidth - stage.clientWidth); // The stylesheet puts the light exactly where the first dot rests at the start
        // (--lxp = --padl + --DX), so both always agree — even while the intro moves it.
        lightX = start0 + D;
      } else {
        start0 = (r0.top - tr.top) / s;
        D = db ? (db.top + db.height / 2 - r0.top) / s : 0;
        gapPx = parseFloat(getComputedStyle(rows[0]).paddingBottom) || 0;
      }
    }; // Size of an item along the timeline, gap included.
    // Horizontal slots have one width whether folded or open: nothing is ever pushed.
    const foldSize = (k) => (horiz ? slot : headH[k] + params.current.spacer + gapPx);
    const openSize = (k) => (horiz ? slot : headH[k] + innerH[k] + gapPx);
    const curSize = (k) => {
      const f = foldSize(k);
      return f + (openSize(k) - f) * S[k].a;
    }; // Changes that must not animate (first frame, jumps, cards out of view) are applied with
    // transitions switched off for the frames that render them.
    const still = (row) => {
      row.setAttribute("data-instant", "");
      nextFrame(() => nextFrame(() => row.removeAttribute("data-instant")));
    };
    const setOpenAttrs = (k, open) => {
      const r = rows[k];
      if (!r) return;
      r.setAttribute("data-open", open ? "true" : "false");
      const b = heads[k];
      if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
      const w = wraps[k];
      if (w) {
        if (open) w.removeAttribute("inert");
        else w.setAttribute("inert", "");
      }
    };
    const unit = () => Math.max(0.05, params.current.u) * 1e3; // A slim bud grows out of the dot and stretches across the card, then the card opens
    // to its full height while its text arrives (vertical: pushing the next dates down).
    const startOpen = (st, t) => {
      const U = unit();
      st.to = tween(st.o, 1, t, 0.16 * U * Math.max(0.3, 1 - st.o), LINEAR);
      st.tb = horiz
        ? tween(st.b, 1, t, 0.62 * U * Math.max(0.3, 1 - st.b), EASE_BUD_H)
        : tween(st.b, 1, t, 0.55 * U * Math.max(0.3, 1 - st.b), EASE_OUT);
      st.ta = tween(
        st.a,
        1,
        t + (horiz ? 0.12 : 0.08) * U * (1 - st.b),
        0.78 * U * Math.max(0.35, 1 - st.a),
        EASE_UNFOLD,
      );
    };
    const startClose = (st, t) => {
      const U = unit();
      st.ta = tween(
        st.a,
        0,
        t + 0.05 * U * Math.min(1, st.a * 4),
        0.5 * U * Math.max(0.35, st.a),
        EASE_FOLD,
      );
      const wd = 0.2 * U * st.a;
      st.tb = tween(st.b, 0, t + wd, 0.42 * U * Math.max(0.3, st.b), EASE_FOLD);
      st.to = tween(st.o, 0, t + wd + 0.26 * U * st.b, 0.18 * U * Math.max(0.3, st.o), LINEAR);
    };
    const snap = (st) => {
      const v = st.open ? 1 : 0;
      st.a = v;
      st.b = v;
      st.o = v;
      st.ta = null;
      st.tb = null;
      st.to = null;
    };
    const advance = (st, t) => {
      if (st.ta) {
        st.a = valueAt(st.ta, t);
        if (t >= st.ta.t0 + st.ta.d) st.ta = null;
      }
      if (st.tb) {
        st.b = valueAt(st.tb, t);
        if (t >= st.tb.t0 + st.tb.d) st.tb = null;
      }
      if (st.to) {
        st.o = valueAt(st.to, t);
        if (t >= st.to.t0 + st.to.d) st.to = null;
      }
      return !!(st.ta || st.tb || st.to);
    };
    const paint = (k, moving) => {
      const st = S[k];
      const w = wraps[k];
      const sf = surfaces[k];
      const sp = params.current.spacer;
      if (moving) {
        if (horiz) {
          // Same unfold as the vertical timeline, turned: a bud under the dot (tail
          // included) stretches across the slot, then the card drops to its full height.
          // Every card keeps its full size in the layout; the unfold only moves clip
          // edges (no layout per frame), and no other milestone ever moves.
          const drop = (1 - st.a) * Math.max(0, innerH[k] - sp);
          const x = 1 - st.b;
          const bud = D + 12;
          const side = "calc(" + (x * 100).toFixed(3) + "% - " + (x * bud).toFixed(2) + "px)";
          if (w) {
            // The text area is cut exactly like the card behind it.
            const wc = "inset(0px " + side + " " + drop.toFixed(2) + "px 0px)";
            if (wc !== w.style.clipPath) {
              w.style.clipPath = wc;
              w.style.webkitClipPath = wc;
            }
          }
          if (sf) {
            const clip =
              "inset(-" +
              (TAIL_W + 1) +
              "px calc(" +
              (x * 100).toFixed(3) +
              "% - " +
              (x * bud).toFixed(2) +
              "px) " +
              drop.toFixed(2) +
              "px 0px round " +
              clipR +
              "px)";
            if (clip !== st.clip) {
              st.clip = clip;
              sf.style.clipPath = clip;
              sf.style.webkitClipPath = clip;
            }
          }
        } else {
          const hpx = sp + (innerH[k] - sp) * st.a;
          if (w && !(Math.abs(hpx - st.py) <= 0.05)) {
            st.py = hpx;
            w.style.height = hpx.toFixed(2) + "px";
          }
          if (sf) {
            const x = 1 - st.b;
            const clip =
              "inset(0px calc(" +
              (x * 100).toFixed(3) +
              "% - " +
              (x * BUD).toFixed(2) +
              "px) 0px -" +
              (TAIL_W + 1) +
              "px round " +
              clipR +
              "px)";
            if (clip !== st.clip) {
              st.clip = clip;
              sf.style.clipPath = clip;
              sf.style.webkitClipPath = clip;
            }
          }
        }
        if (sf && !(Math.abs(st.o - st.op) <= 0.004)) {
          st.op = st.o;
          sf.style.opacity = st.o.toFixed(3);
        }
        st.styled = true;
      } else if (st.styled) {
        // At rest the stylesheet takes over again (auto height, no clips).
        if (w) {
          w.style.removeProperty("height");
          w.style.removeProperty("clip-path");
          w.style.removeProperty("-webkit-clip-path");
        }
        if (sf) {
          sf.style.removeProperty("clip-path");
          sf.style.removeProperty("-webkit-clip-path");
          sf.style.removeProperty("opacity");
        }
        st.styled = false;
        st.py = NaN;
        st.clip = "";
        st.op = NaN;
      }
    }; // Horizontal: the light draws a trail only while the strip (or the light itself) moves.
    const setMoving = (dir) => {
      if (dir === movingDir) return;
      movingDir = dir;
      if (dir) root.setAttribute("data-moving", dir);
      else root.removeAttribute("data-moving");
    }; // One more look shortly after the strip stopped: the milestone it came to rest on unfolds.
    const armSettle = (ms = 90) => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleTimer = 0;
        kick();
      }, ms);
    }; // Intro: the light glides in along the rail; once it arrives, the first card unfolds.
    const startGlide = () => {
      const dist = Math.max(0, lightX);
      if (reduced || dist < 24) {
        releaseIntro();
        return;
      }
      glide = { t0: performance.now(), d: clamp(320 + dist * 0.85, 450, 1e3), dist };
      setMoving("f");
      kick();
    };
    function endGlide() {
      glide = null;
      holdIntro = false;
      if (!movingTimer) setMoving("");
    } // Someone moves the strip before or during the intro: the cards follow it at once (a
    // glide under way still finishes; it only brings the light in).
    function releaseIntro() {
      if (!holdIntro) return;
      holdIntro = false;
      kick();
    } // Which cards are open for a light at Lp, and where every dot sits once they are. Laid out
    // in order with measured sizes, so a card that pushes its neighbours can never make them
    // flicker, and a card only folds once the light is clearly back behind its dot.
    const plan = (Lp) => {
      const p = params.current;
      const n = rows.length;
      const open = [];
      const tdot = [];
      let yy = start0;
      for (let k = 0; k < n; k++) {
        const dotY = yy + D;
        tdot.push(dotY);
        let isOpen;
        if (!byScroll) isOpen = !!clickOpen[k];
        else {
          const reached = dotY <= Lp + 0.5;
          if (reached) sticky[k] = true;
          let auto;
          if (reduced) auto = true;
          else if (horiz && p.one) {
            // Only the milestone at the light: it unfolds once the strip arrives
            // there (not while it rushes past) and folds as soon as it moves on.
            // Where the strip is heading is known for our own glides: that milestone
            // unfolds the moment its dot meets the light, together with the ignition.
            const sd = dotY - (Lp - H_EPS);
            const dx = Math.abs(sd);
            const ant = Math.max(ZONE_IN, ANTICIPATE * slot);
            const aimed = k === navTarget && !dragging && !touching; // A native swipe settling onto this milestone: it may start early too.
            const settling = !touching && !dragging && sd * hV > 0 && Math.abs(hV) < 0.45;
            auto =
              (aimed ? dx <= ant : (dx <= ZONE_IN && hSlow) || (settling && dx <= ant)) ||
              (S[k].open && dx <= ant + 12);
          } else {
            const hold = p.refold && S[k].open && dotY <= Lp + HYSTERESIS;
            auto = p.refold ? reached || hold : reached || !!sticky[k]; // Horizontal: the milestone the strip heads for opens as it arrives.
            if (
              horiz &&
              k === navTarget &&
              Math.abs(dotY - (Lp - H_EPS)) <= Math.max(ZONE_IN, ANTICIPATE * slot)
            )
              auto = true;
          }
          if (lastAuto[k] !== auto) {
            if (!first) override[k] = undefined;
            lastAuto[k] = auto;
          }
          const ov = override[k];
          isOpen = ov === undefined ? auto : ov;
        }
        open.push(isOpen);
        yy += isOpen ? openSize(k) : foldSize(k);
      }
      return { open, tdot };
    };
    const step = (t, forceStill) => {
      const n = rows.length;
      if (!n) return true;
      const p = params.current; // Vertical follows the page: where the page (or a frame around it) is scrolled, and
      // the scale of any transform above us. Horizontal needs none of that — it reads
      // nothing but its own scroll position, so a frame costs no layout reads.
      let s = 1;
      let viewTop = 0;
      let viewH = 800;
      let y = 0;
      let maxY = 0;
      if (!horiz) {
        const rr = root.getBoundingClientRect();
        s = rootW > 0 && rr.width > 0 ? rr.width / rootW : 1;
        const winH = window.innerHeight || document.documentElement.clientHeight || 800;
        viewH = winH; // The page may scroll the document or an element around the component (e.g. a
        // preview frame). Reading line and end-of-page detection follow whichever scrolls.
        let sc = scroller;
        if (sc && !sc.isConnected) sc = scroller = null;
        if (sc) {
          const sr = sc.getBoundingClientRect();
          viewTop = Math.max(0, sr.top);
          viewH = Math.max(1, Math.min(winH, sr.bottom) - viewTop);
          y = sc.scrollTop;
          maxY = sc.scrollHeight - sc.clientHeight;
        } else {
          const se = document.scrollingElement || document.documentElement;
          y = window.scrollY || se.scrollTop || 0;
          maxY = se.scrollHeight - winH;
        }
      } // Current layout (computed, not read).
      const vstart = [];
      let own = 0;
      {
        let yy = start0;
        for (let k = 0; k < n; k++) {
          vstart.push(yy);
          const z = curSize(k);
          yy += z;
          own += z;
        }
      }
      let instant = forceStill;
      let raw = 0;
      let viewMain = 1;
      let visEnd = 0;
      let visStart = -Infinity;
      let introVisible = false;
      if (!horiz) {
        const rect = track.getBoundingClientRect();
        raw = (viewTop + (viewH * clamp(p.readingLine, 0, 100)) / 100 - rect.top) / s;
        viewMain = viewH / s;
        visEnd = (viewTop + viewH - rect.top) / s;
        const dotScreen = rect.top + (start0 + D) * s;
        introVisible = dotScreen >= viewTop + 8 && dotScreen <= viewTop + viewH - 24 && maxY > 2;
      } else {
        // The strip scrolls natively (or glides under our hand); the light stays put.
        X = travel || travelT === t ? travelX : dragging ? dragX : stage.scrollLeft;
        raw = lightX + X + H_EPS;
        viewMain = stageW;
        visStart = X - 40;
        visEnd = X + stageW;
        const vNow = t - lastScrollT > 60 ? 0 : vX;
        hV = vNow;
        hSlow = !dragging && !touching && !tp.on && t - lastWheelT > 120 && Math.abs(vNow) < V_SLOW; // The intro glide has brought the light in: the first card may unfold now.
        if (glide && t >= glide.t0 + glide.d) endGlide(); // An instant jump (End key, a far target reached at once): no cascade.
        if (L !== null && Math.abs(raw - L) > stageW * 1.5) instant = true;
      }
      let target = raw;
      if (byScroll && horiz) {
        // Intro: until the timeline has been seen, the first card waits folded; then it
        // unfolds by itself (everything after it follows the strip).
        if (holdIntro) target = Math.min(raw, start0 + D - 3);
        L = target;
      } else if (byScroll) {
        // Intro: on arrival the light waits in front of the first dot, then moves to it —
        // the first card unfolds by itself. Scrolling on, the light catches up with the
        // reading line over most of a screen, so the next cards arrive one at a time;
        // scrolling back, the first card stays for a while before it folds.
        if (first && p.intro !== "off" && !reduced && introVisible) {
          introOn = true;
          introPending = true;
          introAt = t + INTRO_DELAY;
          raw0 = raw;
          introF = start0 + D + 1;
          K0 = raw - introF;
          introView = viewMain;
          timers.push(window.setTimeout(kick, INTRO_DELAY + 20));
        }
        if (introOn) {
          const dd = raw - raw0;
          if (introPending && (t >= introAt || Math.abs(dd) > 4)) introPending = false;
          if (introPending) target = Math.min(raw, introF - 3);
          else {
            const conv = raw - K0 * Math.max(0, 1 - Math.max(0, dd) / (0.8 * introView));
            target = Math.max(
              conv,
              Math.min(raw, introF),
              introF - Math.max(0, -dd - 0.3 * introView),
            );
          }
        }
        {
          let allOpenLast = start0 + D;
          for (let k = 0; k < n - 1; k++) allOpenLast += openSize(k); // At the very end of the page (or on a page too short to scroll) everything
          // left unfolds and stays until the reader scrolls back up a little — otherwise
          // the last cards could never reach the light. Content that grows elsewhere
          // releases it.
          if (maxY <= 2 || y >= maxY - 2) {
            if (!latched) {
              latched = true;
              latchY = y;
              latchMax = maxY;
              latchOwn = own;
            }
          } else if (latched) {
            const external = maxY - latchMax - (own - latchOwn);
            if (y < latchY - 48 || (external > 48 && y < maxY - 48)) latched = false;
          }
          if (latched) target = Math.max(target, allOpenLast + 1);
        }
        if (L === null || instant) L = target;
        else {
          const diff = target - L;
          if (Math.abs(diff) > viewMain * 1.2) {
            // A jump (anchor link, restored scroll position, End key): no cascade.
            L = target;
            instant = true;
          } else {
            const dt = clamp(t - lastT, 0, 64);
            const tau = reduced ? 1 : Math.abs(diff) > 240 ? 200 : 85;
            L += diff * (1 - Math.exp(-dt / tau));
            if (Math.abs(target - L) < 0.5) L = target;
          }
        }
      }
      lastT = t;
      const Lc = L === null ? 0 : L; // Targets, then motion.
      const pl = plan(Lc);
      first = false;
      if (navTarget >= 0 && !travel && performance.now() - navT > 2500) navTarget = -1;
      for (let k = 0; k < n; k++) {
        const st = S[k];
        if (pl.open[k] === st.open) continue;
        st.open = pl.open[k];
        setOpenAttrs(k, st.open);
        if (instant || vstart[k] > visEnd + 40 || vstart[k] + curSize(k) < visStart) {
          still(rows[k]);
          snap(st);
        } else if (reduced) snap(st);
        else if (st.open) startOpen(st, t);
        else startClose(st, t);
      }
      let moving = false;
      for (let k = 0; k < n; k++) {
        const m = advance(S[k], t);
        paint(k, m);
        if (m) moving = true;
      } // Where the dots are drawn right now.
      const vdot = [];
      const size = [];
      {
        let yy = start0;
        for (let k = 0; k < n; k++) {
          vdot.push(yy + D);
          const z = curSize(k);
          size.push(z);
          yy += z;
        }
      } // Dots.
      for (let k = 0; k < n; k++) {
        const st = S[k];
        const on = byScroll
          ? Lc >= pl.tdot[k] - 0.5 ||
            (st.lit && Lc >= pl.tdot[k] - HYSTERESIS) ||
            (horiz && !reduced && st.open)
          : st.open;
        if (on !== st.lit) {
          st.lit = on;
          const r = rows[k];
          if (instant) still(r);
          r.setAttribute("data-lit", on ? "1" : "0");
          if (on && !instant && !reduced) r.setAttribute("data-ping", "");
          else r.removeAttribute("data-ping");
        }
      }
      if (byScroll) {
        // The light lives in the target layout; on screen it is mapped onto the rail as it
        // is drawn right now, so it arrives at a dot exactly when that card starts to
        // unfold and waits while the card grows instead of running past moving dots.
        const td = pl.tdot;
        let vis;
        if (n === 1 || Lc <= td[0]) vis = vdot[0] - (td[0] - Lc);
        else if (Lc >= td[n - 1]) vis = vdot[n - 1] + (Lc - td[n - 1]);
        else {
          let j = 0;
          while (j < n - 2 && Lc >= td[j + 1]) j++;
          const span = td[j + 1] - td[j];
          const f = span > 0.5 ? (Lc - td[j]) / span : 1;
          vis = vdot[j] + f * (vdot[j + 1] - vdot[j]);
        } // Horizontal: the rail is lit up to the light as it is drawn, not to the point
        // slightly ahead of it where milestones are detected.
        if (horiz) vis -= H_EPS;
        const G = DOT_R + DOT_GAP;
        for (let k = 0; k < n - 1; k++) {
          const el = fills[k];
          if (!el) continue;
          const segStart = vdot[k] + G;
          const segLen = Math.max(1, size[k] - 2 * G);
          const f = clamp((vis - segStart) / segLen, 0, 1);
          if (!(Math.abs(fv[k] - f) <= 5e-4)) {
            fv[k] = f;
            el.style.transform = (horiz ? "scaleX(" : "scaleY(") + f.toFixed(4) + ")";
          }
        }
        if (comet) {
          const a0 = vdot[0];
          const a1 = vdot[n - 1];
          let a = 0;
          if (horiz) {
            // Fixed on the strip by the stylesheet: only its presence changes —
            // except in the intro, where it glides in from the left edge first.
            a =
              n < 2
                ? 0
                : smoothstep(a0 - 26, a0 - 4, vis) * (1 - smoothstep(a1 + 40, a1 + 90, vis));
            let tx = "";
            if (glide) {
              const g = clamp((t - glide.t0) / glide.d, 0, 1);
              const off = -(1 - EASE_GLIDE(g)) * glide.dist;
              tx = "translate3d(" + off.toFixed(2) + "px,0,0)";
              const ramp = n < 2 ? 0 : smoothstep(0, 0.3, g);
              a = holdIntro ? ramp : Math.min(a, ramp);
            } else if (holdIntro) {
              a = 0;
              tx = "translate3d(" + (-lightX).toFixed(2) + "px,0,0)";
            }
            if (tx !== cometTx) {
              cometTx = tx;
              if (tx) comet.style.transform = tx;
              else comet.style.removeProperty("transform");
            }
          } else {
            a = n < 2 ? 0 : smoothstep(a0, a0 + 28, vis) * (1 - smoothstep(a1 - 36, a1, vis));
            const cv = clamp(vis, a0, a1);
            if (!(Math.abs(cv - cometV) <= 0.1)) {
              cometV = cv;
              comet.style.transform = "translate3d(0," + cv.toFixed(2) + "px,0)";
            }
          }
          if (!(Math.abs(a - cometA) <= 0.004)) {
            cometA = a;
            comet.style.opacity = a.toFixed(3);
          }
        }
      }
      if (horiz && navBtns.length === 2) {
        const ns = (X <= 2 ? "s" : "") + (X >= maxScroll - 2 ? "e" : "");
        if (ns !== navState) {
          navState = ns;
          navBtns[0].setAttribute("aria-disabled", X <= 2 ? "true" : "false");
          navBtns[1].setAttribute("aria-disabled", X >= maxScroll - 2 ? "true" : "false");
        }
      }
      return !moving && !glide && !travel && (!byScroll || Math.abs(target - Lc) < 0.5);
    };
    const frame = (t) => {
      raf = 0;
      if (!alive) return; // Our own glide moves on once per frame, on the frame's clock (evenly spaced steps).
      if (travel) advanceTravel(t);
      if (!step(t, false)) raf = requestAnimationFrame(frame);
    };
    function kick() {
      if (!raf && alive) raf = requestAnimationFrame(frame);
    } // Nearest scrolling ancestor, body included (null = the viewport scrolls the document).
    const findScroller = () => {
      let el = root.parentElement;
      while (el) {
        const oy = getComputedStyle(el).overflowY;
        if (
          (oy === "auto" || oy === "scroll" || oy === "overlay") &&
          el.scrollHeight > el.clientHeight + 1 &&
          el !== document.documentElement
        )
          return el;
        if (el === document.body) break;
        el = el.parentElement;
      }
      return null;
    }; // Vertical: the page (or an element around it) scrolls.
    const onScroll = (e) => {
      if (!alive) return;
      const tg = e.target;
      const el = tg && tg.nodeType === 1 && tg !== document.documentElement && tg !== document.body;
      if (el && !tg.contains(root)) return; // scrolls elsewhere
      if (el && tg !== scroller) {
        // A different element turned out to scroll the page: follow it from now on.
        scroller = tg;
        latched = false;
      } // Follow the scroll in the same frame — a scroll event comes right before the frame
      // is drawn — instead of a frame later.
      if (!step(performance.now(), false)) kick();
    };
    const remeasure = () => {
      if (!alive) return;
      measure();
      kick();
    };
    const onResize = () => {
      scroller = findScroller();
      remeasure();
    };
    const onMotionPref = () => {
      reduced = !!(mq && mq.matches);
      measure();
      step(performance.now(), true);
    };
    /* -- horizontal strip: navigation -- */ const n0 = () => rows.length;
    const snapPos = (k) => Math.min(Math.max(0, k) * slot, maxScroll);
    const nearestIdx = () => clamp(Math.round(stage ? stage.scrollLeft / slot : 0), 0, n0() - 1); // Snapping is off while a hand or our own glide moves the strip, and back on once it rests
    // exactly on a milestone — so it never has anything left to correct.
    const syncFree = () => {
      if (dragging || travel || tp.on) root.setAttribute("data-free", "");
      else root.removeAttribute("data-free");
    }; // The strip glides like a critically damped spring: it keeps the speed it was given (a
    // flick, a swipe; a tap gets a brisk start) and settles softly without overshooting.
    const startTravel = (to, v0) => {
      if (!stage) return;
      const now = performance.now();
      const e0 = (travel ? travelX : stage.scrollLeft) - to;
      const dist = Math.abs(e0);
      const toward = e0 < 0 ? 1 : -1;
      const w0 = SPRING_W * clamp(Math.pow(slot / Math.max(1, dist), 0.3), 0.55, 1);
      let w = w0;
      let v = v0 === null ? 0 : v0 * 1e3;
      let t0 = now; // The speed of a glide already under way, toward the new milestone (0: none). The new
      // glide takes over from the frame the strip was last placed at, so the next frame
      // moves on as usual (no frame standing still at the hand-over).
      let vc = 0;
      if (travel) {
        const tr = travel;
        const tt = travelT >= tr.t0 && travelT <= now ? travelT : tr.t0;
        const s = Math.max(0, (tt - tr.t0) / 1e3);
        const c = tr.v0 + tr.w * tr.e0;
        vc = (c - tr.w * (tr.e0 + c * s)) * Math.exp(-tr.w * s) * toward;
        t0 = Math.min(now, tt);
      }
      if (vc > 0) {
        // Re-aimed mid-glide (another tap, notch or swipe): it carries on from the speed it
        // has, on a spring soft enough to only ease out from there — never a jolt, never
        // "slow, then faster".
        v = Math.max(vc, v * toward);
        w = Math.max(0.6 * w0, Math.min(w0, v / (0.5 * dist)));
        v = Math.max(v, 0.5 * w * dist) * toward;
      } else if (v * toward < 0.6 * w * dist) {
        // From rest: never slower than a tap on an arrow — it starts briskly and only
        // ever slows down.
        v = 0.6 * w * dist * toward;
      } // Never so fast that it would sail past the milestone.
      if (v * toward > 0.95 * w * dist) v = 0.95 * w * dist * toward;
      travel = { to, e0, v0: v, w, t0 };
      travelT = t0;
      travelX = to + e0;
      syncFree();
      kick();
    };
    function advanceTravel(t) {
      const tr = travel;
      if (!tr || !stage) return;
      travelT = t;
      const s = Math.max(0, (t - tr.t0) / 1e3);
      const c = tr.v0 + tr.w * tr.e0;
      const ex = Math.exp(-tr.w * s);
      const e = (tr.e0 + c * s) * ex;
      const ev = (c - tr.w * (tr.e0 + c * s)) * ex; // The last pixel is not worth a creeping tail: land once it is under one.
      const landed = (s > 0.05 && Math.abs(e) < 1 && Math.abs(ev) < 30) || s > 2.5;
      const x = landed ? tr.to : tr.to + e;
      stage.scrollLeft = x; // The glide knows where it put the strip and how fast it goes: the light's trail and
      // speed follow from that, and nothing needs to read the scroll position back (which
      // would make the browser restyle in the middle of the frame).
      travelX = x;
      vX = landed ? 0 : ev / 1e3;
      lastScrollT = t;
      lastScrollX = x;
      if (!landed && Math.abs(ev) > 1) {
        setMoving(ev > 0 ? "f" : "b");
        if (movingTimer) clearTimeout(movingTimer);
        movingTimer = window.setTimeout(() => {
          movingTimer = 0;
          if (!glide) setMoving("");
        }, 160);
      }
      if (landed) {
        travel = null;
        nextFrame(syncFree);
        armSettle(60);
      }
    }
    const stopTravel = () => {
      if (!travel) return;
      travel = null;
      syncFree();
    };
    const go = (k, fromUser = true, v0 = null) => {
      if (!stage || !n0()) return;
      const kk = clamp(k, 0, n0() - 1);
      navIdx = kk;
      navTarget = kk;
      navT = performance.now();
      if (fromUser) lastUser = navT;
      releaseIntro();
      const to = snapPos(kk);
      const cur = travel ? travelX : stage.scrollLeft;
      if (reduced || Math.abs(to - cur) < 0.5) {
        travel = null;
        if (Math.abs(to - cur) >= 0.5) stage.scrollLeft = to;
        syncFree(); // Already there (nothing will move): still look again once, so it can unfold.
        armSettle();
        return;
      }
      startTravel(to, v0);
    }; // Where a released hand leads: a flick or a clear push goes on to the next milestone in
    // its direction (never back); a small nudge returns. At most two milestones per release.
    const pageTarget = (x, v, moved) => {
      const cur = x / slot;
      const near = Math.round(cur);
      let k;
      if (Math.abs(v) > 0.25) {
        k = v > 0 ? Math.floor(cur + 0.02) + 1 : Math.ceil(cur - 0.02) - 1;
        const far = Math.round((x + v * 260) / slot);
        k = v > 0 ? Math.max(k, far) : Math.min(k, far);
      } else k = Math.round(cur + 0.32 * Math.sign(moved));
      return clamp(k, near - 2, near + 2);
    };
    const nav = (dir) => {
      const base = performance.now() - navT < 520 && navIdx >= 0 ? navIdx : nearestIdx();
      const k = base + dir;
      if (k < 0 || k > n0() - 1) return false;
      go(k);
      return true;
    };
    const onStageScroll = () => {
      if (!alive || !stage) return; // Our own glide: its frame has placed the strip and noted its speed already.
      if (travel) return;
      releaseIntro();
      const now = performance.now();
      const x = dragging ? dragX : stage.scrollLeft;
      const dt = now - lastScrollT;
      vX = dt > 0 && dt < 120 ? 0.5 * vX + 0.5 * ((x - lastScrollX) / Math.max(4, dt)) : 0;
      const dir = x > lastScrollX + 0.5 ? "f" : x < lastScrollX - 0.5 ? "b" : movingDir;
      lastScrollT = now;
      lastScrollX = x;
      if (dir) {
        setMoving(dir);
        if (movingTimer) clearTimeout(movingTimer);
        movingTimer = window.setTimeout(() => {
          movingTimer = 0;
          if (!glide) setMoving("");
        }, 160);
      }
      armSettle();
      if (now - navT > 800) lastUser = now; // A hand or the browser moving the strip: an update right here, so everything follows
      // in the same frame.
      if (!step(now, false)) kick();
    }; // A card reached with the keyboard is brought to the light.
    const onFocusIn = (e) => {
      if (!horiz || !stage) return;
      const el = e.target;
      if (!el || typeof el.closest !== "function") return;
      let visible = true;
      try {
        visible = el.matches(":focus-visible");
      } catch (_) {}
      if (!visible) return;
      const row = el.closest(q("row"));
      const k = row ? rows.indexOf(row) : -1;
      if (k >= 0) go(k);
    };
    api.current = {
      toggle: (i) => {
        const st = S[i];
        if (!st) return;
        if (horiz && byScroll && stage) {
          // A tap on a milestone brings it to the light; at the light it folds or
          // unfolds by hand.
          if (Math.abs(stage.scrollLeft - snapPos(i)) > 6) {
            go(i);
            return;
          }
          override[i] = !st.open;
        } else if (byScroll) override[i] = !st.open;
        else clickOpen[i] = !st.open;
        kick();
      },
      nav: (dir) => {
        nav(dir);
      },
      kick,
      remeasure,
    }; // First frame, before anything is painted: the resting state, applied without motion.
    holdIntro = horiz && byScroll && params.current.intro !== "off" && !reduced;
    scroller = horiz ? null : findScroller();
    measure();
    step(performance.now(), true);
    root.removeAttribute("data-hold");
    if (!horiz) window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    root.addEventListener("focusin", onFocusIn);
    if (horiz && stage) stage.addEventListener("scroll", onStageScroll, { passive: true });
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      const box = stage || track;
      ro = new ResizeObserver((entries) => {
        for (const en of entries) {
          // The track grows with every unfold; only a new container width matters.
          if (en.target === box && box.offsetWidth === boxW) continue;
          remeasure();
          return;
        }
      });
      ro.observe(box);
      rows.forEach((r) => {
        const inner = r.querySelector(q("inner"));
        const b = r.querySelector(q("head"));
        if (inner && ro) ro.observe(inner);
        if (b && ro) ro.observe(b);
      });
    }
    const fonts = document.fonts;
    if (fonts && fonts.ready) fonts.ready.then(remeasure).catch(() => {});
    if (fonts && fonts.addEventListener) fonts.addEventListener("loadingdone", remeasure);
    if (mq) {
      if (mq.addEventListener) mq.addEventListener("change", onMotionPref);
      else if (mq.addListener) mq.addListener(onMotionPref);
    }
    const offs = [];
    const on = (t, ev, fn, opt) => {
      t.addEventListener(ev, fn, opt);
      offs.push(() => t.removeEventListener(ev, fn, opt));
    };
    if (horiz && stage) {
      // Seen for the first time: the intro unfolds the first card; autoplay may run.
      let seenNow = false;
      let io = null;
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (ents) => {
            for (const en of ents) {
              seenNow = en.isIntersecting && en.intersectionRatio >= 0.3;
              if (seenNow && !seen) {
                seen = true;
                if (holdIntro)
                  timers.push(
                    window.setTimeout(() => {
                      if (!alive || !holdIntro || glide) return;
                      startGlide();
                    }, INTRO_DELAY),
                  );
              }
            }
          },
          { threshold: [0, 0.3, 0.6] },
        );
        io.observe(stage);
        offs.push(() => io && io.disconnect());
      } else if (holdIntro) {
        holdIntro = false;
        seen = seenNow = true;
        kick();
      } // Mouse: drag the strip, with a flick carrying it on to a milestone.
      let down = false;
      let moved = false;
      let sx = 0;
      let sl = 0;
      let lx0 = 0;
      let lt0 = 0;
      let vx = 0;
      let sl0 = 0;
      let pid = -1;
      let ds = 1;
      const onDown = (e) => {
        lastUser = performance.now();
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        down = true;
        moved = false;
        sx = e.clientX;
        sl = stage.scrollLeft;
        lx0 = e.clientX;
        lt0 = e.timeStamp;
        vx = 0;
        pid = e.pointerId;
      };
      const onMove = (e) => {
        if (!down || e.pointerId !== pid) return;
        const dx = e.clientX - sx;
        if (!moved) {
          if (Math.abs(dx) < 6) return; // The scale of any transform above us, read once per drag (not per move).
          const rr = root.getBoundingClientRect();
          ds = rootW > 0 && rr.width > 0 ? rr.width / rootW : 1;
          moved = true;
          dragging = true; // Grab the strip where it is, even mid-glide.
          const x0 = travel ? travelX : stage.scrollLeft;
          stopTravel();
          sl = x0 + dx / ds;
          sl0 = x0;
          syncFree();
          root.setAttribute("data-drag", "");
          navTarget = -1;
          releaseIntro();
        }
        const s = ds;
        dragX = clamp(sl - dx / s, 0, maxScroll);
        stage.scrollLeft = dragX;
        const dt = e.timeStamp - lt0;
        if (dt > 0) vx = 0.75 * ((e.clientX - lx0) / s / dt) + 0.25 * vx;
        lx0 = e.clientX;
        lt0 = e.timeStamp;
        lastUser = performance.now();
        e.preventDefault();
      };
      const onUp = (e) => {
        if (!down || e.pointerId !== pid) return;
        down = false;
        if (!moved) return;
        dragging = false;
        root.removeAttribute("data-drag"); // The strip goes on with the hand's own speed to the milestone it was pushed to.
        const x = dragX;
        const v = -vx;
        go(pageTarget(x, v, x - sl0), true, v);
      };
      const onClickCapture = (e) => {
        if (!moved) return;
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }; // A finger on the strip: it scrolls natively; nothing unfolds until it comes to rest.
      on(
        stage,
        "touchstart",
        () => {
          touching = true;
          navTarget = -1;
          stopTravel();
          syncFree();
          lastUser = performance.now();
        },
        { passive: true },
      ); // The browser says the strip has come to rest (native swipes and snaps included):
      // the milestone at the light unfolds right away.
      on(stage, "scrollend", () => {
        if (travel || tp.on) return;
        vX = 0;
        lastScrollT = -1e9;
        kick();
      });
      const onTouchEnd = () => {
        touching = false;
        armSettle(160);
      };
      on(stage, "touchend", onTouchEnd, { passive: true });
      on(stage, "touchcancel", onTouchEnd, { passive: true });
      on(stage, "pointerdown", onDown);
      on(window, "pointermove", onMove, { passive: false });
      on(window, "pointerup", onUp);
      on(window, "pointercancel", onUp);
      on(stage, "click", onClickCapture, true);
      on(root, "pointerenter", (e) => {
        if (e.pointerType === "mouse") hovered = true;
      });
      on(root, "pointerleave", () => {
        hovered = false;
      });
      on(root, "keydown", () => {
        lastUser = performance.now();
      }); // Wheels. A notched wheel (or a tilting one, or Shift + wheel) steps one milestone per
      // notch, a sideways trackpad swipe one milestone per swipe; touch scrolls natively and
      // comes to rest on a milestone by itself. With "Mouse Wheel: Moves Timeline" turning
      // the wheel (or swiping up/down) over the strip steps through it as well; at either
      // end the page scrolls on as usual.
      const isTick = (e, d, legacy) => {
        if (e.deltaMode !== 0) return true;
        const ad = Math.abs(d);
        if (ad < 30) return false;
        const wd = Math.abs(legacy || 0);
        if (wd && Math.abs(wd - 3 * ad) < 1.5) return false; // precise trackpad
        return !wd || d % 1 === 0;
      }; // A two-finger swipe steps one milestone, exactly like the arrows: as soon as it has
      // clearly started, the strip glides on its own to the next milestone — the same speed
      // and the same soft landing every time — and the rest of that swipe (its momentum
      // included) is ignored. A new swipe, even during the last one's momentum, steps on.
      const armTp = () => {
        if (tp.timer) clearTimeout(tp.timer);
        tp.timer = window.setTimeout(() => {
          tp.timer = 0;
          tp.on = false;
          syncFree();
        }, 200);
      }; // false: nothing to step there (an end) — the page may scroll instead
      const swipe = (d) => {
        const now = performance.now();
        if (!tp.on || now - tp.lastT > 200) {
          tp.on = true;
          tp.fired = false;
          tp.acc = 0;
          tp.lastD = 0;
          tp.rise = 0;
          releaseIntro();
        } else if (tp.fired) {
          // a fresh swipe during the last one's momentum: the deltas grow again (or turn)
          const grows =
            Math.abs(d) > Math.abs(tp.lastD) + 0.5 && Math.sign(d) === Math.sign(tp.lastD);
          tp.rise = grows ? tp.rise + 1 : 0;
          const turned = Math.sign(d) !== tp.dirF && Math.abs(d) >= 4;
          if ((tp.rise >= 2 && now - tp.firedT > 260) || (turned && now - tp.firedT > 150)) {
            tp.fired = false;
            tp.acc = 0;
            tp.rise = 0;
          }
        }
        tp.lastT = now;
        tp.lastD = d;
        armTp();
        if (tp.fired) return true;
        const x = travel ? travelX : stage.scrollLeft;
        if ((d < 0 && x <= 1 && navIdx <= 0) || (d > 0 && x >= maxScroll - 1)) return false;
        tp.acc += d;
        if (Math.abs(tp.acc) < 12) return true;
        const dir = tp.acc > 0 ? 1 : -1;
        if (!nav(dir)) return false;
        tp.fired = true;
        tp.firedT = now;
        tp.dirF = dir;
        return true;
      };
      offs.push(() => {
        if (tp.timer) clearTimeout(tp.timer);
      });
      let lastEvT = -1e9;
      let lastEvD = 0;
      const onWheel = (e) => {
        if (e.ctrlKey) return;
        const side = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const d = side ? e.deltaX : e.deltaY;
        const legacy = e[side ? "wheelDeltaX" : "wheelDeltaY"];
        const now = performance.now(); // Pixel deltas arriving this densely are a touchpad (or a free-spinning wheel),
        // whatever their size: one swipe, one milestone — not one per event.
        const dense = now - lastEvT < 45 && d * lastEvD > 0;
        lastEvT = now;
        lastEvD = d;
        const tick = isTick(e, d, legacy) && !(dense && e.deltaMode === 0);
        if (!side && params.current.wheel !== "timeline") return; // A hand on the wheel or trackpad: nothing unfolds until the strip comes to rest.
        lastWheelT = performance.now();
        navTarget = -1;
        armSettle(160);
        if (side && !tick) {
          // trackpad (or Magic Mouse) sideways: one swipe, one milestone
          e.preventDefault();
          lastUser = performance.now();
          swipe(d);
          return;
        }
        lastUser = performance.now();
        if (tick) {
          const dir = d > 0 ? 1 : -1;
          const base = performance.now() - navT < 520 && navIdx >= 0 ? navIdx : nearestIdx();
          const k = base + dir;
          if (k < 0 || k > n0() - 1) return; // the end: the page scrolls on
          e.preventDefault();
          go(k); // Should more of this turn a moment later come as a dense stream, it
          // belongs to this step (see swipe).
          tp.on = true;
          tp.fired = true;
          tp.acc = 0;
          tp.rise = 0;
          tp.firedT = now;
          tp.dirF = dir;
          tp.lastT = now;
          tp.lastD = d;
          armTp();
          return;
        } // A trackpad's up/down swipe (Moves Timeline) steps like a sideways one; at an end
        // the page scrolls on.
        if (swipe(d)) e.preventDefault();
      };
      on(stage, "wheel", onWheel, { passive: false }); // Autoplay (optional): one milestone at a time while nobody interacts; from the last
      // it returns to the first.
      let lastAdvance = performance.now();
      const ap = window.setInterval(() => {
        const p = params.current;
        const now = performance.now();
        if (!p.autoplay || reduced || !seenNow || hovered || dragging || tp.on) {
          lastAdvance = now;
          return;
        }
        if (document.hidden || root.contains(document.activeElement)) {
          lastAdvance = now;
          return;
        }
        const every = Math.max(1.5, p.interval || 4) * 1e3;
        if (now - lastUser < every || now - lastAdvance < every) return;
        lastAdvance = now;
        const k = nearestIdx() + 1;
        go(k > n0() - 1 ? 0 : k, false);
      }, 250);
      offs.push(() => clearInterval(ap));
    }
    return () => {
      alive = false;
      api.current = null;
      if (raf) cancelAnimationFrame(raf);
      pending.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      travel = null;
      if (settleTimer) clearTimeout(settleTimer);
      if (movingTimer) clearTimeout(movingTimer);
      root.removeAttribute("data-moving");
      if (comet) comet.style.removeProperty("transform");
      offs.forEach((f) => f());
      rows.forEach((r) => r.removeAttribute("data-instant"));
      for (let k = 0; k < S.length; k++) {
        S[k].ta = S[k].tb = S[k].to = null;
        paint(k, false);
      }
      root.removeAttribute("data-drag");
      root.removeAttribute("data-free");
      if (!horiz) window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      root.removeEventListener("focusin", onFocusIn);
      if (horiz && stage) stage.removeEventListener("scroll", onStageScroll);
      if (ro) ro.disconnect();
      if (fonts && fonts.removeEventListener) fonts.removeEventListener("loadingdone", remeasure);
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener("change", onMotionPref);
        else if (mq.removeListener) mq.removeListener(onMotionPref);
      }
    };
  }, [live, cls, count, scrollMode, horizontal]); // Parameter changes (reading line, fold behaviour, sizes) are measured and re-run.
  useEffect(() => {
    const a = api.current;
    if (a) a.remeasure();
  }, [readingLine, lineX, refold, spacer, gap, cardW, padT, padR, padB, padL, arrows, one]);
  /* ---- interaction ---- */ const onNav = useCallback(
    (dir) => {
      if (!live) return;
      const a = api.current;
      if (a) a.nav(dir);
    },
    [live],
  );
  const onToggle = useCallback(
    (i) => {
      if (!live) return;
      const a = api.current;
      if (a) a.toggle(i);
    },
    [live],
  );
  const onKey = useCallback(
    (i, e) => {
      const root = rootRef.current;
      if (!root) return;
      const heads = root.querySelectorAll("button[aria-controls]");
      const n = heads.length;
      const next = horizontal ? "ArrowRight" : "ArrowDown";
      const prev = horizontal ? "ArrowLeft" : "ArrowUp";
      let to = -1;
      if (e.key === next || e.key === "ArrowDown") to = Math.min(n - 1, i + 1);
      else if (e.key === prev || e.key === "ArrowUp") to = Math.max(0, i - 1);
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = n - 1;
      if (to < 0) return;
      e.preventDefault();
      const el = heads[to];
      if (el) el.focus();
    },
    [horizontal],
  );
  /* ---- styles ---- */ const dateStyle = fontStyle(dateFont);
  const titleStyle = fontStyle(titleFont);
  const textStyle = fontStyle(textFont); // A see-through background: the strip's edges fade with a mask instead (overlays in the
  // background colour would show as bands over whatever is behind).
  const edgeMask = horizontal && !isOpaque(palette.background);
  const css = buildCss({
    cls,
    railXWide,
    clWide,
    DWide,
    DCompact,
    dW,
    dateLH,
    gap,
    glow,
    dark: palette.dark,
    u,
    spacer,
    padT,
    padR,
    padB,
    padL,
    cpl,
    cpr,
    cardW,
    arrows: horizontal && arrows,
    edgeMask,
  });
  if (count === 0) {
    return /*#__PURE__*/ _jsx("div", {
      style: {
        ...style,
        padding: 24,
        fontSize: 14,
        color: palette.text,
        background: palette.background,
      },
      children: "Add items to the timeline.",
    });
  }
  const openArr = isStatic ? staticOpen : scrollMode ? null : clickOpenInit;
  const lastOpen = (() => {
    let idx = -1;
    if (openArr)
      openArr.forEach((v, i) => {
        if (v) idx = i;
      });
    return idx;
  })(); // Photos are fetched at the size they are shown (a card is never wider than Card Width).
  const imgSizes = horizontal
    ? `(max-width: 480px) 82vw, ${cardW}px`
    : "(max-width: 640px) 100vw, 600px"; // Horizontal canvas: the milestone the strip rests on (-1: none reached yet).
  const hActive = horizontal && isStatic && scrollMode ? (canvasOpen > 0 ? staticActive : -1) : -1;
  const rowsEl = list.map((item, i) => {
    const isOpen = openArr ? !!openArr[i] : undefined;
    let staticFill = undefined;
    if (isStatic && scrollMode)
      staticFill = horizontal
        ? i < hActive
          ? 1
          : 0
        : i < lastOpen
          ? 1
          : i === lastOpen
            ? 0.72
            : 0;
    const lit = isStatic
      ? scrollMode
        ? i <= (horizontal ? hActive : lastOpen)
        : !!isOpen
      : scrollMode
        ? undefined
        : !!isOpen;
    return /*#__PURE__*/ _jsx(
      Row,
      {
        cls: cls,
        item: item || {},
        index: i,
        count: count,
        horizontal: horizontal,
        open: isOpen,
        lit: lit,
        staticMode: isStatic,
        u: u,
        pad: pad,
        radius: radius,
        innerRadius: innerRadius,
        ratio: ratio,
        reveal: reveal,
        titleTag: titleTag,
        dateFont: dateStyle,
        titleFont: titleStyle,
        textFont: textStyle,
        staticFill: staticFill,
        showStaticComet: isStatic && scrollMode && !horizontal && i === lastOpen && i < count - 1,
        sampleImages: sampleImages,
        imgSizes: imgSizes,
        titleLinks: scrollMode,
        onToggle: onToggle,
        onKey: onKey,
      },
      i,
    );
  }); // Live: placed and faded by the engine. Horizontal canvas: shown resting on its milestone.
  const cometEl =
    scrollMode && (live || horizontal)
      ? /*#__PURE__*/ _jsxs("div", {
          className: cls + "-comet" + (isStatic && hActive >= 0 ? " " + cls + "-comet-on" : ""),
          "aria-hidden": "true",
          suppressHydrationWarning: true,
          children: [
            /*#__PURE__*/ _jsx("span", { className: cls + "-halo" }),
            /*#__PURE__*/ _jsx("span", { className: cls + "-trail" }),
            /*#__PURE__*/ _jsx("span", { className: cls + "-core" }),
          ],
        })
      : null; // Vertical: the light travels inside the track. Horizontal: it stays in place on top of the
  // scrolling strip.
  const trackEl = /*#__PURE__*/ _jsxs("div", {
    className: cls + "-track",
    suppressHydrationWarning: true,
    children: [
      /*#__PURE__*/ _jsx("ol", { className: cls + "-ol", children: rowsEl }),
      horizontal ? null : cometEl,
    ],
  }); // Arrows at both ends of the rail: they close the thread off on either side. On a phone they
  // sit together on the rail above the card's right edge, clear of the light.
  const navAt = isStatic && scrollMode ? Math.max(0, staticActive) : 0;
  const navBtn = (dir) =>
    /*#__PURE__*/ _jsx(
      "button",
      {
        type: "button",
        className: cls + "-navbtn",
        "aria-label": dir < 0 ? "Previous milestone" : "Next milestone",
        "aria-disabled": (dir < 0 ? navAt <= 0 : navAt >= count - 1 && isStatic)
          ? "true"
          : undefined,
        suppressHydrationWarning: true,
        tabIndex: isStatic ? -1 : undefined,
        onClick: () => onNav(dir),
        children: /*#__PURE__*/ _jsx("svg", {
          width: "16",
          height: "16",
          viewBox: "0 0 16 16",
          "aria-hidden": "true",
          children: /*#__PURE__*/ _jsx("path", {
            d: dir < 0 ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }),
        }),
      },
      dir,
    );
  const navEl =
    horizontal && arrows
      ? /*#__PURE__*/ _jsxs("div", { className: cls + "-nav", children: [navBtn(-1), navBtn(1)] })
      : null;
  return /*#__PURE__*/ _jsxs("div", {
    ref: rootRef,
    className: cls,
    "data-static": isStatic ? "true" : undefined,
    "data-mode": scrollMode ? "scroll" : "click",
    "data-dir": horizontal ? "h" : "v",
    "data-snap": horizontal && snap ? "" : undefined,
    "data-hold": typeof window === "undefined" && live && scrollMode ? "1" : undefined,
    suppressHydrationWarning: true,
    style: {
      ...style,
      ["--ut-bg"]: palette.background,
      ["--ut-card"]: palette.card,
      ["--ut-border"]: palette.border,
      ["--ut-rail"]: palette.rail,
      ["--ut-title"]: palette.title,
      ["--ut-text"]: palette.text,
      ["--ut-date"]: palette.date,
      ["--ut-accent"]: accent,
      ["--ut-line"]: lineColor,
      ["--ut-ink"]: inkColor,
      ["--lx"]: clamp(lineX, 0, 100) / 100,
      ["--sa"]: horizontal && isStatic && scrollMode ? Math.max(0, hActive) : undefined,
      background: palette.background,
      padding: horizontal ? 0 : `${padT}px ${padR}px ${padB}px ${padL}px`,
    },
    children: [
      /*#__PURE__*/ _jsx("style", { dangerouslySetInnerHTML: { __html: css } }),
      horizontal
        ? /*#__PURE__*/ _jsxs("div", {
            className: cls + "-hwrap",
            children: [
              /*#__PURE__*/ _jsx("div", { className: cls + "-stage", children: trackEl }),
              edgeMask
                ? null
                : /*#__PURE__*/ _jsx("span", {
                    className: cls + "-fade " + cls + "-fade-l",
                    "aria-hidden": "true",
                  }),
              edgeMask
                ? null
                : /*#__PURE__*/ _jsx("span", {
                    className: cls + "-fade " + cls + "-fade-r",
                    "aria-hidden": "true",
                  }),
              cometEl,
              navEl,
            ],
          })
        : /*#__PURE__*/ _jsx("div", {
            className: cls + "-list",
            style: { maxWidth },
            children: trackEl,
          }),
      live // The script sits inside an opaque wrapper: if a host ever strips it from the
        ? // server HTML, hydration still matches and the engine sets the state instead.
          /*#__PURE__*/ _jsx("div", {
            className: cls + "-pre",
            hidden: true,
            dangerouslySetInnerHTML: {
              __html:
                '<script data-c="' +
                cls +
                '" data-m="' +
                (scrollMode ? "scroll" : "click") +
                '" data-d="' +
                (horizontal ? "h" : "v") +
                '" data-i="' +
                (introFirst ? "1" : "0") +
                '" data-o="' +
                (one ? "1" : "0") +
                '" data-rl="' +
                clamp(readingLine, 0, 100) +
                '" data-g="' +
                (DOT_R + DOT_GAP) +
                '">' +
                PRE +
                "</script>",
            },
          })
        : null,
    ],
  });
}
/* ------------------------------------------------------------------------ */ /* CSS                                                                       */
function buildCss(o) {
  const c = o.cls;
  const r = DOT_R;
  const g = DOT_GAP;
  const glowA = o.dark ? 1 : 0.55;
  const railXC = RAIL_X_COMPACT;
  const clC = RAIL_X_COMPACT + CARD_GAP_COMPACT;
  const open = `.${c}-row[data-open="true"]`;
  const H = `.${c}[data-dir="h"]`;
  const RY = o.dateLH + 14 + r; // horizontal: rail centre, from the top of a column
  // Horizontal: the strip's edges fade into the background, so milestones glide in and out
  // instead of being cut off (overlays, not a mask: a masked scroller re-rasters its photos).
  const EDGE_MASK =
    "linear-gradient(90deg,transparent,rgba(0,0,0,.2) calc(var(--fade) * .3),rgba(0,0,0,.62) calc(var(--fade) * .6),#000 var(--fade),#000 calc(100% - var(--fade)),rgba(0,0,0,.62) calc(100% - var(--fade) * .6),rgba(0,0,0,.2) calc(100% - var(--fade) * .3),transparent)";
  const EDGE_FADE = (dir) =>
    `linear-gradient(${dir},var(--ut-bg) 0%,color-mix(in srgb,var(--ut-bg) 80%,transparent) 30%,color-mix(in srgb,var(--ut-bg) 38%,transparent) 60%,transparent 100%)`; // overflow-anchor:none — the browser must not answer an unfolding card by shifting the scroll
  // position (scroll anchoring), otherwise the page jumps while cards grow.
  // Rows sit on their own compositor layers (will-change) so a card that grows only moves the
  // rows after it instead of repainting them in every frame.
  return `
.${c}{position:relative;box-sizing:border-box;color:var(--ut-text);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-anchor:none}
.${c} *,.${c} *::before,.${c} *::after{box-sizing:border-box}
.${c}-list{position:relative;margin:0 auto;width:100%;container:${c}v / inline-size}
.${c}-track{position:relative;--railX:${o.railXWide}px;--cl:${o.clWide}px;--D:${o.DWide}px}
.${c}-ol{list-style:none;margin:0;padding:0}
.${c}-row{position:relative;margin:0;padding:0 0 ${o.gap}px var(--cl);will-change:transform}
.${c}-date{position:absolute;left:0;top:calc(var(--D) - ${o.dateLH / 2}px);width:${o.dW}px;text-align:right !important;color:var(--ut-date);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;user-select:none;-webkit-user-select:none;font-variant-numeric:tabular-nums;transition:color .4s ease}
.${c}-row[data-lit="1"] .${c}-date,.${c}-row[data-lit="1"] .${c}-eyebrow{color:color-mix(in srgb,var(--ut-title) 86%,var(--ut-date))}
.${c}-dot{position:absolute;left:calc(var(--railX) - ${r}px);top:calc(var(--D) - ${r}px);width:${2 * r}px;height:${2 * r}px;border-radius:50%;box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--ut-date) 55%,transparent);pointer-events:none;transition:background-color .35s ease,box-shadow .45s ease,transform .35s cubic-bezier(.22,1,.36,1)}
.${c}-row[data-lit="1"] .${c}-dot{background:var(--ut-line);box-shadow:inset 0 0 0 2px var(--ut-line)${o.glow ? `,0 0 0 4px color-mix(in srgb,var(--ut-line) ${Math.round(16 * glowA)}%,transparent),0 0 16px color-mix(in srgb,var(--ut-line) ${Math.round(55 * glowA)}%,transparent)` : ""}}
.${c}-dot::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 1.5px var(--ut-line);opacity:0;pointer-events:none}
.${c}-row[data-ping] .${c}-dot::after{animation:${c}-ping ${Math.max(0.5, 1.1 * o.u).toFixed(2)}s cubic-bezier(.22,1,.36,1) 1}
@keyframes ${c}-ping{0%{transform:scale(1);opacity:.75}100%{transform:scale(3.4);opacity:0}}
.${c}-segbox{position:absolute;left:calc(var(--railX) - ${RAIL_W / 2}px);top:calc(var(--D) + ${r + g}px);bottom:calc(${r + g}px - var(--D));width:${RAIL_W}px;pointer-events:none}
.${c}-cap{position:absolute;left:calc(var(--railX) - ${RAIL_W / 2}px);width:${RAIL_W}px;height:36px;pointer-events:none}
.${c}-cap-top{top:calc(var(--D) - ${r + g + 36}px);background:linear-gradient(to top,var(--ut-rail),transparent)}
.${c}-cap-end{top:calc(var(--D) + ${r + g}px);background:linear-gradient(to bottom,var(--ut-rail),transparent)}
.${c}-seg{position:absolute;inset:0;border-radius:${RAIL_W}px;background:var(--ut-rail)}
.${c}-lit{position:absolute;inset:0;transform-origin:50% 0;transform:scaleY(0)}
.${c}-fill{position:absolute;inset:0;border-radius:${RAIL_W}px;background:var(--ut-line)}
.${c}-glowline{position:absolute;top:0;bottom:0;left:-4px;right:-4px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ut-line) ${o.dark ? 34 : 18}%,transparent) 50%,transparent);${o.glow ? "" : "display:none;"}}
.${c}-card{position:relative}
.${c}-surface{position:absolute;left:0;top:0;bottom:0;width:100%;background:${o.dark ? "linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,0) 42%),var(--ut-card)" : "var(--ut-card)"};box-shadow:inset 0 0 0 1px var(--ut-border)${o.dark ? ",inset 0 1px 0 rgba(255,255,255,.04),0 24px 48px -28px rgba(0,0,0,.7)" : ",0 1px 2px rgba(15,18,23,.04),0 16px 36px -18px rgba(15,18,23,.16)"};pointer-events:none;opacity:0;clip-path:inset(0 100% 0 -${TAIL_W + 1}px);-webkit-clip-path:inset(0 100% 0 -${TAIL_W + 1}px)}
${open} .${c}-surface{opacity:1;clip-path:none;-webkit-clip-path:none}
.${c}-surface::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;${o.glow ? `background:radial-gradient(280px 150px at 0 var(--D),color-mix(in srgb,var(--ut-line) ${o.dark ? 11 : 7}%,transparent),transparent 72%)` : "display:none"}}
.${c}-surface::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ut-title) ${o.dark ? 24 : 18}%,transparent);opacity:0;transition:opacity .35s ease}
.${c}-tail{position:absolute;left:-${TAIL_W}px;top:calc(var(--D) - 10px);overflow:visible;display:block}
.${c}-h{margin:0;padding:0;font:inherit;font-size:inherit;font-weight:inherit;letter-spacing:inherit;line-height:inherit}
.${c}-head{all:unset;box-sizing:border-box;position:relative;display:block;width:100%;cursor:pointer;color:inherit;text-align:left;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
.${c}-head::before{content:"";position:absolute;inset:0 0 -${o.spacer}px;border-radius:inherit;background:var(--ut-card);box-shadow:inset 0 0 0 1px var(--ut-border);opacity:0;transform:scaleX(.985);transform-origin:0 50%;transition:opacity .3s ease,transform .45s cubic-bezier(.22,1,.36,1);pointer-events:none}
${open} .${c}-head::before{display:none}
.${c}-head:focus-visible{outline:2px solid var(--ut-line);outline-offset:3px}
@supports selector(:has(*)){
${open} .${c}-head:focus-visible{outline:none}
${open} .${c}-card:has(.${c}-head:focus-visible) .${c}-surface{outline:2px solid var(--ut-line);outline-offset:3px}
}
.${c}-title{position:relative;display:block;color:var(--ut-title);opacity:.62;transition:opacity .4s ease}
${open} .${c}-title{opacity:1}
.${c}-eyebrow{position:absolute;z-index:1;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;color:var(--ut-date);font-variant-numeric:tabular-nums;transition:color .4s ease}
.${c}-wrap{position:relative;overflow:hidden;height:${o.spacer}px}
${open} .${c}-wrap{height:auto}
.${c}-inner{position:relative}
.${c}-text{margin:0;color:var(--ut-text)}
.${c}-media{position:relative;width:100%;overflow:hidden;margin-top:16px;background:color-mix(in srgb,var(--ut-rail) 34%,transparent);transform:translateZ(0)}
.${c}-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;transform:scale(1.045);transition:opacity .35s ease,transform .5s ease}
${open} .${c}-media img{opacity:1;transform:none;transition:opacity .5s ease calc(var(--b) * .6),transform 1.1s cubic-bezier(.22,1,.36,1) calc(var(--b) * .6)}
.${c}[data-js] .${c}-media img:not([data-loaded]){opacity:0}
.${c}-link{display:inline-flex;align-items:center;gap:6px;margin-top:14px;color:var(--ut-ink);text-decoration:none;font-weight:500;cursor:pointer;border-radius:6px;opacity:0;transform:translateY(4px);transition:opacity .15s ease,transform .3s ease}
${open} .${c}-link{opacity:1;transform:none;transition:opacity .45s ease calc(var(--b) + var(--m)),transform .6s cubic-bezier(.22,1,.36,1) calc(var(--b) + var(--m))}
.${c}-link-label{background:linear-gradient(currentColor,currentColor) 0 100%/0% 1px no-repeat;padding-bottom:1px;transition:background-size .35s cubic-bezier(.22,1,.36,1)}
.${c}-arrow{flex:none;transition:transform .35s cubic-bezier(.22,1,.36,1)}
.${c}-link:focus-visible{outline:2px solid var(--ut-line);outline-offset:3px}
.${c}-link:focus-visible .${c}-link-label{background-size:100% 1px}
.${c}-w{color:transparent;transition:color .14s ease}
${open} .${c}-r-words .${c}-w{color:inherit;transition:color .55s ease calc(var(--b) + var(--i) * 11ms)}
.${c}-r-words{transform:translateY(5px);transition:transform .2s ease}
${open} .${c}-r-words{transform:none;transition:transform .8s cubic-bezier(.22,1,.36,1) var(--b)}
.${c}-r-typewriter .${c}-w{color:inherit;transition:none}
.${c}-c{color:transparent;transition:color .1s linear}
${open} .${c}-r-typewriter .${c}-c{color:inherit;transition:color 0s linear calc(var(--b) + var(--i) * 9ms)}
.${c}-r-fade{opacity:0;transform:translateY(6px);transition:opacity .15s ease,transform .25s ease}
${open} .${c}-r-fade{opacity:1;transform:none;transition:opacity .55s ease var(--b),transform .7s cubic-bezier(.22,1,.36,1) var(--b)}
.${c}-r-none{opacity:0;transition:opacity .12s linear}
${open} .${c}-r-none{opacity:1}
.${c}-comet{position:absolute;left:var(--railX);top:0;width:0;height:0;opacity:0;pointer-events:none;z-index:2;will-change:transform,opacity}
.${c}-comet-static{top:0;left:${RAIL_W / 2}px;opacity:1}
.${c}-core{position:absolute;left:-3.5px;top:-3.5px;width:7px;height:7px;border-radius:50%;background:color-mix(in srgb,var(--ut-line) 45%,#fff)${o.glow ? `;box-shadow:0 0 8px 1px color-mix(in srgb,var(--ut-line) ${Math.round(80 * glowA)}%,transparent),0 0 22px 5px color-mix(in srgb,var(--ut-line) ${Math.round(35 * glowA)}%,transparent)` : ""}}
.${c}-halo{position:absolute;left:-34px;top:-34px;width:68px;height:68px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--ut-line) ${Math.round(26 * glowA)}%,transparent) 0%,transparent 68%);${o.glow ? "" : "display:none;"}}
.${c}-trail{position:absolute;left:-1px;top:-72px;width:2px;height:72px;border-radius:2px;background:linear-gradient(to top,color-mix(in srgb,var(--ut-line) 40%,#fff) 0%,transparent 100%);opacity:${o.glow ? 0.9 : 0}}
${H}{--DX:${o.cpl}px;--RY:${RY}px;--ow:min(${o.cardW}px,${OPEN_SHARE * 100}cqw);--sl:min(${o.padL}px,(100cqw - var(--ow)) / 2);--sr:min(${o.padR}px,(100cqw - var(--ow)) / 2);--cx:clamp(calc(var(--ow) / 2 + var(--sl)),calc(var(--lx,.5) * 100cqw),calc(100cqw - var(--ow) / 2 - var(--sr)));--padl:calc(var(--cx) - var(--ow) / 2);--padr:max(0px,calc(100cqw - var(--padl) - var(--ow)));--lxp:calc(var(--padl) + var(--DX));--fade:max(0px,min(160px,12cqw,calc(var(--padl) - 12px),calc(var(--padr) - 12px)));--na:max(6px,min(24px,calc(var(--padl) - 48px),calc(var(--padr) - 48px)))}
.${c}-hwrap{position:relative;container-type:inline-size}
.${c}-stage{position:relative;width:100%;padding:${o.padT}px 0 ${o.padB}px;overflow:hidden}
${o.edgeMask ? `${H} .${c}-stage{-webkit-mask-image:${EDGE_MASK};mask-image:${EDGE_MASK}}` : ""}
${H} .${c}-fade{position:absolute;top:0;bottom:0;width:var(--fade);z-index:2;pointer-events:none}
${H} .${c}-fade-l{left:0;background:${EDGE_FADE("90deg")}}
${H} .${c}-fade-r{right:0;background:${EDGE_FADE("270deg")}}
${H}[data-static][data-mode="scroll"] .${c}-track{transform:translateX(calc(var(--sa,0) * -1 * (var(--ow) + ${o.gap}px)))}
${H}:not([data-static]) .${c}-stage{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
${H} .${c}-stage::-webkit-scrollbar{display:none}
${H}[data-snap]:not([data-static]):not([data-free]) .${c}-stage{scroll-snap-type:x mandatory}
${H}[data-drag] .${c}-stage{cursor:grabbing}
${H}[data-drag] .${c}-stage *{user-select:none;-webkit-user-select:none}
${H} .${c}-track{width:max-content;padding:0 var(--padr) 0 var(--padl)}
${H} .${c}-ol{display:flex;align-items:flex-start}
${H} .${c}-row{flex:none;width:var(--ow);margin:0 ${o.gap}px 0 0;padding:0;scroll-snap-align:start;scroll-margin-left:var(--padl)}
${H} .${c}-row:last-child{margin-right:0}
${H} .${c}-wrap{height:auto}
${H} .${c}-row:not([data-open="true"]) .${c}-wrap{clip-path:inset(0 0 calc(100% - ${o.spacer}px) 0);-webkit-clip-path:inset(0 0 calc(100% - ${o.spacer}px) 0)}
${H} .${c}-date{left:calc(var(--DX) - ${r}px);top:0;width:auto;max-width:calc(100% - var(--DX) + ${r}px);text-align:left !important}
${H} .${c}-dot{left:calc(var(--DX) - ${r}px);top:calc(var(--RY) - ${r}px)}
${H} .${c}-segbox{top:calc(var(--RY) - ${RAIL_W / 2}px);bottom:auto;left:calc(var(--DX) + ${r + g}px);right:calc(${r + g}px - ${o.gap}px - var(--DX));width:auto;height:${RAIL_W}px}
${H} .${c}-lit{transform-origin:0 50%;transform:scaleX(0)}
${H} .${c}-glowline{top:-4px;bottom:-4px;left:0;right:0;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--ut-line) ${o.dark ? 34 : 18}%,transparent) 50%,transparent)}
${H} .${c}-cap{top:calc(var(--RY) - ${RAIL_W / 2}px);width:36px;height:${RAIL_W}px}
${H} .${c}-cap-top{left:calc(-1 * var(--padl));width:calc(var(--padl) + var(--DX) - ${r + g}px);background:linear-gradient(to left,var(--ut-rail),color-mix(in srgb,var(--ut-rail) 55%,transparent) 30%,color-mix(in srgb,var(--ut-rail) 18%,transparent) 70%,transparent)}
${H} .${c}-cap-end{left:calc(var(--DX) + ${r + g}px);width:calc(var(--ow) - var(--DX) - ${r + g}px + var(--padr));background:linear-gradient(to right,var(--ut-rail),color-mix(in srgb,var(--ut-rail) 55%,transparent) 30%,color-mix(in srgb,var(--ut-rail) 18%,transparent) 70%,transparent)}
${H} .${c}-card{margin-top:calc(var(--RY) + ${r + 24}px)}
${H} .${c}-surface{clip-path:inset(-${TAIL_W + 1}px 100% 0 0);-webkit-clip-path:inset(-${TAIL_W + 1}px 100% 0 0)}
${H} ${open} .${c}-surface{clip-path:none;-webkit-clip-path:none}
${H} .${c}-surface::before{${o.glow ? `background:radial-gradient(220px 150px at var(--DX) 0,color-mix(in srgb,var(--ut-line) ${o.dark ? 11 : 7}%,transparent),transparent 72%)` : "display:none"}}
${H} .${c}-tail{left:calc(var(--DX) - 10px);top:-${TAIL_W}px}
${H} .${c}-inner{width:var(--ow)}
${H} .${c}-hwrap > .${c}-comet{left:var(--lxp);top:calc(${o.padT}px + var(--RY));z-index:3}
${H} .${c}-hwrap > .${c}-comet-on{opacity:1}
${H} .${c}-trail{left:-72px;top:-1px;width:72px;height:2px;background:linear-gradient(to left,color-mix(in srgb,var(--ut-line) 40%,#fff) 0%,transparent 100%);opacity:0;transform-origin:100% 50%;transition:opacity .55s ease}
${H}[data-moving] .${c}-trail{opacity:${o.glow ? 0.9 : 0};transition-duration:.12s}
${H}[data-moving="b"] .${c}-trail{transform:scaleX(-1)}
${H} .${c}-comet-static{top:${RAIL_W / 2}px}
.${c}-nav{position:absolute;left:0;right:0;top:calc(${o.padT}px + var(--RY) - 20px);height:0;z-index:4;pointer-events:none}
.${c}-navbtn{all:unset;box-sizing:border-box;position:absolute;top:0;left:var(--na);width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer;color:var(--ut-title);background:var(--ut-card);box-shadow:inset 0 0 0 1px var(--ut-border)${o.dark ? ",inset 0 1px 0 rgba(255,255,255,.04)" : ",0 1px 2px rgba(15,18,23,.06)"};transition:opacity .3s ease,background-color .25s ease,transform .3s cubic-bezier(.22,1,.36,1);-webkit-tap-highlight-color:transparent}
.${c}-navbtn + .${c}-navbtn{left:auto;right:var(--na)}
.${c}-navbtn::before{content:"";position:absolute;inset:-4px;border-radius:50%}
.${c}-navbtn[aria-disabled="true"]{opacity:.32;cursor:default}
.${c}-navbtn:not([aria-disabled="true"]):active{transform:scale(.94)}
.${c}-navbtn:focus-visible{outline:2px solid var(--ut-line);outline-offset:3px}
.${c}[data-static] .${c}-navbtn{cursor:default}
@media (hover:hover) and (pointer:fine){
.${c}-row:not([data-open="true"]) .${c}-head:hover .${c}-title{opacity:.92}
.${c}-row:not([data-open="true"]) .${c}-card:hover .${c}-head::before{opacity:.55;transform:none}
.${c}-row:hover .${c}-dot{transform:scale(1.2)}
.${c}-row:not([data-lit="1"]):hover .${c}-date{color:color-mix(in srgb,var(--ut-date) 45%,var(--ut-title))}
.${c}-link:hover .${c}-link-label{background-size:100% 1px}
.${c}-link:hover .${c}-arrow{transform:translateX(4px)}
.${c}:not([data-static]) .${c}-row:not([data-open="true"]) .${c}-card{cursor:pointer}
.${c}:not([data-static]) ${open}[data-link] .${c}-card{cursor:pointer}
${open}[data-link] .${c}-card:hover .${c}-link-label{background-size:100% 1px}
${open}[data-link] .${c}-card:hover .${c}-arrow{transform:translateX(4px)}
${open}[data-link] .${c}-card:hover .${c}-surface::after{opacity:1}
${H}:not([data-static]) .${c}-stage{cursor:grab}
${H}[data-drag] .${c}-stage *{cursor:grabbing !important}
.${c}-navbtn:not([aria-disabled="true"]):hover{background:color-mix(in srgb,var(--ut-card) 84%,var(--ut-title))}
}
@container (max-width:${BREAKPOINT - 1}px){
${H} .${c}-navbtn{width:36px;height:36px;top:2px;left:auto;right:calc(max(var(--padr),8px) + 44px)}
${H} .${c}-navbtn + .${c}-navbtn{right:max(var(--padr),8px)}
}
@container ${c}v (max-width:${BREAKPOINT - 1}px){
.${c}-track{--railX:${railXC}px;--cl:${clC}px;--D:${o.DCompact}px}
.${c}-date{display:none}
.${c}-eyebrow{position:relative;width:auto;height:auto;margin:0 0 4px;overflow:visible;clip:auto;white-space:normal;display:block}
}
@media (prefers-reduced-motion:reduce){
.${c} .${c}-dot::after{animation:none !important}
.${c}-w{transform:none !important;filter:none !important}
.${c}-media img,.${c}-link,.${c}-r-fade{transform:none !important}
}
@media (prefers-contrast:more){
.${c}-surface{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ut-title) 38%,transparent)}
.${c}-date,.${c}-eyebrow{color:color-mix(in srgb,var(--ut-date) 50%,var(--ut-title))}
.${c}-title{opacity:.85}
.${c}-seg{background:color-mix(in srgb,var(--ut-date) 60%,transparent)}
}
.${c}[data-hold]{visibility:hidden;animation:${c}-unhold 0s linear 1.2s forwards}
@keyframes ${c}-unhold{to{visibility:visible}}
.${c}-row[data-instant],.${c}-row[data-instant] *,.${c}-row[data-instant] *::before,.${c}-row[data-instant] *::after{transition:none !important;animation:none !important}
.${c}[data-still] *,.${c}[data-still] *::before,.${c}[data-still] *::after,.${c}[data-static="true"] *,.${c}[data-static="true"] *::after{transition:none !important;animation:none !important}
.${c}[data-static="true"] ${open} .${c}-w,.${c}[data-static="true"] ${open} .${c}-c{color:inherit}
.${c}[data-static="true"] ${open} .${c}-r-words{transform:none}
`;
}
/* ------------------------------------------------------------------------ */ /* Property Controls                                                         */ TimelineSlider.displayName =
  "Timeline Slider";
const notCustom = (p) => p.theme !== "custom";
const isHorizontal = (p) => p.direction !== "vertical";

const DEFAULT_PROPS = {
  items: DEFAULT_ITEMS,
  sampleImages: true,
  direction: "horizontal",
  trigger: "scroll",
  intro: "first",
  readingLine: 60,
  lineX: 50,
  unfolded: "current",
  refold: true,
  openOnLoad: 1,
  snap: true,
  wheel: "page",
  arrows: true,
  autoplay: false,
  interval: 4,
  canvasOpen: 3,
  theme: "dark",
  accent: "#7CC4F2",
  glow: true,
  background: THEMES.dark.background,
  cardColor: THEMES.dark.card,
  borderColor: THEMES.dark.border,
  railColor: THEMES.dark.rail,
  titleColor: THEMES.dark.title,
  textColor: THEMES.dark.text,
  dateColor: THEMES.dark.date,
  dateFont: {
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.01em",
    lineHeight: "1.4em",
  },
  titleFont: {
    fontSize: "18px",
    fontWeight: 600,
    letterSpacing: "-0.015em",
    lineHeight: "1.35em",
  },
  textFont: {
    fontSize: "15px",
    fontWeight: 400,
    letterSpacing: "-0.005em",
    lineHeight: "1.6em",
  },
  titleTag: "h3",
  padding: "64px 32px 64px 32px",
  maxWidth: 760,
  dateWidth: 104,
  cardWidth: 340,
  spacing: 14,
  card: { padding: "20px 24px 20px 24px", radius: "18px", imageRatio: "2:1" },
  reveal: "words",
  speed: 0.7,
};

const GROUP_KEYS = ["card"];

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

export interface TimelineSliderProps {
  items?: {
    date?: string;
    title?: string;
    text?: string;
    image?: { src?: string; srcSet?: string; alt?: string };
    linkLabel?: string;
    link?: string;
    newTab?: boolean;
    sample?: string;
  }[];
  sampleImages?: boolean;
  direction?: "vertical" | "horizontal";
  trigger?: "scroll" | "click";
  intro?: "first" | "off";
  readingLine?: number;
  lineX?: number;
  unfolded?: "current" | "passed";
  refold?: boolean;
  openOnLoad?: number;
  snap?: boolean;
  wheel?: "page" | "timeline";
  arrows?: boolean;
  autoplay?: boolean;
  interval?: number;
  canvasOpen?: number;
  theme?: "dark" | "light" | "custom";
  accent?: string;
  glow?: boolean;
  background?: string;
  cardColor?: string;
  borderColor?: string;
  railColor?: string;
  titleColor?: string;
  textColor?: string;
  dateColor?: string;
  dateFont?: React.CSSProperties;
  titleFont?: React.CSSProperties;
  textFont?: React.CSSProperties;
  titleTag?: "h2" | "h3" | "h4" | "p";
  padding?: string;
  maxWidth?: number;
  dateWidth?: number;
  cardWidth?: number;
  spacing?: number;
  card?: {
    padding?: string;
    radius?: string;
    imageRatio?: "21:9" | "2:1" | "16:9" | "3:2" | "4:3" | "1:1";
  };
  reveal?: "words" | "typewriter" | "fade" | "none";
  speed?: number;
  style?: React.CSSProperties;
}

export function TimelineSlider(props: TimelineSliderProps) {
  return _jsx(TimelineSliderImpl, mergeProps(props));
}

TimelineSlider.displayName = "TimelineSlider";

export default TimelineSlider;
