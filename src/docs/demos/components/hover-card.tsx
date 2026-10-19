import { Button } from "@onysnow/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@onysnow/ui/hover-card";

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@onysnow</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-sm">
        <p className="font-medium">Onysnow</p>
        <p className="text-muted-foreground">Components with real light.</p>
      </HoverCardContent>
    </HoverCard>
  );
}
