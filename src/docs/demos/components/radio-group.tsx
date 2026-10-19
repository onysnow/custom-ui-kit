import { Label } from "@onysnow/ui/label";
import { RadioGroup, RadioGroupItem } from "@onysnow/ui/radio-group";

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="frosted">
      {[
        ["frosted", "Frosted float"],
        ["crown", "Optical crown"],
        ["flint", "Dense flint"],
      ].map(([value, label]) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value!} id={`glass-${value}`} />
          <Label htmlFor={`glass-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}
