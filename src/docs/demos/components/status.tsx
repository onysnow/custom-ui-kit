import { AiTag, LevelChip, StatusChip } from "@onysnow/ui/status";

// Colours come from the theme's --status-*, --flag-* and --ai-mark tokens; the shape and word carry the meaning too.
export default function StatusDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatusChip status="supported" />
        <StatusChip status="disputed" />
        <StatusChip status="unshown" />
        <StatusChip status="ruled_out" />
      </div>
      <div className="flex flex-wrap gap-2">
        <LevelChip level="faint" />
        <LevelChip level="strong" />
        <LevelChip level="textbook" showMeaning />
      </div>
      <AiTag date="18 Oct" />
    </div>
  );
}
