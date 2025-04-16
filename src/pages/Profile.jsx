import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Image,
  Trophy,
  Star,
  Award,
  Users,
  Heart,
  MessageCircle,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Crown,
  MapPin,
  Globe,
  Bookmark,
  LinkIcon,
  Github,
  Linkedin,
  Twitter,
  UserPlus,
  UserMinus,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";

// --- Import new components from Home ---
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { CommentModal } from "@/components/CommentModal";

// --- Helper function to get current user data ---
const getCurrentUser = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      console.error("Error parsing user data from storage:", e);
      return null;
    }
  }
  return null;
};
// --- End Helper ---

// --- Constants from Home (adapted) ---
const CURRENT_USER_DATA = getCurrentUser(); // Get full user object once
const CURRENT_USER_ID = CURRENT_USER_DATA?.id ? Number(CURRENT_USER_DATA.id) : null; // Get ID as number
const ARTWORKS_PAGE_LIMIT = 6; // Define the limit for artworks per page

// --- Helper function to construct full URL for storage paths ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg"; // Default image if path is invalid
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path; // Already a full URL
  }

  // Normalize slashes for consistency
  const normalizedPath = path.replace(/\\/g, "/");

  // Ensure the path starts with a single slash if it's relative to storage
  let relativePath = normalizedPath;
  if (normalizedPath.startsWith("storage/")) {
    relativePath = `/${normalizedPath}`;
  } else if (!normalizedPath.startsWith("/storage/")) {
    // Assuming paths like 'uploads/....jpg' should be prefixed
    relativePath = `/storage/${normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath}`;
  }

  // Get base URL from axios instance or window location
  const baseUrl = api.defaults.baseURL || window.location.origin;

  try {
    // Use URL constructor for robust joining
    const url = new URL(relativePath, baseUrl);
    return url.href;
  } catch (e) {
    console.error("Error constructing image URL:", e);
    return "/placeholder.svg"; // Fallback on error
  }
};

// --- Helper function to get platform icon ---
const getPlatformIcon = (url) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("github.com")) return <Github className="h-4 w-4" />;
    if (hostname.includes("linkedin.com")) return <Linkedin className="h-4 w-4" />;
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return <Twitter className="h-4 w-4" />;
    // Add more platforms as needed
  } catch (e) {
    // Invalid URL
  }
  return <LinkIcon className="h-4 w-4" />; // Default link icon
};
// --- End Helper ---

