import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === "dark");

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const handleThemeToggle = (checked) => {
    setIsDark(checked);
    toggleTheme();
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <Link to="/landing" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PS</span>
            </div>
            <span className="font-bold text-xl text-green-600 dark:text-green-400">PaletteStream</span>
          </Link>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">🌙</span>
            <Switch checked={isDark} onCheckedChange={handleThemeToggle} className="data-[state=checked]:bg-green-600" />
            <span className="text-sm text-muted-foreground">☀️</span>
          </div>

          {/* Authentication Buttons */}
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                Join Beta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
