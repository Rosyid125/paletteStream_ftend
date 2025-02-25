import { Home, Compass, Award, PenTool, BookOpen, BookMarked, FileText, Users, Trophy, Minimize, Maximize } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Menu items dengan grup terpisah
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
    group: "Main Navigations",
  },
  {
    title: "Discover",
    url: "#",
    icon: Compass,
    group: "Main Navigations",
  },
  {
    title: "Challenges",
    url: "#",
    icon: Award,
    group: "Main Navigations",
  },
  {
    title: "Top 10 Players",
    url: "#",
    icon: Users,
    group: "Gamifications",
  },
  {
    title: "Top 10 Posts",
    url: "#",
    icon: FileText,
    group: "Gamifications",
  },
  {
    title: "Weekly Challenges Winner",
    url: "#",
    icon: Trophy,
    group: "Gamifications",
  },
  {
    title: "Illustrations",
    url: "#",
    icon: PenTool,
    group: "Posts",
  },
  {
    title: "Mangas",
    url: "#",
    icon: BookOpen,
    group: "Posts",
  },
  {
    title: "Novels",
    url: "#",
    icon: BookMarked,
    group: "Posts",
  },
];

export function ShadcnSidebar() {
  // Membuat grup berdasarkan group
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});

  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex justify-center items-center">
        <h1 className="text-2xl font-bold mt-2">PaletteStream</h1>
      </SidebarHeader>
      <SidebarContent>
        {Object.keys(groupedItems).map((group) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="font-bold">{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedItems[group].map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span className="font-bold">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {/* Announcement Card */}
        <div className="p-4 shadow-md rounded-md mb-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Announcement</h2>
            <Button onClick={toggleMinimize} variant="ghost" size="icon" className="text-sm">
              {isMinimized ? <Maximize className="text-lg" /> : <Minimize className="text-lg" />}
            </Button>
          </div>
          {!isMinimized && <p className="mt-2 text-sm text-gray-600">Here is the latest announcement regarding PaletteStream.</p>}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
