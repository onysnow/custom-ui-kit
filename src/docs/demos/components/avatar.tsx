import { Avatar, AvatarFallback, AvatarImage } from "@onysnow/ui/avatar";

export default function AvatarDemo() {
  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src="/does-not-exist.png" alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>ON</AvatarFallback>
      </Avatar>
    </div>
  );
}
