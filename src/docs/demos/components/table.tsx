import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@onysnow/ui/table";

const rows = [
  ["Case Night", "4.66:1", "Navy and amber"],
  ["Rain Noir", "5.90:1", "Warm charcoal"],
  ["Archive", "4.72:1", "Manila and lamp"],
];

export default function TableDemo() {
  return (
    <Table>
      <TableCaption>Lowest contrast pair per theme.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Theme</TableHead>
          <TableHead>Contrast</TableHead>
          <TableHead>Mood</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([name, ratio, mood]) => (
          <TableRow key={name}>
            <TableCell className="font-medium">{name}</TableCell>
            <TableCell>{ratio}</TableCell>
            <TableCell>{mood}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
