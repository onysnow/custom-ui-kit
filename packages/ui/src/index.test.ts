import { describe, expect, it } from "vitest";
import * as ui from "./index";

describe("the public surface", () => {
  it("exports every component through the barrel", () => {
    for (const name of ["Button", "Card", "Dialog", "Tabs", "Input", "Select", "Tooltip"]) {
      expect(ui[name as keyof typeof ui], name).toBeDefined();
    }
  });
});
