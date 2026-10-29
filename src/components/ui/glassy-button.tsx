import { motion, useReducedMotion, type MotionStyle } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/** Sample click sound shipped with the original design. */
const DEFAULT_SOUND_URL = "https://framerusercontent.com/assets/QftwjMR4j8LTgXvov8IGLNVxLS4.mp3";

/** [x, y, blur, spread, alpha] */
type ShadowLayer = [number, number, number, number, number];

const shadow = (layers: ShadowLayer[]) =>
  layers
    .map(
      ([x, y, blur, spread, alpha]) =>
        `${x}px ${y}px ${blur}px ${spread}px rgba(0, 0, 0, ${alpha})`,
    )
    .join(", ");

/** Three white highlight layers that stay transparent in every state but must exist to interpolate. */
const HIGHLIGHT =
  "0.12px 0.241px 0px 0px rgba(255, 255, 255, 0), 0.458px 0.915px 0px 0px rgba(255, 255, 255, 0), 2px 4px 0px 0px rgba(255, 255, 255, 0)";

/** Soft stacked drop shadow under the button; it tightens when hovered and collapses when pressed. */
const SHADOW_REST = `${shadow([
  [0.067, 1.008, 0.505, 0, 0],
  [0.159, 2.389, 1.197, 0, 0],
  [0.29, 4.357, 2.183, 0, 0.01],
  [0.483, 7.244, 3.63, 0, 0.01],
  [0.78, 11.698, 5.862, 0, 0.02],
  [1.277, 19.148, 9.595, 0, 0.03],
  [2.198, 32.972, 16.522, 0, 0.05],
  [4, 60, 30.067, 0, 0.1],
])}, ${HIGHLIGHT}`;

const SHADOW_HOVER = `${shadow([
  [0.067, 1.008, 0.505, 0, 0],
  [0.159, 2.389, 1.197, 0, 0],
  [0.29, 4.357, 2.183, 0, 0.01],
  [0.483, 7.244, 3.63, 0, 0.01],
  [0.78, 11.698, 5.862, 0, 0.01],
  [1.277, 19.148, 9.595, 0, 0.02],
  [2.198, 32.972, 16.522, 0, 0.04],
  [4, 60, 30.067, 0, 0.07],
])}, ${HIGHLIGHT}`;

const SHADOW_PRESSED = `${shadow([
  [0.067, 1.008, 0.404, -0.375, 0.03],
  [0.159, 2.389, 0.958, -0.75, 0.03],
  [0.29, 4.357, 1.747, -1.125, 0.03],
  [0.483, 7.244, 2.904, -1.5, 0.03],
  [0.78, 11.698, 4.689, -1.875, 0.03],
  [1.277, 19.148, 7.676, -2.25, 0.03],
  [2.198, 32.972, 13.218, -2.625, 0.02],
  [4, 60, 24.053, -3, 0.02],
])}, ${HIGHLIGHT}`;

/** Disabled: no drop shadow, a thin white edge instead. */
const SHADOW_DISABLED =
  "0 0 0 0 transparent, 0.121px 0.241px 0px 0px rgba(255, 255, 255, 0.08), 1px 2px 0px 0px rgba(255, 255, 255, 0.7)";

const OUTER_GRADIENT =
  "linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(201, 201, 201) 8.995%, rgb(161, 161, 161) 31.88%, rgb(117, 117, 117) 73%, rgb(255, 255, 255) 100%)";
const CONTENT_GRADIENT =
  "linear-gradient(150deg, rgb(208, 208, 208) 0%, rgb(204, 204, 204) 50.172%, rgb(200, 200, 200) 100%)";
const CONTENT_GRADIENT_LIT =
  "linear-gradient(150deg, rgb(208, 208, 208) 0%, rgb(232, 232, 232) 50.172%, rgb(200, 200, 200) 100%)";
const CONTENT_INSET_REST =
  "inset 2px 4px 5px 0px rgba(0, 0, 0, 0), inset 0px 0px 1px 1px rgba(0, 0, 0, 0)";

export interface GlassyIconProps {
  stroke: string;
  strokeWidth: number;
  className?: string;
  style?: React.CSSProperties;
}

/** The "Home" glyph of the original icon set: 24x24 grid, round caps and joins, outline only. */
export function HomeIcon({ stroke, strokeWidth, className, style }: GlassyIconProps) {
  const common = {
    fill: "none",
    stroke,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={style}>
      <path
        {...common}
        transform="translate(4.75 4.75)"
        d="M 2 14.5 L 12.5 14.5 C 13.605 14.5 14.5 13.605 14.5 12.5 L 14.5 5 L 7.25 0 L 0 5 L 0 12.5 C 0 13.605 0.895 14.5 2 14.5 Z"
      />
      <path
        {...common}
        transform="translate(9.75 13.749)"
        d="M 0 2 C 0 0.895 0.895 0 2 0 L 2.5 0 C 3.605 0 4.5 0.895 4.5 2 L 4.5 5.5 L 0 5.5 Z"
      />
    </svg>
  );
}

export interface GlassyButtonProps extends Omit<
  React.ComponentProps<"button">,
  | "color"
  | "onAnimationStart"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
