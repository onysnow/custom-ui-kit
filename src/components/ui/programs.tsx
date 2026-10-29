/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- ported from Framer's compiled output; public props are typed below, internals are not yet.
/* Created by Nur Mohammad From Rayso Studio */ import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import * as React from "react";
/* =========================================================
   DEFAULT CONTENT
========================================================= */ const defaultPrograms = [
  {
    title: "Smart Automation",
    description: "Automate repetitive tasks and keep your workflow running smoothly.",
    duration: "01",
    iconMode: "emoji",
    icon: "⚙️",
    iconImage: {},
  },
  {
    title: "Fast Performance",
    description: "Build fast, responsive experiences that feel smooth across every device.",
    duration: "02",
    iconMode: "emoji",
    icon: "⚡",
    iconImage: {},
  },
  {
    title: "Easy Integration",
    description: "Connect your favorite tools and bring your entire workflow together.",
    duration: "03",
    iconMode: "emoji",
    icon: "🔗",
    iconImage: {},
  },
  {
    title: "Real-time Analytics",
    description: "Track important metrics and understand how your product is performing.",
    duration: "04",
    iconMode: "emoji",
    icon: "📈",
    iconImage: {},
  },
  {
    title: "Team Collaboration",
    description: "Work together, share ideas, and keep projects moving forward.",
    duration: "05",
    iconMode: "emoji",
    icon: "👥",
    iconImage: {},
  },
  {
    title: "Reliable Workflow",
    description: "Create consistent processes that help your team work more efficiently.",
    duration: "06",
    iconMode: "emoji",
    icon: "🛡️",
    iconImage: {},
  },
];
const DEFAULT_PROPS = {
  programs: defaultPrograms,
  layout: { maxWidth: 1200, desktopColumns: 3, tabletColumns: 2, mobileColumns: 1, gap: 24 },
  spacing: {
    sectionPadding: "80px 20px",
    cardPadding: "30px",
    cardRadius: "16px",
    cardMinHeight: 0,
  },
  colors: {
    backgroundColor: "transparent",
    cardBackground: "linear-gradient(145deg, #1A1A1A 0%, #111111 100%)",
    cardTitleColor: "#FFFFFF",
    descriptionColor: "#CCCCCC",
    accentColor: "#FF3C3C",
  },
  border: { borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)" },
  hoverBorderColor: "rgba(255,60,60,0.28)",
  cardTitleFont: { fontSize: "21px", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.025em" },
  descriptionFont: { fontSize: "15px", fontWeight: 400, lineHeight: 1.7 },
  durationFont: { fontSize: "14px", fontWeight: 600, lineHeight: 1.4 },
  iconStyle: {
    showIcons: true,
    iconSize: 52,
    iconRadius: 14,
    iconBackground: "rgba(255,60,60,0.08)",
  },
  content: { showDuration: true },
  hover: {
    enableHover: true,
    enableShimmer: true,
    hoverLift: 8,
    hoverGlow: 20,
    hoverCardBackground: "linear-gradient(145deg, #202020 0%, #121212 100%)",
    hoverGlowColor: "rgba(59,130,246,0.18)",
    hoverShimmerGradient:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 30%, rgba(255,60,60,0.16) 50%, rgba(255,255,255,0.02) 70%, transparent 100%)",
  },
  entrance: {
    enableEntrance: false,
    entranceDistance: 12,
    entranceDuration: 0.6,
    entranceStagger: 0.06,
  },
  accessibility: { reducedMotion: false },
};

/** Fills in missing fields of each settings group, one level deep. */
function mergeProps(raw) {
  const merged = { ...DEFAULT_PROPS };
  for (const key of Object.keys(DEFAULT_PROPS)) {
    const value = raw?.[key];
    if (value === undefined || value === null) continue;
    const base = DEFAULT_PROPS[key];
    merged[key] =
      base && typeof base === "object" && !Array.isArray(base) ? { ...base, ...value } : value;
  }
  return merged;
}

export interface ProgramsItem {
  title?: string;
  description?: string;
  /** Short label shown on the card, e.g. "01". */
  duration?: string;
  iconMode?: "emoji" | "image" | "none";
  icon?: string;
  iconImage?: { src?: string; srcSet?: string; alt?: string };
}

