import { Mail } from "lucide-react";
import { Button } from "@onysnow/ui/button";

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Email">
        <Mail />
      </Button>
      <Button asChild>
        <a href="#asChild">As a link</a>
      </Button>
    </div>
  );
}
