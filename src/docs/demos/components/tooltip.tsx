import { Button } from "@onysnow/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@onysnow/ui/tooltip";

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover or focus me</Button>
        </TooltipTrigger>
        <TooltipContent>Press and hold to light the lamp</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
