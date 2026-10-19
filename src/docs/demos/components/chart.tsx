import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@onysnow/ui/chart";

const data = [
  { month: "Jan", lamps: 18, rain: 8 },
  { month: "Feb", lamps: 26, rain: 14 },
  { month: "Mar", lamps: 31, rain: 22 },
  { month: "Apr", lamps: 24, rain: 30 },
];
const config = {
  lamps: { label: "Lamps", color: "var(--chart-1)" },
  rain: { label: "Rain", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ChartDemo() {
  return (
    <ChartContainer config={config} className="h-56 w-full max-w-md">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="lamps" fill="var(--color-lamps)" radius={4} />
        <Bar dataKey="rain" fill="var(--color-rain)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
