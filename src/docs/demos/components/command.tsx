import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@onysnow/ui/command";

export default function CommandDemo() {
  return (
    <Command className="max-w-sm rounded-xl border border-border">
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Scene">
          <CommandItem>Add lamp</CommandItem>
          <CommandItem>Add pane</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem>Rain Noir</CommandItem>
          <CommandItem>Archive</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
