import { Search, Bell, MessageSquare, User, Menu, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/theme/theme-context";

export default function Navbar({ toggleSidebar }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">PaletteStream</h1>
          <div className="hidden items-center space-x-4 md:flex">
            <a href="#" className="text-sm font-medium">
              Home
            </a>
            <a href="#" className="text-sm font-medium">
              Discover
            </a>
            <a href="#" className="text-sm font-medium">
              Challenges
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <form className="hidden md:block">
            <Input type="search" placeholder="Search PaletteStream" className="w-[200px] lg:w-[300px]" />
          </form>
          <Button size="icon" variant="ghost">
            <Search className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>Settings</DropdownMenuItem>
              <DropdownMenuItem onSelect={toggleTheme}>
                {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                {theme === "light" ? "Dark" : "Light"} mode
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
