// --- Import necessary components and hooks ---
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageCarousel } from "@/components/ImageCarousel"; // Import ImageCarousel
import { CommentModal } from "@/components/CommentModal"; // Import CommentModal
import { LikesHoverCard } from "@/components/LikesHoverCard"; // Import LikesHoverCard
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Heart, MessageCircle, Bookmark, Trophy, Loader2, Crown } from "lucide-react"; // Adjusted icons
import api from "../api/axiosInstance"; // Import axios instance

// --- Constants ---
const ARTWORKS_PAGE_LIMIT = 9; // Number of artworks per page/fetch

// --- Helper function to construct full URL for storage paths (same as Profile.jsx) ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.replace(/\\/g, "/");
  let relativePath = normalizedPath;
  if (normalizedPath.startsWith("storage/")) {
    relativePath = normalizedPath; // Keep 'storage/' prefix
  } else if (!normalizedPath.startsWith("/api") && !normalizedPath.startsWith("storage/")) {
    relativePath = `/api/${normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath}`;
    console.warn(`Prefixed non-storage path with /api/: ${relativePath}`);
  }

  const baseUrl = api.defaults.baseURL || window.location.origin;
  const separator = baseUrl.endsWith("/") ? "" : "/";

  try {
    const url = new URL(relativePath, baseUrl + separator);
    return url.href;
  } catch (e) {
    console.error("Error constructing image URL:", e, `Base: ${baseUrl}`, `Path: ${relativePath}`);
    return "/placeholder.svg";
  }
};

// --- Helper function to get type color (same as Profile.jsx) ---
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "illustration":
      return "text-primary bg-primary/10 hover:bg-primary/20";
    case "manga":
      return "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
    case "novel":
      return "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
    default:
      return "text-gray-500 bg-gray-500/10 hover:bg-gray-500/20"; // Fallback color
  }
};

// --- Helper function to get rank badge style ---
const getRankBadgeStyle = (rank) => {
  if (rank === 1) return "bg-yellow-500 text-white";
  if (rank === 2) return "bg-gray-400 text-gray-800"; // Adjusted silver color
  if (rank === 3) return "bg-amber-700 text-white"; // Bronze color
  return "bg-muted text-muted-foreground";
};

