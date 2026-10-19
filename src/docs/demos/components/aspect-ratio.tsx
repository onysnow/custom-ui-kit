import { AspectRatio } from "@onysnow/ui/aspect-ratio";

export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio
        ratio={16 / 9}
        className="overflow-hidden rounded-xl bg-gradient-to-br from-primary/40 to-secondary"
      >
        <div className="grid size-full place-items-center text-sm text-foreground/80">16 : 9</div>
      </AspectRatio>
    </div>
  );
}
