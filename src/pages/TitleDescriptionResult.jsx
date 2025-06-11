import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { CommentModal } from "@/components/CommentModal";
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { Search, Heart, MessageCircle, Bookmark, Loader2, MoreHorizontal, Edit, Trash2, Flag } from "lucide-react"; // Added Search icon
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditPost } from "@/components/EditPost";
import { ReportPostModal } from "@/components/ReportPostModal";
import { useAuth } from "@/contexts/AuthContext";
import api from "../api/axiosInstance";
import { toast } from "sonner"; // Optional: for feedback

// --- Constants ---
const RESULTS_PAGE_LIMIT = 9; // Default limit if not in URL

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
export default function TitleDescriptionResult() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext
  const [searchParams] = useSearchParams(); // Hook to get URL query parameters

  // Get search parameters from URL
  const query = searchParams.get("query") || ""; // Get the search query
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || String(RESULTS_PAGE_LIMIT), 10);

  // State for fetched data and UI control
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage); // Page number for the *next* fetch
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false); // For initial page load / query change
  const [loadingMore, setLoadingMore] = useState(false); // For subsequent page loads
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // State for interactions
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const CURRENT_USER_ID = user?.id;
  // --- *** NEW: Edit Post State *** ---
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  // --- *** End of Edit Post State *** ---

  // --- *** NEW: Report Post State *** ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  // --- *** End of Report Post State *** ---
  // Ref for Intersection Observer
  const observer = useRef();

  // --- Fetching Logic ---
  const fetchResults = useCallback(
    async (pageNum, searchQuery) => {
      if (!searchQuery) {
        // Don't fetch if query is empty
        setResults([]);
        setHasMore(false);
        setInitialLoadComplete(true);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      console.log(`Fetching title/desc results page: ${pageNum}, query: ${searchQuery}`);

      try {
        const params = {
          query: searchQuery,
          page: pageNum,
          limit: limit,
          viewerId: CURRENT_USER_ID ?? 0,
        };
        const response = await api.get("/posts/title-desc", { params });

        if (response.data?.success && Array.isArray(response.data.data)) {
          const fetchedData = response.data.data;

          // Process data (like TopArtworks.jsx)
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
          setCurrentPage(pageNum + 1); // Set *next* page number
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
    // Dependencies: limit, CURRENT_USER_ID
    [limit, CURRENT_USER_ID]
  );

  // --- Effect for Initial Load and Query Change ---
  useEffect(() => {
    // Reset state when the query changes
    setResults([]);
    setCurrentPage(1); // Reset to page 1 for new query
    setHasMore(true);
    setInitialLoadComplete(false);
    setLoadingMore(false);
    setLoading(true); // Start loading for the new query
    // Fetch page 1 with the current query from the URL
    fetchResults(1, query);

    // We don't need to fetch subsequent pages here, only the first page based on the URL query.
    // Infinite scroll will handle fetching pages 2, 3, etc.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Re-run ONLY when the 'query' from the URL changes

  // --- Intersection Observer Setup ---
  const lastResultRef = useCallback(
    (node) => {
      if (loading || loadingMore) return; // Don't observe while loading
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("Intersection observer triggered fetch for next page");
          // Fetch the *next* page using the current query
          fetchResults(currentPage, query);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchResults, currentPage, query] // Dependencies
  );

  // --- Interaction Handlers (Copied from TopArtworks/Discover) ---
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

  // --- *** NEW: Edit and Delete Post Functions *** ---
  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditPostOpen(true);
  };
  const handlePostUpdated = (postId, updatedData) => {
    setResults((prevResults) => prevResults.map((post) => (post.id === postId ? { ...post, ...updatedData } : post)));
  };

  // --- *** NEW: Report Post Function *** ---
  const handleReportPost = (post) => {
    setPostToReport(post);
    setIsReportModalOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (!CURRENT_USER_ID) {
      toast.error("You must be logged in to delete posts.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await api.delete(`/posts/delete/${postId}`);
      if (response.data.success) {
        setResults((prevResults) => prevResults.filter((post) => post.id !== postId));
        toast.success("Post deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.response?.data?.message || "Failed to delete post.");
    }
  };
  // --- *** End of Edit and Delete Post Functions *** ---

  // --- Render Loading Skeleton ---
  const renderSkeleton = (key) => (
    <Card key={key} className="overflow-hidden">
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
      </CardHeader>
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="pt-4">
        {" "}
        <Skeleton className="h-5 w-3/4 mb-2" /> <Skeleton className="h-4 w-full mb-1" /> <Skeleton className="h-4 w-2/3" />{" "}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        {" "}
        <div className="flex space-x-4">
          {" "}
          <Skeleton className="h-8 w-16" /> <Skeleton className="h-8 w-16" />{" "}
        </div>{" "}
        <Skeleton className="h-8 w-8" />{" "}
      </CardFooter>
    </Card>
  );

  // --- Main Render ---
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            <CardTitle>Search Results</CardTitle>
          </div>
          <CardDescription>
            Showing results for title/description matching: <span className="font-semibold text-foreground">"{query}"</span>
          </CardDescription>
        </CardHeader>
      </Card>
      {/* Error Message Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 text-center text-destructive">Error: {error}</CardContent>
        </Card>
      )}
      {/* Results Grid Area */}
      <div className="mt-6">
        {/* Initial Loading Skeletons */}
        {loading && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: limit }).map((_, index) => renderSkeleton(`initial-skeleton-${index}`))}</div>}

        {/* Displayed Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((artwork, index) => (
              <div
                ref={results.length === index + 1 ? lastResultRef : null}
                key={`${artwork.id}-${index}`} // Use index in key for potential non-unique IDs across pages
              >
                {" "}
                <ArtworkCard
                  artwork={artwork}
                  onLikeToggle={handleLikeToggle}
                  onBookmarkToggle={handleBookmarkToggle}
                  onCommentClick={openCommentModal}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  onReportPost={handleReportPost}
                  currentUserId={CURRENT_USER_ID}
                />
              </div>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {/* Show fewer skeletons for loading more */}
            {Array.from({ length: 3 }).map((_, index) => renderSkeleton(`loading-skeleton-${index}`))}
          </div>
        )}

        {/* Empty State */}
        {initialLoadComplete && !loading && results.length === 0 && !error && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            <p>No posts found matching "{query}".</p>
            <Button variant="link" onClick={() => navigate("/discover")} className="mt-2">
              Back to Discover
            </Button>
          </div>
        )}

        {/* End of List Message */}
        {!loading && !loadingMore && !hasMore && results.length > 0 && initialLoadComplete && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            <p>You've reached the end of the search results.</p>
          </div>
        )}
      </div>{" "}
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
          currentUser={user ? { id: user.id, username: user.username, avatar: getFullStorageUrl(user.avatar), level: user.level || 1 } : null}
        />
      )}
      {/* --- *** NEW: Edit Post Modal *** --- */}{" "}
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
      )}
      {/* --- *** End of Edit Post Modal *** --- */} {/* --- *** NEW: Report Post Modal *** --- */}
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
      {/* --- *** End of Report Post Modal *** --- */}
    </div>
  );
}

// --- Artwork Card Component (Copied from Discover/TopArtworks) ---
// (Make sure props match what's passed)
function ArtworkCard({ artwork, onLikeToggle, onBookmarkToggle, onCommentClick, onEditPost, onDeletePost, onReportPost, currentUserId }) {
  const navigate = useNavigate(); // Get navigate function from useNavigate hook
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
            <Badge variant="outline" className={`${getTypeColor(artwork.type)} capitalize cursor-pointer`} onClick={() => navigate(`/posts/type?query=${encodeURIComponent(artwork.type)}&page=1&limit=9`)}>
              <span>{artwork.type || "Unknown"}</span>
            </Badge>{" "}
            {/* --- *** NEW: Dropdown Menu for Edit/Delete/Report *** --- */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currentUserId === artwork.userId ? (
                  <>
                    <DropdownMenuItem onClick={() => onEditPost(artwork)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeletePost(artwork.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => onReportPost(artwork)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* --- *** End of Dropdown Menu *** --- */}
          </div>
        </div>
      </CardHeader>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <ImageCarousel images={artwork.images} title={artwork.title} />
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="text-lg font-semibold">{artwork.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{artwork.description}</p>
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
