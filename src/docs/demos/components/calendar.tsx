import { useState } from "react";
import { Calendar } from "@onysnow/ui/calendar";

export default function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-xl border border-border"
    />
  );
}
