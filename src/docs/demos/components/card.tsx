import { Button } from "@onysnow/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@onysnow/ui/card";

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Night shoot</CardTitle>
        <CardDescription>Three lamps, one window, light rain.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Everything is lit from the same scene.</p>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost">Cancel</Button>
        <Button>Open</Button>
      </CardFooter>
    </Card>
  );
}
