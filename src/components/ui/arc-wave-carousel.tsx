import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Arc Wave Carousel: portrait cards laid on the outside of a large vertical cylinder seen in
 * perspective. The strip drifts sideways on its own, follows a drag 1:1 (mouse or touch) and the
 * wheel, then springs to the nearest card.
 *
 * Every number below was measured on the public demo (arcwavecarouselcms.framer.website) and the
 * owner's recording, and is expressed relative to the card width so the whole arc scales with
 * the container.
 */

const FRAMER = "https://framerusercontent.com";

export interface ArcWaveCarouselItem {
  /** Image or video URL. */
  src: string;
  /** "video" plays the source muted and looped; defaults to "image". */
  type?: "image" | "video";
  /** Name shown in the caption at the bottom of the card. */
  title?: string;
  /** Smaller second caption line. */
  subtitle?: string;
  /** Alternative text for images (defaults to the title). */
  alt?: string;
}

const ARC_WAVE_DEMO_ITEMS: ArcWaveCarouselItem[] = [
  {
    src: `${FRAMER}/images/KbhZ8TSifLt6oom0DJy3I6dtRk.png?width=800&height=1200`,
    title: "Mara Okafor",
    subtitle: "Creative Director — leads brand and campaign vision",
  },
  {
    src: `${FRAMER}/assets/NN6Lx6k4t7M9vGURDbnyq40sQ.mp4`,
    type: "video",
    title: "Nora Vance",
    subtitle: "UX Researcher — listens first, then shapes the product",
  },
  {
    src: `${FRAMER}/images/xUSdDKegY1epCfmV1Z59ievg1LI.png?width=1536&height=2048`,
    title: "Julian Reyes",
    subtitle: "Lead Engineer — builds fast, reliable front-end systems",
  },
  {
    src: `${FRAMER}/assets/evzABRU4WEqu8p0fD9C5sDiGY9s.mp4`,
    type: "video",
    title: "Kai Nakamura",
    subtitle: "Motion Designer — crafts transitions that feel alive",
  },
  {
    src: `${FRAMER}/images/tMsaCZMLrhptj9Km3aVihdywnlw.jpg?width=600&height=749`,
    title: "Iris Calder",
    subtitle: "Brand Strategist — finds the story behind each name",
  },
  {
    src: `${FRAMER}/images/FnA0lOktORlmJAnlNebTalpe6ZM.png?scale-down-to=2048&width=1796&height=2400`,
    title: "Lena Moreau",
    subtitle: "Art Director — sets the visual tone for every launch",
  },
  {
    src: `${FRAMER}/assets/roSTU06jbgGlsYXGIPH26maBtQQ.mp4`,
    type: "video",
    title: "Sofia Lind",
    subtitle: "Content Lead — writes words people actually remember",
  },
  {
    src: `${FRAMER}/images/HKrd4wmSAWqLUZ2RqMnQJF5bxw.jpg?width=736&height=915`,
    title: "Amara Diallo",
    subtitle: "Head of Operations — keeps every project on rhythm",
  },
  {
    src: `${FRAMER}/assets/kGZt3pMAG52JXRenq65ma0fZw.mp4`,
    type: "video",
    title: "Elias Hart",
    subtitle: "Photographer — captures light, texture and quiet moments",
  },
  {
    src: `${FRAMER}/images/bw0gFHiTF8Q4IDcQFWSfWh6pyg.png?scale-down-to=2048&width=1796&height=2400`,
    title: "Theo Brandt",
    subtitle: "Product Designer — turns rough ideas into clear interfaces",
  },
];

export interface ArcWaveCarouselProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Cards, in order. Demo portraits and clips by default. */
  items?: ArcWaveCarouselItem[];
  /** Auto-drift speed in px/s along the arc (0 stops it). The demo drifts at about 50. */
  speed?: number;
  /** Drift direction: -1 moves the strip to the left (as in the demo), 1 to the right. */
  direction?: -1 | 1;
  /** Card width in px. By default min(35.4% of the width, 54.5% of the height), as in the demo. */
  cardWidth?: number;
  /** Drag with mouse or touch. */
  draggable?: boolean;
  /** Scroll the strip with the mouse wheel / trackpad. */
  wheel?: boolean;
  /** How long the strip rests after the user lets go before it drifts again (ms). */
  resumeDelay?: number;
  /** Show the name / role caption on each card. */
  showCaptions?: boolean;
  /** Page colour behind the arc. */
  background?: string;
}

// Geometry, as multiples of the card width w (measured at w = 168 and w = 354 px).
const ASPECT = 354 / 506; // card width / height
const RADIUS = 3.175; // cylinder radius
const PERSPECTIVE = 2.857; // CSS perspective of the stage
const SLOT_DEG = 18.75; // angle between neighbouring card centres
const MAX_TILT = 65; // cards turn with the arc up to 65deg, then stay at 65deg
const SLOT_RAD = (SLOT_DEG * Math.PI) / 180;

