// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { onScreen, typingInto } from "./on-screen";

describe("onScreen and typingInto", () => {
  it("is false inside anything hidden and once removed from the page", () => {
    document.body.innerHTML =
      '<div id="stage"><section id="tab"><p id="inner"></p></section></div>';
    const inner = document.getElementById("inner");
    expect(onScreen(inner)).toBe(true);
    document.getElementById("tab")!.hidden = true;
    expect(onScreen(inner)).toBe(false);
    document.getElementById("tab")!.hidden = false;
    document.getElementById("stage")!.hidden = true;
    expect(onScreen(inner)).toBe(false);
    expect(onScreen(document.createElement("p"))).toBe(false);
    expect(onScreen(null)).toBe(false);
  });

  it("knows fields, list boxes and rich text", () => {
    document.body.innerHTML =
      '<input id="i"><select id="s"></select><div contenteditable="true"><b id="r">x</b></div><button id="b"></button>';
    for (const id of ["i", "s", "r"]) expect(typingInto(document.getElementById(id))).toBe(true);
    expect(typingInto(document.getElementById("b"))).toBe(false);
    expect(typingInto(null)).toBe(false);
  });
});
