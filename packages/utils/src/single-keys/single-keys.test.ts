// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createSingleKeyPreference } from "./single-keys";

beforeEach(() => window.localStorage.clear());

describe("createSingleKeyPreference", () => {
  it("is on by default, can be switched off and back, and is kept per key", () => {
    const a = createSingleKeyPreference("a:keys");
    const b = createSingleKeyPreference("b:keys");
    expect(a.on()).toBe(true);
    a.set(false);
    expect(a.on()).toBe(false);
    expect(b.on()).toBe(true);
    a.set(true);
    expect(a.on()).toBe(true);
  });
});
