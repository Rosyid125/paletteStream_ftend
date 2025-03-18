import { Home, Compass, Award, BookMarked, FileText, Users, Trophy, Palette, Bell, Heart, Group } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

// Menu items with separate groups
const items = [
  {
    title: "Home",
    url: "/home",
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
    url: "/profile/socital",
    icon: Avatar,
    group: "User's",
    color: "text-purple-500",
    isAvatar: true,
  },
  {
    title: "Bookmarked",
    url: "/bookmarked",
    icon: BookMarked,
    group: "User's",
    color: "text-amber-500",
  },
  {
    title: "Liked",
    url: "/liked",
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

  const [open, setOpen] = useState(false);
  const location = useLocation(); // useLocation gives you the full location object

  // Get the current user info (this would normally come from your auth system)
  const currentUser = {
    name: "Jane Painter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    level: 7,
    notifications: 3,
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
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">Level {currentUser.level}</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {currentUser.notifications > 0 && <Badge className="absolute -right-1 -top-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-[10px] text-white">{currentUser.notifications}</Badge>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You have {currentUser.notifications} notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </SidebarHeader>

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
                              {item.title === "Challenges" && <Badge className="ml-auto bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">2 New</Badge>}
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

        <Separator className="my-4" />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-2 w-full border-dashed border-muted-foreground/50">
              <Bell className="mr-2 h-4 w-4 text-primary" />
              Announcements
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Latest Announcements
              </DialogTitle>
              <DialogDescription>Stay updated with the latest news and features</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">New Challenge Available</h3>
                  <Badge>New</Badge>
                </div>
                <p className="mt-2 text-sm">Join our "Fantasy Worlds" challenge and win exclusive badges and XP rewards!</p>
                <p className="mt-1 text-xs text-muted-foreground">Posted 2 hours ago</p>
              </div>

              <div className="rounded-lg border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Platform Update</h3>
                  <Badge variant="outline">Update</Badge>
                </div>
                <p className="mt-2 text-sm">We've improved the artwork upload process with new tagging features and better previews.</p>
                <p className="mt-1 text-xs text-muted-foreground">Posted 2 days ago</p>
              </div>
            </div>
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        <div className="mt-4" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
