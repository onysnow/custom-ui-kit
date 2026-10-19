import { Tabs, TabsList, TabsTrigger, TabsContent } from "@onysnow/ui/tabs";
import { CodeBlock } from "./CodeBlock";
import { INSTALL } from "../site";

export function InstallTabs({ className }: { className?: string }) {
  return (
    <Tabs defaultValue="npm" className={className}>
      <TabsList>
        {Object.keys(INSTALL).map((pm) => (
          <TabsTrigger key={pm} value={pm}>
            {pm}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.entries(INSTALL).map(([pm, cmd]) => (
        <TabsContent key={pm} value={pm}>
          <CodeBlock code={cmd} lang="bash" />
        </TabsContent>
      ))}
    </Tabs>
  );
}
