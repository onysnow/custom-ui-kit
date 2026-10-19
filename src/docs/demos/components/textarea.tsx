import { Label } from "@onysnow/ui/label";
import { Textarea } from "@onysnow/ui/textarea";

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="msg">Message</Label>
      <Textarea id="msg" placeholder="Tell us about the room…" />
    </div>
  );
}