export default function Profile() {
  const navigate = useNavigate();
  const { userId: userIdParam } = useParams(); // Get user ID from URL parameter
  const userId = Number(userIdParam); // Ensure userId is a number for comparison

  // State for data fetched from API
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true); // Profile loading
  const [error, setError] = useState(null); // State for profile errors

  // State for Follow logic
  const [currentUserIdState, setCurrentUserIdState] = useState(null); // Renamed to avoid conflict
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false); // Loading state for follow button

  // State for User Artworks (Posts) - adapted for lazy loading
  const [userArtworks, setUserArtworks] = useState([]); // Initialize as empty array
  const [artworksLoading, setArtworksLoading] = useState(false); // For initial load
  const [loadingMoreArtworks, setLoadingMoreArtworks] = useState(false); // For subsequent loads
  const [artworksError, setArtworksError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page for artworks
  const [hasMoreArtworks, setHasMoreArtworks] = useState(true); // Track if more artworks exist

  // State for dummy data (until APIs are available for these sections)
  const [badges, setBadges] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [challengeHistory, setChallengeHistory] = useState(null);

  const [activeTab, setActiveTab] = useState("artworks");

  // --- State for Modals (from Home.jsx) ---
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // --- Effect to set current user ID state ---
  useEffect(() => {
    setCurrentUserIdState(CURRENT_USER_ID); // Set state from constant
  }, []);

  // --- Function to fetch user profile data ---
  const fetchUserProfile = async () => {
    if (!userId) {
      setError("User ID is missing in the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setUserProfile(null);
    setUserStats(null);
    // Reset artworks state when profile changes
    setUserArtworks([]);
    setArtworksError(null);
    setCurrentPage(1);
    setHasMoreArtworks(true);
    setArtworksLoading(false); // Ensure artworks loading isn't stuck if profile load fails early
    setLoadingMoreArtworks(false);

    try {
      const response = await api.get(`/profiles/profile/${userId}`);

      if (response.data && response.data.success) {
        const profileData = response.data.data;
        const correctedProfileData = {
          ...profileData,
          avatar: profileData.avatar || null,
          bio: profileData.bio || null,
          posts: Number(profileData.posts) || 0,
          likes: Number(profileData.likes) || 0,
          comments: Number(profileData.comments) || 0,
          challanges: Number(profileData.challanges ?? profileData.challenges) || 0,
          challangeWins: Number(profileData.challangeWins ?? profileData.challengeWins) || 0,
          followers: Number(profileData.followers) || 0,
          followings: Number(profileData.followings) || 0,
          level: Number(profileData.level) || 1,
          exp: Number(profileData.exp) || 0,
          id: Number(profileData.id),
        };
        setUserProfile(correctedProfileData);

        setUserStats({
          totalUploads: correctedProfileData.posts,
          totalLikes: correctedProfileData.likes,
          totalComments: correctedProfileData.comments,
          challengesParticipated: correctedProfileData.challanges,
          challengesWon: correctedProfileData.challangeWins,
        });

        setIsFollowing(profileData.userFollowStatus ?? false);
        setIsCurrentUserProfile(CURRENT_USER_ID === correctedProfileData.id);
      } else {
        console.error("API request successful but data format unexpected or success=false:", response.data);
        setError(response.data?.message || "Failed to fetch profile data.");
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(error.response?.data?.message || error.message || "An error occurred while fetching the profile.");
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Function to fetch user artworks (posts) for a specific page ---
  const fetchArtworksPage = useCallback(
    async (pageToFetch) => {
      if (!userId) {
        setArtworksError("Cannot fetch artworks without a User ID.");
        return;
      }

      // Set appropriate loading state based on whether it's the first page or not
      if (pageToFetch === 1) {
        setArtworksLoading(true);
        // Reset state only for initial load, not for load more
        // setUserArtworks([]); // Moved reset to fetchUserProfile
      } else {
        setLoadingMoreArtworks(true);
      }
      setArtworksError(null);

      try {
        const response = await api.get(`/posts/${userId}`, {
          params: { page: pageToFetch, limit: ARTWORKS_PAGE_LIMIT, viewerId: CURRENT_USER_ID ?? 0 },
        });

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const fetchedData = response.data.data;

          const processedData = fetchedData.map((post) => ({
            ...post,
            bookmarkStatus: post.bookmarkStatus === undefined ? false : post.bookmarkStatus,
            postLikeStatus: post.postLikeStatus === undefined ? false : post.postLikeStatus,
            likeCount: post.likeCount === undefined ? 0 : Number(post.likeCount) || 0,
            commentCount: post.commentCount === undefined ? 0 : Number(post.commentCount) || 0,
            userId: Number(post.userId),
            id: Number(post.id),
            level: Number(post.level) || 1,
            images: Array.isArray(post.images) ? post.images : [],
            tags: Array.isArray(post.tags) ? post.tags : [],
          }));

          // Append new data if fetching subsequent pages, replace if it's the first page
          setUserArtworks((prevArtworks) => (pageToFetch === 1 ? processedData : [...prevArtworks, ...processedData]));

          // Update pagination state
          setCurrentPage(pageToFetch + 1); // Set the *next* page number to fetch
          setHasMoreArtworks(processedData.length === ARTWORKS_PAGE_LIMIT); // Check if a full page was returned
        } else {
          console.error("Artworks API request successful but data format unexpected or success=false:", response.data);
          setArtworksError(response.data?.message || "Failed to fetch artworks.");
          if (pageToFetch === 1) setUserArtworks([]); // Clear on initial load failure
          setHasMoreArtworks(false); // Assume no more if there's an error
        }
      } catch (error) {
        console.error(`Error fetching user artworks (page ${pageToFetch}):`, error);
        setArtworksError(error.response?.data?.message || error.message || "An error occurred while fetching artworks.");
        if (pageToFetch === 1) setUserArtworks([]); // Clear on initial load failure
        setHasMoreArtworks(false); // Assume no more if there's an error
      } finally {
        if (pageToFetch === 1) {
          setArtworksLoading(false);
        } else {
          setLoadingMoreArtworks(false);
        }
      }
    },
    [userId, CURRENT_USER_ID]
  ); // Dependencies for the fetch function itself

  // --- Effect to fetch profile when userId changes ---
  useEffect(() => {
    if (userId) {
      fetchUserProfile(); // This now also resets artwork state
    } else {
      console.error("User ID parameter is missing or invalid.");
      setError("User ID parameter is missing or invalid.");
      setLoading(false);
    }
    setActiveTab("artworks"); // Default to artworks tab on profile change
  }, [userId]); // Depend only on userId (numeric)

  // --- Effect to fetch initial artworks when the artworks tab is active AND profile is loaded ---
  useEffect(() => {
    // Only fetch if tab is active, profile is loaded (userProfile exists),
    // not currently loading profile, no profile error, and artworks haven't been loaded yet (userArtworks is empty)
    if (activeTab === "artworks" && userProfile && !loading && !error && userArtworks.length === 0 && hasMoreArtworks) {
      fetchArtworksPage(1); // Fetch the first page
    }
    // We depend on userProfile to ensure profile data is ready before fetching artworks
    // We depend on userArtworks.length === 0 to prevent re-fetching if tab is switched back and forth
  }, [activeTab, userProfile, loading, error, userArtworks.length, hasMoreArtworks, fetchArtworksPage]);

  // --- Effect to set dummy data for other tabs (runs once) ---
  useEffect(() => {
    setBadges([
      { id: 1, name: "Early Bird", description: "Joined the platform early.", date: "2023-01-15", icon: "🐦" },
      { id: 2, name: "Art Lover", description: "Liked 50 artworks.", date: "2023-03-20", icon: "❤️" },
      { id: 3, name: "Commentator", description: "Made 100 comments.", date: "2023-05-10", icon: "💬" },
    ]);
    setAchievements([
      { id: 1, name: "First Upload", progress: 100, completed: true },
      { id: 2, name: "100 Likes", progress: 100, completed: true },
      { id: 3, name: "Participate in Challenge", progress: 100, completed: true },
      { id: 4, name: "Win Challenge", progress: 50, completed: false },
    ]);
    setChallengeHistory([
      { id: 1, title: "Summer Art Challenge", artwork: "Seascape", result: "Top 10", date: "2023-06-20", thumbnail: "/placeholder.svg" },
      { id: 2, title: "Autumn Colors Challenge", artwork: "Fall Trees", result: "Winner", date: "2023-09-15", thumbnail: "/placeholder.svg" },
      { id: 3, title: "Winter Wonderland Challenge", artwork: "Snowy Village", result: "Top 10", date: "2023-12-24", thumbnail: "/placeholder.svg" },
    ]);
  }, []);

  // --- Event Handlers ---

  // Follow/Unfollow Handler
  const handleFollowToggle = async () => {
    if (!userProfile || followLoading || isCurrentUserProfile || !CURRENT_USER_ID) return;

    setFollowLoading(true);
    const targetUserId = userProfile.id;
    const followEndpoint = isFollowing ? "/profiles/unfollow" : "/profiles/follow";
    const originalFollowStatus = isFollowing;
    const originalFollowerCount = userProfile.followers;

    setIsFollowing(!originalFollowStatus);
    setUserProfile((prev) => ({
      ...prev,
      followers: Math.max(0, (prev.followers ?? 0) + (originalFollowStatus ? -1 : 1)),
    }));

    try {
      await api.post(followEndpoint, {
        follower_id: CURRENT_USER_ID,
        following_id: targetUserId,
      });
    } catch (error) {
      console.error(`Error ${originalFollowStatus ? "unfollowing" : "following"} user:`, error);
      setIsFollowing(originalFollowStatus);
      setUserProfile((prev) => ({
        ...prev,
        followers: originalFollowerCount,
      }));
      alert(`Failed to ${originalFollowStatus ? "unfollow" : "follow"} user. Please try again.`);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (!userProfile?.id) return;
    navigate(`/messages/${userProfile.id}`);
  };

  const handleViewAllChallengesClick = () => {
    navigate("/challenges");
  };

  // --- Action Handlers from Home.jsx (adapted for userArtworks state) ---

  const handleLikeToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      setArtworksError("You must be logged in to like posts.");
      return;
    }

    const postIndex = userArtworks.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const originalPost = userArtworks[postIndex];
    const optimisticStatus = !currentStatus;
    const optimisticCount = currentStatus ? originalPost.likeCount - 1 : originalPost.likeCount + 1;

    setUserArtworks((prevArtworks) => prevArtworks.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: Math.max(0, optimisticCount) } : p)));

    try {
      const response = await api.post("/likes/create-delete", {
        postId: postId,
        userId: CURRENT_USER_ID,
      });

      if (response.data.success) {
        console.log(`Like status toggled for post ${postId}: ${response.data.data.message}`);
        setArtworksError(null); // Clear error on success
      } else {
        console.error(`Backend failed to toggle like status for post ${postId}:`, response.data.message || "Unknown backend error");
        setUserArtworks((prevArtworks) => prevArtworks.map((p) => (p.id === postId ? originalPost : p)));
        setArtworksError(response.data.message || "Could not update like status. Please try again.");
      }
    } catch (err) {
      console.error("Error toggling like status:", err);
      setUserArtworks((prevArtworks) => prevArtworks.map((p) => (p.id === postId ? originalPost : p)));
      let errorMsg = "Could not update like status. Please try again.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setArtworksError(errorMsg);
    }
  };

  const handleBookmarkToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      setArtworksError("You must be logged in to bookmark posts.");
      return;
    }

    const postIndex = userArtworks.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const originalPost = userArtworks[postIndex];
    const optimisticStatus = !currentStatus;

    setUserArtworks((prevArtworks) => prevArtworks.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));

    try {
      const response = await api.post("/bookmarks/create-delete", {
        postId: postId,
        userId: CURRENT_USER_ID,
      });

      if (response.data.success) {
        console.log(`Bookmark status toggled for post ${postId}: ${response.data.data.message}`);
        setArtworksError(null);
      } else {
        console.error(`Backend failed to toggle bookmark status for post ${postId}:`, response.data.message || "Unknown backend error");
        setUserArtworks((prevArtworks) => prevArtworks.map((p) => (p.id === postId ? originalPost : p)));
        setArtworksError(response.data.message || "Could not update bookmark status. Please try again.");
      }
    } catch (err) {
      console.error("Error toggling bookmark status:", err);
      setUserArtworks((prevArtworks) => prevArtworks.map((p) => (p.id === postId ? originalPost : p)));
      let errorMsg = "Could not update bookmark status. Please try again.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setArtworksError(errorMsg);
    }
  };

  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title });
    setIsCommentModalOpen(true);
  };

  const handleCommentAdded = (postId) => {
    setUserArtworks((prevArtworks) => prevArtworks.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  const handleDeletePost = async () => {
    if (!postToDelete || !CURRENT_USER_ID) return;

    const postOwnerId = userArtworks.find((p) => p.id === postToDelete)?.userId;
    if (postOwnerId !== CURRENT_USER_ID) {
      setArtworksError("You can only delete your own posts.");
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
      return;
    }

    // Add loading state to delete button? Optional.
    try {
      const response = await api.delete(`/posts/${postToDelete}`);
      if (response.data.success) {
        setUserArtworks((prevArtworks) => prevArtworks.filter((post) => post.id !== postToDelete));
        // Decrement total posts count in profile stats optimistically
        setUserProfile((prev) => ({ ...prev, posts: Math.max(0, (prev?.posts || 0) - 1) }));
        setUserStats((prev) => ({ ...prev, totalUploads: Math.max(0, (prev?.totalUploads || 0) - 1) }));
        setArtworksError(null);
      } else {
        setArtworksError(response.data.message || "Failed to delete post.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      setArtworksError("An error occurred while deleting the post.");
    } finally {
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // --- Helper functions for styling ---
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "illustration":
        return "text-primary bg-primary/10 hover:bg-primary/20";
      case "manga":
        return "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
      case "novel":
        return "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 hover:bg-gray-500/20";
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case "Winner":
        return "bg-amber-500/10 text-amber-500";
      case "Top 10":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-muted-foreground/10 text-muted-foreground";
    }
  };

  // --- Render Logic ---

  // Loading State (Profile Fetch)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  // Error State (Profile Fetch Error)
  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-600">Error: {error}</p>
        <p className="mt-2 text-muted-foreground">Could not load profile data for user ID: {userIdParam}. Please check the ID or try again later.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          {" "}
          Go Home{" "}
        </Button>
      </div>
    );
  }

  // Profile not found (API succeeded but no data)
  if (!userProfile) {
    return (
      <div className="text-center p-10">
        <p className="text-muted-foreground">Profile not found for user ID: {userIdParam}.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          {" "}
          Go Home{" "}
        </Button>
      </div>
    );
  }

  // --- Success State - Render Profile ---
  const avatarUrl = getFullStorageUrl(userProfile.avatar);
  const userBio = userProfile.bio;
  console.log("User Profile Data:", userProfile); // Debugging line to check profile data
  const displayName = [userProfile.first_name, userProfile.last_name].filter(Boolean).join(" ") || userProfile.username;
  const xpPercentage = Math.min(100, Math.max(0, ((userProfile.exp || 0) / 100) * 100));

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Profile Header */}
      <Card className="border-t-4 border-t-indigo-500 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left Side: Avatar, Name, Actions */}
            <div className="flex flex-col items-center md:items-start w-full md:w-auto">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md ring-2 ring-offset-2 ring-offset-background ring-indigo-200">
                <AvatarImage src={avatarUrl} alt={`${userProfile.username}'s Avatar`} />
                <AvatarFallback>{userProfile.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
              </Avatar>

              <div className="mt-4 text-center md:text-left">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <p className="text-muted-foreground">@{userProfile.username}</p>

                <div className="flex items-center justify-center md:justify-start mt-2 space-x-2 flex-wrap">
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 font-medium">
                    Level {userProfile.level || 1}
                  </Badge>
                  {/* <Badge variant="secondary">Digital Artist</Badge> */}
                </div>

                {/* Action Buttons */}
                {!isCurrentUserProfile && CURRENT_USER_ID !== null && (
                  <div className="flex mt-4 space-x-3 justify-center md:justify-start">
                    <Button onClick={handleFollowToggle} size="sm" variant={isFollowing ? "outline" : "default"} disabled={followLoading} className="min-w-[100px]">
                      {followLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          {" "}
                          <UserMinus className="mr-2 h-4 w-4" /> Unfollow{" "}
                        </>
                      ) : (
                        <>
                          {" "}
                          <UserPlus className="mr-2 h-4 w-4" /> Follow{" "}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleMessageClick} size="sm">
                      {" "}
                      Message{" "}
                    </Button>
                  </div>
                )}
                {isCurrentUserProfile && (
                  <div className="flex mt-4 justify-center md:justify-start">
                    <Button onClick={() => navigate("/settings/profile")} size="sm">
                      {" "}
                      Edit Profile{" "}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Bio, Stats, Location, Progress */}
            <div className="flex-1 mt-6 md:mt-0 space-y-4">
              {userBio && (
                <Card className="bg-muted/30 p-4 border border-dashed">
                  <CardDescription className="whitespace-pre-wrap">{userBio}</CardDescription>
                </Card>
              )}

              {/* Platform Links */}
              {userProfile.platform_links && userProfile.platform_links.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.platform_links.map((link, index) => (
                      <TooltipProvider key={index} delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                              <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Link ${index + 1}`}>
                                {getPlatformIcon(link)}
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {" "}
                            <p>{link}</p>{" "}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}

              {/* Followers/Following/Location */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm cursor-default">
                        <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <span className="font-medium">{userProfile.followers ?? 0}</span>
                        <span className="ml-1 text-muted-foreground">Followers</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {" "}
                      <p>People following {userProfile.username}</p>{" "}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm cursor-default">
                        <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <span className="font-medium">{userProfile.followings ?? 0}</span>
                        <span className="ml-1 text-muted-foreground">Following</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {" "}
                      <p>People {userProfile.username} follows</p>{" "}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {userProfile.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
              </div>

              {/* Level Progress */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Level Progress</h3>
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{userProfile.exp || 0} / 100 XP</span>
                </div>
                <Progress value={xpPercentage} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground text-right">
                  {100 - (userProfile.exp || 0)} XP to Level {(userProfile.level || 1) + 1}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {userStats ? (
              <>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <Image className="h-5 w-5 text-indigo-500 mb-1.5" />
                    <span className="font-bold text-lg">{userStats.totalUploads}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Uploads</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <Heart className="h-5 w-5 text-red-500 mb-1.5" />
                    <span className="font-bold text-lg">{userStats.totalLikes}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Likes Rec.</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <MessageCircle className="h-5 w-5 text-blue-500 mb-1.5" />
                    <span className="font-bold text-lg">{userStats.totalComments}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Comments</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <Trophy className="h-5 w-5 text-orange-500 mb-1.5" />
                    <span className="font-bold text-lg">{userStats.challengesParticipated}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Challenges</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <Crown className="h-5 w-5 text-amber-500 mb-1.5" />
                    <span className="font-bold text-lg">{userStats.challengesWon}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Wins</span>
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-4">Stats not available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Profile Content Tabs --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="artworks" className="flex items-center justify-center gap-2">
            {" "}
            <Image className="h-4 w-4" /> Artworks{" "}
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center justify-center gap-2">
            {" "}
            <Award className="h-4 w-4" /> Badges{" "}
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center justify-center gap-2">
            {" "}
            <Star className="h-4 w-4" /> Achievements{" "}
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center justify-center gap-2">
            {" "}
            <Trophy className="h-4 w-4" /> Challenges{" "}
          </TabsTrigger>
        </TabsList>

        {/* --- Artworks Tab Content (Fetched Data - Lazy Loading) --- */}
        <TabsContent value="artworks" className="mt-6 space-y-6">
          {" "}
          {/* Added space-y-6 */}
          {/* Display Error if exists */}
          {artworksError && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              <span className="font-medium">Error!</span> {artworksError}
            </div>
          )}
          {artworksLoading ? (
            // Initial Loading Skeleton for Artworks
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: ARTWORKS_PAGE_LIMIT }).map((_, index) => (
                <Card key={`artwork-skeleton-${index}`} className="overflow-hidden">
                  <CardHeader className="pb-2 space-y-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          {" "}
                          <Skeleton className="h-4 w-20 mb-1" /> <Skeleton className="h-3 w-16" />{" "}
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                  </CardHeader>
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="pt-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex space-x-4">
                      {" "}
                      <Skeleton className="h-8 w-16" /> <Skeleton className="h-8 w-16" />{" "}
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : userArtworks && userArtworks.length > 0 ? (
            // Display Fetched Artworks
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userArtworks.map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden flex flex-col">
                    {" "}
                    {/* Added flex flex-col */}
                    {/* Card Header */}
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getFullStorageUrl(artwork.avatar)} alt={artwork.username} />
                            <AvatarFallback>{artwork.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{artwork.username}</p>
                            <p className="text-xs text-muted-foreground">Level {artwork.level || 1}</p>
                            <p className="text-xs text-muted-foreground">{artwork.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${getTypeColor(artwork.type)} capitalize`}>
                            {" "}
                            {artwork.type || "Unknown"}{" "}
                          </Badge>
                          {CURRENT_USER_ID === artwork.userId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                  {" "}
                                  <MoreHorizontal className="h-4 w-4" />{" "}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setPostToDelete(artwork.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {/* Image Carousel */}
                    <ImageCarousel images={artwork.images} title={artwork.title} />
                    {/* Card Content */}
                    <CardContent className="pt-4 flex-grow">
                      {" "}
                      {/* Added flex-grow */}
                      <h3 className="text-lg font-semibold">{artwork.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{artwork.description}</p>
                      {artwork.tags && Array.isArray(artwork.tags) && artwork.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {artwork.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs capitalize">
                              {" "}
                              #{tag}{" "}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    {/* Card Footer - Like, Comment, Bookmark */}
                    <CardFooter className="flex justify-between border-t pt-4 mt-auto">
                      {" "}
                      {/* Added mt-auto */}
                      <div className="flex space-x-4">
                        <HoverCard openDelay={200} closeDelay={100}>
                          <TooltipProvider>
                            {" "}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center space-x-1 h-8 pl-1 pr-2 rounded-l-md ${artwork.postLikeStatus ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
                                    onClick={() => handleLikeToggle(artwork.id, artwork.postLikeStatus)}
                                    disabled={!CURRENT_USER_ID}
                                  >
                                    <Heart className={`h-4 w-4 ${artwork.postLikeStatus ? "fill-current" : ""}`} />
                                  </Button>
                                  <HoverCardTrigger asChild>
                                    <span
                                      className={`cursor-pointer text-sm font-medium h-8 flex items-center pr-2 pl-1 border-l border-transparent hover:bg-accent rounded-r-md ${
                                        artwork.postLikeStatus ? "text-red-500" : "text-muted-foreground"
                                      }`}
                                    >
                                      {artwork.likeCount || 0}
                                    </span>
                                  </HoverCardTrigger>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {" "}
                                <p>{!CURRENT_USER_ID ? "Login to like" : artwork.postLikeStatus ? "Unlike" : "Like"} this post</p>{" "}
                              </TooltipContent>
                            </Tooltip>{" "}
                          </TooltipProvider>
                          <HoverCardContent className="w-auto p-0" side="top" align="start">
                            {artwork.id && <LikesHoverCard postId={artwork.id} />}
                          </HoverCardContent>
                        </HoverCard>

                        <TooltipProvider>
                          {" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8 text-muted-foreground hover:text-foreground" onClick={() => openCommentModal(artwork)}>
                                <MessageCircle className="h-4 w-4" />
                                <span>{artwork.commentCount || 0}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {" "}
                              <p>View or add comments</p>{" "}
                            </TooltipContent>
                          </Tooltip>{" "}
                        </TooltipProvider>
                      </div>
                      <TooltipProvider>
                        {" "}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 ${artwork.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                              onClick={() => handleBookmarkToggle(artwork.id, artwork.bookmarkStatus)}
                              disabled={!CURRENT_USER_ID}
                            >
                              <Bookmark className={`h-4 w-4 ${artwork.bookmarkStatus ? "fill-current" : ""}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {" "}
                            <p>{!CURRENT_USER_ID ? "Login to bookmark" : artwork.bookmarkStatus ? "Remove from bookmarks" : "Save to bookmarks"}</p>{" "}
                          </TooltipContent>
                        </Tooltip>{" "}
                      </TooltipProvider>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Load More Button Section */}
              {hasMoreArtworks && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchArtworksPage(currentPage)} // Fetch the next page
                    disabled={loadingMoreArtworks}
                  >
                    {loadingMoreArtworks ? (
                      <>
                        {" "}
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...{" "}
                      </>
                    ) : (
                      "Load More Artworks"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Message if no artworks found and not loading initially
            <Card className="col-span-full flex items-center justify-center h-40">
              <CardDescription>{userProfile.username} hasn't uploaded any artworks yet.</CardDescription>
            </Card>
          )}
        </TabsContent>

        {/* --- Other Tabs (Badges, Achievements, Challenges - Dummy Data) --- */}
        <TabsContent value="badges" className="mt-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
              <CardDescription>Recognitions for achievements and milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <HoverCard key={badge.id} openDelay={100} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        <Card className="flex items-center p-3 space-x-3 cursor-default bg-muted/40 hover:bg-muted/70 transition-colors">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">Earned: {badge.date}</p>
                          </div>
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-60">
                        <p className="text-sm font-semibold">{badge.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No badges earned yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle>Achievements Progress</CardTitle>
              <CardDescription>Track progress towards platform goals.</CardDescription>
            </CardHeader>
            <CardContent>
              {achievements && achievements.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4 -mr-4">
                  <div className="space-y-4">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="flex items-center space-x-3 p-3 rounded-md bg-muted/40">
                        <div className={`p-1.5 rounded-full ${ach.completed ? "bg-green-500/20" : "bg-muted"}`}>{ach.completed ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Star className="h-5 w-5 text-amber-500" />}</div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${ach.completed ? "text-foreground" : "text-muted-foreground"}`}>{ach.name}</p>
                          <Progress value={ach.progress} className="h-1.5 mt-1" />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-12 text-right">{ach.progress}%</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8">No achievements to display.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Challenge History</CardTitle>
                <CardDescription>Participation and results in past challenges.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewAllChallengesClick}>
                {" "}
                View All{" "}
              </Button>
            </CardHeader>
            <CardContent>
              {challengeHistory && challengeHistory.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4 -mr-4">
                  <div className="space-y-4">
                    {challengeHistory.map((chal) => (
                      <div key={chal.id} className="flex items-center space-x-3 p-3 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors">
                        <Avatar className="h-10 w-10 rounded-md border">
                          <AvatarImage src={chal.thumbnail} alt={chal.title} />
                          <AvatarFallback>
                            {" "}
                            <Trophy className="h-4 w-4" />{" "}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{chal.title}</p>
                          <p className="text-xs text-muted-foreground">Artwork: {chal.artwork}</p>
                        </div>
                        <Badge variant="outline" className={`${getResultColor(chal.result)} text-xs`}>
                          {" "}
                          {chal.result}{" "}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8">No challenge history available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Modals Rendered Outside Main Layout Flow (from Home.jsx) --- */}
      {isCommentModalOpen && selectedPostForModal && (
        <CommentModal
          postId={selectedPostForModal.id}
          postTitle={selectedPostForModal.title}
          isOpen={isCommentModalOpen}
          onClose={() => {
            setIsCommentModalOpen(false);
            setSelectedPostForModal(null);
          }}
          onCommentAdded={handleCommentAdded}
          currentUser={CURRENT_USER_DATA ? { id: CURRENT_USER_DATA.id, username: CURRENT_USER_DATA.username, avatar: CURRENT_USER_DATA.avatar, level: CURRENT_USER_DATA.level || 1 } : null}
        />
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the post and all associated data.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {" "}
              Cancel{" "}
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              {" "}
              Delete{" "}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