export interface ProgramsProps {
  programs?: ProgramsItem[];
  layout?: {
    maxWidth?: number;
    desktopColumns?: number;
    tabletColumns?: number;
    mobileColumns?: number;
    gap?: number;
  };
  spacing?: {
    sectionPadding?: string;
    cardPadding?: string;
    cardRadius?: string;
    cardMinHeight?: number;
  };
  colors?: {
    backgroundColor?: string;
    /** Any CSS background value, including gradients. */
    cardBackground?: string;
    cardTitleColor?: string;
    descriptionColor?: string;
    accentColor?: string;
  };
  border?: { borderWidth?: number | string; borderStyle?: string; borderColor?: string };
  hoverBorderColor?: string;
  cardTitleFont?: React.CSSProperties;
  descriptionFont?: React.CSSProperties;
  durationFont?: React.CSSProperties;
  iconStyle?: {
    showIcons?: boolean;
    iconSize?: number;
    iconRadius?: number;
    iconBackground?: string;
  };
  content?: { showDuration?: boolean };
  hover?: {
    enableHover?: boolean;
    enableShimmer?: boolean;
    hoverLift?: number;
    hoverGlow?: number;
    hoverCardBackground?: string;
    hoverGlowColor?: string;
    hoverShimmerGradient?: string;
  };
  entrance?: {
    enableEntrance?: boolean;
    entranceDistance?: number;
    entranceDuration?: number;
    entranceStagger?: number;
  };
  accessibility?: { reducedMotion?: boolean };
}

