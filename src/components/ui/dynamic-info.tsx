import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

/** Spring used by every size, padding, radius and opacity change in the original. */
const SPRING = { type: "spring", duration: 0.8, bounce: 0.4 } as const;

/** Original fonts: Inter Variable (opsz 32, wght 500) for text, Inter Display 500 for the clock. */
const TEXT_FONT = '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif';
const CLOCK_FONT = '"Inter Display", Inter, ui-sans-serif, system-ui, sans-serif';

/* -------------------------------------------------------------------------------------------------
 * Live clock
 * -----------------------------------------------------------------------------------------------*/

export interface LiveClockProps extends Omit<React.ComponentProps<"time">, "children"> {
  /** "time" shows the time of day, "date" the calendar date. */
  outputType?: "time" | "date";
  /** 12 or 24 hour clock (time output). */
  timeFormat?: "12h" | "24h";
  showMinutes?: boolean;
  /** Needs `showMinutes`. */
  showSeconds?: boolean;
  /** Date output parts. */
  showWeekday?: boolean;
  showMonth?: boolean;
  showYear?: boolean;
  monthFormat?: "short" | "long" | "numeric";
  /** BCP 47 locale; the browser's language when omitted. */
  locale?: string | undefined;
  /** IANA time zone; the viewer's when omitted. */
  timeZone?: string | undefined;
  /** Equal-width digits so the clock does not jitter as it ticks. */
  tabular?: boolean;
}

function buildFormatter({
  outputType,
  timeFormat,
  showMinutes,
  showSeconds,
  showWeekday,
  showMonth,
  showYear,
  monthFormat,
  locale,
  timeZone,
}: Required<
  Pick<
    LiveClockProps,
    | "outputType"
    | "timeFormat"
    | "showMinutes"
    | "showSeconds"
    | "showWeekday"
    | "showMonth"
    | "showYear"
    | "monthFormat"
  >
> &
  Pick<LiveClockProps, "locale" | "timeZone">) {
  if (outputType === "date") {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: showWeekday ? "long" : undefined,
      // A lone year ("2026") should not grow a day-of-month.
      day: !showWeekday && !showMonth && showYear ? undefined : "numeric",
      month: showMonth ? monthFormat : undefined,
      year: showYear ? "numeric" : undefined,
    });
  }
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: showMinutes ? "numeric" : undefined,
    second: showSeconds && showMinutes ? "numeric" : undefined,
    hour12: timeFormat === "12h",
  });
}

/**
 * Live time or date, formatted with `Intl.DateTimeFormat`. Re-renders only when the visible text can
 * change: on the next second boundary with seconds shown, otherwise on the next minute boundary.
 */
