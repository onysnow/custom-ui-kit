import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DocsSidebar } from "../docs/components/DocsSidebar";

export const Route = createFileRoute("/docs")({ component: DocsLayout });

function DocsLayout() {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl gap-8 px-5 sm:px-8">
      <DocsSidebar />
      <div className="min-w-0 flex-1 py-10">
        <Outlet />
      </div>
    </div>
  );
}
