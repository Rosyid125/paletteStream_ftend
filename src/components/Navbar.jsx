import { Bell, MessageSquare, User, LogOut, PlusCircle, Image, BookOpen, BookMarked, Heart, Bookmark, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext"; // Assuming you have this context
import { Switch } from "@/components/ui/switch";
import { Link, useNavigate } from "react-router-dom"; // Use useNavigate for programmatic navigation
import { logout } from "@/services/authService"; // Import logout service
import ChallengeNotifications from "@/components/ChallengeNotifications";
import api from "./../api/axiosInstance"; // Import the custom axios instance

// Helper function to format image URLs
const formatImageUrl = (imagePath) => {
  if (!imagePath) return "/storage/avatars/noimage.png"; // Default fallback
  const cleanedPath = imagePath.replace(/\\/g, "/");

  if (cleanedPath.startsWith("http")) {
    return cleanedPath;
  }
  if (cleanedPath.startsWith("/storage")) {
    return api.defaults.baseURL ? `${api.defaults.baseURL}${cleanedPath}` : cleanedPath;
  }
  if (api.defaults.baseURL) {
    const baseUrl = api.defaults.baseURL.endsWith("/") ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
    const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
    return `${baseUrl}/${relativePath}`;
  }
  return cleanedPath;
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  // Removed searchFocused state as it wasn't used
  const [userId, setUserId] = useState(null); // State for user ID (if needed later)
  const [isDark, setIsDark] = useState(theme === "dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu (if needed later)

  // State for fetched user profile data
  const [miniProfile, setMiniProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Hook for navigation

  // --- Static Data (Notifications/Messages - Not in mini-profile endpoint) ---
  // Consider fetching this from a separate endpoint if available
  const staticCounters = {
    notifications: 3,
    messages: 2,
  };
  // --- End Static Data ---

  useEffect(() => {
    // setUserId from localStorage or context (if using a global state management)
    const storedUser = localStorage.getItem("user"); // Example: get user from local storage
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id); // Assuming user object has an id property
    } else {
      setUserId(null); // No user found, set to null
    }
  }, []); // Run once on mount

  // Fetch mini profile data on component mount if userId exists
  useEffect(() => {
    const fetchMiniProfile = async () => {
      if (!userId) {
        console.warn("Navbar: User ID not found. Cannot fetch profile.");
        setIsLoading(false);
        // Optionally set an error or default state if user MUST be logged in
        // setError("User not logged in.");
        return; // Exit if no user ID
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/profiles/mini-profile/${userId}`);
        if (response.data && response.data.success && response.data.data) {
          setMiniProfile(response.data.data);
        } else {
          console.error("Navbar: Unexpected API response structure:", response.data);
          setError("Failed to parse profile data.");
          setMiniProfile(null);
        }
      } catch (err) {
        console.error("Navbar: Failed to fetch mini profile:", err);
        const errorMessage = err.response?.data?.message || "Failed to load profile.";
        setError(errorMessage);
        setMiniProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMiniProfile();
  }, [userId]); // Refetch if userId changes (e.g., after login/logout without full refresh)

  // Update theme switch state when theme context changes
  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const handleToggleTheme = () => {
    setIsDark(!isDark); // Toggle local state immediately for responsiveness
    toggleTheme(); // Call the context function
  };

  // Handle logout
  const handleLogout = async () => {
    // Make async if logout service returns a promise
    try {
      await logout(); // Call the service function
      // Clear local storage/state if not handled by logout service
      localStorage.removeItem("user"); // Example: clear user item
      localStorage.removeItem("token"); // Example: clear token
      setMiniProfile(null); // Clear profile state
      // Redirect to login page
      navigate("/login"); // Use navigate for SPA navigation
      // window.location.href = "/login"; // Use this for full page reload if necessary
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
      // Optionally show an error message to the user
    }
  };

  // Helper to get Avatar Fallback character
  const getAvatarFallback = () => {
    if (isLoading) return "?";
    if (!miniProfile || (!miniProfile.username && !miniProfile.first_name)) return "U"; // Default if no profile or names
    const nameForFallback = miniProfile.username || miniProfile.first_name;
    return nameForFallback.charAt(0).toUpperCase();
  };

  // Get formatted avatar URL
  const avatarUrl = miniProfile ? formatImageUrl(miniProfile.avatar) : formatImageUrl(null);

  // --- Mobile Menu Toggle (Implementation depends on full mobile design) ---
  // const toggleMobileMenu = () => {
  //   setIsMobileMenuOpen(!isMobileMenuOpen);
  // };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Desktop Navigation Links (Consider moving to separate component if complex) */}
        <div className={`hidden items-center space-x-1 md:flex`}>
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
          {/* Add more links as needed */}
        </div>

        {/* Right side Actions (Mobile Menu trigger might go here) */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Conditionally render based on userId */}
          {userId ? (
            <>
              {/* Create Post Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Create Post</span>
                    <span className="md:hidden">Post</span> {/* Shorter text for mobile */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    {/* Use template literals for dynamic user IDs */}
                    <Link to={`/post/illustration/${userId}`}>
                      <DropdownMenuItem>
                        <Image className="mr-2 h-4 w-4 text-primary" />
                        <span>Illustration</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to={`/post/manga/${userId}`}>
                      <DropdownMenuItem>
                        <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Manga</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to={`/post/novel/${userId}`}>
                      <DropdownMenuItem>
                        <BookMarked className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Novel</span>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {/*  User is Logged In and Profile is Loaded  */}{" "}
              {!isLoading && miniProfile && (
                <>
                  {/* Challenge Notifications */}
                  <ChallengeNotifications />

                  {/* Messages */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/chat">
                          <Button variant="ghost" size="icon" className="relative">
                            <MessageSquare className="h-5 w-5" />
                            {staticCounters.messages > 0 && (
                              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] text-white hover:bg-blue-600 dark:hover:bg-blue-800">
                                {staticCounters.messages}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You have {staticCounters.messages} messages</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8 border-2 border-muted">
                          <AvatarImage src={avatarUrl} alt={miniProfile?.username || "User"} />
                          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {/* Dropdown Header with User Info */}
                      <div className="flex items-center justify-start gap-2 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={avatarUrl} alt={miniProfile.username} />
                          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-0.5 leading-none">
                          <p className="truncate text-sm font-medium">{miniProfile.username || `${miniProfile.first_name} ${miniProfile.last_name}`.trim() || "User"}</p>
                          <p className="truncate text-xs text-muted-foreground">@{miniProfile.username || "username"}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {/* Corrected: Use Link component with 'to' prop */}
                        <Link to={`/profile/${userId}`}>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link to="/bookmarks">
                          <DropdownMenuItem>
                            <Bookmark className="mr-2 h-4 w-4" />
                            <span>Saved Artworks</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link to="/likes">
                          <DropdownMenuItem>
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Liked Artworks</span>
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {/* Prevent item selection default behavior for the switch */}
                        <DropdownMenuItem className="flex cursor-default items-center justify-between hover:bg-transparent focus:bg-transparent" onSelect={(e) => e.preventDefault()}>
                          <span className="text-sm">Dark mode</span>
                          <Switch id="dark-mode-switch-navbar" checked={isDark} onCheckedChange={handleToggleTheme} aria-label="Toggle dark mode" />
                        </DropdownMenuItem>
                        {/* Corrected: Use Link component with 'to' prop */}
                        <Link to="/landing">
                          <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>About (Landing)</span>
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-900/50 dark:focus:text-red-500" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </>
          ) : (
            /* User is not logged in */
            !isLoading && (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )
          )}

          {/* --- Loading Indicator (Optional) --- */}
          {isLoading && userId && (
            // Show spinner only when fetching user data and user is logged in
            <div className="h-8 w-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          )}

          {/* --- Mobile Menu Button (Add logic if needed) --- */}
          {/* <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button> */}
        </div>
      </div>

      {/* --- Mobile Menu Dropdown (Example Structure - Implement if needed) --- */}
      {/* {isMobileMenuOpen && (
        <div className="container mx-auto px-4 pb-4 md:hidden">
          <Separator className="my-2" />
          <div className="flex flex-col space-y-2">
            <Link to="/" onClick={toggleMobileMenu}><Button variant="ghost" className="w-full justify-start">Home</Button></Link>
            <Link to="/discover" onClick={toggleMobileMenu}><Button variant="ghost" className="w-full justify-start">Discover</Button></Link>
            <Link to="/challenges" onClick={toggleMobileMenu}><Button variant="ghost" className="w-full justify-start">Challenges</Button></Link>
            {/* Add more mobile links */}
      {/* </div>
        </div>
      )} */}
    </nav>
  );
}
