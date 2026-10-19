import { Home, Layers, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@onysnow/ui/sidebar";

const items = [
  { icon: Home, label: "Home" },
  { icon: Layers, label: "Scenes" },
  { icon: Settings, label: "Settings" },
];

export default function SidebarDemo() {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl border border-border">
      <SidebarProvider className="min-h-0 h-full">
        <Sidebar collapsible="none" className="h-full">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Studio</SidebarGroupLabel>
              <SidebarMenu>
                {items.map(({ icon: Icon, label }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton>
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
