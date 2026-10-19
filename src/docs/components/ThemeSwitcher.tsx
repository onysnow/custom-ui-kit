import { Check, Palette } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@onysnow/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@onysnow/ui/dropdown-menu";
import { THEMES } from "@onysnow/tokens";
import { themes } from "../theme";
import { setEffectsLevel, useEffectsLevel, type EffectsLevel } from "../effects-level";

const subscribe = (fn: () => void) => themes.onAppearanceChange(fn);
const current = () => themes.currentAppearance().theme;

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, current, () => "rain-noir");
  const level = useEffectsLevel();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme and effects">
          <Palette className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onSelect={() => themes.keepAppearance({ theme: t.id })}
            className="items-start gap-3"
          >
            <span className="mt-1 flex">
              {t.swatches.slice(0, 5).map((c) => (
                <span
                  key={c}
                  className="-ml-1 size-4 rounded-full border border-black/30 first:ml-0"
                  style={{ background: c }}
                />
              ))}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{t.name}</span>
              <span className="block text-xs text-muted-foreground">
                Contrast {t.lowestContrast}
              </span>
            </span>
            {theme === t.id && <Check className="mt-1 size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Effects</DropdownMenuLabel>
        {(["full", "light", "off"] as EffectsLevel[]).map((l) => (
          <DropdownMenuItem key={l} onSelect={() => setEffectsLevel(l)} className="justify-between">
            <span>
              <span className="text-sm font-medium capitalize">{l}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {l === "full" ? "Rain and lights" : l === "light" ? "Lights, no rain" : "None"}
              </span>
            </span>
            {level === l && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
