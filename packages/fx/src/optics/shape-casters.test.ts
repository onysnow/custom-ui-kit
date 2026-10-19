import { describe, expect, it } from "vitest";
import {
  addShapeCaster,
  magnification,
  polygonInBox,
  shadowOf,
  shapeCasterList,
  threadQuad,
  type ShapeCaster,
} from "./shape-casters";

const caster = (id: string): ShapeCaster => ({
  id,
  path: {} as Path2D,
  x: 0,
  y: 0,
  size: 100,
  angle: 0,
  height: 10,
  tint: [0, 0, 0],
});

describe("shape casters", () => {
  it("are listed while added and gone once removed (the shadow of whatever registered them goes with it)", () => {
    const a = caster("a");
    const remove = addShapeCaster(a);
    expect(shapeCasterList()).toContain(a);
    remove();
    expect(shapeCasterList()).not.toContain(a);
  });

  it("magnify a shadow by H / (H - h) and project it from the lamp", () => {
    expect(magnification(0, 300)).toBe(1);
    expect(magnification(150, 300)).toBe(2);
    expect(shadowOf(110, 100, 150, 100, 100, 300)).toEqual([120, 100]);
  });
});

describe("polygonInBox", () => {
  it("centres a polygon on (50, 50) at 100 units across", () => {
    const square = [
      { x: 10, y: 10 },
      { x: 30, y: 10 },
      { x: 30, y: 30 },
      { x: 10, y: 30 },
    ];
    expect(polygonInBox(square, { x: 20, y: 20 }, 20)).toEqual([
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ]);
  });
});

describe("threadQuad", () => {
  it("is a quad of the given width along the thread", () => {
    const q = threadQuad({ x: 0, y: 0 }, { x: 10, y: 0 }, 2)!;
    expect(q).toEqual([
      [0, 1],
      [10, 1],
      [10, -1],
      [0, -1],
    ]);
  });

  it("is null for a thread too short to cast anything", () => {
    expect(threadQuad({ x: 0, y: 0 }, { x: 0.2, y: 0 }, 2)).toBeNull();
  });
});
