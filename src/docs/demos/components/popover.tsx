import { Button } from "@onysnow/ui/button";
import { Input } from "@onysnow/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@onysnow/ui/popover";

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Lamp colour</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2">
        <p className="text-sm font-medium">Temperature (K)</p>
        <Input type="number" defaultValue={3200} aria-label="Kelvin" />
      </PopoverContent>
    </Popover>
  );
}
