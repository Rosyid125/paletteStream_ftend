// --- Import necessary components and hooks ---
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Image, Trophy, Star, Award, Users, Heart, MessageCircle, CheckCircle2, Crown, MapPin, Bookmark, LinkIcon, Github, Linkedin, Twitter, UserPlus, UserMinus, Loader2, MoreHorizontal, Trash2, Edit, Flag } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";

// --- Import new components from Home ---
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { CommentModal } from "@/components/CommentModal";
import { EditPost } from "@/components/EditPost";
import { ReportPostModal } from "@/components/ReportPostModal";
import ChatPopup from "@/components/ChatPopup";
import FollowersModal from "@/components/FollowersModal";
import { useAuth } from "@/contexts/AuthContext";

// --- Constants from Home (adapted) ---
const ARTWORKS_PAGE_LIMIT = 6;

// --- Helper function to construct full URL for storage paths ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.replace(/\\/g, "/");
  let relativePath = normalizedPath;
  // Adjusted logic: Assume paths starting with 'storage/' are relative to base URL root
  if (normalizedPath.startsWith("storage/")) {
    // Remove potential leading slash if base URL ends with one
    relativePath = normalizedPath; // Keep 'storage/' prefix
  } else if (!normalizedPath.startsWith("/api") && !normalizedPath.startsWith("storage/")) {
    // If it's neither '/api/...' nor 'storage/...', prefix with '/api/' (adjust if needed)
    // This might need refinement based on your actual asset paths
    relativePath = `/api/${normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath}`;
    console.warn(`Prefixed non-storage path with /api/: ${relativePath}`);
  }

  const baseUrl = api.defaults.baseURL || window.location.origin;
  const separator = baseUrl.endsWith("/") ? "" : "/"; // Add separator only if needed

  try {
    // Construct URL ensuring 'storage/' paths are relative to the domain root
    const url = new URL(relativePath, baseUrl + separator);
    return url.href;
  } catch (e) {
    console.error("Error constructing image URL:", e, `Base: ${baseUrl}`, `Path: ${relativePath}`);
    return "/placeholder.svg";
  }
};

// --- Helper function to get platform icon ---
const getPlatformIcon = (url) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("github.com")) return <Github className="h-4 w-4" />;
    if (hostname.includes("linkedin.com")) return <Linkedin className="h-4 w-4" />;
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return <Twitter className="h-4 w-4" />;
  } catch {
    /* Invalid URL */
  }
  return <LinkIcon className="h-4 w-4" />;
};
// --- End Helper ---

