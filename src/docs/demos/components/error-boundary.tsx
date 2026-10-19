import { useState } from "react";
import { Button } from "@onysnow/ui/button";
import { ErrorBoundary } from "@onysnow/ui/error-boundary";

function Flaky({ broken }: { broken: boolean }) {
  if (broken) throw new Error("The timeline could not read its data");
  return <p className="text-sm text-muted-foreground">The timeline is fine.</p>;
}

export default function ErrorBoundaryDemo() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="w-full max-w-md space-y-3">
      <ErrorBoundary key={String(broken)} name="Timeline">
        <Flaky broken={broken} />
      </ErrorBoundary>
      <Button variant="outline" size="sm" onClick={() => setBroken((b) => !b)}>
        {broken ? "Repair it" : "Break it"}
      </Button>
    </div>
  );
}
