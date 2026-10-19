import { Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@onysnow/ui/alert";

export default function AlertDemo() {
  return (
    <div className="w-full max-w-lg space-y-3">
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>
          Effects run after the page is idle so it stays responsive.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <TriangleAlert className="size-4" />
        <AlertTitle>No WebGL</AlertTitle>
        <AlertDescription>The glass falls back to its CSS surface.</AlertDescription>
      </Alert>
    </div>
  );
}
