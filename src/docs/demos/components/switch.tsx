import { Label } from "@onysnow/ui/label";
import { Switch } from "@onysnow/ui/switch";

export default function SwitchDemo() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="shadows" defaultChecked />
      <Label htmlFor="shadows">Cast shadows</Label>
    </div>
  );
}
