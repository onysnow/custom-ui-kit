import { useEffect, useState } from "react";
import { Progress } from "@onysnow/ui/progress";

export default function ProgressDemo() {
  const [value, setValue] = useState(13);
  useEffect(() => {
    const id = setTimeout(() => setValue(72), 400);
    return () => clearTimeout(id);
  }, []);
  return <Progress value={value} className="w-full max-w-sm" aria-label="Upload progress" />;
}
