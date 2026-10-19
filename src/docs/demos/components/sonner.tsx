import { toast } from "sonner";
import { Button } from "@onysnow/ui/button";

// Mount <Toaster /> from "@onysnow/ui/sonner" once, near the root of your app.
export default function ToastDemo() {
  return (
    <Button
      variant="outline"
      onClick={() => toast("Theme kept", { description: "Rain Noir will be here next time." })}
    >
      Show toast
    </Button>
  );
}
