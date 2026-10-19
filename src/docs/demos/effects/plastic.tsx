import { Button } from "@onysnow/ui/button";
import { Stage } from "../../components/Stage";

// `.plastic` marks a rounded surface for <PlasticBevel />, which lights its bevel from every light in the scene.
export default function PlasticDemo() {
  return (
    <Stage className="h-56">
      <div className="absolute inset-0 flex items-center justify-center gap-5">
        <Button size="lg" className="plastic">
          Orange plastic
        </Button>
        <Button size="lg" className="plastic plastic--dark">
          Dark plastic
        </Button>
      </div>
    </Stage>
  );
}
