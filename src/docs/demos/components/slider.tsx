import { useState } from "react";
import { Slider } from "@onysnow/ui/slider";

export default function SliderDemo() {
  const [value, setValue] = useState([40]);
  return (
    <div className="w-full max-w-sm space-y-3">
      <Slider value={value} onValueChange={setValue} max={100} step={1} aria-label="Volume" />
      <p className="text-sm text-muted-foreground">Value: {value[0]}</p>
    </div>
  );
}
