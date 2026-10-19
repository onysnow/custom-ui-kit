import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@onysnow/ui/resizable";

export default function ResizableDemo() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-6">
      <Horizontal />
      <Vertical />
    </div>
  );
}

function Vertical() {
  return (
    // The group fills its parent (react-resizable-panels sizes it to 100%), so the parent carries the size.
    <div className="h-48 w-48">
      <ResizablePanelGroup orientation="vertical" className="rounded-xl border border-border">
        <ResizablePanel defaultSize="30%">
          <div className="grid h-full place-items-center text-sm">Header</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="70%">
          <div className="grid h-full place-items-center text-sm">Body</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function Horizontal() {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="max-w-md rounded-xl border border-border"
    >
      <ResizablePanel defaultSize="40%">
        <div className="grid h-32 place-items-center text-sm">Sidebar</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="60%">
        <div className="grid h-32 place-items-center text-sm">Content</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
