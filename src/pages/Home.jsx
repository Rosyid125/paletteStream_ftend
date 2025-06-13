// --- Import necessary components and hooks ---
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Bookmark, Award, Clock, CheckCircle2, Trophy, Star, Flame as FlameIcon, TrendingUp, MoreHorizontal, Trash2, UserPlus, UserCheck, Loader2, Edit, Flag, Repeat2 } from "lucide-react"; // Tambahkan UserPlus, UserCheck, Loader2, Trash2, Edit, Flag, Repeat2
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Import Dialog components

// --- Import new components ---
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { CommentModal } from "@/components/CommentModal";
import { useNotificationHandler } from "@/hooks/useNotificationHandler";
import { EditPost } from "@/components/EditPost";
import { ReportPostModal } from "@/components/ReportPostModal";

// --- Import instance Axios ---
import api from "./../api/axiosInstance"; // Pastikan path ini benar
import { Flame as Fire } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// --- Constants ---
const POSTS_PER_PAGE = 9;
const RECOMMENDED_USERS_LIMIT = 5; // *** NEW: Limit for recommended users per page ***

export default function Home() {
  const navigate = useNavigate(); // Hook untuk navigasi
  const { user } = useAuth(); // Get user from AuthContext

  // Handle notification redirects and highlighting
  useNotificationHandler();

  // --- State untuk Posts (Feed) ---
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // --- State untuk Recommended Users (Sidebar) ---
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [recommendedUsersLoading, setRecommendedUsersLoading] = useState(true); // Initial loading
  const [recommendedUsersError, setRecommendedUsersError] = useState(null);
  const [followingInProgress, setFollowingInProgress] = useState(null); // Menyimpan ID user yg sedang diproses follow/unfollow
  // *** NEW: Pagination state for recommended users ***
  const [recommendedUsersPage, setRecommendedUsersPage] = useState(1);
  const [recommendedUsersHasMore, setRecommendedUsersHasMore] = useState(true);
  const [recommendedUsersLoadingMore, setRecommendedUsersLoadingMore] = useState(false); // Loading more users
  // --- State for Modals ---
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  // --- NEW: State for Delete Confirmation Dialog ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null); // Store the ID of the post to be deleted  // --- NEW: State for Edit Post Modal ---
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null); // Store the post to be edited
  // --- NEW: State for Report Post Modal ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [postToReport, setPostToReport] = useState(null); // Store the post to be reported  // --- State for User ID ---
  const userId = user?.id;
  // --- State untuk Achievements (from backend) ---
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState(null);

  // --- State untuk Gamification Hub ---
  const [gamificationData, setGamificationData] = useState(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);
  const [gamificationError, setGamificationError] = useState(null);

  // --- State untuk Active Challenges ---
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [activeChallengesLoading, setActiveChallengesLoading] = useState(true);
  const [activeChallengesError, setActiveChallengesError] = useState(null);

  const observer = useRef();
  // --- useEffect ini menangani pemuatan data SETELAH userId ditentukan ---
  useEffect(() => {
    // Hanya muat data jika userId ada (pengguna login)
    if (userId) {
      console.log(`userId is now set to: ${userId}. Loading initial posts and recommendations.`);
      loadMorePosts(1, true); // Panggil saat pertama kali userId siap
      loadRecommendedUsers(1); // Panggil saat pertama kali userId siap
      loadGamificationData(); // Load gamification data
      loadActiveChallenges(); // Load active challenges
    } else {
      // Tangani kasus pengguna tidak login setelah cek localStorage
      console.log("userId is null after check. Setting initial states for logged-out user.");
      // Reset posts untuk tampilan logout
      setPosts([]);
      setInitialLoading(false);
      setLoading(false);
      setHasMore(false);
      setError(null);

      // Atur state recommended users untuk tampilan logout
      setRecommendedUsers([]);
      setRecommendedUsersLoading(false);
      // --- Set pesan error di sini jika pengguna tidak login ---
      setRecommendedUsersError("Login to see recommendations.");
      setRecommendedUsersHasMore(false);

      // Reset gamification states
      setGamificationData(null);
      setGamificationLoading(false);
      setGamificationError("Login to see your progress.");

      // Reset active challenges states
      setActiveChallenges([]);
      setActiveChallengesLoading(false);
      setActiveChallengesError("Login to see active challenges.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // --- Fetch achievements for the logged-in user ---
  useEffect(() => {
    if (!userId) {
      setAchievements([]);
      setAchievementsLoading(false);
      setAchievementsError(null);
      return;
    }
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

  // --- Helper function to format image URLs ---
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/storage/avatars/noimage.png";
    const cleanedPath = imagePath.replace(/\\/g, "/");
    if (cleanedPath.startsWith("http") || cleanedPath.startsWith("/storage")) {
      return cleanedPath.startsWith("/storage") && api.defaults.baseURL ? `${api.defaults.baseURL}${cleanedPath}` : cleanedPath;
    }
    if (api.defaults.baseURL) {
      const baseUrl = api.defaults.baseURL.endsWith("/") ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
      const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
      return `${baseUrl}/${relativePath}`;
    }
    return cleanedPath;
  };

  // --- Function Fetch Data Posts ---
  const loadMorePosts = useCallback(
    async (currentPage, isInitialLoad) => {
      if ((loading && !isInitialLoad) || (!hasMore && !isInitialLoad)) return;

      console.log(`Fetching posts page ${currentPage} (Initial: ${isInitialLoad})`);
      setLoading(true);
      if (isInitialLoad) {
        setInitialLoading(true);
        setError(null);
        setPosts([]);
        setPage(1);
        setHasMore(true);
      }

      try {
        if (!userId) {
          setLoading(false);
          setInitialLoading(false);
          setHasMore(false);
          console.warn("User not logged in. Cannot fetch home feed.");
          return;
        }

        const response = await api.get(`/posts/home/${userId}`, {
          params: { page: currentPage, limit: POSTS_PER_PAGE },
        });
        const result = response.data;

        if (result.success && Array.isArray(result.data)) {
          const fetchedData = result.data;
          const processedData = fetchedData.map((post) => ({
            ...post,
            bookmarkStatus: post.bookmarkStatus === undefined ? false : post.bookmarkStatus,
            postLikeStatus: post.postLikeStatus === undefined ? false : post.postLikeStatus,
            likeCount: post.likeCount === undefined ? 0 : post.likeCount,
            commentCount: post.commentCount === undefined ? 0 : post.commentCount,
            userId: post.userId || post.user?.id, // Make sure userId is present
          }));

          setPosts((prevPosts) => (isInitialLoad ? processedData : [...prevPosts, ...processedData]));
          setPage(currentPage + 1);
          setHasMore(processedData.length === POSTS_PER_PAGE);
          setError(null);
        } else {
          console.error("API error or invalid data for posts:", result);
          setHasMore(false);
          if (isInitialLoad || posts.length === 0) {
            setError(result.message || "Failed to fetch posts.");
          }
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        let errorMessage = err.message || "An error occurred while fetching posts.";
        if (err.response) {
          errorMessage = `Error ${err.response.status}: ${err.response.data?.message || err.message}`;
          if (err.response.status === 401) {
            errorMessage = "Unauthorized. Please log in again.";
          }
        } else if (err.request) {
          errorMessage = "No response from server. Check network or API status.";
        }
        setError(errorMessage);
        setHasMore(false);
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setInitialLoading(false);
        }
      }
    },
    [loading, hasMore, posts.length] // userId is implicitly constant here
  );

  // --- *** Function Fetch Recommended Users with Pagination *** ---
  const loadRecommendedUsers = useCallback(
    async (pageToFetch) => {
      console.log(`Fetching recommended users page ${pageToFetch}`);
      setRecommendedUsersError(null); // Clear previous errors

      // Set appropriate loading state
      if (pageToFetch === 1) {
        setRecommendedUsersLoading(true); // Initial load
        setRecommendedUsers([]); // Reset users on initial load
        setRecommendedUsersPage(1); // Reset page number
        setRecommendedUsersHasMore(true); // Assume more initially
      } else {
        setRecommendedUsersLoadingMore(true); // Loading more users
      }

      try {
        const response = await api.get("/users", {
          params: { page: pageToFetch, limit: RECOMMENDED_USERS_LIMIT },
          // If endpoint needs currentUserId for follow status:
          // params: { page: pageToFetch, limit: RECOMMENDED_USERS_LIMIT, currentUserId: userId }
        });

        // Check response structure. Adjust if data is nested (e.g., response.data.data)
        const fetchedUsers = response.data && Array.isArray(response.data) ? response.data : [];

        if (fetchedUsers.length > 0) {
          const filteredUsers = fetchedUsers
            .filter((user) => user.id !== userId) // Filter out the current user
            .map((user) => ({
              ...user,
              avatar: formatImageUrl(user.avatar), // Format avatar
              follow_status: user.follow_status === undefined ? false : user.follow_status,
            }));

          // Append new users if loading more, otherwise set as initial list
          setRecommendedUsers((prevUsers) => (pageToFetch === 1 ? filteredUsers : [...prevUsers, ...filteredUsers]));

          // Update pagination state
          setRecommendedUsersPage(pageToFetch + 1);
          setRecommendedUsersHasMore(fetchedUsers.length === RECOMMENDED_USERS_LIMIT);
        } else {
          // No users returned for this page (or API error with empty array)
          setRecommendedUsersHasMore(false); // No more users to load
          if (pageToFetch === 1 && recommendedUsers.length === 0) {
            // Optional: Set a message if *initial* load yields nothing
            // setRecommendedUsersError("No recommendations found right now.");
          }
        }
      } catch (err) {
        console.error("Error fetching recommended users:", err);
        setRecommendedUsersError("Could not fetch recommendations.");
        setRecommendedUsersHasMore(false); // Assume no more on error
      } finally {
        // Reset loading states
        if (pageToFetch === 1) {
          setRecommendedUsersLoading(false);
        } else {
          setRecommendedUsersLoadingMore(false);
        }
      }
    },
    // Dependencies: userId is constant, RECOMMENDED_USERS_LIMIT is constant
    // No changing dependencies needed unless userId could change without remount
    []
  );

  // --- Like/Unlike Post ---
  const handleLikeToggle = async (postId, currentStatus) => {
    if (!userId) {
      setError("You must be logged in to like posts.");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = posts[postIndex];
    const optimisticStatus = !currentStatus;
    const optimisticCount = currentStatus ? originalPost.likeCount - 1 : originalPost.likeCount + 1;
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: Math.max(0, optimisticCount) } : p)));
    try {
      const response = await api.post("/likes/create-delete", { postId: postId, userId: userId });
      if (response.data.success) {
        setError(null);
      } else {
        setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p)));
        setError(response.data.message || "Could not update like status.");
      }
    } catch (err) {
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.response?.data?.message || "Could not update like status.");
    }
  };

  // --- Bookmark/Unbookmark Post ---
  const handleBookmarkToggle = async (postId, currentStatus) => {
    if (!userId) {
      setError("You must be logged in to bookmark posts.");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = posts[postIndex];
    const optimisticStatus = !currentStatus;
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));
    try {
      const response = await api.post("/bookmarks/create-delete", { postId: postId, userId: userId });
      if (response.data.success) {
        setError(null);
      } else {
        setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p)));
        setError(response.data.message || "Could not update bookmark status.");
      }
    } catch (err) {
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.response?.data?.message || "Could not update bookmark status.");
    }
  };

  // --- Follow/Unfollow User ---
  const handleFollowToggle = async (targetUserId, currentFollowStatus) => {
    if (!userId) {
      setRecommendedUsersError("You must be logged in to follow users.");
      return;
    }
    if (followingInProgress === targetUserId) return;

    setFollowingInProgress(targetUserId);
    setRecommendedUsersError(null); // Clear previous errors related to recommendations

    const originalUsers = [...recommendedUsers]; // Store original state for potential rollback
    setRecommendedUsers((prevUsers) => prevUsers.map((user) => (user.id === targetUserId ? { ...user, follow_status: !currentFollowStatus } : user)));

    try {
      const apiUrl = `/follows/create-delete/${targetUserId}`;
      console.log(`Attempting to toggle follow status for user ${targetUserId} via POST ${apiUrl}`);
      const response = await api.post(apiUrl);
      console.log(`Follow toggle successful for user ${targetUserId}:`, response.data.message);
    } catch (err) {
      console.error(`Error toggling follow status for user ${targetUserId}:`, err);
      setRecommendedUsers(originalUsers); // Rollback UI
      let errorMsg = "Could not update follow status. Please try again.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setRecommendedUsersError(errorMsg);
    } finally {
      setFollowingInProgress(null); // Release lock
    }
  };

  // --- *** NEW: Delete Post Function *** ---
  const handleDeletePost = async () => {
    if (!postToDelete) return; // Exit if no post is selected

    try {
      // Use the specified endpoint structure
      const response = await api.delete(`/posts/delete/${postToDelete}`);

      if (response.data.success) {
        // Remove the post from the local state
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postToDelete));
        setError(null); // Clear any previous errors
        console.log(`Post ${postToDelete} deleted successfully.`);
      } else {
        setError(response.data.message || "Failed to delete post.");
        console.error("Failed to delete post:", response.data.message);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.response?.data?.message || "An error occurred while deleting the post.");
    } finally {
      // Always close the dialog and reset the state
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };
  // --- *** End of Delete Post Function *** ---

  // --- *** NEW: Edit Post Functions *** ---
  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditPostOpen(true);
  };
  const handlePostUpdated = (postId, updatedData) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, ...updatedData } : post)));
  };
  // --- *** End of Edit Post Functions *** ---  // --- *** NEW: Report Post Function *** ---
  const handleReportPost = (post) => {
    setPostToReport(post);
    setIsReportModalOpen(true);
  };
  // --- *** End of Report Post Function *** ---

  // --- Open Comment Modal ---
  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title });
    setIsCommentModalOpen(true);
  };

  // --- Callback for Comment Modal ---
  const handleCommentAdded = (postId) => {
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  // --- Intersection Observer Setup for Posts ---
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          loadMorePosts(page, false);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, initialLoading, loadMorePosts]
  );

  // --- Function to load gamification data ---
  const loadGamificationData = useCallback(async () => {
    if (!userId) {
      setGamificationData(null);
      setGamificationLoading(false);
      setGamificationError("Login to see your progress.");
      return;
    }

    setGamificationLoading(true);
    setGamificationError(null);

    try {
      const response = await api.get(`/gamification/hub`);
      if (response.data && response.data.success) {
        setGamificationData(response.data.data);
      } else {
        setGamificationError("Failed to fetch gamification data.");
      }
    } catch (err) {
      console.error("Error fetching gamification data:", err);
      setGamificationError(err.response?.data?.message || err.message || "Failed to fetch gamification data.");
    } finally {
      setGamificationLoading(false);
    }
  }, [userId]);

  // --- Function to load active challenges ---
  const loadActiveChallenges = useCallback(async () => {
    if (!userId) {
      setActiveChallenges([]);
      setActiveChallengesLoading(false);
      setActiveChallengesError("Login to see active challenges.");
      return;
    }

    setActiveChallengesLoading(true);
    setActiveChallengesError(null);

    try {
      const response = await api.get(`/challenges/active`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Limit to 2 challenges for the sidebar
        setActiveChallenges(response.data.data.slice(0, 2));
      } else {
        setActiveChallenges([]);
        setActiveChallengesError("Failed to fetch active challenges.");
      }
    } catch (err) {
      console.error("Error fetching active challenges:", err);
      setActiveChallenges([]);
      setActiveChallengesError(err.response?.data?.message || err.message || "Failed to fetch active challenges.");
    } finally {
      setActiveChallengesLoading(false);
    }
  }, [userId]);
  // --- Helper Functions ---
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

  // --- Helper function to get time remaining ---
  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
    return "Less than 1 hour left";
  };

  // --- Mapping icon string ke komponen lucide-react
  const ICONS_MAP = {
    heart: Heart,
    flame: FlameIcon,
    star: Star,
    trophy: Trophy,
    award: Award,
    bookmark: Bookmark,
    "message-circle": MessageCircle,
    repeat: Repeat2,
    // tambahkan jika backend menambah icon baru
  };

  // --- Return JSX ---
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-4 md:p-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Feed</CardTitle>
              <CardDescription>Discover the latest creations from the community.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* === Loading States Posts === */}
                {initialLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={`skeleton-${index}`} className="overflow-hidden">
                      <CardHeader className="pb-2 space-y-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-20 mb-1" /> <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-16 rounded-md" />
                        </div>
                      </CardHeader>
                      <Skeleton className="aspect-video w-full" />
                      <CardContent className="pt-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Skeleton className="h-4 w-12 mr-1 rounded" />
                          <Skeleton className="h-4 w-16 mr-1 rounded" />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="flex space-x-4">
                          <Skeleton className="h-8 w-16" /> <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </CardFooter>
                    </Card>
                  ))}

                {/* === Content Display Posts === */}
                {!initialLoading &&
                  posts.length > 0 &&
                  posts.map((post, index) => {
                    const isLastElement = posts.length === index + 1;
                    // Added check for post.userId which is needed for the delete button logic
                    if (!post || typeof post.id === "undefined" || typeof post.userId === "undefined") {
                      console.warn("Rendering skipped for invalid post data:", post);
                      return null;
                    }
                    return (
                      <Card key={`${post.id}-${index}`} id={`post-${post.id}`} className="overflow-hidden" ref={isLastElement ? lastPostElementRef : null}>
                        <CardHeader className="pb-2 space-y-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  {/* Link uses post.userId */}
                                  <Link to={`/profile/${post.userId}`} className="cursor-pointer">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={formatImageUrl(post.avatar)} alt={post.username} />
                                      <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                  </Link>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="flex justify-between space-x-4">
                                    {/* Link uses post.userId */}
                                    <Link to={`/profile/${post.userId}`}>
                                      <Avatar>
                                        <AvatarImage src={formatImageUrl(post.avatar)} />
                                        <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                      </Avatar>
                                    </Link>
                                    <div className="space-y-1">
                                      {/* Link uses post.userId */}
                                      <Link to={`/profile/${post.userId}`} className="hover:underline">
                                        <h4 className="text-sm font-semibold">{post.username}</h4>
                                      </Link>
                                      <p className="text-sm text-muted-foreground">Level {post.level || 1} Artist</p>
                                      {/* Add follow button here if needed */}
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                              <div>
                                {/* Link uses post.userId */}
                                <Link to={`/profile/${post.userId}`} className="hover:underline">
                                  <p className="font-medium text-sm">{post.username}</p>
                                </Link>
                                <p className="text-xs text-muted-foreground">Level {post.level || 1}</p>
                                <p className="text-xs text-muted-foreground">{post.createdAt}</p> {/* Consider formatting this */}
                              </div>{" "}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge asChild variant="outline" className={`${getTypeColor(post.type)} capitalize cursor-pointer`} onClick={() => navigate(`/posts/type?query=${encodeURIComponent(post.type)}&page=1&limit=9`)}>
                                <span>{post.type || "Unknown"}</span>
                              </Badge>
                              {/* --- *** Conditionally render DropdownMenu for Edit/Delete/Report *** --- */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {userId === post.userId ? (
                                    // Show Edit/Delete for post owner
                                    <>
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          handleEditPost(post);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" /> Edit Post
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setPostToDelete(post.id);
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
                                        handleReportPost(post);
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

                        <ImageCarousel images={post.images} title={post.title} />

                        <CardContent className="pt-4">
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{post.description}</p>
                          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {post.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge asChild key={tagIndex} variant="secondary" className="text-xs capitalize cursor-pointer" onClick={() => navigate(`/posts/tags?page=1&limit=9&query=${encodeURIComponent(tag)}`)}>
                                  <span>#{tag}</span>
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="text-xs cursor-default">
                                      ...
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Tags: {post.tags.join(", ")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="flex justify-between border-t pt-4">
                          <div className="flex space-x-4">
                            {/* Like Button */}
                            <HoverCard openDelay={200} closeDelay={100}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`flex items-center space-x-1 h-8 pl-1 pr-2 rounded-l-md ${post.postLikeStatus ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
                                        onClick={() => handleLikeToggle(post.id, post.postLikeStatus)}
                                        disabled={!userId}
                                      >
                                        <Heart className={`h-4 w-4 ${post.postLikeStatus ? "fill-current" : ""}`} />
                                      </Button>
                                      <HoverCardTrigger asChild>
                                        <span
                                          className={`cursor-pointer text-sm font-medium h-8 flex items-center pr-2 pl-1 border-l border-transparent hover:bg-accent rounded-r-md ${
                                            post.postLikeStatus ? "text-red-500" : "text-muted-foreground"
                                          }`}
                                        >
                                          {post.likeCount || 0}
                                        </span>
                                      </HoverCardTrigger>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{!userId ? "Login to like" : post.postLikeStatus ? "Unlike" : "Like"} this post</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <HoverCardContent className="w-auto p-0" side="top" align="start">
                                {post.id && <LikesHoverCard postId={post.id} />}
                              </HoverCardContent>
                            </HoverCard>

                            {/* Comment Button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8 text-muted-foreground hover:text-foreground" onClick={() => openCommentModal(post)}>
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{post.commentCount || 0}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View or add comments</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Bookmark Button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 ${post.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                                  onClick={() => handleBookmarkToggle(post.id, post.bookmarkStatus)}
                                  disabled={!userId}
                                >
                                  <Bookmark className={`h-4 w-4 ${post.bookmarkStatus ? "fill-current" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{!userId ? "Login to bookmark" : post.bookmarkStatus ? "Remove from bookmarks" : "Save to bookmarks"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardFooter>
                      </Card>
                    );
                  })}

                {/* === End of Post Content States === */}
                {loading && !initialLoading && <div className="text-center py-4 text-muted-foreground">Loading more posts...</div>}
                {!initialLoading && !loading && posts.length === 0 && !error && !userId && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Please log in to see posts from users you follow.</p>
                    <Button onClick={() => navigate("/login")} className="mt-2">
                      Login
                    </Button>
                  </div>
                )}
                {!initialLoading && !loading && posts.length === 0 && !error && userId && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No posts found yet. Follow some artists or explore to see their work here!</p>
                  </div>
                )}
                {!loading && !hasMore && posts.length > 0 && <div className="text-center py-4 text-muted-foreground">You&#39;ve reached the end! ✨</div>}
                {error && (
                  <div className="p-4 my-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Error!</span> {error}
                    {/* Optional: Add a button to clear the error */}
                    {/* <button onClick={() => setError(null)} className="ml-2 font-semibold underline">Dismiss</button> */}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 text-primary mr-2" /> Active Challenges
              </CardTitle>
              <CardDescription>Compete and earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Loading state */}
              {activeChallengesLoading &&
                Array.from({ length: 2 }).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden border-none shadow-sm bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full mt-1" />
                      <div className="flex justify-between items-center mt-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Error state */}
              {activeChallengesError && !activeChallengesLoading && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">{activeChallengesError}</p>
                </div>
              )}

              {/* No challenges state */}
              {!activeChallengesLoading && !activeChallengesError && activeChallenges.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">No active challenges at the moment.</p>
                </div>
              )}

              {/* Real challenges data */}
              {!activeChallengesLoading &&
                !activeChallengesError &&
                activeChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden border-none shadow-sm bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/challenges/${challenge.id}`)}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm">{challenge.title}</h3>
                        <Badge variant="outline" className="text-xs whitespace-nowrap bg-primary/10 text-primary border-primary/20">
                          <Clock className="h-3 w-3 mr-1" /> {getTimeRemaining(challenge.deadline)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{challenge.description}</p>
                      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                        <span>{challenge.challengePosts?.length || 0} participants</span>
                        <span className="font-medium text-primary">Exclusive Badge</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/challenges")}>
                View All Challenges
              </Button>
            </CardFooter>
          </Card>{" "}
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 text-amber-500 mr-2" /> Gamification Hub
              </CardTitle>
              <CardDescription>Track your progress and missions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Gamification Loading State */}
              {gamificationLoading && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-3" />
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Gamification Error State */}
              {gamificationError && !gamificationLoading && (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">{gamificationError}</p>
                </div>
              )}{" "}
              {/* Real Gamification Data */}
              {!gamificationLoading && !gamificationError && gamificationData && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-base">Level {gamificationData.stats?.level || 1}</h3>
                      <p className="text-xs text-muted-foreground">
                        EXP: {gamificationData.level_info?.current_exp || 0} / {gamificationData.level_info?.exp_to_next_level || 100}
                      </p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Progress value={gamificationData.level_info?.progress_percentage || 0} className="h-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{Math.max(0, (gamificationData.level_info?.exp_to_next_level || 100) - (gamificationData.level_info?.current_exp || 0))} EXP to next level</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Separator className="my-4" />{" "}
                  <div>
                    <h3 className="font-medium mb-3 text-sm">Badges Earned</h3>
                    <ScrollArea className="h-[100px] pr-3">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Display user badges from gamification data */}
                        {gamificationData.badges?.all && gamificationData.badges.all.length > 0 ? (
                          gamificationData.badges.all.slice(0, 4).map((badge, index) => (
                            <Card key={badge.id || index} className="overflow-hidden border-none shadow-sm bg-card/50">
                              <CardContent className="p-2 flex items-center space-x-2">
                                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                  {badge.image ? <img src={formatImageUrl(badge.image)} alt={badge.name} className="w-full h-full object-cover rounded-full" /> : <Award className="h-4 w-4 text-amber-500" />}
                                </div>
                                <div>
                                  <p className="font-medium text-xs leading-tight">{badge.name}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-4">
                            <p className="text-xs text-muted-foreground">No badges earned yet</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  <Separator className="my-4" />
                </>
              )}
              {/* Achievements Section (using existing achievements state) */}
              <div>
                <h3 className="font-medium mb-3 text-sm">Achievements</h3>
                <ScrollArea className="h-[220px]">
                  <div className="space-y-3 px-2">
                    {achievementsLoading &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={`achievement-skeleton-${i}`} className="flex items-start p-1.5 rounded-md">
                          <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between w-full">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full mt-1" />
                            <Skeleton className="h-1 w-full mt-1" />
                          </div>
                        </div>
                      ))}

                    {achievements.length === 0 && !achievementsLoading && !achievementsError && <p className="text-xs text-muted-foreground">No achievements yet.</p>}

                    {achievementsError && !achievementsLoading && <p className="text-xs text-red-500">{achievementsError}</p>}

                    {achievements.map((achievement) => {
                      const LucideIcon = ICONS_MAP[achievement.icon] || Award;
                      const percent = achievement.goal > 0 ? (achievement.progress / achievement.goal) * 100 : 0;
                      const isCompleted = achievement.status === "completed";

                      // ✂️ Batasi panjang judul & deskripsi
                      const shortTitle = achievement.title.length > 24 ? achievement.title.slice(0, 22) + "…" : achievement.title;

                      const shortDesc = achievement.description.length > 40 ? achievement.description.slice(0, 38) + "…" : achievement.description;

                      return (
                        <div key={achievement.id} className="flex items-start p-1.5 rounded-md hover:bg-muted/50 transition-colors text-xs w-full">
                          <div className="flex-shrink-0 h-6 w-6 mr-2 rounded-full bg-muted flex items-center justify-center">
                            <LucideIcon className={`h-4 w-4 ${isCompleted ? "text-green-600" : "text-muted-foreground"}`} />
                          </div>

                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between w-full">
                              <p className="font-medium text-xs truncate">{shortTitle}</p>
                              <Badge variant={isCompleted ? "default" : "outline"} className={`h-4 px-1.5 text-[10px] shrink-0 ${isCompleted ? "bg-green-600/20 text-green-700 border-green-600/30" : ""}`}>
                                {isCompleted ? "Completed" : `${Math.round(percent)}%`}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate" title={achievement.description}>
                              {shortDesc}
                            </p>
                            <Progress value={percent} className={`h-1 mt-1 ${isCompleted ? "[&>*]:bg-green-500" : ""}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Fire className="h-5 w-5 text-blue-500 mr-2" /> Recommended for You
              </CardTitle>
              <CardDescription>Artists you might like</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {/* Initial Loading State */}
              {recommendedUsersLoading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={`skel-rec-${index}`} className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-7 w-16 rounded-md" />
                  </div>
                ))}

              {/* Error State */}
              {!recommendedUsersLoading && recommendedUsersError && <p className="text-sm text-red-600 p-2">{recommendedUsersError}</p>}

              {/* No Users State (after initial load) */}
              {!recommendedUsersLoading && !recommendedUsersError && recommendedUsers.length === 0 && <p className="text-sm text-muted-foreground p-2">No recommendations found right now.</p>}

              {/* Display Users */}
              {!recommendedUsersLoading && // Don't show users during initial load
                recommendedUsers.length > 0 &&
                recommendedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <Link to={`/profile/${user.id}`} className="cursor-pointer">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar} alt={user.username} />
                              <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                          </Link>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72">
                          <div className="flex justify-between space-x-3">
                            <Link to={`/profile/${user.id}`}>
                              <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="space-y-1">
                              <Link to={`/profile/${user.id}`} className="hover:underline">
                                <h4 className="text-sm font-semibold">{user.username}</h4>
                              </Link>
                              <p className="text-xs text-muted-foreground">Level {user.level || 1} Artist</p>
                              <div className="flex items-center pt-1 space-x-1">
                                <Button variant="outline" size="xs" onClick={() => navigate(`/profile/${user.id}`)}>
                                  Profile
                                </Button>
                                <Button size="xs" variant={user.follow_status ? "secondary" : "default"} onClick={() => handleFollowToggle(user.id, user.follow_status)} disabled={followingInProgress === user.id || !userId}>
                                  {followingInProgress === user.id ? "..." : user.follow_status ? "Unfollow" : "Follow"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <div>
                        <Link to={`/profile/${user.id}`} className="hover:underline">
                          <p className="font-medium text-sm">{user.username}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground"> Lvl {user.level || 1} </p>
                      </div>
                    </div>
                    <Button variant={user.follow_status ? "secondary" : "outline"} size="sm" className="h-7 px-2" onClick={() => handleFollowToggle(user.id, user.follow_status)} disabled={followingInProgress === user.id || !userId}>
                      {followingInProgress === user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> // Loading indicator
                      ) : user.follow_status ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5 mr-1" /> Follow
                        </>
                      )}
                    </Button>
                  </div>
                ))}

              {/* Loading More Indicator */}
              {recommendedUsersLoadingMore && (
                <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </div>
              )}
            </CardContent>
            {/* Footer with View More Button */}
            <CardFooter>
              {!recommendedUsersLoading && recommendedUsersHasMore && !recommendedUsersLoadingMore && (
                <Button
                  variant="ghost"
                  className="w-full h-8 text-sm"
                  onClick={() => loadRecommendedUsers(recommendedUsersPage)} // Load next page
                  disabled={recommendedUsersLoadingMore} // Disable while loading more
                >
                  View More
                </Button>
              )}
              {/* Optional: Show end message */}
              {!recommendedUsersLoading && !recommendedUsersHasMore && recommendedUsers.length > 0 && <p className="w-full text-center text-xs text-muted-foreground py-2">No more recommendations</p>}
            </CardFooter>
          </Card>
        </div>
      </div>{" "}
      {/* --- Modals Rendered Outside Main Layout Flow --- */}
      {/* Comment Modal */}
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
          currentUser={user ? { id: user.id, username: user.username, avatar: formatImageUrl(user.avatar), level: user.level || 1 } : null}
        />
      )}{" "}
      {/* --- *** NEW: Edit Post Modal *** --- */}
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
      {/* --- *** NEW: Report Post Modal *** --- */}
      {isReportModalOpen && postToReport && (
        <ReportPostModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setPostToReport(null);
          }}
          post={postToReport}
          currentUser={user}
        />
      )}
      {/* --- *** NEW: Delete Confirmation Dialog *** --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the post and all associated data (likes, comments, bookmarks).</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* Use DialogClose for the cancel button for default behavior */}
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {/* Call handleDeletePost when the delete button is clicked */}
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
