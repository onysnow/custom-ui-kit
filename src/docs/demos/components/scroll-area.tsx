import { ScrollArea } from "@onysnow/ui/scroll-area";

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-48 w-56 rounded-xl border border-border p-4">
      {Array.from({ length: 24 }, (_, i) => (
        <p key={i} className="py-1 text-sm text-muted-foreground">
          Frame {i + 1}
        </p>
      ))}
    </ScrollArea>
  );
}
