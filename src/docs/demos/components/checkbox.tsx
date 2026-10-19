import { Checkbox } from "@onysnow/ui/checkbox";
import { Label } from "@onysnow/ui/label";

export default function CheckboxDemo() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox id="terms" defaultChecked />
        <Label htmlFor="terms">Accept the terms</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="news" />
        <Label htmlFor="news">Send me the newsletter</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="off" disabled />
        <Label htmlFor="off">Disabled</Label>
      </div>
    </div>
  );
}
