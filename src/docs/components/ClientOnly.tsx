import { useEffect, useState, type ReactNode } from "react";

/** Renders its children only after hydration. For widgets whose server markup cannot match the client (Radix Slider). */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <>{ready ? children : fallback}</>;
}
