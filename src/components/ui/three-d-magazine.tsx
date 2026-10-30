/*
 * 3D Magazine: a floating magazine whose pages turn in 3D when clicked. Each sheet is a chain of
 * 30 hinged CSS 3D segments, so a turning page bends: curled near the spine, a travelling bulge
 * during the turn and a slight fold at the free edge. The scene is lit per segment (ambient,
 * key light and a gloss highlight), floats gently and can be orbited by dragging.
 *
 * Built from the behaviour of the Framer "3D Magazine" component (a react-three-fiber skinned
 * mesh); this implementation is CSS 3D transforms only, with no WebGL or 3D library.
 */
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Sample cover of the original. */
const DEFAULT_IMAGE = "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg";
/** Filler page inserted when the page count is odd (the original's is solid black). */
const BLANK_PAGE = "#000000";

export interface MagazinePage {
  type?: "image" | "video";
  /** Image (or the video's poster). */
  image?: string;
  alt?: string;
  /** Video source (type "video"). */
  video?: string;
  loop?: boolean;
  muted?: boolean;
  playbackRate?: number;
  /** Focal point used by cover/contain, CSS background-position. */
  position?: string;
  /** 0–100, overrides the magazine gloss for this page. */
  gloss?: number;
}

export type MagazinePageSize =
  | "portrait-2-3"
  | "portrait-3-4"
  | "portrait-4-5"
  | "portrait-9-16"
  | "landscape-3-2"
  | "landscape-4-3"
  | "landscape-16-9"
  | "landscape-5-4"
  | "square-1-1"
  | { width: number; height: number };

export type MagazineEnterAnimation =
  | "none"
  | "slideBottom"
  | "slideTop"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "drop"
  | "spin"
  | "tilt"
  | "rise"
  | "dolly"
  | "orbit"
  | "crane"
  | "focusPull";

export interface ThreeDMagazineProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** First item is the front cover, last item the back cover. Two pages make one sheet. */
  pages?: MagazinePage[];
  /** Page proportions, a preset or a size in scene units (1.28 wide is the default). */
  pageSize?: MagazinePageSize;
  fitMedia?: "cover" | "contain" | "stretch";
  /** Tint that glows over a sheet under the pointer. */
  hoverColor?: string;
  /** 0–100: how shiny the paper is. */
  gloss?: number;
  /** 0–20: how much a page bends while turning. */
  bend?: number;
  /** Page the magazine opens at (0 = closed on the front cover). */
  openAtPage?: number;
  /** Turn pages by themselves every `autoFlipInterval` seconds. */
  autoFlip?: boolean;
  autoFlipInterval?: number;
  float?: { enabled?: boolean; intensity?: number; speed?: number; rotationIntensity?: number };
  /** One-off entrance, played when the component mounts. */
  enterAnimation?: { type?: MagazineEnterAnimation; speed?: number; delay?: number };
  camera?: {
    /** Only its length (the camera distance) is used when orbiting. */
    position?: { x: number; y: number; z: number };
    /** x: polar angle from straight above, y: azimuth, in degrees. */
    rotation?: { x: number; y: number };
    zoom?: number;
    fov?: number;
  };
  /** Drag to orbit the camera around the magazine. */
  orbit?: boolean;
  lights?: { baseIntensity?: number; lightsIntensity?: number };
  shadow?: boolean;
  /** Called with the target page when it changes. */
  onPageChange?: (page: number) => void;
}

const BASE = 1.28;
const PRESETS: Record<Exclude<MagazinePageSize, object>, [number, number]> = {
  "portrait-2-3": [BASE, BASE * 1.5],
  "portrait-3-4": [BASE, (BASE * 4) / 3],
  "portrait-4-5": [BASE, BASE * 1.25],
  "portrait-9-16": [BASE, (BASE * 16) / 9],
  "landscape-3-2": [BASE * 1.5, BASE],
  "landscape-4-3": [(BASE * 4) / 3, BASE],
  "landscape-16-9": [(BASE * 16) / 9, BASE],
  "landscape-5-4": [BASE * 1.25, BASE],
  "square-1-1": [BASE, BASE],
};