export function LiveClock({
  outputType = "time",
  timeFormat = "12h",
  showMinutes = true,
  showSeconds = false,
  showWeekday = true,
  showMonth = true,
  showYear = true,
  monthFormat = "long",
  locale,
  timeZone,
  tabular = true,
  className,
  style,
  ...props
}: LiveClockProps) {
  const [now, setNow] = useState(() => new Date());
  // Real time only exists in the browser; keep the first paint hidden so SSR and hydration agree.
  const [mounted, setMounted] = useState(false);

  const formatter = useMemo(
    () =>
      buildFormatter({
        outputType,
        timeFormat,
        showMinutes,
        showSeconds,
        showWeekday,
        showMonth,
        showYear,
        monthFormat,
        locale,
        timeZone,
      }),
    [
      outputType,
      timeFormat,
      showMinutes,
      showSeconds,
      showWeekday,
      showMonth,
      showYear,
      monthFormat,
      locale,
      timeZone,
    ],
  );

  const tickEveryMinute = outputType === "date" || !(showSeconds && showMinutes);

  useEffect(() => {
    setMounted(true);
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = new Date();
      setNow(current);
      const boundary = new Date(current);
      if (tickEveryMinute) boundary.setSeconds(60, 0);
      else boundary.setSeconds(current.getSeconds() + 1, 0);
      timer = setTimeout(tick, boundary.getTime() - current.getTime());
    };
    tick();
    return () => clearTimeout(timer);
  }, [tickEveryMinute]);

  return (
    <time
      {...props}
      dateTime={now.toISOString()}
      suppressHydrationWarning
      className={cn("m-0 whitespace-nowrap p-0", className)}
      style={{
        fontVariantNumeric: tabular ? "tabular-nums" : "normal",
        visibility: mounted ? "visible" : "hidden",
        ...style,
      }}
    >
      {formatter.format(now)}
    </time>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Icons (24px grid, 1.5 stroke, round caps) and social links
 * -----------------------------------------------------------------------------------------------*/

export interface SocialIconProps {
  color: string;
  strokeWidth?: number;
}

function IconFrame({
  color,
  strokeWidth = 1.5,
  children,
}: SocialIconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="block"
      width={14}
      height={14}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function XLogo(props: SocialIconProps) {
  return (
    <IconFrame {...props}>
      <path transform="translate(4.5 3.75)" d="M 0 0 L 4.5 0 L 15 16.5 L 10.5 16.5 Z" />
      <path transform="translate(4.5 13.456)" d="M 6.176 0 L 0 6.794" />
      <path transform="translate(13.324 3.75)" d="M 6.176 0 L 0 6.794" />
    </IconFrame>
  );
}

export function LinkedinLogo(props: SocialIconProps) {
  return (
    <IconFrame {...props}>
      <path
        transform="translate(3 3)"
        d="M 0.75 18 C 0.336 18 0 17.664 0 17.25 L 0 0.75 C 0 0.336 0.336 0 0.75 0 L 17.25 0 C 17.664 0 18 0.336 18 0.75 L 18 17.25 C 18 17.664 17.664 18 17.25 18 Z"
      />
      <path transform="translate(11.25 10.5)" d="M 0 0 L 0 6" />
      <path transform="translate(8.25 10.5)" d="M 0 0 L 0 6" />
      <path
        transform="translate(11.25 10.5)"
        d="M 0 2.625 C 0 1.175 1.175 0 2.625 0 C 4.075 0 5.25 1.175 5.25 2.625 L 5.25 6"
      />
      {/* The i-dot is a filled circle. */}
      <circle cx="8.25" cy="7.875" r="1.125" fill={props.color} stroke="none" />
    </IconFrame>
  );
}

export function GithubLogo(props: SocialIconProps) {
  return (
    <IconFrame {...props}>
      <path
        transform="translate(6 3)"
        d="M 5.234 2.25 C 4.338 0.848 2.789 0 1.125 0 C 0.387 1.275 0.267 2.816 0.798 4.191 C 0.285 4.946 0.007 5.837 0 6.75 L 0 7.5 C 0 9.985 2.015 12 4.5 12 L 9 12 C 11.485 12 13.5 9.985 13.5 7.5 L 13.5 6.75 C 13.493 5.837 13.215 4.946 12.702 4.191 C 13.233 2.816 13.113 1.275 12.375 0 C 10.711 0 9.162 0.848 8.266 2.25 Z"
      />
      <path
        transform="translate(9.75 15)"
        d="M 0 6.75 L 0 3 C 0 1.343 1.343 0 3 0 L 3 0 C 4.657 0 6 1.343 6 3 L 6 6.75"
      />
      <path
        transform="translate(0.75 13.5)"
        d="M 9 6 L 6 6 C 4.343 6 3 4.657 3 3 C 3 1.343 1.657 0 0 0"
      />
    </IconFrame>
  );
}

export function FramerLogo(props: SocialIconProps) {
  return (
    <IconFrame {...props}>
      <path
        transform="translate(5.25 3.75)"
        d="M 0 6 L 0 12 L 6.75 18.75 L 6.75 12 L 13.5 12 L 0 0 L 13.5 0 L 13.5 6 Z"
      />
    </IconFrame>
  );
}

export interface SocialLinkItem {
  /** Destination; a bare domain such as "x.com" is treated as https. */
  href: string;
  /** Accessible name. */
  label: string;
  icon: React.ComponentType<SocialIconProps>;
}

const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  { href: "x.com", label: "X", icon: XLogo },
  { href: "linkedin.com", label: "LinkedIn", icon: LinkedinLogo },
  { href: "github.com", label: "GitHub", icon: GithubLogo },
  { href: "framer.com", label: "Framer", icon: FramerLogo },
];

const withProtocol = (href: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(href) ? href : `https://${href}`;

/* -------------------------------------------------------------------------------------------------
 * Availability badge
 * -----------------------------------------------------------------------------------------------*/

function AvailabilityBadge({ available }: { available: boolean }) {
  const reduceMotion = useReducedMotion();
  const dot = available ? "rgb(0, 255, 111)" : "rgb(237, 49, 49)";
  // Available dots send out a ring: 1s at rest, then 0.7s growing from 6px to 48px while fading,
  // 0.3s hold, and an instant reset (the original cycles two variants on 1s timers).
  const pulse = available && !reduceMotion;

  return (
    <span className="flex items-center" style={{ gap: 4 }}>
      <span className="relative block" style={{ width: 6, height: 6 }}>
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: dot, opacity: 0.5 }}
          animate={
            pulse ? { scale: [1, 1, 8, 8], opacity: [0.5, 0.5, 0, 0] } : { scale: 1, opacity: 0.5 }
          }
          transition={
            pulse
              ? {
                  duration: 2,
                  times: [0, 0.5, 0.85, 1],
                  ease: ["linear", [0.12, 0.23, 0.5, 1], "linear"],
                  repeat: Infinity,
                  repeatType: "loop",
                }
              : { duration: 0 }
          }
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: dot,
            boxShadow: `0px 0px 20px 0px ${available ? "rgba(80, 112, 86, 0.5)" : "rgba(237, 49, 49, 0.5)"}`,
          }}
        />
      </span>
      <span
        className="select-none whitespace-pre"
        style={{
          fontFamily: TEXT_FONT,
          fontSize: 14,
          fontWeight: 500,
          fontVariationSettings: '"opsz" 32, "wght" 500',
          letterSpacing: "-0.04em",
          lineHeight: "1.4em",
          color: available ? "rgb(0, 255, 111)" : "rgb(255, 0, 0)",
        }}
      >
        {available ? "Available" : "Unavailable"}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Dynamic info
 * -----------------------------------------------------------------------------------------------*/

