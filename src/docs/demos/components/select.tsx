import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@onysnow/ui/select";

export default function SelectDemo() {
  return (
    <Select defaultValue="rain-noir">
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="case-night">Case Night</SelectItem>
        <SelectItem value="rain-noir">Rain Noir</SelectItem>
        <SelectItem value="archive">Archive</SelectItem>
        <SelectItem value="forest-ledger">Forest Ledger</SelectItem>
        <SelectItem value="indigo-clarity">Indigo Clarity</SelectItem>
      </SelectContent>
    </Select>
  );
}
