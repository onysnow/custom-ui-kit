import { CloudRain } from "lucide-react";
import { Pane } from "@onysnow/fx/react/Pane";
import { Button } from "@onysnow/ui/button";
import { Stage } from "../../components/Stage";
import { KnobGrid } from "../../components/Knob";
import { setEffectsLevel, useEffectsLevel } from "../../effects-level";

// <WaterDrops /> is one fixed canvas that finds every Pane on the page. Mount it once (FxStage does, with `rain`).
export default function RainDemo() {
  const level = useEffectsLevel();
  return (
    <div className="w-full space-y-6">
      <Stage className="h-72">
        <Pane className="absolute inset-x-10 inset-y-8">
          <div className="flex h-full flex-col justify-end p-7">
            <p className="font-display text-2xl font-light">Wet glass</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {level === "full"
                ? "Drops are running."
                : "Rain is off. Turn it on to watch the drops form and run."}
            </p>
          </div>
        </Pane>
      </Stage>
      {level !== "full" && (
        <Button onClick={() => setEffectsLevel("full")} className="gap-2">
          <CloudRain className="size-4" /> Turn rain on
        </Button>
      )}
      <KnobGrid keys={["rainStrength", "windSpeed", "rainType", "windGusts"]} />
    </div>
  );
}
