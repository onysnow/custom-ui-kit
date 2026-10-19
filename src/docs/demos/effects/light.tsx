import { Pane } from "@onysnow/fx/react/Pane";
import { Button } from "@onysnow/ui/button";
import { Stage } from "../../components/Stage";
import { KnobGrid } from "../../components/Knob";

// Press and hold anywhere on the page to wind the camera cursor: the lamp lights where the pointer is.
// Light is not decoration here: one lamp and the room's lights are shared by every surface. A pane, a button and a
// photograph all read the same scene, and each throws its shadow onto the next.
export default function LightDemo() {
  return (
    <div className="w-full space-y-6">
      <Stage className="h-80">
        <Pane className="absolute left-8 top-8 h-40 w-[46%]" thickness={22}>
          <div className="p-5 text-sm text-muted-foreground">A thick pane, lit from the lamp.</div>
        </Pane>
        <Pane className="absolute bottom-8 right-8 h-36 w-[42%]" thickness={10}>
          <div className="flex h-full items-center justify-center gap-3 p-4">
            <Button className="plastic">Plastic</Button>
            <Button className="plastic plastic--dark">Dark</Button>
          </div>
        </Pane>
      </Stage>
      <KnobGrid
        keys={[
          "shadowHeight",
          "shadowSoftness",
          "shadowStrength",
          "roomBrightness",
          "lampKelvin",
          "transmit",
        ]}
      />
    </div>
  );
}
