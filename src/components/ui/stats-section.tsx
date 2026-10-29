/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
import * as React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function measureText(text, fontSize, fontWeight, fontFamily) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}
function AnimatedNumber({
  end,
  duration,
  prefix,
  suffix,
  decimals,
  separator,
  shouldStart,
  font,
  numberColor,
}) {
  const [display, setDisplay] = useState("0");
  const raf = useRef(null);
  useEffect(() => {
    if (!shouldStart) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1e3), 1);
      const eased = easeOutExpo(progress);
      const current = eased * end;
      const formatted = separator
        ? current.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : current.toFixed(decimals);
      setDisplay(formatted);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [shouldStart, end, duration, decimals, separator]);
  return /*#__PURE__*/ _jsxs("span", {
    style: {
      fontVariantNumeric: "tabular-nums",
      fontSize: font?.fontSize ?? 48,
      fontWeight: font?.fontWeight ?? 700,
      fontFamily: font?.fontFamily ?? "Inter",
      fontStyle: font?.fontStyle ?? "normal",
      color: numberColor,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      whiteSpace: "nowrap",
    },
    children: [prefix, display, suffix],
  });
}
function StatItem({
  value,
  label,
  prefix,
  suffix,
  decimals,
  separator,
  duration,
  shouldStart,
  font,
  numberColor,
  labelFont,
  labelColor,
  labelTextTransform,
  gap,
}) {
  return /*#__PURE__*/ _jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap, alignItems: "center" },
    children: [
      /*#__PURE__*/ _jsx(AnimatedNumber, {
        end: value,
        duration: duration,
        prefix: prefix,
        suffix: suffix,
        decimals: decimals,
        separator: separator,
        shouldStart: shouldStart,
        font: font,
        numberColor: numberColor,
      }),
      /*#__PURE__*/ _jsx("span", {
        style: {
          fontSize: labelFont?.fontSize ?? 14,
          fontWeight: labelFont?.fontWeight ?? 400,
          fontFamily: labelFont?.fontFamily ?? "Inter",
          fontStyle: labelFont?.fontStyle ?? "normal",
          color: labelColor,
          lineHeight: 1.4,
          textAlign: "center",
          textTransform: labelTextTransform,
        },
        children: label,
      }),
    ],
  });
}
const DEFAULT_PROPS = {
  duration: 2,
  triggerOnView: true,
  separator: true,
  numberColor: "#000000",
  labelColor: "#888888",
  labelTextTransform: "none",
  itemGap: 8,
  columnGap: 32,
  rowGap: 32,
  minItemWidth: 140,
  divider: false,
  dividerColor: "#E5E5E5",
  paddingTop: 40,
  background: "transparent",
  borderRadius: 0,
  font: { fontSize: 48, fontWeight: 700, fontFamily: "Inter" },
  labelFont: { fontSize: 14, fontWeight: 400, fontFamily: "Inter" },
  stats: [
    { value: 1e4, label: "Happy Customers", prefix: "", suffix: "+", decimals: 0 },
    { value: 99.9, label: "Uptime SLA", prefix: "", suffix: "%", decimals: 1 },
    { value: 500, label: "Projects Shipped", prefix: "", suffix: "+", decimals: 0 },
    { value: 4.9, label: "Average Rating", prefix: "★ ", suffix: "", decimals: 1 },
  ],
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

export interface StatsSectionProps {
  stats?: { value?: number; label?: string; prefix?: string; suffix?: string; decimals?: number }[];
  duration?: number;
  triggerOnView?: boolean;
  separator?: boolean;
  font?: React.CSSProperties;
  numberColor?: string;
  labelFont?: React.CSSProperties;
  labelColor?: string;
  labelTextTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  itemGap?: number;
  columnGap?: number;
  rowGap?: number;
  minItemWidth?: number;
  divider?: boolean;
  dividerColor?: string;
  paddingTop?: unknown;
  background?: string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
function StatsSectionImpl({
  stats,
  duration,
  separator,
  triggerOnView,
  font,
  numberColor,
  labelFont,
  labelColor,
  labelTextTransform,
  itemGap,
  columnGap,
  rowGap,
  minItemWidth,
  divider,
  dividerColor,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  background,
  borderRadius,
}) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [cellWidth, setCellWidth] = useState(minItemWidth);
  const fontSize = font?.fontSize ?? 48;
  const fontWeight = font?.fontWeight ?? 700;
  const fontFamily = font?.fontFamily ?? "Inter";
  useEffect(() => {
    const calculate = () => {
      const max = Math.max(
        minItemWidth,
        ...stats.map((stat) => {
          const finalNumber = separator
            ? stat.value.toLocaleString("en-US", {
                minimumFractionDigits: stat.decimals ?? 0,
                maximumFractionDigits: stat.decimals ?? 0,
              })
            : Number(stat.value).toFixed(stat.decimals ?? 0);
          const fullText = `${stat.prefix ?? ""}${finalNumber}${stat.suffix ?? ""}`;
          return Math.ceil(measureText(fullText, fontSize, fontWeight, fontFamily)) + 24;
        }),
      );
      setCellWidth(max);
    };
    document.fonts.ready.then(calculate);
  }, [stats, fontSize, fontWeight, fontFamily, separator, minItemWidth]);
  useEffect(() => {
    if (!triggerOnView) {
      setStarted(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerOnView]);
  return /*#__PURE__*/ _jsx("div", {
    ref: ref,
    style: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      columnGap,
      rowGap,
      width: "100%",
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      background,
      borderRadius,
      boxSizing: "border-box",
    },
    children: stats.map((stat, i) =>
      /*#__PURE__*/ _jsxs(
        "div",
        {
          style: {
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: cellWidth,
            flexShrink: 0,
          },
          children: [
            divider &&
              i > 0 &&
              /*#__PURE__*/ _jsx("div", {
                style: {
                  position: "absolute",
                  left: 0,
                  top: "15%",
                  height: "70%",
                  width: 1,
                  background: dividerColor,
                },
              }),
            /*#__PURE__*/ _jsx(StatItem, {
              value: stat.value,
              label: stat.label,
              prefix: stat.prefix ?? "",
              suffix: stat.suffix ?? "",
              decimals: stat.decimals ?? 0,
              separator: separator,
              duration: duration,
              shouldStart: started,
              font: font,
              numberColor: numberColor,
              labelFont: labelFont,
              labelColor: labelColor,
              labelTextTransform: labelTextTransform,
              gap: itemGap,
            }),
          ],
        },
        i,
      ),
    ),
  });
}
StatsSection.defaultProps = {
  duration: 2,
  separator: true,
  triggerOnView: true,
  font: { fontSize: 48, fontWeight: 700, fontFamily: "Inter" },
  numberColor: "#000000",
  labelFont: { fontSize: 14, fontWeight: 400, fontFamily: "Inter" },
  labelColor: "#888888",
  labelTextTransform: "none",
  itemGap: 8,
  columnGap: 32,
  rowGap: 32,
  minItemWidth: 140,
  divider: false,
  dividerColor: "#E5E5E5",
  paddingTop: 40,
  paddingRight: 48,
  paddingBottom: 40,
  paddingLeft: 48,
  background: "transparent",
  borderRadius: 0,
  stats: [
    { value: 1e4, label: "Happy Customers", prefix: "", suffix: "+", decimals: 0 },
    { value: 99.9, label: "Uptime SLA", prefix: "", suffix: "%", decimals: 1 },
    { value: 500, label: "Projects Shipped", prefix: "", suffix: "+", decimals: 0 },
    { value: 4.9, label: "Average Rating", prefix: "★ ", suffix: "", decimals: 1 },
  ],
};

export function StatsSection(props: StatsSectionProps) {
  return _jsx(StatsSectionImpl, mergeProps(props));
}

StatsSection.displayName = "StatsSection";

export default StatsSection;
