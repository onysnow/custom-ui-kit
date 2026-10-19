import { Button } from "@onysnow/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@onysnow/ui/dialog";
import { Input } from "@onysnow/ui/input";

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Rename scene</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename scene</DialogTitle>
          <DialogDescription>Pick a name you will recognise later.</DialogDescription>
        </DialogHeader>
        <Input defaultValue="Night shoot" aria-label="Scene name" />
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
