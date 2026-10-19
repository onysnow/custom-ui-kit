import { useState } from "react";
import { MATERIALS, type MaterialId } from "@onysnow/fx/materials/presets";
import { Pane } from "@onysnow/fx/react/Pane";
import { Label } from "@onysnow/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@onysnow/ui/select";
import { Slider } from "@onysnow/ui/slider";
import { Stage } from "../../components/Stage";

const LABEL: Record<MaterialId, string> = {
  "frosted-float": "Frosted float",
  "optical-crown": "Optical crown",
  "dense-flint": "Dense flint",
  museum: "Museum (anti-reflection)",
  opal: "Opal",
};

// Every Pane prop is a cause: what the glass is, how thick, how wide its edge, how far it stands off what is behind it.
export default function GlassDemo() {
  const [material, setMaterial] = useState<MaterialId>("frosted-float");
  const [thickness, setThickness] = useState(18);
  const [edge, setEdge] = useState(28);
  const [gap, setGap] = useState(60);
  return (
    <div className="w-full space-y-6">
      <Stage className="h-80">
        <Pane
          material={material}
          thickness={thickness}
          edge={{ width: edge }}
          gap={gap}
          className="absolute inset-x-10 inset-y-9"
        >
          <div className="p-7">
            <p className="font-display text-2xl font-light">
              {LABEL[material]} · n {MATERIALS[material].ior}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Press and hold anywhere to wind the camera: the lamp lights where the pointer is, and
              the edge, the reflection and the light through the glass all answer.
            </p>
          </div>
        </Pane>
      </Stage>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Material</Label>
          <Select value={material} onValueChange={(v) => setMaterial(v as MaterialId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MATERIALS).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {LABEL[m.id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Control
          label={`Thickness · ${thickness} px`}
          value={thickness}
          onChange={setThickness}
          min={4}
          max={60}
        />
        <Control
          label={`Edge width · ${edge} px`}
          value={edge}
          onChange={setEdge}
          min={4}
          max={80}
        />
        <Control
          label={`Gap to what is behind · ${gap} px`}
          value={gap}
          onChange={setGap}
          min={0}
          max={160}
        />
      </div>
    </div>
  );
}

function Control({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v ?? value)}
      />
    </div>
  );
}
