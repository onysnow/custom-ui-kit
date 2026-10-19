import { Input } from "@onysnow/ui/input";
import { Label } from "@onysnow/ui/label";

export default function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <Input type="password" placeholder="Password" />
      <Input disabled placeholder="Disabled" />
    </div>
  );
}
