import { useMemo } from "react";

// A night street seen through wet glass, reduced to what the glass needs behind it: dark ground and soft coloured
// lights at different depths. Seeded, so the server and the client draw the same lights.
function lights(seed: number, count: number) {
  let s = seed;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rnd() * 100,
    y: 8 + rnd() * 84,
    r: 38 + rnd() * 130,
    hue: rnd() < 0.62 ? "amber" : rnd() < 0.7 ? "teal" : "cream",
    o: 0.1 + rnd() * 0.32,
    d: 40 + rnd() * 60,
  }));
}

const COLOUR = {
  amber: "oklch(0.78 0.16 65)",
  teal: "oklch(0.74 0.11 190)",
  cream: "oklch(0.93 0.03 85)",
} as const;

/** The fixed scene behind every page: what the glass bends, blurs and reflects. */
export function Backdrop() {
  const items = useMemo(() => lights(7, 46), []);
  return (
    <div aria-hidden className="docs-backdrop">
      <div className="docs-backdrop__sky" />
      {items.map((l) => (
        <span
          key={l.id}
          className="docs-backdrop__light"
          style={{
            left: `${l.x}%`,
            top: `${l.y}%`,
            width: l.r,
            height: l.r,
            background: `radial-gradient(circle, ${COLOUR[l.hue as keyof typeof COLOUR]} 0%, transparent 68%)`,
            opacity: l.o,
            animationDuration: `${l.d}s`,
          }}
        />
      ))}
      <div className="docs-backdrop__grain" />
    </div>
  );
}
