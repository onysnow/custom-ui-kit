import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@onysnow/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@onysnow/ui/command";
import { NAV } from "../nav";

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 justify-between gap-2 border-border bg-card/40 text-muted-foreground sm:flex"
        aria-label="Search documentation"
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" /> Search docs
        </span>
        <kbd className="rounded border border-border px-1.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
      >
        <Search className="size-5" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search components, effects and guides…" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          {NAV.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.to + (item.params?.["slug"] ?? "")}
                  value={`${section.title} ${item.title}`}
                  onSelect={() => {
                    setOpen(false);
                    void navigate({
                      to: item.to,
                      ...(item.params ? { params: item.params } : {}),
                    } as never);
                  }}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
