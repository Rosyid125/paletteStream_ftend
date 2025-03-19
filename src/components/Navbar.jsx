import { Search, Bell, MessageSquare, User, LogOut, PlusCircle, Image, BookOpen, BookMarked, Settings, Heart, Bookmark, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { logout } from "@/services/authService"; // Impor API login yang sudah dibuat

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [handlleLogout, setHandlleLogout] = useState(false);

  const [isDark, setIsDark] = useState(theme === "dark");

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
    toggleTheme();
  };

  // Get the current user info (this would normally come from your auth system)
  const currentUser = {
    name: "Jane Painter",
    username: "jane_painter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    level: 7,
    notifications: 3,
    messages: 2,
  };

  // Hapus state handlleLogout dan ubah menjadi fungsi biasa
  const handleLogout = () => {
    // Logout user
    const response = logout();
    if (response) {
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="hidden items-center space-x-1 md:flex">
          {/* Desktop navigation links */}
          <Link to="/home">
            <Button variant="ghost" className="text-sm font-medium">
              Home
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="ghost" className="text-sm font-medium">
              Discover
            </Button>
          </Link>
          <Link to="/challenges">
            <Button variant="ghost" className="text-sm font-medium">
              Challenges
            </Button>
          </Link>
        </div>

        <div className={`relative mx-4 flex-1 transition-all duration-200 ${searchFocused ? "md:mx-0" : "md:mx-4"}`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search for artworks, artists, or tags..." className="w-full pl-10 pr-4" onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 md:gap-2">
          {/* Create post button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden md:flex">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <Link to="/post/illustration">
                  <DropdownMenuItem>
                    <Image className="mr-2 h-4 w-4 text-primary" />
                    <span>Illustration</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/post/manga">
                  <DropdownMenuItem>
                    <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Manga</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/post/novel">
                  <DropdownMenuItem>
                    <BookMarked className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Novel</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
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

          {/* Messages */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                  {currentUser.messages > 0 && (
                    <Badge className="absolute -right-1 -top-1 flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-[10px] hover:bg-blue-600 dark:hover:bg-blue-800 text-white">{currentUser.messages}</Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You have {currentUser.messages} messeges</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-muted">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/bookmarks">
                  <DropdownMenuItem>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Saved Artworks</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/likes">
                  <DropdownMenuItem>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Liked Artworks</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="flex justify-between items-center hover:bg-transparent focus:bg-transparent" onSelect={(e) => e.preventDefault()}>
                  <span>Dark mode</span>
                  <Switch checked={isDark} onCheckedChange={handleToggleTheme} />
                </DropdownMenuItem>
                <Link href="/help">
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
