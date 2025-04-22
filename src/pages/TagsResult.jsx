import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // Use useSearchParams
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { CommentModal } from "@/components/CommentModal";
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { Tag, Heart, MessageCircle, Bookmark, Loader2 } from "lucide-react"; // Using Tag icon
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import api from "../api/axiosInstance";
import { toast } from "sonner";

// --- Constants ---
const RESULTS_PAGE_LIMIT = 9; // Default limit

// --- Helper function to construct full URL for storage paths ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedPath = path.replace(/\\/g, "/");
  let relativePath = normalizedPath;
  if (normalizedPath.startsWith("storage/")) {
    relativePath = normalizedPath;
  } else if (!normalizedPath.startsWith("/api") && !normalizedPath.startsWith("storage/")) {
    relativePath = `/api/${normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath}`;
  }
  const baseUrl = api.defaults.baseURL || window.location.origin;
  const separator = baseUrl.endsWith("/") ? "" : "/";
  try {
    const url = new URL(relativePath, baseUrl + separator);
    return url.href;
  } catch (e) {
    console.error("Error constructing image URL:", e);
    return "/placeholder.svg";
  }
};

// --- Helper function to get type color ---
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

// --- Component Start ---
export default function TagsResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- State for Tags Query ---
  // Read all 'query' parameters from the URL into an array
  const [tagsQuery, setTagsQuery] = useState([]);

  // State for fetched data and UI control
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Next page to fetch
  const [limit] = useState(RESULTS_PAGE_LIMIT); // Use constant or read from URL if needed
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // State for interactions
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [CURRENT_USER_ID, setUserId] = useState(null);
  const [CURRENT_USER_DATA, setUserData] = useState(null);

  // Ref for Intersection Observer
  const observer = useRef();

  // Get logged-in user data
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setUserId(parsedData?.id);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setUserData(null);
        setUserId(null);
      }
    } else {
      setUserData(null);
      setUserId(null);
    }
  }, []);

  // --- Effect to update tagsQuery state when URL search params change ---
  useEffect(() => {
    const tagsFromUrl = searchParams.getAll("query") || [];
    setTagsQuery(tagsFromUrl);
    // Reset pagination and results when tags change
    setResults([]);
    setCurrentPage(1);
    setHasMore(true);
    setInitialLoadComplete(false);
    setLoading(true); // Start loading indicator
    // Fetch will be triggered by the next effect that depends on tagsQuery
  }, [searchParams]);

  // --- Fetching Logic ---
  const fetchResults = useCallback(
    async (pageNum, tagsArray) => {
      // Don't fetch if tags array is empty
      if (!tagsArray || tagsArray.length === 0) {
        setResults([]);
        setHasMore(false);
        setInitialLoadComplete(true);
        setLoading(false);
        setLoadingMore(false);
        setError(null); // Clear any previous error
        return;
      }

      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      console.log(`Fetching tags results page: ${pageNum}, tags: ${tagsArray.join(", ")}`);

      try {
        // --- Pass tags array directly to params ---
        // Axios should correctly serialize this as repeated query parameters
        const params = {
          query: tagsArray, // Pass the array here
          page: pageNum,
          limit: limit,
          viewerId: CURRENT_USER_ID ?? 0,
        };
        const response = await api.get("/posts/tags", { params }); // Endpoint for tags

        if (response.data?.success && Array.isArray(response.data.data)) {
          const fetchedData = response.data.data;
          const processedData = fetchedData.map((post) => ({
            ...post,
            bookmarkStatus: post.bookmarkStatus ?? false,
            postLikeStatus: post.postLikeStatus ?? false,
            likeCount: Number(post.likeCount) || 0,
            commentCount: Number(post.commentCount) || 0,
            userId: Number(post.userId),
            id: Number(post.id),
            level: Number(post.level) || 1,
            images: Array.isArray(post.images) ? post.images : [],
            tags: Array.isArray(post.tags) ? post.tags : [],
            createdAt: post.createdAt,
            avatar: post.avatar || null,
            username: post.username || "Unknown",
            type: post.type || "Unknown",
            title: post.title || "Untitled",
            description: post.description || "",
          }));
          setResults((prevResults) => (pageNum === 1 ? processedData : [...prevResults, ...processedData]));
          setCurrentPage(pageNum + 1);
          setHasMore(processedData.length === limit);
        } else {
          setError(response.data?.message || "Failed to fetch results.");
          if (pageNum === 1) setResults([]);
          setHasMore(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "An error occurred.");
        if (pageNum === 1) setResults([]);
        setHasMore(false);
      } finally {
        if (pageNum === 1) {
          setLoading(false);
          setInitialLoadComplete(true);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [limit, CURRENT_USER_ID] // Dependencies
  );

  // --- Effect for Initial Load based on tagsQuery ---
  useEffect(() => {
    // Fetch page 1 only when tagsQuery is populated and not empty
    if (tagsQuery.length > 0) {
      fetchResults(1, tagsQuery);
    } else {
      // Handle case where URL has no tags or they were removed
      setLoading(false); // Stop loading indicator
      setInitialLoadComplete(true); // Mark load as complete
      setHasMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsQuery]); // Re-run ONLY when the tagsQuery array changes

  // --- Intersection Observer Setup ---
  const lastResultRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("Intersection observer triggered fetch for next page (tags)");
          // Fetch the *next* page using the current tags
          fetchResults(currentPage, tagsQuery);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchResults, currentPage, tagsQuery] // Dependencies
  );

  // --- Interaction Handlers (Copied) ---
  const handleLikeToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      toast.warning("Login required");
      return;
    }
    const postIndex = results.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = results[postIndex];
    const optimisticStatus = !currentStatus;
    const optimisticCount = currentStatus ? originalPost.likeCount - 1 : originalPost.likeCount + 1;
    setResults((prev) => prev.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: Math.max(0, optimisticCount) } : p)));
    setError(null);
    try {
      const response = await api.post("/likes/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "BE error");
    } catch (err) {
      console.error("Like error:", err);
      setResults((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.message || "Like failed");
      toast.error("Like failed");
    }
  };
  const handleBookmarkToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      toast.warning("Login required");
      return;
    }
    const postIndex = results.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = results[postIndex];
    const optimisticStatus = !currentStatus;
    setResults((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));
    setError(null);
    try {
      const response = await api.post("/bookmarks/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "BE error");
    } catch (err) {
      console.error("Bookmark error:", err);
      setResults((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.message || "Bookmark failed");
      toast.error("Bookmark failed");
    }
  };
  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title });
    setIsCommentModalOpen(true);
  };
  const handleCommentAdded = (postId) => {
    setResults((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  // --- Render Loading Skeleton ---
  const renderSkeleton = (key) => (
    <Card key={key} className="overflow-hidden">
      {" "}
      <CardHeader className="pb-2 space-y-0">
        {" "}
        <div className="flex justify-between items-center">
          {" "}
          <div className="flex items-center space-x-2">
            {" "}
            <Skeleton className="h-10 w-10 rounded-full" />{" "}
            <div>
              {" "}
              <Skeleton className="h-4 w-20 mb-1" /> <Skeleton className="h-3 w-16" />{" "}
            </div>{" "}
          </div>{" "}
          <Skeleton className="h-6 w-16 rounded-md" />{" "}
        </div>{" "}
      </CardHeader>{" "}
      <Skeleton className="aspect-[4/3] w-full" />{" "}
      <CardContent className="pt-4">
        {" "}
        <Skeleton className="h-5 w-3/4 mb-2" /> <Skeleton className="h-4 w-full mb-1" /> <Skeleton className="h-4 w-2/3" />{" "}
      </CardContent>{" "}
      <CardFooter className="flex justify-between border-t pt-4">
        {" "}
        <div className="flex space-x-4">
          {" "}
          <Skeleton className="h-8 w-16" /> <Skeleton className="h-8 w-16" />{" "}
        </div>{" "}
        <Skeleton className="h-8 w-8" />{" "}
      </CardFooter>{" "}
    </Card>
  );

  // --- Main Render ---
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-500" /> {/* Tag Icon */}
            <CardTitle>Tag Search Results</CardTitle>
          </div>
          <CardDescription>
            Showing posts tagged with:
            {tagsQuery.length > 0 ? (
              <span className="ml-2 space-x-1">
                {tagsQuery.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </span>
            ) : (
              <span className="ml-1 italic text-muted-foreground"> No tags specified in URL.</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Message Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          {" "}
          <CardContent className="p-4 text-center text-destructive">Error: {error}</CardContent>{" "}
        </Card>
      )}

      {/* Results Grid Area */}
      <div className="mt-6">
        {/* Initial Loading Skeletons */}
        {loading && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"> {Array.from({ length: limit }).map((_, index) => renderSkeleton(`initial-skeleton-${index}`))} </div>}

        {/* Displayed Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((artwork, index) => (
              <div ref={results.length === index + 1 ? lastResultRef : null} key={`${artwork.id}-${index}`}>
                <ArtworkCard artwork={artwork} onLikeToggle={handleLikeToggle} onBookmarkToggle={handleBookmarkToggle} onCommentClick={openCommentModal} currentUserId={CURRENT_USER_ID} />
              </div>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6"> {Array.from({ length: 3 }).map((_, index) => renderSkeleton(`loading-skeleton-${index}`))} </div>}

        {/* Empty State */}
        {initialLoadComplete && !loading && results.length === 0 && !error && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            <p>No posts found matching the specified tags.</p>
            <Button variant="link" onClick={() => navigate("/discover")} className="mt-2">
              Back to Discover
            </Button>
          </div>
        )}

        {/* End of List Message */}
        {!loading && !loadingMore && !hasMore && results.length > 0 && initialLoadComplete && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            {" "}
            <p>You've reached the end of the search results.</p>{" "}
          </div>
        )}
      </div>

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
          currentUser={CURRENT_USER_DATA ? { id: CURRENT_USER_DATA.id, username: CURRENT_USER_DATA.username, avatar: getFullStorageUrl(CURRENT_USER_DATA.avatar), level: CURRENT_USER_DATA.level || 1 } : null}
        />
      )}
    </div>
  );
}

