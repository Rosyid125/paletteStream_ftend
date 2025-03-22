import { Home, Compass, Award, BookMarked, FileText, Users, Trophy, Palette, Bell, Heart } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

// Get current userid from local storage
const user = JSON.parse(localStorage.getItem("user"));
const userId = user ? user.id : null;

// Menu items with separate groups
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    group: "Main",
    color: "text-primary",
  },
  {
    title: "Discover",
    url: "/discover",
    icon: Compass,
    group: "Main",
    color: "text-blue-500",
  },
  {
    title: "Challenges",
    url: "/challenges",
    icon: Award,
    group: "Main",
    color: "text-amber-500",
  },
  {
    title: "Top Artists",
    url: "/top-artists",
    icon: Users,
    group: "Leaderboard",
    color: "text-green-500",
  },
  {
    title: "Top Artworks",
    url: "/top-artworks",
    icon: FileText,
    group: "Leaderboard",
    color: "text-blue-500",
  },
  {
    title: "Weekly Winners",
    url: "/weekly-winners",
    icon: Trophy,
    group: "Leaderboard",
    color: "text-yellow-500",
  },
  {
    title: "Profile",
    url: `/profile/${userId}`,
    icon: Avatar,
    group: "User's",
    color: "text-purple-500",
    isAvatar: true,
  },
  {
    title: "Bookmarked",
    url: "/bookmarks",
    icon: BookMarked,
    group: "User's",
    color: "text-amber-500",
  },
  {
    title: "Liked",
    url: "/likes",
    icon: Heart,
    group: "User's",
    color: "text-green-500",
  },
];

export default function ShadcnSidebar() {
  // Group items by their group property
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});

  const location = useLocation(); // useLocation gives you the full location object

  const currentUser = {
    name: "Jane Painter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    level: 7,
  };

  // Helper function to check if a menu item is active
  const isActive = (url) => {
    return location.pathname === url; // Compare location.pathname with the desired URL
  };

  // Helper function to get group border color
  const getGroupBorderColor = (group) => {
    switch (group) {
      case "Main":
        return "border-l-primary";
      case "Leaderboard":
        return "border-l-amber-500";
      case "Categories":
        return "border-l-blue-500";
      default:
        return "border-l-primary";
    }
  };

  return (
    <Sidebar className="border-r z-50">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PaletteStream</h1>
            <p className="text-xs text-muted-foreground">Game it is!</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link to={`/profile/${userId}`} className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">Level {currentUser.level}</p>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <Separator className="my-4" />

      <SidebarContent className="px-2">
        {Object.keys(groupedItems).map((group) => (
          <SidebarGroup key={group} className={`mt-4 border-l-4 pl-2 ${getGroupBorderColor(group)}`}>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedItems[group].map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild isActive={isActive(item.url)} className={`group transition-colors ${isActive(item.url) ? "bg-muted" : "hover:bg-muted/50"}`}>
                            <Link to={item.url} className="flex items-center space-x-3">
                              {item.isAvatar ? (
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ) : (
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                              )}
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <div className="mt-4" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
