import { Input } from "@onysnow/ui/input";
import { Label } from "@onysnow/ui/label";

export default function LabelDemo() {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor="name">Your name</Label>
      <Input id="name" placeholder="Ada Lovelace" />
    </div>
  );
}
