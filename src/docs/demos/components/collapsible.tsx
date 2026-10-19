import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@onysnow/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@onysnow/ui/collapsible";

export default function CollapsibleDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">3 lights in the scene</p>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle">
            <ChevronsUpDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border border-border px-4 py-2 text-sm">Key lamp</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border border-border px-4 py-2 text-sm">Fill lamp</div>
        <div className="rounded-md border border-border px-4 py-2 text-sm">Window</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
