import { Bold, Italic } from "lucide-react";
import { Toggle } from "@onysnow/ui/toggle";

export default function ToggleDemo() {
  return (
    <div className="flex gap-2">
      <Toggle aria-label="Bold">
        <Bold className="size-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="Italic" defaultPressed>
        <Italic className="size-4" />
      </Toggle>
    </div>
  );
}
