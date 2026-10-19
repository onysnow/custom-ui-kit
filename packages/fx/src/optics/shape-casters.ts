/**
 * Casters that are shapes rather than page elements (effects/optics/casters):
 * things standing in the light at their own height above the photograph --
 * a balloon floating in the room -- given as an outline, placed by centre,
 * size and turn in viewport CSS px. The floor works their shadows out like
 * any other caster's: projected from the lamp, magnified by H / (H - h),
 * softened by the lamp's size over that height, coloured by what a
 * translucent one lets through.
 *
 * Outlines are drawn in a 100 x 100 box centred on (50, 50).
 */

export type ShapeCaster = {
  readonly id: string;
  /** Its outline, in a 100 x 100 box; holes by the even-odd rule. */
  path: Path2D;
  /** Its centre, viewport CSS px. */
  x: number;
  y: number;
  /** How wide the 100-unit box is drawn, CSS px. */
  size: number;
  /** Its turn, radians. */
  angle: number;
  /** Mirrored left to right. */
  flip?: boolean;
  /** How high above the photograph it stands, CSS px. */
  height: number;
  /** What light it lets through where it covers: 0 for opaque, its colour for a coloured, see-through one. */
  tint: [number, number, number];
};

const shapes = new Set<ShapeCaster>();

/** Add a shape caster (returns the removal). */
export function addShapeCaster(s: ShapeCaster): () => void {
  shapes.add(s);
  return () => {
    shapes.delete(s);
  };
}

/** The shape casters now. */
export function shapeCasterList(): readonly ShapeCaster[] {
  return [...shapes];
}

/** How much larger the shadow of something at height h is than the thing, lamp at height H. */
export function magnification(h: number, H: number): number {
  return H / Math.max(H - h, 1e-3);
}

/** Where the shadow of a point at (x, y), height h, lands on the photograph: projected from the lamp at (lx, ly), height H. */
export function shadowOf(
  x: number,
  y: number,
  h: number,
  lx: number,
  ly: number,
  H: number,
): [number, number] {
  const k = magnification(h, H);
  return [lx + (x - lx) * k, ly + (y - ly) * k];
}

/** A point in any 2D space. */
type Pt = { x: number; y: number };

/**
 * A polygon as the 100 x 100 box a shape caster is drawn in: centred on (50, 50), `side` px across. Returns the
 * points; build a Path2D from them (`moveTo` the first, `lineTo` the rest, close).
 */
export function polygonInBox(poly: readonly Pt[], centre: Pt, side: number): [number, number][] {
  const s = Math.max(side, 1);
  return poly.map((p) => [((p.x - centre.x) / s) * 100 + 50, ((p.y - centre.y) / s) * 100 + 50]);
}

/**
 * One thread of silk (or any thin line) as a quad `width` px wide, in the same units as its end points. Null for a
 * thread too short to cast anything.
 */
export function threadQuad(
  a: Pt,
  b: Pt,
  width: number,
): [[number, number], [number, number], [number, number], [number, number]] | null {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  if (len < 0.5) return null;
  const half = width / 2;
  const nx = (-(b.y - a.y) / len) * half;
  const ny = ((b.x - a.x) / len) * half;
  return [
    [a.x + nx, a.y + ny],
    [b.x + nx, b.y + ny],
    [b.x - nx, b.y - ny],
    [a.x - nx, a.y - ny],
  ];
}