export default function Profile() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // Get current user from AuthContext
  const { userId: userIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = Number(userIdParam); // <<< USE THIS ID for fetching the profile owner's data

  // Get tab from URL query parameter
  const tabFromUrl = searchParams.get("tab");
  const validTabs = ["artworks", "achievements", "stats", "badges", "challenges"];
  const defaultTab = "artworks";
  const initialTab = validTabs.includes(tabFromUrl) ? tabFromUrl : defaultTab;

  // State for data fetched from API
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Follow logic
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // State for User Artworks (Posts) - using userId from param
  const [userArtworks, setUserArtworks] = useState([]);
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [loadingMoreArtworks, setLoadingMoreArtworks] = useState(false);
  const [artworksError, setArtworksError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreArtworks, setHasMoreArtworks] = useState(true);
  // State for dummy data
  const [badges, setBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [badgesError, setBadgesError] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState(null);
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [challengeHistoryLoading, setChallengeHistoryLoading] = useState(true);
  const [challengeHistoryError, setChallengeHistoryError] = useState(null);
  const [challengeStats, setChallengeStats] = useState(null);
  const [challengeFilter, setChallengeFilter] = useState("all");

  const [activeTab, setActiveTab] = useState(initialTab);
  // State for Modals
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null); // --- NEW: State for Edit Post Modal ---
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  // --- NEW: State for Report Post Modal ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [postToReport, setPostToReport] = useState(null);

  // State for Logged-in User Data
  const [CURRENT_USER_ID, setUserId] = useState(null);
  const [CURRENT_USER_DATA, setUserData] = useState(null);
  // State for Chat Popup
  const [chatUserId, setChatUserId] = useState(null);

  // State for Followers Modal
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState("followers");

  // Get logged-in user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setUserId(parsedData?.id); // Set CURRENT_USER_ID

        // *** Compare userId (from param) with CURRENT_USER_ID (from storage) ***
        setIsCurrentUserProfile(userId === parsedData?.id);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        setUserData(null);
        setUserId(null);
      }
    } else {
      setUserData(null);
      setUserId(null);
    }
  }, [userId]); // Runs when userId changes

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    // *** Use userId (from param) here ***
    if (!userId || isNaN(userId)) {
      setError("Invalid or missing User ID in the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setUserProfile(null);
    setUserStats(null);
    setUserArtworks([]); // Reset artworks when profile changes
    setArtworksError(null);
    setCurrentPage(1);
    setHasMoreArtworks(true);
    setArtworksLoading(false);
    setLoadingMoreArtworks(false);
    setIsFollowing(false);

    try {
      // *** Use userId (from param) in the API URL ***
      const response = await api.get(`/profiles/profile/${userId}`, {
        // Pass CURRENT_USER_ID as viewerId to check follow status
        params: { viewerId: CURRENT_USER_ID ?? 0 },
      });

      if (response.data && response.data.success) {
        const profileData = response.data.data;
        const currentLevel = Number(profileData.level) || 1;
        const currentThreshold = Number(profileData.current_treshold) || 0;
        const nextThreshold = Number(profileData.next_treshold) || currentThreshold + 100;

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
          level: currentLevel,
          exp: Number(profileData.exp) || 0,
          // Ensure 'id' from profileData is used, it should match 'userId' from param
          id: Number(profileData.id),
          userFollowStatus: profileData.userFollowStatus ?? false,
          platform_links: Array.isArray(profileData.platform_links) ? profileData.platform_links : [],
          location: profileData.location || null,
          first_name: profileData.first_name || null,
          last_name: profileData.last_name || null,
          username: profileData.username || "Unknown",
          current_treshold: currentThreshold,
          next_treshold: nextThreshold,
        };
        setUserProfile(correctedProfileData);

        setUserStats({
          totalUploads: correctedProfileData.posts,
          totalLikes: correctedProfileData.likes,
          totalComments: correctedProfileData.comments,
          challengesParticipated: correctedProfileData.challanges,
          challengesWon: correctedProfileData.challangeWins,
        });

        setIsFollowing(correctedProfileData.userFollowStatus);
      } else {
        setError(response.data?.message || "Failed to fetch profile data.");
        setUserProfile(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "An error occurred while fetching the profile.");
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // --- *** FIXED: Function to fetch user artworks (posts) for a specific page *** ---
  const fetchArtworksPage = useCallback(
    async (pageToFetch) => {
      // *** Guard clause: Check if userId (from param) is valid ***
      if (!userId || isNaN(userId)) {
        setArtworksError("Cannot fetch artworks without a valid Profile User ID.");
        setArtworksLoading(false); // Ensure loading state is reset
        setLoadingMoreArtworks(false);
        return;
      }

      // Set loading state
      if (pageToFetch === 1) {
        setArtworksLoading(true);
      } else {
        setLoadingMoreArtworks(true);
      }
      setArtworksError(null);

      try {
        // *** Use userId (from param) in the API URL to get the profile owner's posts ***
        const response = await api.get(`/posts/${userId}`, {
          params: {
            page: pageToFetch,
            limit: ARTWORKS_PAGE_LIMIT,
            // *** Pass CURRENT_USER_ID (logged-in user) as viewerId ***
            // This tells the backend *who* is viewing, needed for like/bookmark status
            viewerId: CURRENT_USER_ID ?? 0,
          },
        });

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const fetchedData = response.data.data;

          const processedData = fetchedData.map((post) => ({
            ...post,
            bookmarkStatus: post.bookmarkStatus === undefined ? false : post.bookmarkStatus,
            postLikeStatus: post.postLikeStatus === undefined ? false : post.postLikeStatus,
            likeCount: post.likeCount === undefined ? 0 : Number(post.likeCount) || 0,
            commentCount: post.commentCount === undefined ? 0 : Number(post.commentCount) || 0,
            // userId here refers to the *author* of the post, which should match the profile userId
            userId: Number(post.userId),
            id: Number(post.id),
            level: Number(post.level) || 1,
            images: Array.isArray(post.images) ? post.images : [],
            tags: Array.isArray(post.tags) ? post.tags : [],
            createdAt: post.createdAt,
            // Use post author's details, fallback to profile data if missing (unlikely but safe)
            avatar: post.avatar || userProfile?.avatar || null,
            username: post.username || userProfile?.username || "Unknown User",
            type: post.type || "Unknown",
            title: post.title || "Untitled",
            description: post.description || "No description.",
          }));

          setUserArtworks((prevArtworks) => (pageToFetch === 1 ? processedData : [...prevArtworks, ...processedData]));
          setCurrentPage(pageToFetch + 1);
          setHasMoreArtworks(processedData.length === ARTWORKS_PAGE_LIMIT);
        } else {
          setArtworksError(response.data?.message || "Failed to fetch artworks.");
          if (pageToFetch === 1) setUserArtworks([]);
          setHasMoreArtworks(false);
        }
      } catch (error) {
        setArtworksError(error.response?.data?.message || error.message || "An error occurred while fetching artworks.");
        if (pageToFetch === 1) setUserArtworks([]);
        setHasMoreArtworks(false);
      } finally {
        if (pageToFetch === 1) {
          setArtworksLoading(false);
        } else {
          setLoadingMoreArtworks(false);
        }
      }
    },
    // *** Update dependencies: Use userId (from param) and CURRENT_USER_ID (from storage) ***
    [userId, CURRENT_USER_ID, userProfile]
  );

  // --- Effect to sync tab with URL parameter ---
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab, validTabs]);

  // --- Function to handle tab changes and update URL ---
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Update URL with new tab parameter
    const newSearchParams = new URLSearchParams(searchParams);
    if (newTab !== defaultTab) {
      newSearchParams.set("tab", newTab);
    } else {
      newSearchParams.delete("tab");
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  // --- Effect to fetch profile when userId (from param) changes ---
  useEffect(() => {
    if (userId && !isNaN(userId)) {
      fetchUserProfile(); // Fetch profile based on URL param ID
    } else {
      console.error("User ID parameter is missing or invalid in URL.");
      setError("User ID parameter is missing or invalid.");
      setLoading(false); // Stop loading if ID is invalid
    }
    setActiveTab("artworks"); // Default to artworks tab on profile change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Re-fetch profile if the userId param changes

  // --- Effect to fetch initial artworks when the artworks tab is active AND profile is loaded ---
  useEffect(() => {
    // Fetch only if tab is artworks, profile loaded, no error, no artworks yet, more exist, not loading
    if (activeTab === "artworks" && userProfile && !loading && !error && userArtworks.length === 0 && hasMoreArtworks && !artworksLoading) {
      // *** Pass the correct page number (1) to fetchArtworksPage ***
      fetchArtworksPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userProfile, loading, error, hasMoreArtworks, artworksLoading, fetchArtworksPage]); // Keep dependencies including fetchArtworksPage
  // --- Effect to fetch achievements for the profile user ---
  useEffect(() => {
    setAchievementsLoading(true);
    setAchievementsError(null);
    api
      .get(`/achievements/user/${userId}`)
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setAchievements(res.data.data);
        } else {
          setAchievements([]);
          setAchievementsError("Failed to fetch achievements.");
        }
      })
      .catch((err) => {
        setAchievements([]);
        setAchievementsError(err.response?.data?.message || err.message || "Failed to fetch achievements.");
      })
      .finally(() => setAchievementsLoading(false));
  }, [userId]);

  // --- Effect to fetch badges for the profile user ---
  useEffect(() => {
    setBadgesLoading(true);
    setBadgesError(null);
    api
      .get(`/gamification/profile/badges/${userId}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setBadges(res.data.data.badges || []);
        } else {
          setBadges([]);
          setBadgesError("Failed to fetch badges.");
        }
      })
      .catch((err) => {
        setBadges([]);
        setBadgesError(err.response?.data?.message || err.message || "Failed to fetch badges.");
      })
      .finally(() => setBadgesLoading(false));
  }, [userId]);

  // --- Effect to fetch challenge history for the profile user ---
  useEffect(() => {
    setChallengeHistoryLoading(true);
    setChallengeHistoryError(null);
    api
      .get(`/gamification/profile/challenges/${userId}`, {
        params: { status: challengeFilter },
      })
      .then((res) => {
        if (res.data && res.data.success) {
          setChallengeHistory(res.data.data.challenges || []);
          setChallengeStats(res.data.data.stats || null);
        } else {
          setChallengeHistory([]);
          setChallengeHistoryError("Failed to fetch challenge history.");
        }
      })
      .catch((err) => {
        setChallengeHistory([]);
        setChallengeHistoryError(err.response?.data?.message || err.message || "Failed to fetch challenge history.");
      })
      .finally(() => setChallengeHistoryLoading(false));
  }, [userId, challengeFilter]);
  // --- Helper function to get rank color ---
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"; // Gold
      case 2:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"; // Silver
      case 3:
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"; // Bronze
      default:
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };
  // --- Helper function to get status badge ---
  const getStatusBadge = (status) => {
    const badges = {
      won: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: "🏆", label: "Won" },
      active: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: "⏳", label: "Active" },
      participated: { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: "📝", label: "Participated" },
    };
    return badges[status] || badges.participated;
  };

  // --- Helper function to format date ---  // --- Helper function to format date safely ---
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // --- Event Handlers ---

  // Follow/Unfollow Handler - Uses userProfile.id (target user)
  const handleFollowToggle = async () => {
    if (!userProfile || followLoading || isCurrentUserProfile || !CURRENT_USER_ID) return;
    setFollowLoading(true);
    const targetUserId = userProfile.id; // The ID of the profile being viewed
    const followEndpoint = `/follows/create-delete/${targetUserId}`;
    const originalFollowStatus = isFollowing;
    const originalFollowerCount = userProfile.followers;

    // Optimistic UI
    setIsFollowing(!originalFollowStatus);
    setUserProfile((prev) => ({ ...prev, followers: Math.max(0, (prev.followers ?? 0) + (originalFollowStatus ? -1 : 1)) }));

    try {
      // POST request - backend identifies follower via token, target via URL
      const response = await api.post(followEndpoint);
      if (response.data && response.data.message) {
        // Optional: Verify response message matches action
        console.log(`Follow toggle successful: ${response.data.message}`);
        if ((originalFollowStatus && response.data.message === "User follow created") || (!originalFollowStatus && response.data.message === "User follow deleted")) {
          console.warn("Backend response message mismatch with expected action. Reverting UI.");
          setIsFollowing(originalFollowStatus);
          setUserProfile((prev) => ({ ...prev, followers: originalFollowerCount }));
        }
      } else {
        console.warn("Follow toggle API response lacked expected message format:", response.data);
      }
    } catch (error) {
      console.error(`Error toggling follow status for user ${targetUserId}:`, error);
      // Rollback optimistic update
      setIsFollowing(originalFollowStatus);
      setUserProfile((prev) => ({ ...prev, followers: originalFollowerCount }));
      // Use artworksError state or a dedicated profile error state
      setArtworksError(`Failed to ${originalFollowStatus ? "unfollow" : "follow"} user: ${error.response?.data?.message || "Please try again."}`);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (!userProfile?.id) return;
    setChatUserId(userProfile.id); // Open chat popup with this user
  };
  const handleViewAllChallengesClick = () => {
    navigate("/challenges");
  };

  const handleOpenFollowersModal = (tab = "followers") => {
    setFollowersModalTab(tab);
    setIsFollowersModalOpen(true);
  };

  // --- Action Handlers for Artworks (Like, Bookmark, Comment, Delete) ---
  // These correctly use CURRENT_USER_ID for performing actions,
  // and update the userArtworks state which contains the profile owner's posts.

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
    setUserArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: Math.max(0, optimisticCount) } : p)));
    try {
      const response = await api.post("/likes/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "Backend error");
      setArtworksError(null);
    } catch (err) {
      console.error("Error toggling like:", err);
      setUserArtworks((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setArtworksError(err.message || "Could not update like status.");
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
    setUserArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));
    try {
      const response = await api.post("/bookmarks/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "Backend error");
      setArtworksError(null);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setUserArtworks((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setArtworksError(err.message || "Could not update bookmark status.");
    }
  };

  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title });
    setIsCommentModalOpen(true);
  };

  const handleCommentAdded = (postId) => {
    setUserArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  // Delete Post Handler - Correctly checks CURRENT_USER_ID against post's userId
  const handleDeletePost = async () => {
    if (!postToDelete || !CURRENT_USER_ID) return;

    // *** Verify ownership against the post data ***
    const postOwnerId = userArtworks.find((p) => p.id === postToDelete)?.userId;
    if (postOwnerId !== CURRENT_USER_ID) {
      setArtworksError("Verification failed: You can only delete your own posts.");
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
      return;
    }

    try {
      const response = await api.delete(`/posts/delete/${postToDelete}`);
      if (response.data.success) {
        // Remove post from state
        setUserArtworks((prevArtworks) => prevArtworks.filter((post) => post.id !== postToDelete));
        // Decrement profile counts
        setUserProfile((prev) => ({ ...prev, posts: Math.max(0, (prev?.posts || 0) - 1) }));
        setUserStats((prev) => ({ ...prev, totalUploads: Math.max(0, (prev?.totalUploads || 0) - 1) }));
        setArtworksError(null);
        console.log(`Post ${postToDelete} deleted successfully.`);
      } else {
        setArtworksError(response.data.message || "Failed to delete post.");
      }
    } catch (err) {
      setArtworksError(err.response?.data?.message || "An error occurred while deleting the post.");
    } finally {
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // --- *** NEW: Edit Post Functions *** ---
  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditPostOpen(true);
  };
  const handlePostUpdated = (postId, updatedData) => {
    setUserArtworks((prevArtworks) => prevArtworks.map((artwork) => (artwork.id === postId ? { ...artwork, ...updatedData } : artwork)));
  };
  // --- *** End of Edit Post Functions *** ---

  // --- *** NEW: Report Post Function *** ---
  const handleReportPost = (post) => {
    setPostToReport(post);
    setIsReportModalOpen(true);
  };
  // --- *** End of Report Post Function *** ---

  // --- Helper functions for styling ---
  const getTypeColor = (type) => {
    // ... (remains the same) ...
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
  const displayName = [userProfile.first_name, userProfile.last_name].filter(Boolean).join(" ") || userProfile.username;
  const currentExp = userProfile.exp || 0;
  const currentThreshold = userProfile.current_treshold ?? 0;
  const nextThreshold = userProfile.next_treshold ?? currentThreshold + 100;
  const xpInCurrentLevel = Math.max(0, currentExp - currentThreshold);
  const xpRangeForLevel = Math.max(1, nextThreshold - currentThreshold);
  const levelProgressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRangeForLevel) * 100));
  const xpNeededForNextLevel = Math.max(0, nextThreshold - currentExp);
  return (
    <div className="space-y-4 lg:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Profile Header Card */}
      <Card className="border-t-4 border-t-indigo-500 shadow-lg overflow-hidden">
        {/* ... (Profile Header Content remains largely the same, using userProfile data) ... */}
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            {/* Left Side: Avatar, Name, Actions */}
            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-background shadow-md ring-2 ring-offset-2 ring-offset-background ring-indigo-200">
                <AvatarImage src={avatarUrl} alt={`${userProfile.username}'s Avatar`} />
                <AvatarFallback>{userProfile.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
              </Avatar>

              <div className="mt-4 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{displayName}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">@{userProfile.username}</p>

                <div className="flex items-center justify-center sm:justify-start mt-2 space-x-2 flex-wrap">
                  {" "}
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 font-medium dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700 text-xs sm:text-sm">
                    Level {userProfile.level || 1}
                  </Badge>
                </div>

                {/* Action Buttons: Follow/Unfollow/Message or Edit Profile */}
                {/* Logic here correctly uses isCurrentUserProfile state */}
                {CURRENT_USER_ID !== null && !isCurrentUserProfile && (
                  <div className="flex flex-col sm:flex-row mt-4 space-y-2 sm:space-y-0 sm:space-x-3 justify-center sm:justify-start">
                    <Button onClick={handleFollowToggle} size="sm" variant={isFollowing ? "outline" : "default"} disabled={followLoading} className="min-w-[100px]">
                      {followLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" /> Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" /> Follow
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
                  <div className="flex mt-4 justify-center sm:justify-start">
                    <Button onClick={() => navigate("/settings/profile")} size="sm">
                      {" "}
                      Edit Profile{" "}
                    </Button>
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Right Side: Bio, Stats, Location, Progress */}
            <div className="flex-1 mt-4 sm:mt-6 md:mt-0 space-y-4">
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
                            <p>{link}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}{" "}
              {/* Followers/Following/Location */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => handleOpenFollowersModal("followers")}>
                        <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <span className="font-medium">{userProfile.followers ?? 0}</span>
                        <span className="ml-1 text-muted-foreground">Followers</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View people following {userProfile.username}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => handleOpenFollowersModal("following")}>
                        <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <span className="font-medium">{userProfile.followings ?? 0}</span>
                        <span className="ml-1 text-muted-foreground">Following</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View people {userProfile.username} follows</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {userProfile.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" /> <span>{userProfile.location}</span>
                  </div>
                )}
              </div>
              {/* Level Progress */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Level Progress</h3>
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    {currentExp} / {nextThreshold} XP
                  </span>
                </div>
                <Progress value={levelProgressPercentage} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground text-right">
                  {xpNeededForNextLevel} XP to Level {(userProfile.level || 1) + 1}
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-6" /> {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {userStats ? (
              <>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-2 sm:p-3 h-full text-center">
                    <Image className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 mb-1 sm:mb-1.5" />
                    <span className="font-bold text-sm sm:text-lg">{userStats.totalUploads}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Uploads</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-2 sm:p-3 h-full text-center">
                    <Heart className="h-5 w-5 text-red-500 mb-1.5" /> <span className="font-bold text-lg">{userStats.totalLikes}</span> <span className="text-xs text-muted-foreground mt-0.5">Likes Rec.</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <MessageCircle className="h-5 w-5 text-blue-500 mb-1.5" /> <span className="font-bold text-lg">{userStats.totalComments}</span> <span className="text-xs text-muted-foreground mt-0.5">Comments</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <Trophy className="h-5 w-5 text-orange-500 mb-1.5" /> <span className="font-bold text-lg">{userStats.challengesParticipated}</span> <span className="text-xs text-muted-foreground mt-0.5">Challenges</span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none shadow-sm hover:bg-muted/70 transition-colors duration-200">
                  <CardContent className="flex flex-col items-center justify-center p-3 h-full text-center">
                    <Crown className="h-5 w-5 text-amber-500 mb-1.5" /> <span className="font-bold text-lg">{userStats.challengesWon}</span> <span className="text-xs text-muted-foreground mt-0.5">Wins</span>
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-4">Stats not available.</p>
            )}
          </div>
        </CardContent>
      </Card>{" "}
      {/* --- Profile Content Tabs --- */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="artworks" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            {" "}
            <Image className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Artworks</span>
            <span className="xs:hidden">Art</span>{" "}
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            {" "}
            <Award className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Badges</span>
            <span className="xs:hidden">Badge</span>{" "}
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            {" "}
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Achievements</span>
            <span className="xs:hidden">Achiev</span>{" "}
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            {" "}
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Challenges</span>
            <span className="xs:hidden">Chall</span>{" "}
          </TabsTrigger>
        </TabsList>
        {/* --- Artworks Tab Content --- */}
        <TabsContent value="artworks" className="mt-6 space-y-6">
          {/* Artworks Error Message */}
          {artworksError && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              <span className="font-medium">Error!</span> {artworksError}
            </div>
          )}
          {/* Initial Artworks Loading Skeleton */}
          {artworksLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: ARTWORKS_PAGE_LIMIT }).map((_, index) => (
                <Card key={`artwork-skeleton-${index}`} className="overflow-hidden">
                  <CardHeader className="pb-2 space-y-0">
                    {" "}
                    {/* ... Skeleton Header ... */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {" "}
                        <Skeleton className="h-10 w-10 rounded-full" />{" "}
                        <div>
                          {" "}
                          <Skeleton className="h-4 w-20 mb-1" /> <Skeleton className="h-3 w-16" />{" "}
                        </div>{" "}
                      </div>
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                  </CardHeader>
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="pt-4">
                    {" "}
                    {/* ... Skeleton Content ... */}
                    <Skeleton className="h-5 w-3/4 mb-2" /> <Skeleton className="h-4 w-full mb-1" />
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    {" "}
                    {/* ... Skeleton Footer ... */}
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
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-start">
                        {/* Post Author Info (should be profile owner) */}
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
                        {/* Type Badge and Delete Dropdown */}
                        <div className="flex items-center space-x-2">
                          <Badge asChild variant="outline" className={`${getTypeColor(artwork.type)} capitalize cursor-pointer`} onClick={() => navigate(`/posts/type?query=${encodeURIComponent(artwork.type)}&page=1&limit=9`)}>
                            <span>{artwork.type || "Unknown"}</span>
                          </Badge>{" "}
                          {/* Show Edit/Delete for owners, Report for others */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>{" "}
                            <DropdownMenuContent align="end">
                              {CURRENT_USER_ID === artwork.userId ? (
                                // Show Edit/Delete for post owner
                                <>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      handleEditPost(artwork);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit Post
                                  </DropdownMenuItem>{" "}
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/30 cursor-pointer"
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setPostToDelete(artwork.id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                // Show Report for other users
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleReportPost(artwork);
                                  }}
                                >
                                  <Flag className="mr-2 h-4 w-4" /> Report Post
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <ImageCarousel images={artwork.images} title={artwork.title} />
                    <CardContent className="pt-4 flex-grow">
                      <h3 className="text-lg font-semibold">{artwork.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{artwork.description}</p>
                      {/* Tags */}
                      {artwork.tags && Array.isArray(artwork.tags) && artwork.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {artwork.tags.map((tag, tagIndex) => (
                            <Badge asChild key={tagIndex} variant="secondary" className="text-xs capitalize cursor-pointer" onClick={() => navigate(`/posts/tags?page=1&limit=9&query=${encodeURIComponent(tag)}`)}>
                              <span>#{tag}</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    {/* Like/Comment/Bookmark Footer */}
                    <CardFooter className="flex justify-between border-t pt-4 mt-auto">
                      <div className="flex space-x-4">
                        {/* Like Button & Hover Card */}
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
                          {/* Likes Hover Card Content */}
                          <HoverCardContent className="w-auto p-0" side="top" align="start">
                            {artwork.id && <LikesHoverCard postId={artwork.id} />}
                          </HoverCardContent>
                        </HoverCard>
                        {/* Comment Button */}
                        <TooltipProvider>
                          {" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8 text-muted-foreground hover:text-foreground" onClick={() => openCommentModal(artwork)}>
                                {" "}
                                <MessageCircle className="h-4 w-4" /> <span>{artwork.commentCount || 0}</span>{" "}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {" "}
                              <p>View or add comments</p>{" "}
                            </TooltipContent>
                          </Tooltip>{" "}
                        </TooltipProvider>
                      </div>
                      {/* Bookmark Button */}
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

              {/* Load More Button or End Message */}
              {hasMoreArtworks && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={() => fetchArtworksPage(currentPage)} disabled={loadingMoreArtworks}>
                    {loadingMoreArtworks ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                      </>
                    ) : (
                      "Load More Artworks"
                    )}
                  </Button>
                </div>
              )}
              {!hasMoreArtworks && userArtworks.length > 0 && !loadingMoreArtworks && <p className="text-center text-sm text-muted-foreground py-4">You&apos;ve reached the end of the artworks.</p>}
            </>
          ) : (
            // No Artworks Message
            <Card className="col-span-full flex items-center justify-center h-40 border-dashed">
              <CardDescription>{userProfile.username} hasn&apos;t uploaded any artworks yet.</CardDescription>
            </Card>
          )}
        </TabsContent>
        {/* --- Other Tabs (Badges, Achievements, Challenges - Dummy Data) --- */}{" "}
        <TabsContent value="badges" className="mt-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
              <CardDescription>Recognitions for achievements and milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              {badgesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={`badge-skeleton-${index}`} className="flex items-center p-3 space-x-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : badgesError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">⚠️ Failed to load badges</p>
                  <p className="text-sm text-muted-foreground">{badgesError}</p>
                </div>
              ) : badges && badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {" "}
                  {badges.map((badge) => (
                    <HoverCard key={badge.id} openDelay={100} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        <Card className="flex flex-col items-center p-4 space-y-3 cursor-default bg-muted/40 hover:bg-muted/70 transition-colors">
                          <div className="relative">
                            <img
                              src={getFullStorageUrl(badge.badge_img)}
                              alt={badge.challenge_title || "Challenge badge"}
                              className="w-16 h-16 object-contain rounded-lg"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg";
                              }}
                            />
                            <div className={`absolute -top-2 -right-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRankColor(badge.rank || 1)}`}>🏆 {badge.rank_display || `Rank ${badge.rank || 1}`}</div>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-sm">{badge.challenge_title || "Unknown Challenge"}</p>
                            <p className="text-xs text-muted-foreground">Earned: {formatDate(badge.earned_at)}</p>
                          </div>
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-60">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">{badge.challenge_title || "Unknown Challenge"}</p>
                          <p className="text-sm text-muted-foreground">🏆 {badge.rank_display || `Rank ${badge.rank || 1}`}</p>
                          {badge.admin_note && <p className="text-sm text-muted-foreground italic">&quot;{badge.admin_note}&quot;</p>}
                          <p className="text-xs text-muted-foreground">Earned on {formatDate(badge.earned_at)}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <div className="text-4xl mb-4">🏆</div>
                  <p>No badges earned yet</p>
                  <p className="text-sm">Participate in challenges to earn badges!</p>
                </div>
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
              {achievementsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full rounded-md" />
                  ))}
                </div>
              ) : achievementsError ? (
                <div className="text-xs text-red-500 py-2">{achievementsError}</div>
              ) : achievements.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4 -mr-4">
                  <div className="space-y-4">
                    {achievements.map((ach) => {
                      const progress = ach.progress || 0;
                      const goal = ach.goal || 1;
                      const status = ach.status || "locked";
                      return (
                        <div key={ach.id} className="flex items-center space-x-3 p-3 rounded-md bg-muted/40">
                          <div className={`p-1.5 rounded-full ${status === "completed" ? "bg-green-500/20" : status === "in_progress" ? "bg-amber-400/20" : "bg-muted"}`}>
                            {status === "completed" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : status === "in_progress" ? <Star className="h-5 w-5 text-amber-500" /> : <Award className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${status === "completed" ? "text-foreground" : status === "in_progress" ? "text-muted-foreground" : "text-gray-400"}`}>{ach.title}</p>
                            <p className="text-xs text-muted-foreground mb-1">{ach.description}</p>
                            <Progress value={Math.round((progress / goal) * 100)} className="h-1.5 mt-1" />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground w-12 text-right">{status === "completed" ? "100%" : `${Math.round((progress / goal) * 100)}%`}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8">No achievements to display.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>{" "}
        <TabsContent value="challenges" className="mt-6">
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Challenge History</CardTitle>
                <CardDescription>Participation and results in past challenges.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewAllChallengesClick}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {challengeHistoryLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`challenge-skeleton-${index}`} className="flex items-center space-x-3 p-3 rounded-md bg-muted/40">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : challengeHistoryError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">⚠️ Failed to load challenge history</p>
                  <p className="text-sm text-muted-foreground">{challengeHistoryError}</p>
                </div>
              ) : (
                <>
                  {" "}
                  {/* Stats Summary */}
                  {challengeStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{challengeStats.total_participated}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Participated</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{challengeStats.total_won}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Won</div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{challengeStats.active_participations}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{challengeStats.win_rate}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
                      </div>
                    </div>
                  )}
                  {/* Filter Tabs */}
                  <div className="flex space-x-4 border-b mb-4">
                    {[
                      { key: "all", label: "All" },
                      { key: "won", label: "Won" },
                      { key: "active", label: "Active" },
                      { key: "participated", label: "Participated" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setChallengeFilter(tab.key)}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                          challengeFilter === tab.key ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  {/* Challenges List */}
                  {challengeHistory && challengeHistory.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4 -mr-4">
                      <div className="space-y-4">
                        {challengeHistory.map((challenge) => {
                          const statusBadge = getStatusBadge(challenge.status);
                          return (
                            <div key={challenge.id} className="bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <img src={getFullStorageUrl(challenge.badge_img)} alt={challenge.title} className="w-12 h-12 object-contain rounded-md border" />
                                    <div>
                                      <h3 className="font-semibold text-lg">{challenge.title}</h3>
                                      <p className="text-gray-600 dark:text-gray-400 text-sm">{challenge.description}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                                    <span>Joined: {formatDate(challenge.participation_date)}</span>
                                    <span>Deadline: {formatDate(challenge.deadline)}</span>
                                  </div>

                                  {challenge.win_info && (
                                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-green-600 dark:text-green-400 font-medium">🏆 {challenge.win_info.rank_display}</span>
                                        {challenge.win_info.final_score && <span className="text-gray-600 dark:text-gray-400">• Score: {challenge.win_info.final_score}</span>}
                                      </div>
                                      {challenge.win_info.admin_note && <p className="text-green-700 dark:text-green-300 text-sm mt-1 italic">&quot;{challenge.win_info.admin_note}&quot;</p>}
                                    </div>
                                  )}
                                </div>

                                <div className="ml-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                    <span className="mr-1">{statusBadge.icon}</span>
                                    {statusBadge.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-4">🎯</div>
                      <p>No challenges found</p>
                      <p className="text-sm">{challengeFilter === "all" ? "Haven't participated in any challenges yet" : `No ${challengeFilter} challenges`}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* --- Modals --- */}
      {/* Comment Modal */}{" "}
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
          // Pass logged-in user details for adding comments
          currentUser={CURRENT_USER_DATA ? { id: CURRENT_USER_DATA.id, username: CURRENT_USER_DATA.username, avatar: getFullStorageUrl(CURRENT_USER_DATA.avatar), level: CURRENT_USER_DATA.level || 1 } : null}
        />
      )}{" "}
      {/* --- *** Edit Post Modal *** --- */}
      {isEditPostOpen && postToEdit && (
        <EditPost
          isOpen={isEditPostOpen}
          onClose={() => {
            setIsEditPostOpen(false);
            setPostToEdit(null);
          }}
          post={postToEdit}
          onPostUpdated={handlePostUpdated}
        />
      )}{" "}
      {/* --- *** Report Post Modal *** --- */}
      {isReportModalOpen && postToReport && (
        <ReportPostModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setPostToReport(null);
          }}
          post={postToReport}
          currentUser={currentUser}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            {" "}
            <DialogTitle>Are you absolutely sure?</DialogTitle> <DialogDescription> This action cannot be undone. This will permanently delete the post and all associated data (likes, comments, bookmarks). </DialogDescription>{" "}
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              {" "}
              <Button variant="outline">Cancel</Button>{" "}
            </DialogClose>
            <Button variant="destructive" onClick={handleDeletePost}>
              {" "}
              Delete Post{" "}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>{" "}
      {/* Chat Popup - Rendered at the bottom of the profile page */}
      {chatUserId && <ChatPopup openUserId={chatUserId} onClose={() => setChatUserId(null)} />}
      {/* Followers Modal */}
      <FollowersModal isOpen={isFollowersModalOpen} onClose={() => setIsFollowersModalOpen(false)} userId={userId} userProfile={userProfile} initialTab={followersModalTab} />
    </div>
  );
}
