import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { applyTuning, tuning } from "@onysnow/fx/core/tuning";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@onysnow/ui/select";
import { Slider } from "@onysnow/ui/slider";

/**
 * One of the effect system's tuning knobs, as a control. Every number in the glass, light and water models is a knob
 * (see `@onysnow/fx/core/tuning`); this writes one and lets the effects pick it up on their next frame.
 */
export function Knob({ k }: { k: string }) {
  const knob = tuning[k];
  const [value, setValue] = useState(knob?.value ?? 0);
  const [initial] = useState(knob?.value ?? 0);
  useEffect(() => {
    if (knob) knob.value = value;
    applyTuning();
  }, [knob, value]);
  if (!knob) return null;
  const id = `knob-${k}`;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {knob.label}
        </label>
        <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          {knob.options ? knob.options[value - knob.min] : value}
          {value !== initial && (
            <button
              type="button"
              aria-label={`Reset ${knob.label}`}
              onClick={() => setValue(initial)}
              className="hover:text-foreground"
            >
              <RotateCcw className="size-3" />
            </button>
          )}
        </span>
      </div>
      {knob.options ? (
        <Select value={String(value)} onValueChange={(v) => setValue(Number(v))}>
          <SelectTrigger id={id} className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {knob.options.map((label, i) => (
              <SelectItem key={label} value={String(knob.min + i)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Slider
          id={id}
          aria-label={knob.label}
          min={knob.min}
          max={knob.max}
          step={knob.step}
          value={[value]}
          onValueChange={([v]) => setValue(v ?? value)}
        />
      )}
      {knob.hint && <p className="text-xs leading-relaxed text-muted-foreground">{knob.hint}</p>}
    </div>
  );
}

export function KnobGrid({ keys }: { keys: string[] }) {
  return (
    <div className="grid w-full gap-x-8 gap-y-6 sm:grid-cols-2">
      {keys.map((k) => (
        <Knob key={k} k={k} />
      ))}
    </div>
  );
}