// Release spring, fitted to the demo's snap-back (stiffness 130, damping 22, mass 1: slightly
// under-damped, ~16px overshoot after a fast flick, settled in ~500ms).
const RELEASE_SPRING = { stiffness: 130, damping: 22 };
// The wheel glides in more softly (critically damped, ~90% of the way in 400ms).
const WHEEL_SPRING = { stiffness: 100, damping: 20 };
/** Share of the finger's release speed handed to the spring (fitted: 450 of 1220 px/s). */
const RELEASE_VELOCITY = 0.37;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Look of a card whose centre sits `deg` degrees round the arc (fitted to the demo). */
function cardLook(deg: number) {
  const t = Math.abs(deg);
  return {
    // Linear fade to 45% at the rim, plus a smooth fade-out between 65deg and 90deg.
    opacity: (1 - 0.55 * (t / 90)) * (1 - smoothstep(MAX_TILT, 90, t)),
    blur: 2.4 * Math.pow(t / 90, 1.3),
    shade: 0.6 * (t / 90),
  };
}

export function ArcWaveCarousel({
  items = ARC_WAVE_DEMO_ITEMS,
  speed = 50,
  direction = -1,
  cardWidth,
  draggable = true,
  wheel = true,
  resumeDelay = 1400,
  showCaptions = true,
  background = "#000",
  className,
  style,
  ...props
}: ArcWaveCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  /** Card whose caption is showing: the one under the mouse, or the last one touched. */
  const [hovered, setHovered] = useState<number | null>(null);

  // Repeat the list until the loop is longer than half the cylinder plus a card, so the wrap
  // point always lies hidden behind the arc.
  const cards = useMemo(() => {
    if (items.length === 0) return [];
    const copies = Math.max(1, Math.ceil(12 / items.length));
    return Array.from(
      { length: items.length * copies },
      (_, i) => items[i % items.length] as ArcWaveCarouselItem,
    );
  }, [items]);

  const w = cardWidth ?? Math.min(size.w * 0.354, size.h * 0.545);
  const h = w / ASPECT;

  // Live values read by the animation loop without re-rendering.
  const live = useRef({ speed, direction, draggable, wheel, resumeDelay, w });
  live.current = { speed, direction, draggable, wheel, resumeDelay, w };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || cards.length === 0) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    /** Arc position (px) of card 0's centre; card i sits at offset + i * slot. */
    let offset = 0;
    let velocity = 0;
    let mode: "drift" | "drag" | "spring" = "drift";
    let target = 0;
    let wheelTarget: number | null = null;
    let spring = RELEASE_SPRING;
    let resumeAt = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const slot = () => live.current.w * RADIUS * SLOT_RAD;
    const snap = (value: number) => Math.round(value / slot()) * slot();

    const layout = () => {
      const cw = live.current.w;
      if (cw <= 0) return;
      const R = cw * RADIUS;
      const s = slot();
      const loop = s * cards.length;
      for (let i = 0; i < cards.length; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        // Wrap into [-loop/2, loop/2) so the strip is endless.
        let p = (offset + i * s) % loop;
        if (p < -loop / 2) p += loop;
        if (p >= loop / 2) p -= loop;
        const theta = p / R;
        const deg = (theta * 180) / Math.PI;
        if (Math.abs(deg) >= 90) {
          card.style.visibility = "hidden";
          continue;
        }
        const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, deg));
        const look = cardLook(deg);
        card.style.visibility = "visible";
        card.style.transform = `translate3d(${R * Math.sin(theta)}px, 0px, ${R * (Math.cos(theta) - 1)}px) rotateY(${tilt}deg)`;
        card.style.opacity = String(look.opacity);
        card.style.filter = look.blur > 0.05 ? `blur(${look.blur}px)` : "none";
        card.style.zIndex = String(1000 - Math.round(Math.abs(deg) * 10));
        const shade = shadeRefs.current[i];
        if (shade) shade.style.opacity = String(look.shade);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
      last = now;
      if (mode === "drift") {
        if (!reduced && now >= resumeAt) offset += live.current.direction * live.current.speed * dt;
      } else if (mode === "spring") {
        // Semi-implicit Euler in 4ms sub-steps keeps the spring stable at any frame rate.
        const steps = Math.max(1, Math.ceil(dt / 0.004));
        const h2 = dt / steps;
        for (let k = 0; k < steps; k++) {
          velocity += (-spring.stiffness * (offset - target) - spring.damping * velocity) * h2;
          offset += velocity * h2;
        }
        if (Math.abs(offset - target) < 0.05 && Math.abs(velocity) < 2) {
          offset = target;
          velocity = 0;
          mode = "drift";
          wheelTarget = null;
        }
      }
      layout();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const start = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const springTo = (value: number, v = velocity, params = RELEASE_SPRING) => {
      spring = params;
      target = value;
      velocity = v;
      mode = "spring";
      resumeAt = performance.now() + live.current.resumeDelay;
      start();
    };

    // Dragging -------------------------------------------------------------------------------
    let pointerId: number | null = null;
    let dragStartX = 0;
    let dragStartOffset = 0;
    const samples: { t: number; x: number }[] = [];

    const onDown = (e: PointerEvent) => {
      if (!live.current.draggable || pointerId !== null) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointerId = e.pointerId;
      root.setPointerCapture(e.pointerId);
      dragStartX = e.clientX;
      dragStartOffset = offset;
      samples.length = 0;
      samples.push({ t: performance.now(), x: e.clientX });
      mode = "drag";
      velocity = 0;
      wheelTarget = null;
      root.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      offset = dragStartOffset + (e.clientX - dragStartX);
      const t = performance.now();
      samples.push({ t, x: e.clientX });
      while (samples.length > 2 && t - (samples[0]?.t ?? t) > 100) samples.shift();
      start();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      root.style.cursor = "";
      const first = samples[0];
      const lastSample = samples[samples.length - 1];
      let v = 0;
      if (first && lastSample) {
        const span = (lastSample.t - first.t) / 1000;
        const fresh = performance.now() - lastSample.t < 80;
        if (span > 0 && fresh) v = (lastSample.x - first.x) / span;
      }
      const handed = v * RELEASE_VELOCITY;
      // A gentle flick carries on to the next card; a slow release snaps to the nearest one.
      springTo(snap(offset + handed * 0.25), handed);
    };

    // Wheel: every notch moves the snap target, and the spring chases it.
    const onWheel = (e: WheelEvent) => {
      if (!live.current.wheel) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? root.clientWidth : 1;
      wheelTarget = (wheelTarget ?? offset) - delta * scale;
      springTo(snap(wheelTarget), velocity, WHEEL_SPRING);
    };

    // Keyboard: one card per arrow press.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const base = mode === "spring" ? target : snap(offset);
      springTo(base + (e.key === "ArrowLeft" ? slot() : -slot()));
    };

    // Pause while off-screen or in a background tab; videos follow.
    const videos = () => Array.from(root.querySelectorAll("video"));
    const setVisible = (next: boolean) => {
      visible = next && document.visibilityState === "visible";
      for (const v of videos()) {
        if (visible) v.play().catch(() => {});
        else v.pause();
      }
      if (visible) start();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    let inView = true;
    const io = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      setVisible(inView);
    });
    io.observe(root);
    const onVisibility = () => setVisible(inView);
    document.addEventListener("visibilitychange", onVisibility);

    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("keydown", onKey);
    layout();
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKey);
    };
  }, [cards]);

  const ready = w > 0;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      tabIndex={0}
      {...props}
      className={cn(
        "relative h-full w-full overflow-hidden outline-none select-none focus-visible:ring-2 focus-visible:ring-white/60",
        draggable && "cursor-grab",
        className,
      )}
      style={{
        background,
        perspective: ready ? w * PERSPECTIVE : undefined,
        perspectiveOrigin: "50% 50%",
        touchAction: draggable ? "pan-y" : undefined,
        ...style,
      }}
    >
      {ready &&
        cards.map((item, i) => (
          <div
            key={i}
            ref={(node) => {
              cardRefs.current[i] = node;
            }}
            aria-hidden={i >= items.length || undefined}
            className="absolute top-1/2 left-1/2 overflow-hidden"
            style={{
              width: w,
              height: h,
              marginLeft: -w / 2,
              marginTop: -h / 2,
              visibility: "hidden",
              willChange: "transform, opacity, filter",
            }}
            onPointerEnter={() => setHovered(i)}
            onPointerDown={() => setHovered(i)}
            // Touch keeps the caption up after the finger lifts (like Safari's sticky hover).
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setHovered((v) => (v === i ? null : v));
            }}
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                disablePictureInPicture
                aria-hidden
                tabIndex={-1}
                className="pointer-events-none block h-full w-full object-cover"
              />
            ) : (
              <img
                src={item.src}
                alt={item.alt ?? item.title ?? ""}
                draggable={false}
                loading="lazy"
                className="pointer-events-none block h-full w-full object-cover"
              />
            )}
            {/* Darkens the card as it turns away. */}
            <div
              ref={(node) => {
                shadeRefs.current[i] = node;
              }}
              className="pointer-events-none absolute inset-0 bg-black"
              style={{ opacity: 0 }}
            />
            {showCaptions && (item.title || item.subtitle) && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end"
                style={{
                  // Captions fade in on the hovered / touched card only.
                  opacity: hovered === i ? 1 : 0,
                  transition: "opacity 0.35s",
                  top: "40%",
                  gap: w * 0.00952,
                  padding: w * 0.04285,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 100%)",
                  // The demo loads Inter from Google Fonts.
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {item.title && (
                  <div
                    style={{
                      fontSize: w * 0.04285,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      lineHeight: "1.2em",
                      color: "#fff",
                    }}
                  >
                    {item.title}
                  </div>
                )}
                {item.subtitle && (
                  <div
                    style={{
                      fontSize: w * 0.0309,
                      fontWeight: 400,
                      lineHeight: "1.4em",
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    {item.subtitle}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default ArcWaveCarousel;