// --- Artwork Card Component (Copied from Discover/TopArtworks) ---
function ArtworkCard({ artwork, onLikeToggle, onBookmarkToggle, onCommentClick, currentUserId }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex justify-between items-start">
          <Link to={`/profile/${artwork.userId}`} className="flex items-center space-x-2 group">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getFullStorageUrl(artwork.avatar)} alt={artwork.username} />
              <AvatarFallback>{artwork.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm group-hover:underline">{artwork.username}</p>
              <p className="text-xs text-muted-foreground">Level {artwork.level || 1}</p>
              <p className="text-xs text-muted-foreground">{artwork.createdAt}</p>
            </div>
          </Link>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant="outline" className={`${getTypeColor(artwork.type)} capitalize`}>
              {artwork.type || "Unknown"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <ImageCarousel images={artwork.images} title={artwork.title} />
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="text-lg font-semibold">{artwork.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{artwork.description}</p>
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {artwork.tags.map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="secondary" className="text-xs capitalize">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 mt-auto">
        <div className="flex space-x-4">
          <HoverCard openDelay={200} closeDelay={100}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center space-x-1 h-8 pl-1 pr-2 rounded-l-md ${artwork.postLikeStatus ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => onLikeToggle(artwork.id, artwork.postLikeStatus)}
                      disabled={!currentUserId}
                    >
                      <Heart className={`h-4 w-4 ${artwork.postLikeStatus ? "fill-current" : ""}`} />
                    </Button>
                    <HoverCardTrigger asChild>
                      <span className={`cursor-pointer text-sm font-medium h-8 flex items-center pr-2 pl-1 border-l border-transparent hover:bg-accent rounded-r-md ${artwork.postLikeStatus ? "text-red-500" : "text-muted-foreground"}`}>
                        {artwork.likeCount || 0}
                      </span>
                    </HoverCardTrigger>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{!currentUserId ? "Login to like" : artwork.postLikeStatus ? "Unlike" : "Like"} this post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <HoverCardContent className="w-auto p-0" side="top" align="start">
              {artwork.id && <LikesHoverCard postId={artwork.id} />}
            </HoverCardContent>
          </HoverCard>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8 text-muted-foreground hover:text-foreground" onClick={() => onCommentClick(artwork)}>
                  <MessageCircle className="h-4 w-4" />
                  <span>{artwork.commentCount || 0}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View or add comments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 ${artwork.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onBookmarkToggle(artwork.id, artwork.bookmarkStatus)}
                disabled={!currentUserId}
              >
                <Bookmark className={`h-4 w-4 ${artwork.bookmarkStatus ? "fill-current" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{!currentUserId ? "Login to bookmark" : artwork.bookmarkStatus ? "Remove bookmark" : "Save bookmark"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
