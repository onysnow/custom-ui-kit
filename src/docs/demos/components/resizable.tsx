import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@onysnow/ui/resizable";

export default function ResizableDemo() {
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