/* =========================================================
   HELPERS
========================================================= */ function getColumns(
  width,
  desktop,
  tablet,
  mobile,
) {
  if (width >= 900) return Math.max(1, desktop);
  if (width >= 600) return Math.max(1, tablet);
  return Math.max(1, mobile);
}
/* =========================================================
   MAIN COMPONENT
========================================================= */
export function Programs(rawProps: ProgramsProps) {
  const props = mergeProps(rawProps);
  const {
    programs = defaultPrograms,
    layout,
    spacing,
    colors,
    border,
    hoverBorderColor,
    cardTitleFont,
    descriptionFont,
    durationFont,
    iconStyle,
    content,
    hover,
    entrance,
    accessibility,
  } = props;
  const { maxWidth, desktopColumns, tabletColumns, mobileColumns, gap } = layout;
  const { sectionPadding, cardPadding, cardRadius, cardMinHeight } = spacing;
  const { backgroundColor, cardBackground, cardTitleColor, descriptionColor, accentColor } = colors;
  const cardBorder = border;
  const { showIcons, iconSize, iconRadius, iconBackground } = iconStyle;
  const { showDuration } = content;
  const {
    enableHover,
    enableShimmer,
    hoverLift,
    hoverGlow,
    hoverCardBackground,
    hoverGlowColor,
    hoverShimmerGradient,
  } = hover;
  const { enableEntrance, entranceDistance, entranceDuration, entranceStagger } = entrance;
  const { reducedMotion } = accessibility;
  /* True on the Framer canvas and during static export */ const isStatic = false;
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(1200);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  /* -----------------------------------------------------
       Container resize detection
    ----------------------------------------------------- */ React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const updateSize = () => {
      setContainerWidth(element.getBoundingClientRect().width);
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  /* -----------------------------------------------------
       System reduced-motion detection
    ----------------------------------------------------- */ React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => {
      mediaQuery.removeEventListener?.("change", update);
    };
  }, []);
  /* Static renderer: no animations or effects, plain styled cards only */ const motionDisabled =
    isStatic || reducedMotion || prefersReducedMotion;
  const columns = getColumns(containerWidth, desktopColumns, tabletColumns, mobileColumns);
  return /*#__PURE__*/ _jsx("section", {
    style: { ...styles.section, backgroundColor, padding: sectionPadding },
    children: /*#__PURE__*/ _jsx("div", {
      ref: containerRef,
      style: { ...styles.container, maxWidth },
      children: /*#__PURE__*/ _jsx("div", {
        style: { ...styles.grid, gap, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
        children: programs.map((program, index) =>
          /*#__PURE__*/ _jsx(
            ProgramCard,
            {
              program: program,
              index: index,
              cardPadding: cardPadding,
              cardRadius: cardRadius,
              cardMinHeight: cardMinHeight,
              cardBackground: cardBackground,
              cardBorder: cardBorder,
              cardTitleColor: cardTitleColor,
              descriptionColor: descriptionColor,
              accentColor: accentColor,
              cardTitleFont: cardTitleFont,
              descriptionFont: descriptionFont,
              durationFont: durationFont,
              showIcons: showIcons,
              showDuration: showDuration,
              iconSize: iconSize,
              iconRadius: iconRadius,
              iconBackground: iconBackground,
              enableHover: enableHover,
              enableShimmer: enableShimmer,
              hoverLift: hoverLift,
              hoverGlow: hoverGlow,
              hoverCardBackground: hoverCardBackground,
              hoverGlowColor: hoverGlowColor,
              hoverShimmerGradient: hoverShimmerGradient,
              hoverBorderColor: hoverBorderColor,
              enableEntrance: enableEntrance,
              entranceDistance: entranceDistance,
              entranceDuration: entranceDuration,
              entranceStagger: entranceStagger,
              motionDisabled: motionDisabled,
            },
            `${program.title}-${index}`,
          ),
        ),
      }),
    }),
  });
}
/* =========================================================
   PROGRAM CARD
========================================================= */ function ProgramCard({
  program,
  index,
  cardPadding,
  cardRadius,
  cardMinHeight,
  cardBackground,
  cardBorder,
  cardTitleColor,
  descriptionColor,
  accentColor,
  cardTitleFont,
  descriptionFont,
  durationFont,
  showIcons,
  showDuration,
  iconSize,
  iconRadius,
  iconBackground,
  enableHover,
  enableShimmer,
  hoverLift,
  hoverGlow,
  hoverCardBackground,
  hoverGlowColor,
  hoverShimmerGradient,
  hoverBorderColor,
  enableEntrance,
  entranceDistance,
  entranceDuration,
  entranceStagger,
  motionDisabled,
}) {
  const [hovered, setHovered] = React.useState(false);
  const [entered, setEntered] = React.useState(!enableEntrance);
  React.useEffect(() => {
    if (!enableEntrance || motionDisabled) {
      setEntered(true);
      return;
    }
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [enableEntrance, motionDisabled]);
  const canAnimate = !motionDisabled;
  const interactive = enableHover && canAnimate;
  const shouldLift = interactive && hovered;
  const entranceDelay = index * entranceStagger;
  const cardStyle = {
    ...styles.card,
    padding: cardPadding,
    borderRadius: cardRadius,
    minHeight: cardMinHeight > 0 ? cardMinHeight : undefined,
    background: shouldLift ? hoverCardBackground : cardBackground,
    borderWidth: cardBorder.borderWidth,
    borderStyle: cardBorder.borderStyle,
    borderColor: shouldLift ? hoverBorderColor : cardBorder.borderColor,
    transform: shouldLift
      ? `translateY(-${hoverLift}px)`
      : enableEntrance && canAnimate && !entered
        ? `translateY(${entranceDistance}px)`
        : "translateY(0)",
    boxShadow: shouldLift ? `0 0 ${hoverGlow}px ${hoverGlowColor}` : "0 0 0 rgba(0,0,0,0)",
    transition: canAnimate
      ? `
                transform ${entranceDuration}s cubic-bezier(0.22,1,0.36,1),
                box-shadow 400ms ease,
                background 400ms ease,
                border-color 400ms ease
            `
      : "none",
    transitionDelay: enableEntrance && canAnimate ? `${entranceDelay}s` : "0s",
    cursor: "default",
  };
  const cardContent = /*#__PURE__*/ _jsxs(_Fragment, {
    children: [
      enableShimmer &&
        canAnimate &&
        /*#__PURE__*/ _jsx("span", {
          "aria-hidden": "true",
          style: {
            ...styles.shimmer,
            background: hoverShimmerGradient,
            opacity: hovered ? 1 : 0,
            transform: hovered
              ? "translateX(220%) skewX(-18deg)"
              : "translateX(-120%) skewX(-18deg)",
          },
        }),
      /*#__PURE__*/ _jsxs("div", {
        style: styles.cardContent,
        children: [
          showIcons &&
            program.iconMode !== "none" &&
            /*#__PURE__*/ _jsx("div", {
              "aria-hidden": "true",
              style: {
                ...styles.icon,
                width: iconSize,
                height: iconSize,
                borderRadius: iconRadius,
                background: iconBackground,
                color: accentColor,
              },
              children:
                program.iconMode === "image" && program.iconImage?.src
                  ? /*#__PURE__*/ _jsx("img", {
                      src: program.iconImage.src,
                      srcSet: program.iconImage.srcSet,
                      alt: "",
                      style: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                        display: "block",
                      },
                    })
                  : /*#__PURE__*/ _jsx("span", {
                      style: { fontSize: Math.max(18, iconSize * 0.48), lineHeight: 1 },
                      children: program.icon,
                    }),
            }),
          program.title &&
            /*#__PURE__*/ _jsx("h3", {
              style: { ...styles.cardTitle, ...cardTitleFont, color: cardTitleColor },
              children: program.title,
            }),
          program.description &&
            /*#__PURE__*/ _jsx("p", {
              style: { ...styles.cardDescription, ...descriptionFont, color: descriptionColor },
              children: program.description,
            }),
          showDuration &&
            program.duration &&
            /*#__PURE__*/ _jsx("span", {
              style: { ...styles.duration, ...durationFont, color: accentColor },
              children: program.duration,
            }),
        ],
      }),
    ],
  });
  /* ---------------------------------------------------------
       NON-LINKED CARD
    --------------------------------------------------------- */ return /*#__PURE__*/ _jsx(
    "article",
    {
      style: cardStyle,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      children: cardContent,
    },
  );
}
/* =========================================================
   STYLES
========================================================= */ const styles = {
  section: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
    color: "#FFFFFF",
  },
  container: { width: "100%", margin: "0 auto", boxSizing: "border-box" },
  grid: { width: "100%", display: "grid", alignItems: "stretch", boxSizing: "border-box" },
  card: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
    isolation: "isolate",
  },
  cardContent: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: 22,
    overflow: "hidden",
    boxSizing: "border-box",
  },
  cardTitle: { width: "100%", margin: 0, letterSpacing: "-0.025em" },
  cardDescription: { width: "100%", margin: "12px 0 20px" },
  duration: { display: "inline-block", marginTop: "auto", fontWeight: 600 },
  shimmer: {
    position: "absolute",
    top: "-20%",
    left: "-20%",
    width: "45%",
    height: "140%",
    zIndex: 1,
    pointerEvents: "none",
    transform: "translateX(-120%) skewX(-18deg)",
    transition: "transform 900ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease",
  },
};
/* =========================================================
   DEFAULT PROPS
========================================================= */ Programs.defaultProps = {
  programs: defaultPrograms,
  layout: { maxWidth: 1200, desktopColumns: 3, tabletColumns: 2, mobileColumns: 1, gap: 24 },
  spacing: {
    /* Matches the property control default below */ sectionPadding: "80px 20px",
    cardPadding: "30px",
    cardRadius: "16px",
    cardMinHeight: 0,
  },
  colors: {
    backgroundColor: "transparent",
    cardBackground: "linear-gradient(145deg, #1A1A1A 0%, #111111 100%)",
    cardTitleColor: "#FFFFFF",
    descriptionColor: "#CCCCCC",
    accentColor: "#FF3C3C",
  },
  border: { borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)" },
  hoverBorderColor: "rgba(255,60,60,0.28)",
  cardTitleFont: { fontSize: "21px", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.025em" },
  descriptionFont: { fontSize: "15px", fontWeight: 400, lineHeight: 1.7 },
  durationFont: { fontSize: "14px", fontWeight: 600, lineHeight: 1.4 },
  iconStyle: {
    showIcons: true,
    iconSize: 52,
    iconRadius: 14,
    iconBackground: "rgba(255,60,60,0.08)",
  },
  content: { showDuration: true },
  hover: {
    enableHover: true,
    enableShimmer: true,
    hoverLift: 8,
    hoverGlow: 20,
    hoverCardBackground: "linear-gradient(145deg, #202020 0%, #121212 100%)",
    hoverGlowColor: "rgba(59,130,246,0.18)",
    hoverShimmerGradient:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 30%, rgba(255,60,60,0.16) 50%, rgba(255,255,255,0.02) 70%, transparent 100%)",
  },
  entrance: {
    enableEntrance: false,
    entranceDistance: 12,
    entranceDuration: 0.6,
    entranceStagger: 0.06,
  },
  accessibility: { reducedMotion: false },
};

Programs.displayName = "Programs";

export default Programs;
