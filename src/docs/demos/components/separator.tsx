import { Separator } from "@onysnow/ui/separator";

export default function SeparatorDemo() {
  return (
    <div className="max-w-xs space-y-3 text-sm">
      <p className="font-medium">Onysnow UI</p>
      <Separator />
      <div className="flex h-5 items-center gap-3">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Components</span>
        <Separator orientation="vertical" />
        <span>Effects</span>
      </div>
    </div>
  );
}