const SAMPLE_IMAGE =
  "https://framerusercontent.com/images/mNzl4z6a01cebukTTLU0FRnswRI.jpg?scale-down-to=512&width=6016&height=4016";

export interface DynamicInfoProps extends Omit<React.ComponentProps<"div">, "onClick"> {
  /** Avatar image. */
  image?: string;
  imageAlt?: string;
  name?: string;
  /** Line under the name. */
  info?: string;
  availability?: "available" | "unavailable";
  socialLinks?: SocialLinkItem[];
  /** Start expanded. */
  defaultOpen?: boolean;
  /** Called whenever the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Called when the top row (avatar, name, clock) is clicked. */
  onClick?: () => void;
  /** Panel colour, also used for the two concave corner pieces beside it. */
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  /** Locale and zone for the clock. */
  locale?: string | undefined;
  timeZone?: string | undefined;
}

/**
 * Dynamic info: a dark tab hanging from the top of the page with inverted-radius shoulders. It
 * shows an avatar, a name, a role and a live clock; click it and it springs open to reveal social
 * links and an availability badge, then folds back when the pointer leaves.
 */
export function DynamicInfo({
  image = SAMPLE_IMAGE,
  imageAlt = "a man smiling for the camera",
  name = "James Doe",
  info = "Designer",
  availability = "available",
  socialLinks = DEFAULT_SOCIAL_LINKS,
  defaultOpen = false,
  onOpenChange,
  onClick,
  backgroundColor = "rgb(5, 5, 5)",
  textColor = "rgb(255, 255, 255)",
  mutedTextColor = "rgba(255, 255, 255, 0.6)",
  locale,
  timeZone,
  className,
  style,
  onMouseLeave,
  onBlur,
  onKeyDown,
  ...props
}: DynamicInfoProps) {
  const [open, setOpenState] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : SPRING;

  const setOpen = (next: boolean) => {
    if (next === open) return;
    setOpenState(next);
    onOpenChange?.(next);
  };

  const earSize = open ? 48 : 24;
  const textStyle = {
    fontFamily: TEXT_FONT,
    fontSize: 14,
    fontWeight: 500,
    fontVariationSettings: '"opsz" 32, "wght" 500',
    letterSpacing: "-0.04em",
  } as const;

  return (
    <div
      {...props}
      className={cn("relative flex w-min flex-col items-center", className)}
      style={{ gap: 8, ...style }}
      onMouseLeave={(event) => {
        setOpen(false);
        onMouseLeave?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
        onKeyDown?.(event);
      }}
    >
      {/*
        Concave shoulders. Each is a transparent box whose box-shadow, offset 34px upward, paints
        the panel colour everywhere around the box except inside its rounded corner, leaving the
        quarter-circle of page background that makes the panel look joined to the top edge.
      */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 select-none"
        style={{ zIndex: 1 }}
        initial={false}
        animate={{ width: earSize, height: earSize, left: -earSize }}
        transition={transition}
      >
        <motion.div
          className="absolute overflow-hidden"
          style={{
            bottom: -24,
            left: -24,
            right: 0,
            top: 0,
            zIndex: -1,
            boxShadow: `8px -34px 0px 1px ${backgroundColor}`,
          }}
          initial={false}
          animate={{ borderTopRightRadius: open ? 32 : 12 }}
          transition={transition}
        />
      </motion.div>

      <motion.div
        className="flex flex-col items-center self-stretch overflow-hidden"
        style={{
          gap: 12,
          backgroundColor,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          color: textColor,
        }}
        initial={false}
        animate={{ height: open ? "auto" : 50, padding: open ? 12 : 8 }}
        transition={transition}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => {
            setOpen(true);
            onClick?.();
          }}
          className={cn(
            "flex w-full shrink-0 items-center justify-center overflow-hidden text-left outline-none focus-visible:ring-1 focus-visible:ring-white/60",
            open ? "cursor-default" : "cursor-pointer",
          )}
          style={{ gap: 60, color: "inherit" }}
        >
          <span className="flex select-none items-center" style={{ gap: 8 }}>
            <img
              src={image}
              alt={imageAlt}
              width={34}
              height={34}
              className="block shrink-0 rounded-[24px] object-cover"
              style={{ width: 34, height: 34 }}
            />
            <span className="flex flex-col justify-center">
              <span className="whitespace-pre" style={{ ...textStyle, color: textColor }}>
                {name}
              </span>
              <span className="whitespace-pre" style={{ ...textStyle, color: mutedTextColor }}>
                {info}
              </span>
            </span>
          </span>
          <LiveClock
            locale={locale}
            timeZone={timeZone}
            style={{
              fontFamily: CLOCK_FONT,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: "1em",
              fontFeatureSettings: "'cv01' on, 'zero' on",
              color: textColor,
            }}
          />
        </button>

        <motion.div
          className="relative flex w-full shrink-0 items-center justify-between"
          style={{ zIndex: 1 }}
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={transition}
          inert={!open}
        >
          <div className="flex items-center" style={{ gap: 4 }}>
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <motion.a
                key={label}
                href={withProtocol(href)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white/60"
                whileHover={{ opacity: 0.8 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              >
                <Icon color={mutedTextColor} />
              </motion.a>
            ))}
          </div>
          <AvailabilityBadge available={availability === "available"} />
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 select-none"
        style={{ zIndex: 0 }}
        initial={false}
        animate={{ width: earSize, height: earSize, right: -earSize }}
        transition={transition}
      >
        <motion.div
          className="absolute overflow-hidden"
          style={{
            bottom: -24,
            left: 0,
            right: -24,
            top: 0,
            zIndex: -1,
            boxShadow: `-4px -34px 0px 1px ${backgroundColor}`,
          }}
          initial={false}
          animate={{ borderTopLeftRadius: open ? 32 : 12 }}
          transition={transition}
        />
      </motion.div>
    </div>
  );
}

export default DynamicInfo;