> {
  /** Icon component drawn twice: once in `color`, once as a white embossed highlight. */
  icon?: React.ComponentType<GlassyIconProps>;
  /** Icon stroke colour. */
  color?: string;
  /** Icon stroke width in the icon's 24px grid. */
  strokeWidth?: number;
  /** The flat, greyed-out state. */
  disabled?: boolean;
  /** Play a click sound on press (browsers allow this because a press is a user gesture). */
  playSound?: boolean;
  /** Audio file played on press. */
  soundUrl?: string;
  /** Playback volume, 0 to 100. */
  soundVolume?: number;
  /** Where in the clip playback starts, in milliseconds. */
  soundStartAt?: number;
}

/** Plays `url` from the start on every call to the returned function. */
function useClickSound(url: string, volume: number, startAtMs: number, enabled: boolean) {
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled || !url) return;
    audio.current = new Audio(url);
    audio.current.preload = "auto";
    return () => {
      audio.current?.pause();
      audio.current = null;
    };
  }, [enabled, url]);

  return useCallback(() => {
    const element = audio.current;
    if (!enabled || !element) return;
    element.pause();
    element.currentTime = startAtMs / 1000;
    element.volume = Math.min(1, Math.max(0, volume / 100));
    // A rejected play() (autoplay policy, missing file) must never break the button.
    void element.play().catch(() => undefined);
  }, [enabled, startAtMs, volume]);
}

/**
 * Glassy button: a chrome-rimmed glass tile with an embossed icon. Hover lifts a highlight across
 * the face and shortens the drop shadow; press sinks the tile and dims the icon.
 */
export function GlassyButton({
  icon: Icon = HomeIcon,
  color = "rgb(0, 0, 0)",
  strokeWidth = 1.5,
  disabled = false,
  playSound = true,
  soundUrl = DEFAULT_SOUND_URL,
  soundVolume = 100,
  soundStartAt = 0,
  className,
  style,
  onPointerDown,
  "aria-label": ariaLabel = "Home",
  ...props
}: GlassyButtonProps) {
  const reduceMotion = useReducedMotion();
  const click = useClickSound(soundUrl, soundVolume, soundStartAt, playSound && !disabled);
  const transition = reduceMotion
    ? { duration: 0 }
    : ({ type: "spring", duration: 0.4, bounce: 0.1 } as const);

  return (
    <motion.button
      {...props}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "relative flex shrink-0 flex-col items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
        disabled ? "cursor-default" : "cursor-pointer",
        className,
      )}
      style={{
        width: 149,
        height: 146,
        gap: 8,
        padding: disabled ? 0 : 3,
        borderRadius: 40,
        background: disabled ? "rgb(207, 207, 207)" : OUTER_GRADIENT,
        boxShadow: disabled ? SHADOW_DISABLED : SHADOW_REST,
        ...(style as MotionStyle),
      }}
      initial={false}
      {...(disabled ? {} : { animate: "rest", whileHover: "hover", whileTap: "pressed" })}
      variants={{
        rest: { boxShadow: SHADOW_REST },
        hover: { boxShadow: SHADOW_HOVER },
        pressed: { boxShadow: SHADOW_PRESSED },
      }}
      transition={transition}
      onPointerDown={(event) => {
        click();
        onPointerDown?.(event);
      }}
    >
      <motion.span
        className="relative flex w-full flex-1 items-center justify-center overflow-hidden"
        style={{
          borderRadius: disabled ? 40 : 37,
          background: disabled
            ? "linear-gradient(180deg, rgb(200, 200, 200) 0%, rgb(208, 208, 208) 100%)"
            : CONTENT_GRADIENT,
          boxShadow: disabled
            ? "inset 3px 3px 3px 0px rgba(0, 0, 0, 0.16), inset 0px 0px 1px 2px rgba(0, 0, 0, 0.08), inset 1px 1px 0px 0px rgba(0, 0, 0, 0.1)"
            : CONTENT_INSET_REST,
        }}
        variants={{
          rest: { background: CONTENT_GRADIENT },
          hover: { background: CONTENT_GRADIENT_LIT },
          pressed: { background: CONTENT_GRADIENT_LIT },
        }}
      >
        {/* 68px slot; the 96px icons overflow it by 14px on every side, as in the original. */}
        <span className="relative block" style={{ width: 68, height: 68 }}>
          <motion.span
            className="absolute"
            style={{
              left: -14,
              top: -14,
              width: 96,
              height: 96,
              zIndex: 1,
              opacity: disabled ? 0.4 : 1,
            }}
            variants={{ rest: { opacity: 1 }, hover: { opacity: 1 }, pressed: { opacity: 0.8 } }}
          >
            <Icon
              stroke={color}
              strokeWidth={strokeWidth}
              style={{ display: "block", width: 96, height: 96 }}
            />
          </motion.span>
          {/* White emboss copy, nudged 2px right and 3px down of centre. */}
          <span
            className="absolute"
            style={{
              left: "53%",
              top: "54%",
              width: 96,
              height: 96,
              transform: "translate(-50%, -50%)",
              opacity: disabled ? 0 : 0.4,
            }}
          >
            <Icon
              stroke="rgb(255, 255, 255)"
              strokeWidth={strokeWidth}
              style={{ display: "block", width: 96, height: 96 }}
            />
          </span>
        </span>
      </motion.span>
    </motion.button>
  );
}

export default GlassyButton;
