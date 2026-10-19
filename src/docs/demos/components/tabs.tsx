import { Tabs, TabsContent, TabsList, TabsTrigger } from "@onysnow/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="glass" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="glass">Glass</TabsTrigger>
        <TabsTrigger value="light">Light</TabsTrigger>
        <TabsTrigger value="rain">Rain</TabsTrigger>
      </TabsList>
      <TabsContent value="glass" className="text-sm text-muted-foreground">
        Thickness, edge and frost.
      </TabsContent>
      <TabsContent value="light" className="text-sm text-muted-foreground">
        The lamp and the room.
      </TabsContent>
      <TabsContent value="rain" className="text-sm text-muted-foreground">
        Drops, wind and trails.
      </TabsContent>
    </Tabs>
  );
}
