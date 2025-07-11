import { Home, Compass, Award, BookMarked, FileText, Users, Trophy, Palette, Heart, Bell } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./../api/axiosInstance"; // Ensure this path is correct

// --- Added Helper function to format image URLs ---
const formatImageUrl = (imagePath) => {
  // Default fallback if imagePath is null, undefined, or empty string
  if (!imagePath) return "/storage/avatars/noimage.png"; // Default fallback - Make sure this path is accessible in your public folder or adjust as needed

  // Replace backslashes with forward slashes for consistency
  const cleanedPath = imagePath.replace(/\\/g, "/");

  // Check if it's already an absolute URL
  if (cleanedPath.startsWith("http")) {
    return cleanedPath;
  }

  // Check if it's an absolute path starting with /storage (relative to domain root)
  // Prepend baseURL only if necessary (e.g., if baseURL is set and path doesn't start with http)
  if (cleanedPath.startsWith("/storage")) {
    // If baseURL exists and path starts with /storage, combine them
    return api.defaults.baseURL ? `${api.defaults.baseURL}${cleanedPath}` : cleanedPath;
  }

  // If it's a relative path (doesn't start with http or /storage) and baseURL exists, prepend baseURL
  if (api.defaults.baseURL) {
    const baseUrl = api.defaults.baseURL.endsWith("/") ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
    const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
    return `${baseUrl}/${relativePath}`;
  }

  // Fallback: return the cleaned path if baseURL is not set or logic doesn't match
  // This might result in a broken image if the path is relative and needs a base URL
  return cleanedPath;
};
// --- End of Added Helper function ---

export default function ShadcnSidebar() {
  const [miniProfile, setMiniProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null); // State to hold userId
  const [role, setRole] = useState(null); // State to hold user role

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let userIdFromStorage = null;
    let roleFromStorage = null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userIdFromStorage = parsed?.id;
        roleFromStorage = parsed?.role;
      } catch (e) {
        console.error("Failed to parse user from localStorage in Sidebar:", e);
        localStorage.removeItem("user"); // Clear invalid data
      }
    }

    setUserId(userIdFromStorage); // Set userId state
    setRole(roleFromStorage); // Set role state

    const fetchMiniProfile = async () => {
      if (!userIdFromStorage) {
        console.warn("User ID not found in local storage. Cannot fetch profile.");
        setIsLoading(false);
        setError("User not identified.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/profiles/mini-profile/${userIdFromStorage}`);
        if (response.data && response.data.success && response.data.data) {
          setMiniProfile(response.data.data);
        } else {
          console.error("Unexpected API response structure:", response.data);
          setError("Failed to parse profile data.");
          setMiniProfile(null);
        }
      } catch (err) {
        console.error("Failed to fetch mini profile:", err);
        const errorMessage = err.response?.data?.message || "Failed to load profile data.";
        setError(errorMessage);
        setMiniProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMiniProfile();
  }, []); // Runs once on mount

  // Menu items with separate groups
  let items = [
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
      title: "Challenge Winners",
      url: "/challenge-winners",
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
      title: "Chat",
      url: "/chat",
      icon: Users,
      group: "User's",
      color: "text-blue-400",
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
      group: "User's",
      color: "text-pink-500",
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
  // Tambahkan menu admin jika role admin (dari localStorage, bukan miniProfile)
  if (role === "admin") {
    items = [
      {
        title: "Admin Dashboard",
        url: "/admin/dashboard",
        icon: Trophy,
        group: "Admin",
        color: "text-red-500",
      },
      {
        title: "User Management",
        url: "/admin/users",
        icon: Users,
        group: "Admin",
        color: "text-blue-700",
      },
      {
        title: "Post Management",
        url: "/admin/posts",
        icon: FileText,
        group: "Admin",
        color: "text-amber-700",
      },
      {
        title: "Challenge Management",
        url: "/admin/challenges",
        icon: Award,
        group: "Admin",
        color: "text-green-600",
      },
      ...items,
    ];
  }

  const groupedItems = items.reduce((acc, item) => {
    if (item.title === "Profile" && item.url !== `/profile/${userId}`) {
      item.url = `/profile/${userId}`;
    }
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});

  const location = useLocation();

  const isActive = (url) => {
    return url && location.pathname === url;
  };

  const getGroupBorderColor = (group) => {
    switch (group) {
      case "Main":
        return "border-l-primary";
      case "Leaderboard":
        return "border-l-amber-500";
      case "User's":
        return "border-l-blue-500";
      case "Admin":
        return "border-l-red-500"; // Warna border untuk grup Admin
      default:
        return "border-l-primary";
    }
  };

  const getAvatarFallback = () => {
    if (isLoading) return "?";
    if (error || !miniProfile || (!miniProfile.username && !miniProfile.first_name)) return "U";
    const nameForFallback = miniProfile.username || miniProfile.first_name;
    return nameForFallback.charAt(0).toUpperCase();
  };

  // --- Use formatImageUrl for the avatar in the header ---
  const headerAvatarUrl = !isLoading && miniProfile ? formatImageUrl(miniProfile.avatar) : formatImageUrl(null);
  // --- End of update ---

  return (
    <Sidebar className="border-r z-50">
      <SidebarHeader className="p-4">
        {/* App Logo and Name */}
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PaletteStream</h1>
            <p className="text-xs text-muted-foreground">Game it is!</p>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-6 flex items-center justify-between">
          <Link to={userId ? `/profile/${userId}` : "#"} className={`flex items-center space-x-2 ${!userId ? "pointer-events-none opacity-50" : ""}`}>
            <Avatar className="h-8 w-8 border-2 border-background">
              {/* --- Updated to use formatted URL --- */}
              <AvatarImage src={headerAvatarUrl} alt={miniProfile?.username || "User"} />
              {/* --- End of update --- */}
              <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
            </Avatar>
            <div>
              {isLoading ? (
                <p className="text-sm font-medium animate-pulse">Loading...</p>
              ) : error ? (
                <p className="text-sm font-medium text-destructive">{error}</p>
              ) : miniProfile ? (
                <>
                  <p className="text-sm font-medium">{miniProfile.username || `${miniProfile.first_name} ${miniProfile.last_name}`.trim() || "Unnamed User"}</p>
                  <p className="text-xs text-muted-foreground">Level {miniProfile.level ?? "N/A"}</p>
                </>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">User not found</p>
              )}
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
                {groupedItems[group].map((item) => {
                  if (item.title === "Profile" && !userId) {
                    return null;
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild isActive={isActive(item.url)} className={`group transition-colors ${isActive(item.url) ? "bg-muted" : "hover:bg-muted/50"}`}>
                              <Link to={item.url} className="flex items-center space-x-3">
                                {item.isAvatar ? (
                                  // --- Use formatImageUrl for the avatar in the menu item ---
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={headerAvatarUrl} alt={miniProfile?.username || "User"} />
                                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                                  </Avatar>
                                ) : (
                                  // --- End of update ---
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
                  );
                })}
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