// Bend model of the original (per bone, scaled by the target rotation).
const SEGMENTS = 30;
const SMOOTH_TIME = 0.5;
const SMOOTH_TIME_FOLD = 0.3;
const INSIDE_CURVE = 0.18;
const OUTSIDE_CURVE = 0.05;
const TURNING_CURVE = 0.09;
/** Duration of the bulge that travels along a page as it starts to turn. */
const TURN_MS = 400;
/** Sheets are 0.003 units thick; exaggerated a little so CSS layers never z-fight. */
const PAGE_DEPTH = 0.006;
/** Float group of the original is tilted back by 22.5°. */
const BOOK_TILT = -Math.PI / 8;
const HOVER_INTENSITY = 0.22;

const ENTER: Record<
  Exclude<MagazineEnterAnimation, "none">,
  {
    pos?: [number, number, number];
    rot?: [number, number, number];
    scale?: number;
    fov?: number;
    bounce?: boolean;
  }
> = {
  slideBottom: { pos: [0, -4, 0] },
  slideTop: { pos: [0, 4, 0] },
  slideLeft: { pos: [-4, 0, 0] },
  slideRight: { pos: [4, 0, 0] },
  scaleUp: { scale: 0.2 },
  drop: { pos: [0, 5, 0], bounce: true },
  spin: { rot: [0, Math.PI * 2, 0] },
  tilt: { rot: [0, -Math.PI / 2, 0] },
  rise: { rot: [Math.PI / 2, 0, 0] },
  dolly: { pos: [0, 0, -4], scale: 0.6 },
  orbit: { rot: [0, -Math.PI * 0.66, 0] },
  crane: { rot: [Math.PI * 0.6, 0, 0], pos: [0, 1.2, 0] },
  focusPull: { fov: 2 },
};

type Vec3 = [number, number, number];
const rotX = ([x, y, z]: Vec3, a: number): Vec3 => [
  x,
  y * Math.cos(a) - z * Math.sin(a),
  y * Math.sin(a) + z * Math.cos(a),
];
const rotY = ([x, y, z]: Vec3, a: number): Vec3 => [
  x * Math.cos(a) + z * Math.sin(a),
  y,
  -x * Math.sin(a) + z * Math.cos(a),
];
const rotZ = ([x, y, z]: Vec3, a: number): Vec3 => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
  z,
];
/** Euler XYZ (three.js order): R = Rx · Ry · Rz. */
const euler = (v: Vec3, [a, b, c]: Vec3) => rotX(rotY(rotZ(v, c), b), a);
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const KEY_LIGHT = norm([2, 5, 2]);
const TOP_LIGHT = norm([0, 6, 0.5]);

/** Critically damped smoothing towards a target (same response as maath's `damp`). */
function damp(state: { v: number; vel: number }, target: number, smoothTime: number, dt: number) {
  if (Math.abs(state.v - target) <= 0.0005) {
    state.v = target;
    state.vel = 0;
    return;
  }
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = state.v - target;
  const temp = (state.vel + omega * change) * dt;
  state.vel = (state.vel - omega * temp) * e;
  let out = target + (change + temp) * e;
  if (target - state.v > 0 === out > target) {
    out = target;
    state.vel = 0;
  }
  state.v = out;
}

function springStep(
  s: { v: number; vel: number },
  target: number,
  omega: number,
  zeta: number,
  dt: number,
) {
  let left = dt;
  while (left > 0) {
    const h = Math.min(1 / 120, left);
    s.vel += (-omega * omega * (s.v - target) - 2 * zeta * omega * s.vel) * h;
    s.v += s.vel * h;
    left -= h;
  }
}

interface Face {
  page: MagazinePage | null;
}
interface SheetData {
  front: Face;
  back: Face;
}

/** Pairs pages into sheets; an odd count gets a blank page before the back cover. */
function toSheets(pages: MagazinePage[]): SheetData[] {
  const last = pages[pages.length - 1] ?? null;
  const list: (MagazinePage | null)[] =
    pages.length % 2 === 0 ? [...pages] : [...pages.slice(0, -1), null, last];
  const sheets: SheetData[] = [];
  for (let i = 0; i < list.length; i += 2) {
    sheets.push({ front: { page: list[i] ?? null }, back: { page: list[i + 1] ?? null } });
  }
  return sheets;
}

