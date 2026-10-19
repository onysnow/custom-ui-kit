import { BokehField } from "@onysnow/fx/react/BokehField";
import { Pane } from "@onysnow/fx/react/Pane";
import { KnobGrid } from "../../components/Knob";

// The lights are drawn sharp. The pane's backdrop blur spreads them into soft discs, which is what a lens does to a
// highlight outside the focal plane, so the bokeh follows from the glass rather than imitating it.
export default function BokehDemo() {
  return (
    <div className="w-full space-y-6">
      <div className="relative isolate h-64 w-full overflow-hidden rounded-xl border border-border bg-[var(--ground)]">
        <BokehField />
        <Pane className="absolute inset-x-12 inset-y-10">
          <div className="grid h-full place-items-center p-6 text-center font-display text-3xl font-light">
            Out of focus
          </div>
        </Pane>
      </div>
      <KnobGrid keys={["bokeh", "apertureBlades", "vignetting"]} />
    </div>
  );
}