export default function TopArtworks() {
  const navigate = useNavigate(); // Hook for navigation

  // --- State for dynamic data ---
  const [displayedArtworks, setDisplayedArtworks] = useState([]);
  const [loading, setLoading] = useState(false); // For initial load or subsequent loads
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Next page to fetch
  const [limit] = useState(ARTWORKS_PAGE_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // --- State for Modals & Logged-in User ---
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [CURRENT_USER_ID, setUserId] = useState(null);
  const [CURRENT_USER_DATA, setUserData] = useState(null);

  // --- Infinite Scroll Observer ---
  const observer = useRef();

  // Get logged-in user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setUserId(parsedData?.id);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        setUserData(null);
        setUserId(null);
      }
    } else {
      setUserData(null);
      setUserId(null);
    }
  }, []);

  // --- Function to fetch artworks ---
  const fetchArtworks = useCallback(
    async (pageNum, isInitialLoad = false) => {
      if (loading || (!isInitialLoad && !hasMore)) return; // Prevent redundant fetches

      setLoading(true);
      setError(null);
      console.log(`Fetching top artworks page: ${pageNum}`);

      try {
        const response = await api.get("/posts/leaderboard", {
          params: {
            page: pageNum,
            limit: limit,
            viewerId: CURRENT_USER_ID ?? 0, // Pass viewer for like/bookmark status
          },
        });

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const newArtworks = response.data.data;

          // Calculate Rank and process data
          const startIndex = (pageNum - 1) * limit;
          const processedArtworks = newArtworks.map((artwork, index) => ({
            ...artwork,
            rank: startIndex + index + 1, // Calculate global rank
            // Ensure necessary fields have defaults
            userId: Number(artwork.userId),
            id: Number(artwork.id),
            level: Number(artwork.level) || 1,
            images: Array.isArray(artwork.images) ? artwork.images : [],
            tags: Array.isArray(artwork.tags) ? artwork.tags : [],
            bookmarkStatus: artwork.bookmarkStatus === undefined ? false : artwork.bookmarkStatus,
            postLikeStatus: artwork.postLikeStatus === undefined ? false : artwork.postLikeStatus,
            likeCount: artwork.likeCount === undefined ? 0 : Number(artwork.likeCount) || 0,
            commentCount: artwork.commentCount === undefined ? 0 : Number(artwork.commentCount) || 0,
            avatar: artwork.avatar || null,
            username: artwork.username || "Unknown User",
            type: artwork.type || "Unknown",
            title: artwork.title || "Untitled",
            description: artwork.description || "No description.",
            createdAt: artwork.createdAt, // Keep original format for display if needed
          }));

          setDisplayedArtworks((prev) => (pageNum === 1 ? processedArtworks : [...prev, ...processedArtworks]));
          setHasMore(processedArtworks.length === limit);
          setPage((prev) => prev + 1); // Increment page for the *next* fetch
        } else {
          setError(response.data?.message || "Failed to fetch top artworks.");
          setHasMore(false); // Stop fetching if API indicates error or unexpected data
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "An error occurred while fetching artworks.");
        setHasMore(false); // Stop fetching on error
      } finally {
        setLoading(false);
        if (pageNum === 1) {
          setInitialLoadComplete(true);
        }
      }
    },
    [limit, loading, hasMore, CURRENT_USER_ID] // Include dependencies
  );

  // --- Effect for Initial Data Load ---
  useEffect(() => {
    fetchArtworks(1, true); // Fetch page 1 initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs only on mount

  // --- Intersection Observer Setup ---
  const lastArtworkElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("Intersection detected, fetching next page...");
          fetchArtworks(page); // Fetch the *next* page
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchArtworks, page] // Dependencies
  );

  // --- Action Handlers (copied & adapted from Profile.jsx) ---

  const handleLikeToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      setError("You must be logged in to like posts."); // Use main error state
      return;
    }
    const postIndex = displayedArtworks.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = displayedArtworks[postIndex];
    const optimisticStatus = !currentStatus;
    const optimisticCount = currentStatus ? originalPost.likeCount - 1 : originalPost.likeCount + 1;
    setDisplayedArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: Math.max(0, optimisticCount) } : p)));
    try {
      const response = await api.post("/likes/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "Backend error");
      setError(null);
    } catch (err) {
      console.error("Error toggling like:", err);
      setDisplayedArtworks((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.message || "Could not update like status.");
    }
  };

  const handleBookmarkToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      setError("You must be logged in to bookmark posts.");
      return;
    }
    const postIndex = displayedArtworks.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = displayedArtworks[postIndex];
    const optimisticStatus = !currentStatus;
    setDisplayedArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));
    try {
      const response = await api.post("/bookmarks/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "Backend error");
      setError(null);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setDisplayedArtworks((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.message || "Could not update bookmark status.");
    }
  };

  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title });
    setIsCommentModalOpen(true);
  };

  const handleCommentAdded = (postId) => {
    setDisplayedArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  // --- Render Skeleton ---
  const renderSkeleton = (key) => (
    <Card key={key} className="overflow-hidden">
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
        <div className="flex items-center justify-between mt-1">
          <Skeleton className="h-5 w-8 rounded-md" /> {/* Rank Skeleton */}
          <Skeleton className="h-5 w-12 rounded-md" /> {/* Type Skeleton */}
        </div>
      </CardHeader>
      <Skeleton className="aspect-video w-full" />
      <CardContent className="pt-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex space-x-4">
          <Skeleton className="h-8 w-16" /> <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-8" />
      </CardFooter>
    </Card>
  );
  return (
    <div className="container mx-auto space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-yellow-500">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Top Artworks</CardTitle>
              <CardDescription className="text-sm">Discover the highest-rated artworks on the platform</CardDescription>
            </div>
          </div>
          {/* Filter removed as API doesn't support it */}
        </CardHeader>
      </Card>
      {/* Display Error if exists */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 text-center text-destructive">Error: {error}</CardContent>
        </Card>
      )}{" "}
      {/* Top Artworks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Initial Loading Skeletons */}
        {!initialLoadComplete && loading && Array.from({ length: 6 }).map((_, index) => renderSkeleton(`initial-skeleton-${index}`))}

        {/* Displayed Artworks */}
        {displayedArtworks.map((artwork, index) => (
          <div ref={displayedArtworks.length === index + 1 ? lastArtworkElementRef : null} key={artwork.id}>
            <Card className="overflow-hidden flex flex-col h-full">
              {" "}
              {/* Ensure full height */}
              <CardHeader className="pb-2 space-y-0 px-3 sm:px-6">
                <div className="flex justify-between items-start mb-1">
                  {/* User Info - Link to Profile */}
                  <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate(`/profile/${artwork.userId}`)}>
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={getFullStorageUrl(artwork.avatar)} alt={artwork.username} />
                      <AvatarFallback>{artwork.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors">{artwork.username}</p>
                      <p className="text-xs text-muted-foreground">Level {artwork.level || 1}</p>
                      <p className="text-xs text-muted-foreground">{artwork.createdAt}</p>
                    </div>
                  </div>
                  {/* Rank Badge */}
                  <Badge className={`${getRankBadgeStyle(artwork.rank)} px-2 py-1 self-start flex items-center gap-1 shrink-0`}>
                    {artwork.rank === 1 && <Crown className="h-3 w-3" />} #{artwork.rank}
                  </Badge>
                </div>
                {/* Type Badge */}
                <div className="flex justify-end mt-1">
                  <Badge asChild variant="outline" className={`${getTypeColor(artwork.type)} capitalize cursor-pointer`} onClick={() => navigate(`/posts/type?query=${encodeURIComponent(artwork.type)}&page=1&limit=9`)}>
                    <span>{artwork.type || "Unknown"}</span>
                  </Badge>
                </div>
              </CardHeader>
              {/* Image Carousel */}
              <ImageCarousel images={artwork.images} title={artwork.title} />
              {/* Card Content */}
              <CardContent className="p-4 pt-4 flex-grow">
                <h3 className="text-lg font-semibold line-clamp-2">{artwork.title}</h3>
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
              {/* Card Footer - Like, Comment, Bookmark */}
              <CardFooter className="flex justify-between border-t p-4 pt-3 mt-auto">
                <div className="flex space-x-3">
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
                                className={`cursor-pointer text-sm font-medium h-8 flex items-center pr-2 pl-1 border-l border-transparent hover:bg-accent rounded-r-md ${artwork.postLikeStatus ? "text-red-500" : "text-muted-foreground"}`}
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
                        size="icon"
                        className={`h-8 w-8 ${artwork.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
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
                </TooltipProvider>{" "}
              </CardFooter>{" "}
            </Card>
          </div>
        ))}

        {/* Loading More Indicator */}
        {loading && !initialLoadComplete && Array.from({ length: 3 }).map((_, index) => renderSkeleton(`loading-skeleton-${index}`))}
      </div>
      {/* Empty State */}
      {initialLoadComplete && displayedArtworks.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">No top artworks found at the moment.</CardContent>
        </Card>
      )}
      {/* End of List Message */}
      {!loading && !hasMore && displayedArtworks.length > 0 && initialLoadComplete && (
        <div className="text-center text-muted-foreground py-6">
          <p>You've reached the end of the list!</p>
        </div>
      )}
      {/* --- Modals Rendered Outside Main Layout Flow --- */}
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
          currentUser={CURRENT_USER_DATA ? { id: CURRENT_USER_DATA.id, username: CURRENT_USER_DATA.username, avatar: getFullStorageUrl(CURRENT_USER_DATA.avatar), level: CURRENT_USER_DATA.level || 1 } : null}
        />
      )}
    </div>
  );
}
