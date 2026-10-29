/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
function extractPlainText(node) {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractPlainText).join("");
  }
  if (/*#__PURE__*/ React.isValidElement(node)) {
    return extractPlainText(node.props.children);
  }
  return "";
}
function normalizeTextComponent(textComponent) {
  const instance = Array.isArray(textComponent) ? textComponent[0] : textComponent;
  if (!(/*#__PURE__*/ React.isValidElement(instance))) return instance ?? null;
  return /*#__PURE__*/ React.cloneElement(instance, {
    style: {
      ...instance.props.style,
      width: "100%",
      height: "auto",
      minWidth: "unset",
      whiteSpace: "normal",
    },
  });
}
function createCharSpan(char, dimOpacity) {
  const span = document.createElement("span");
  span.textContent = char;
  span.style.display = "inline";
  span.style.opacity = String(dimOpacity);
  span.style.willChange = "opacity";
  return span;
}
function createWordSpan(word, dimOpacity) {
  const span = document.createElement("span");
  span.textContent = word;
  span.style.display = "inline";
  span.style.opacity = String(dimOpacity);
  span.style.willChange = "opacity";
  return span;
}
function processNodeRecursively(el, revealMode, dimOpacity, segments) {
  const originalChildren = Array.from(el.childNodes);
  for (const node of originalChildren) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text.length) continue;
      const frag = document.createDocumentFragment();
      if (revealMode === "chars") {
        for (const char of text) {
          if (char === " ") {
            frag.appendChild(document.createTextNode(" "));
          } else {
            const span = createCharSpan(char, dimOpacity);
            frag.appendChild(span);
            segments.push(span);
          }
        }
      } else {
        const parts = text.split(/(\s+)/);
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = createWordSpan(part, dimOpacity);
            frag.appendChild(span);
            segments.push(span);
          }
        }
      }
      node.parentNode?.replaceChild(frag, node);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const childEl = node;
    if (childEl.tagName === "BR") {
      childEl.style.display = "inline";
      childEl.style.opacity = String(dimOpacity);
      childEl.style.willChange = "opacity";
      segments.push(childEl);
      continue;
    }
    processNodeRecursively(childEl, revealMode, dimOpacity, segments);
  }
}
/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 180
 * @framerDisableUnlink
 */
export interface TextRevealScrollProps {
  /** The text element to reveal; its plain text is split into characters or words. */
  textComponent?: React.ReactNode;
  revealMode?: "chars" | "words";
  startOffset?: number;
  endOffset?: number;
  dimOpacity?: number;
  overrideFontSize?: boolean;
  fontSize?: number;
  style?: React.CSSProperties;
}

export function TextRevealScroll({
  textComponent,
  revealMode = "chars",
  startOffset = 90,
  endOffset = 30,
  dimOpacity = 0.2,
  overrideFontSize = false,
  fontSize = 64,
  style,
}: TextRevealScrollProps) {
  const rootRef = React.useRef(null);
  const textRef = React.useRef(null);
  const segmentsRef = React.useRef([]);
  const styleId = React.useId().replace(/:/g, "");
  const isVisibleRef = React.useRef(false);
  const rafRef = React.useRef(0);
  const startOffsetRef = React.useRef(startOffset);
  const endOffsetRef = React.useRef(endOffset);
  const dimOpacityRef = React.useRef(dimOpacity);
  startOffsetRef.current = startOffset;
  endOffsetRef.current = endOffset;
  dimOpacityRef.current = dimOpacity;
  const isCanvas = false;
  const connectedText = React.useMemo(() => normalizeTextComponent(textComponent), [textComponent]);
  const textFingerprint = React.useMemo(
    () => extractPlainText(connectedText).replace(/\s+/g, " ").trim(),
    [connectedText],
  );
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  React.useEffect(() => {
    if (!isClient || isCanvas || !rootRef.current || !textRef.current) {
      return;
    }
    let intersectionObserver = null;
    let mutationObserver = null;
    let scrollHandler = null;
    let resizeHandler = null;
    const root = rootRef.current;
    const textRoot = textRef.current;
    const allSegments = [];
    textRoot.style.visibility = "hidden";
    processNodeRecursively(textRoot, revealMode, dimOpacityRef.current, allSegments);
    if (allSegments.length === 0) {
      textRoot.style.visibility = "visible";
      return;
    }
    segmentsRef.current = allSegments;
    textRoot.style.visibility = "visible";
    const computeReveal = () => {
      if (!isVisibleRef.current) return;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const startPx = vh * (startOffsetRef.current / 100);
      const endPx = vh * (endOffsetRef.current / 100);
      const totalRange = rect.height + (startPx - endPx);
      const scrolled = startPx - rect.top;
      const progress = Math.min(Math.max(scrolled / totalRange, 0), 1);
      const total = segmentsRef.current.length;
      const litCount = Math.floor(progress * total);
      segmentsRef.current.forEach((seg, i) => {
        if (i < litCount) {
          seg.style.opacity = "1";
        } else if (i === litCount) {
          const frac = progress * total - litCount;
          seg.style.opacity = String(dimOpacityRef.current + frac * (1 - dimOpacityRef.current));
        } else {
          seg.style.opacity = String(dimOpacityRef.current);
        }
      });
    };
    const scheduleReveal = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeReveal);
    };
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
        if (isVisibleRef.current) scheduleReveal();
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 },
    );
    intersectionObserver.observe(root);
    scrollHandler = scheduleReveal;
    resizeHandler = scheduleReveal;
    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", resizeHandler, { passive: true });
    mutationObserver = new MutationObserver(() => {
      scheduleReveal();
    });
    mutationObserver.observe(root, { childList: true, subtree: true, characterData: true });
    scheduleReveal();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler);
      }
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      if (intersectionObserver) intersectionObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      segmentsRef.current = [];
    };
  }, [isClient, isCanvas, revealMode, textFingerprint]);
  if (!connectedText) {
    return /*#__PURE__*/ _jsxs("div", {
      style: {
        width: 400,
        minHeight: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        border: "2px dashed rgba(99,102,241,0.5)",
        borderRadius: 10,
        color: "rgba(99,102,241,1)",
        background: "rgba(99,102,241,0.08)",
        fontFamily: "Inter",
        textAlign: "center",
        padding: 12,
        gap: 16,
        lineHeight: "1.6em",
        ...style,
      },
      children: [
        /*#__PURE__*/ _jsx("div", {
          style: { fontSize: 24, fontWeight: "500" },
          children: "Connect a Text layer",
        }),
        /*#__PURE__*/ _jsx("div", {
          style: { fontSize: 16, maxWidth: 350 },
          children:
            "Drop a Text layer outside the desktop breakpoint, wrap the Text layer in a Stack, set the Text layer width to Fill, and connect this component with the outside Text layer.",
        }),
      ],
    });
  }
  return /*#__PURE__*/ _jsxs("div", {
    ref: rootRef,
    style: { position: "relative", width: "100%", height: "auto", ...style },
    children: [
      overrideFontSize &&
        /*#__PURE__*/ _jsx("style", {
          children: `
                    #${styleId},
                    #${styleId} * {
                        font-size: ${fontSize}px !important;
                    }
                `,
        }),
      /*#__PURE__*/ _jsx(
        "div",
        {
          id: styleId,
          ref: textRef,
          style: {
            width: "100%",
            height: "auto",
            fontSize: overrideFontSize ? fontSize : undefined,
          },
          children: connectedText,
        },
        `${revealMode}-${textFingerprint}`,
      ),
    ],
  });
}

TextRevealScroll.displayName = "TextRevealScroll";

export default TextRevealScroll;
