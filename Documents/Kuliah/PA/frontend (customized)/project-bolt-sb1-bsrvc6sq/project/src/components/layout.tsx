import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Home, Search, Trophy, User, Bell, MessageSquare, Settings, LogOut, Menu, X, Sun, Moon, Palette } from "lucide-react";
import { group } from "console";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Layout({ children, currentPage, setCurrentPage }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { name: "Home", icon: <Home className="h-5 w-5" />, value: "home", group: "main" },
    { name: "Discover", icon: <Search className="h-5 w-5" />, value: "discover", group: "main" },
    { name: "Challenges", icon: <Trophy className="h-5 w-5" />, value: "challenges", group: "main" },
    { name: "Profile", icon: <User className="h-5 w-5" />, value: "profile", group: "sub" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center p-6">
            <Palette className="h-8 w-8 text-red-500" />
            <span className="ml-2 text-2xl font-bold text-primary">PaletteStream</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            <nav className="space-y-2">
              {navItems
                .filter((item) => item.group === "main")
                .map((item) => (
                  <Button
                    key={item.value}
                    variant={currentPage === item.value ? "default" : "ghost"}
                    className={`w-full justify-start ${currentPage === item.value ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                    onClick={() => {
                      setCurrentPage(item.value);
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                ))}

              <Separator className="my-4" />

              {navItems
                .filter((item) => item.group === "sub")
                .map((item) => (
                  <Button
                    key={item.value}
                    variant={currentPage === item.value ? "default" : "ghost"}
                    className={`w-full justify-start ${currentPage === item.value ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                    onClick={() => {
                      setCurrentPage(item.value);
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                ))}
            </nav>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-medium">Your Progress</h3>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Level 7</span>
                  <span className="text-sm text-muted-foreground">2,450 XP</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-3/4 bg-gradient-to-r from-red-500 to-red-600"></div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">750 XP to Level 8</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Recent Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    First Upload
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    10 Comments
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    Weekly Winner
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="ml-2">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-500">
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="md:hidden">
            {/* Placeholder for mobile toggle button */}
            <div className="w-6"></div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button className=" bg-gradient-to-r from-red-500 to-red-600" variant="default" size="default">
              Post
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Jane Painter</p>
                <p className="text-xs text-muted-foreground">Level 7 Artist</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