const BACKGROUND_SIZE = { cover: "cover", contain: "contain", stretch: "100% 100%" } as const;

/** Refs the render loop writes to directly (no React re-render per frame). */
type PerSide<T> = [T[], T[]]; // [front, back][segment]
interface SheetRefs {
  root: HTMLDivElement | null;
  segs: (HTMLDivElement | null)[];
  shade: PerSide<HTMLDivElement | null>;
  shine: PerSide<HTMLDivElement | null>;
  canvases: PerSide<HTMLCanvasElement | null>;
}
const SIDES = [0, 1] as const;
const emptyRefs = (): SheetRefs => ({
  root: null,
  segs: [],
  shade: [[], []],
  shine: [[], []],
  canvases: [[], []],
});

function FaceSlice({
  page,
  index,
  back,
  width,
  height,
  fit,
  shadeRef,
  shineRef,
  canvasRef,
}: {
  page: MagazinePage | null;
  index: number;
  back: boolean;
  width: number;
  height: number;
  fit: keyof typeof BACKGROUND_SIZE;
  shadeRef: (el: HTMLDivElement | null) => void;
  shineRef: (el: HTMLDivElement | null) => void;
  canvasRef: (el: HTMLCanvasElement | null) => void;
}) {
  const seg = width / SEGMENTS;
  // The back is seen mirrored, so its slices run from the far edge of the image.
  const offset = back ? width - (index + 1) * seg : index * seg;
  const image = page ? page.image || DEFAULT_IMAGE : null;
  return (
    <div
      aria-hidden
      data-face
      style={{
        position: "absolute",
        inset: 0,
        // A hair wider than the segment so no seam shows between neighbours.
        width: seg + 1.5,
        overflow: "hidden",
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        transformOrigin: `${seg / 2}px 50%`,
        backgroundColor: image ? undefined : BLANK_PAGE,
      }}
    >
      {image && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -offset,
            width,
            height,
            backgroundImage: `url("${image}")`,
            backgroundSize: BACKGROUND_SIZE[fit],
            backgroundPosition: page?.position ?? "50% 50%",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {page?.type === "video" && (
        <canvas
          ref={canvasRef}
          width={Math.max(1, Math.ceil(seg + 1))}
          height={Math.max(1, Math.ceil(height))}
          style={{ position: "absolute", top: 0, left: 0, width: seg + 1.5, height }}
        />
      )}
      <div
        ref={shadeRef}
        style={{ position: "absolute", inset: 0, background: "#000", opacity: 0 }}
      />
      <div
        ref={shineRef}
        style={{ position: "absolute", inset: 0, opacity: 0, mixBlendMode: "screen" }}
      />
    </div>
  );
}

export function ThreeDMagazine({
  pages = [
    { image: DEFAULT_IMAGE, alt: "Front Cover" },
    { image: DEFAULT_IMAGE, alt: "Inside Page" },
    { image: DEFAULT_IMAGE, alt: "Back Cover" },
  ],
  pageSize = "portrait-3-4",
  fitMedia = "stretch",
  hoverColor = "#f59a38",
  gloss = 40,
  bend = 20,
  openAtPage = 0,
  autoFlip = false,
  autoFlipInterval = 2.5,
  float,
  enterAnimation,
  camera,
  orbit = true,
  lights,
  shadow = true,
  onPageChange,
  className,
  style,
  ...rest
}: ThreeDMagazineProps) {
  const sheets = useMemo(() => toSheets(pages), [pages]);
  const maxPage = sheets.length;
  const [pw, ph] =
    typeof pageSize === "string" ? PRESETS[pageSize] : [pageSize.width, pageSize.height];
  const floatCfg = { enabled: true, intensity: 1, speed: 2, rotationIntensity: 2, ...float };
  const enterCfg = {
    type: "none" as MagazineEnterAnimation,
    speed: 1,
    delay: 0,
    ...enterAnimation,
  };
  const cam = {
    position: { x: -0.5, y: 1, z: 4 },
    rotation: { x: 83, y: 0 },
    zoom: 1.2,
    fov: 45,
    ...camera,
  };
  const light = { baseIntensity: 0.5, lightsIntensity: 1, ...lights };

  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const clampPage = (p: number) => Math.min(maxPage, Math.max(0, Math.round(p)));
  const [page, setPage] = useState(() => clampPage(openAtPage));
  const [delayedPage, setDelayedPage] = useState(page);
  const [hovered, setHovered] = useState(-1);

  // Mutable state for the render loop.
  const live = useRef({
    delayedPage,
    hovered,
    turnedAt: [] as number[],
    lastOpened: [] as boolean[],
    bones: [] as { y: { v: number; vel: number }; x: { v: number; vel: number } }[][],
    hover: [] as number[],
    azimuth: (cam.rotation.y * Math.PI) / 180,
    polar: (cam.rotation.x * Math.PI) / 180,
    dAz: 0,
    dPol: 0,
    enter: null as null | { t: number; ch: { v: number; vel: number }[] },
    visible: true,
  });
  live.current.delayedPage = delayedPage;
  live.current.hovered = hovered;

  const sheetRefs = useRef<SheetRefs[]>([]);
  sheetRefs.current = sheets.map((_, i) => sheetRefs.current[i] ?? emptyRefs());

  useEffect(() => setPage(clampPage(openAtPage)), [openAtPage, maxPage]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onPageChange?.(page), [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pages turn one at a time towards the target: 150 ms apart, 50 ms when far away.
  useEffect(() => {
    if (page === delayedPage) return;
    const id = setTimeout(
      () => setDelayedPage((d) => (page > d ? d + 1 : d - 1)),
      Math.abs(page - delayedPage) > 2 ? 50 : 150,
    );
    return () => clearTimeout(id);
  }, [page, delayedPage]);
  // The first step happens immediately, as in the original.
  const lastTarget = useRef(page);
  useEffect(() => {
    if (lastTarget.current === page) return;
    lastTarget.current = page;
    setDelayedPage((d) => (page === d ? d : page > d ? d + 1 : d - 1));
  }, [page]);

  useEffect(() => {
    if (!autoFlip) return;
    const id = setInterval(
      () => setPage((p) => (p >= maxPage ? 0 : p + 1)),
      Math.max(0.5, autoFlipInterval) * 1000,
    );
    return () => clearInterval(id);
  }, [autoFlip, autoFlipInterval, maxPage]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setSize({ w: el.clientWidth || 1, h: el.clientHeight || 1 }),
    );
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      live.current.visible = e?.isIntersecting ?? true;
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Orbit drag (OrbitControls feel: 2π per container height, damped with factor 0.05).
  const drag = useRef<{ x: number; y: number; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    suppressClick.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    onHover(e);
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > 4) {
      d.moved = true;
      rootRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved || !orbit) return;
    const h = rootRef.current?.clientHeight || 1;
    live.current.dAz -= (2 * Math.PI * dx) / h;
    live.current.dPol -= (2 * Math.PI * dy) / h;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.moved) suppressClick.current = true;
    if (rootRef.current?.hasPointerCapture(e.pointerId))
      rootRef.current.releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  /**
   * Which sheet a pointer position acts on. Hit-testing nested 3D layers is unreliable across
   * browsers, so like the original's "click a page to turn it" we resolve by side: the right-hand
   * page is the top unopened sheet, the left-hand page the last opened one (mirrored when the
   * camera has orbited round to the back).
   */
  const sheetAt = (clientX: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return -1;
    const right = clientX > rect.left + rect.width / 2 !== Math.cos(live.current.azimuth) < 0;
    const d = live.current.delayedPage;
    const n = right ? d : d - 1;
    return n >= 0 && n < maxPage ? n : right ? d - 1 : d;
  };
  /** Whether a point is over any page slice (by their projected boxes, not hit-testing). */
  const overBook = (x: number, y: number) => {
    const faces = rootRef.current?.querySelectorAll("[data-face]") ?? [];
    for (const f of faces) {
      const r = f.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
    }
    return false;
  };
  const onClick = (e: React.MouseEvent) => {
    if (suppressClick.current || !overBook(e.clientX, e.clientY)) return;
    const n = sheetAt(e.clientX);
    if (n < 0 || n >= maxPage) return;
    const opened = live.current.delayedPage > n;
    setPage(opened ? n : n + 1);
    setHovered(-1);
  };
  const onHover = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || drag.current?.moved) return;
    const n = overBook(e.clientX, e.clientY) ? sheetAt(e.clientX) : -1;
    setHovered((h) => (h === n ? h : n));
  };

  // Video pages: one hidden <video> per video face, painted into its segment canvases.
  const videos = useRef<Map<string, HTMLVideoElement>>(new Map());
  useEffect(() => {
    const map = videos.current;
    const wanted = new Set<string>();
    sheets.forEach((s, i) =>
      [s.front, s.back].forEach((f, side) => {
        if (f.page?.type !== "video" || !f.page.video) return;
        const key = `${i}:${side}`;
        wanted.add(key);
        let v = map.get(key);
        if (!v || v.dataset["src"] !== f.page.video) {
          v?.pause();
          v = document.createElement("video");
          v.crossOrigin = "anonymous";
          v.playsInline = true;
          v.dataset["src"] = f.page.video;
          v.src = f.page.video;
          map.set(key, v);
        }
        v.muted = f.page.muted ?? true;
        v.loop = f.page.loop ?? true;
        v.playbackRate = f.page.playbackRate ?? 1;
      }),
    );
    for (const [key, v] of map) {
      if (!wanted.has(key)) {
        v.pause();
        v.removeAttribute("src");
        map.delete(key);
      }
    }
  }, [sheets]);
  useEffect(
    () => () => {
      for (const v of videos.current.values()) {
        v.pause();
        v.removeAttribute("src");
        v.load();
      }
      videos.current.clear();
    },
    [],
  );

  // Render loop.
  const params = useRef({
    pw,
    ph,
    bend,
    gloss,
    floatCfg,
    enterCfg,
    cam,
    light,
    size,
    shadow,
    hoverColor,
    sheets,
  });
  params.current = {
    pw,
    ph,
    bend,
    gloss,
    floatCfg,
    enterCfg,
    cam,
    light,
    size,
    shadow,
    hoverColor,
    sheets,
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();
    const start = last;
    const L = live.current;
    L.enter = null;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!L.visible) return;
      const P = params.current;
      const reduced = reduce.matches;
      const count = P.sheets.length;

      // Camera: orbit with damping, then project the scene with a CSS perspective that matches
      // a three.js camera (fov, zoom) at the camera's distance.
      L.azimuth += L.dAz * 0.05;
      L.polar += L.dPol * 0.05;
      L.dAz *= 0.95;
      L.dPol *= 0.95;
      L.polar = Math.min(Math.PI - 1e-3, Math.max(1e-3, L.polar));
      const distance = Math.hypot(P.cam.position.x, P.cam.position.y, P.cam.position.z);

      // Entrance spring (omega 6·speed, zeta 0.85, or 0.6 for "drop").
      const enterType = reduced ? "none" : P.enterCfg.type;
      const cfg = enterType === "none" ? null : ENTER[enterType];
      let ePos: Vec3 = [0, 0, 0];
      let eRot: Vec3 = [0, 0, 0];
      let eScale = 1;
      let fovMul = 1;
      if (cfg) {
        if (!L.enter) {
          const initial = [
            ...(cfg.pos ?? [0, 0, 0]),
            ...(cfg.rot ?? [0, 0, 0]),
            cfg.scale ?? 1,
            cfg.fov ?? 1,
          ];
          L.enter = { t: 0, ch: initial.map((v) => ({ v, vel: 0 })) };
        }
        L.enter.t += dt;
        if (L.enter.t >= P.enterCfg.delay) {
          const targets = [0, 0, 0, 0, 0, 0, 1, 1];
          L.enter.ch.forEach((c, i) =>
            springStep(
              c,
              targets[i] ?? 0,
              6 * Math.max(0.1, P.enterCfg.speed),
              cfg.bounce ? 0.6 : 0.85,
              dt,
            ),
          );
        }
        const c = (i: number) => L.enter?.ch[i]?.v ?? 0;
        ePos = [c(0), c(1), c(2)];
        eRot = [c(3), c(4), c(5)];
        eScale = c(6);
        fovMul = c(7);
      }
      const fov = (P.cam.fov * fovMul * Math.PI) / 180;
      const focal = (P.size.h / 2 / Math.tan(fov / 2)) * P.cam.zoom;
      const k = focal / distance; // CSS px per scene unit at the target
      const elevation = Math.PI / 2 - L.polar;

      // Float (drei Float): rotation and bob on a (t/4)·speed clock.
      const fc = P.floatCfg;
      const t = ((now - start) / 1000 / 4) * (fc.enabled && !reduced ? fc.speed : 0);
      const ri = fc.enabled && !reduced ? fc.rotationIntensity : 0;
      const fRot: Vec3 = [(Math.cos(t) / 8) * ri, (Math.sin(t) / 8) * ri, (Math.sin(t) / 20) * ri];
      const fY = fc.enabled && !reduced ? (Math.sin(t) / 10) * fc.intensity : 0;

      if (sceneRef.current) {
        sceneRef.current.style.perspective = `${focal}px`;
      }
      // The orbit target sits on the CSS z = 0 plane, so the camera reduces to two rotations.
      const view = `rotateX(${-elevation}rad) rotateY(${-L.azimuth}rad)`;
      // three.js is y-up, CSS y-down: x and z rotations flip sign, y translations flip sign.
      const enterT = `translate3d(${ePos[0] * k}px, ${-ePos[1] * k}px, ${ePos[2] * k}px) rotateX(${-eRot[0]}rad) rotateY(${eRot[1]}rad) rotateZ(${-eRot[2]}rad) scale3d(${eScale}, ${eScale}, ${eScale})`;
      if (floatRef.current) {
        floatRef.current.style.transform = `${view} ${enterT} rotateX(${-BOOK_TILT}rad) translateY(${-fY * k}px) rotateX(${-fRot[0]}rad) rotateY(${fRot[1]}rad) rotateZ(${-fRot[2]}rad) rotateY(-90deg)`;
      }
      if (shadowRef.current) {
        shadowRef.current.style.transform = `${view} translate3d(${-0.15 * k}px, ${1.5 * k}px, ${-0.4 * k}px) rotateX(90deg)`;
        shadowRef.current.style.opacity = P.shadow ? String(0.2 * (1 - fY * 1.5)) : "0";
      }

      const viewDir: Vec3 = [
        Math.sin(L.polar) * Math.sin(L.azimuth),
        Math.cos(L.polar),
        Math.sin(L.polar) * Math.cos(L.azimuth),
      ];
      const ambient = 0.35 + 0.5 * P.light.baseIntensity;
      const lightK = P.light.lightsIntensity;
      const bonesUsed = Math.min(SEGMENTS + 1, 10 + Math.round(P.bend));

      for (let n = 0; n < count; n++) {
        const refs = sheetRefs.current[n];
        if (!refs?.root) continue;
        const opened = L.delayedPage > n;
        const closed = L.delayedPage === 0 || L.delayedPage === count;
        if (L.lastOpened[n] === undefined) {
          L.lastOpened[n] = opened;
          L.turnedAt[n] = -Infinity;
        }
        if (L.lastOpened[n] !== opened) {
          L.turnedAt[n] = now;
          L.lastOpened[n] = opened;
        }
        const turnedAt = L.turnedAt[n] ?? -Infinity;
        const turning = Math.sin((Math.min(TURN_MS, now - turnedAt) / TURN_MS) * Math.PI);
        let target = opened ? -Math.PI / 2 : Math.PI / 2;
        if (!closed) target += (n * 0.8 * Math.PI) / 180; // pages fan out slightly
        const bones = (L.bones[n] ??= Array.from({ length: SEGMENTS + 1 }, (_, i) => ({
          y: { v: i === 0 ? target : 0, vel: 0 },
          x: { v: 0, vel: 0 },
        })));
        const root = bones[0];
        if (!root) continue;
        for (let i = 0; i < bonesUsed; i++) {
          const bone = bones[i];
          if (!bone) continue;
          const inside = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
          const outside = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
          const turnI = Math.sin((i * Math.PI) / (SEGMENTS + 1)) * turning;
          let angle =
            INSIDE_CURVE * inside * target -
            OUTSIDE_CURVE * outside * target +
            TURNING_CURVE * turnI * target;
          let fold = (Math.sign(target) * 2 * Math.PI) / 180;
          if (closed) {
            angle = i === 0 ? target : 0;
            fold = 0;
          }
          damp(bone.y, angle, SMOOTH_TIME, dt);
          const foldI = i > 8 ? Math.sin((i * Math.PI) / (SEGMENTS + 1) - 0.5) * turning : 0;
          damp(bone.x, fold * foldI, SMOOTH_TIME_FOLD, dt);
        }

        const z = (-n * PAGE_DEPTH + L.delayedPage * PAGE_DEPTH) * k;
        // three.js Euler XYZ is CSS "rotateX rotateY"; the stacking offset lives in the sheet's
        // own (rotated) frame, so open pages stack the other way round.
        refs.root.style.transform = `rotateX(${-root.x.v}rad) rotateY(${root.y.v}rad) translateZ(${z}px)`;

        // Hover tint eases in/out (lerp 0.1 per frame).
        const hoverGoal = L.hovered === n ? HOVER_INTENSITY : 0;
        L.hover[n] = (L.hover[n] ?? 0) + (hoverGoal - (L.hover[n] ?? 0)) * 0.1;

        let cumulative = root.y.v;
        const sheetData = P.sheets[n];
        if (!sheetData) continue;
        for (let s = 0; s < SEGMENTS; s++) {
          const seg = refs.segs[s];
          // Segment s follows bone s (bone 0 is the root and never rotates itself).
          const a = s === 0 ? 0 : (bones[s]?.y.v ?? 0);
          const f = s === 0 ? 0 : (bones[s]?.x.v ?? 0);
          if (s > 0) cumulative += a;
          if (seg) seg.style.transform = `rotateX(${-f}rad) rotateY(${a}rad)`;

          // Lighting: the segment's front normal in world space.
          let normal: Vec3 = rotY([0, 0, 1], cumulative - Math.PI / 2);
          normal = euler(normal, fRot);
          normal = rotX(normal, BOOK_TILT);
          normal = euler(normal, eRot);
          for (const side of SIDES) {
            const nrm: Vec3 = side === 0 ? normal : [-normal[0], -normal[1], -normal[2]];
            const facing = dot(nrm, viewDir);
            const face = side === 0 ? sheetData.front.page : sheetData.back.page;
            const g = (face?.gloss ?? P.gloss) / 100;
            const diffuse = Math.max(0, dot(nrm, KEY_LIGHT)) * 0.55 * lightK;
            const brightness = Math.min(1, ambient + diffuse) * (0.8 + 0.2 * Math.max(0, facing));
            // Gloss: highlight where the top light reflects towards the camera.
            const h = norm([
              TOP_LIGHT[0] + viewDir[0],
              TOP_LIGHT[1] + viewDir[1],
              TOP_LIGHT[2] + viewDir[2],
            ]);
            const spec = Math.pow(Math.max(0, dot(nrm, h)), 6 + g * 40) * g * 0.55 * lightK;
            const shadeEl = refs.shade[side][s];
            const shineEl = refs.shine[side][s];
            if (shadeEl) shadeEl.style.opacity = (1 - brightness).toFixed(3);
            if (shineEl) {
              const hv = L.hover[n] ?? 0;
              shineEl.style.opacity = "1";
              shineEl.style.background = `linear-gradient(rgba(255,255,255,${spec.toFixed(3)}), rgba(255,255,255,${spec.toFixed(3)})), ${hexToRgba(P.hoverColor, hv)}`;
            }
          }
        }

        // Paint visible video faces.
        for (const side of SIDES) {
          const face = side === 0 ? sheetData.front.page : sheetData.back.page;
          if (face?.type !== "video") continue;
          const v = videos.current.get(`${n}:${side}`);
          if (!v) continue;
          const shown = side === 0 ? L.delayedPage === n : L.delayedPage === n + 1;
          if (shown && v.paused) v.play().catch(() => {});
          if (!shown && !v.paused) v.pause();
          if (v.readyState < 2 || !v.videoWidth) continue;
          const canvases = refs.canvases[side];
          for (let s = 0; s < SEGMENTS; s++) {
            const c = canvases[s];
            const ctx = c?.getContext("2d");
            if (!c || !ctx) continue;
            const idx = side === 0 ? s : SEGMENTS - 1 - s;
            const sw = v.videoWidth / SEGMENTS;
            ctx.drawImage(v, idx * sw, 0, sw, v.videoHeight, 0, 0, c.width, c.height);
          }
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const k0 =
    ((size.h / 2 / Math.tan((cam.fov * Math.PI) / 180 / 2)) * cam.zoom) /
    Math.hypot(cam.position.x, cam.position.y, cam.position.z);
  const W = pw * k0;
  const H = ph * k0;
  const segPx = W / SEGMENTS;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      setPage((p) => Math.min(maxPage, p + 1));
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      setPage((p) => Math.max(0, p - 1));
    } else if (e.key === "Home") setPage(0);
    else if (e.key === "End") setPage(maxPage);
  };

  const renderSegments = (sheetIndex: number, sheet: SheetData, s: number): React.ReactNode => {
    if (s >= SEGMENTS) return null;
    const refs = (sheetRefs.current[sheetIndex] ??= emptyRefs());
    return (
      <div
        ref={(el) => {
          refs.segs[s] = el;
        }}
        style={{
          position: "absolute",
          top: 0,
          left: s === 0 ? 0 : segPx,
          width: segPx,
          height: H,
          transformStyle: "preserve-3d",
          transformOrigin: "0 50%",
        }}
      >
        {SIDES.map((side) => (
          <FaceSlice
            key={side}
            page={side === 0 ? sheet.front.page : sheet.back.page}
            index={s}
            back={side === 1}
            width={W}
            height={H}
            fit={fitMedia}
            shadeRef={(el) => {
              refs.shade[side][s] = el;
            }}
            shineRef={(el) => {
              refs.shine[side][s] = el;
            }}
            canvasRef={(el) => {
              refs.canvases[side][s] = el;
            }}
          />
        ))}
        {renderSegments(sheetIndex, sheet, s + 1)}
      </div>
    );
  };

  const pageLabel =
    page === 0
      ? "closed, front cover"
      : page === maxPage
        ? "closed, back cover"
        : `spread ${page} of ${maxPage - 1}`;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="magazine"
      aria-label={`Magazine, ${pageLabel}. Use the arrow keys to turn pages.`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
      onPointerLeave={() => setHovered(-1)}
      className={cn(
        "relative select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-black/40",
        className,
      )}
      style={{
        width: 1200,
        height: 800,
        touchAction: "none",
        cursor: orbit ? "grab" : undefined,
        ...style,
      }}
      {...rest}
    >
      <div ref={sceneRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {/* Contact shadow on a floor 1.5 units below the magazine. */}
        <div
          ref={shadowRef}
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -W * 1.25,
              top: -H * 0.9,
              width: W * 2.5,
              height: H * 1.8,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(0,0,0,1), rgba(0,0,0,0.45) 55%, rgba(0,0,0,0))",
              filter: "blur(18px)",
            }}
          />
        </div>
        <div
          ref={floatRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
          }}
        >
          {sheets.map((sheet, n) => {
            const front = sheet.front.page;
            const back = sheet.back.page;
            return (
              <div
                key={n}
                ref={(el) => {
                  (sheetRefs.current[n] ??= emptyRefs()).root = el;
                }}
                data-sheet={n}
                aria-label={(delayedPage > n ? back?.alt : front?.alt) || undefined}
                style={{
                  position: "absolute",
                  left: 0,
                  top: -H / 2,
                  width: 0,
                  height: H,
                  transformStyle: "preserve-3d",
                  cursor: "pointer",
                }}
              >
                {renderSegments(n, sheet, 0)}
              </div>
            );
          })}
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {pageLabel}
      </span>
    </div>
  );
}

function hexToRgba(color: string, alpha: number) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(color.trim());
  if (!m) {
    const mixed = `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
    return `linear-gradient(${mixed}, ${mixed})`;
  }
  let hex = m[1] ?? "000";
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  const n = parseInt(hex, 16);
  const rgba = `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(3)})`;
  return `linear-gradient(${rgba}, ${rgba})`;
}

export default ThreeDMagazine;
