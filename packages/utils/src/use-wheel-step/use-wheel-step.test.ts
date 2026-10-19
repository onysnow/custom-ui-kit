// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { WheelEvent } from "react";
import { useWheelStep } from "./use-wheel-step";

const wheel = (deltaY: number, deltaMode: number) =>
  ({ deltaY, deltaMode }) as unknown as WheelEvent;

function setup() {
  const setIndex = vi.fn();
  const { result } = renderHook(() => useWheelStep(5, 2, setIndex));
  act(() => result.current.onPointerEnter());
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 1000); // past the dwell
  return { result, setIndex };
}

afterEach(() => vi.restoreAllMocks());

describe("useWheelStep", () => {
  it("takes no wheel until the pointer has rested", () => {
    const setIndex = vi.fn();
    const { result } = renderHook(() => useWheelStep(5, 2, setIndex));
    act(() => result.current.onPointerEnter());
    act(() => result.current.onWheel(wheel(500, 0)));
    expect(setIndex).not.toHaveBeenCalled();
  });

  it("steps after 60 pixels in pixel mode", () => {
    const { result, setIndex } = setup();
    act(() => result.current.onWheel(wheel(30, 0)));
    expect(setIndex).not.toHaveBeenCalled();
    act(() => result.current.onWheel(wheel(40, 0)));
    expect(setIndex).toHaveBeenCalledWith(3);
  });

  it("steps on a few lines in line mode, not a hundred turns", () => {
    const { result, setIndex } = setup();
    act(() => result.current.onWheel(wheel(4, 1)));
    expect(setIndex).toHaveBeenCalledWith(3);
  });

  it("steps once on one page in page mode, and up for a negative page", () => {
    const { result, setIndex } = setup();
    act(() => result.current.onWheel(wheel(-1, 2)));
    expect(setIndex).toHaveBeenCalledWith(1);
  });

  it("does nothing at the ends", () => {
    const setIndex = vi.fn();
    const { result } = renderHook(() => useWheelStep(3, 2, setIndex));
    act(() => result.current.onPointerEnter());
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 1000);
    act(() => result.current.onWheel(wheel(100, 0)));
    expect(setIndex).not.toHaveBeenCalled();
  });
});
