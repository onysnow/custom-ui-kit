import { Button } from "@onysnow/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@onysnow/ui/sheet";

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Scene</SheetTitle>
          <SheetDescription>Docked to the right edge.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
