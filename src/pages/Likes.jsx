import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Trash2, Clock } from "lucide-react"; // Added Clock icon
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Komponen yang relevan
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { CommentModal } from "@/components/CommentModal";

// Instance Axios
import api from "./../api/axiosInstance";

// --- Constants ---
const USER_DATA = JSON.parse(localStorage.getItem("user"));
const USER_ID = USER_DATA?.id;
const POSTS_PER_PAGE = 12;

export default function LikedPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const observer = useRef();

  // --- Helper function to format image URLs ---
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/storage/avatars/noimage.png";
    const cleanedPath = imagePath.replace(/\\+/g, "/");
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

  // --- Function Fetch Liked Posts ---
  const loadMoreLikedPosts = useCallback(
    async (currentPage, isInitialLoad) => {
      if (loading || (!hasMore && !isInitialLoad)) return;

      console.log(`Fetching Liked Posts - Page ${currentPage} (Initial: ${isInitialLoad})`);
      setLoading(true);
      if (isInitialLoad) {
        setInitialLoading(true);
        setError(null);
        setPosts([]);
        setPage(1);
        setHasMore(true);
      }

      if (!USER_ID) {
        setError("User not logged in. Cannot fetch liked posts.");
        setLoading(false);
        setInitialLoading(false);
        setHasMore(false);
        return;
      }

      try {
        const response = await api.get(`/posts/liked/${USER_ID}`, {
          params: { page: currentPage, limit: POSTS_PER_PAGE },
        });
        const result = response.data;

        if (result.success && Array.isArray(result.data)) {
          const fetchedData = result.data;
          console.log("Fetched Liked Posts Sample:", fetchedData[0]);

          const processedData = fetchedData.map((post) => ({
            ...post,
            // Ensure all fields from the sample response are potentially handled
            userId: post.userId ?? null,
            username: post.username ?? "Unknown User",
            avatar: post.avatar ?? null,
            level: post.level ?? 1,
            createdAt: post.createdAt ?? null, // Keep createdAt
            type: post.type ?? "unknown", // Keep type
            title: post.title ?? "Untitled Post",
            description: post.description ?? "", // Keep description
            images: Array.isArray(post.images) ? post.images : [],
            tags: Array.isArray(post.tags) ? post.tags : [],
            postLikeStatus: post.postLikeStatus === undefined ? true : post.postLikeStatus, // Default true for liked page
            bookmarkStatus: post.bookmarkStatus === undefined ? false : post.bookmarkStatus,
            likeCount: post.likeCount === undefined ? 0 : post.likeCount,
            commentCount: post.commentCount === undefined ? 0 : post.commentCount,
          }));

          setPosts((prevPosts) => (isInitialLoad ? processedData : [...prevPosts, ...processedData]));
          setPage(currentPage + 1);
          setHasMore(processedData.length === POSTS_PER_PAGE);
          setError(null);
        } else {
          console.error("API error or invalid liked posts data:", result);
          setHasMore(false);
          if (isInitialLoad || posts.length === 0) {
            setError(result.message || "Failed to fetch liked posts.");
          }
        }
      } catch (err) {
        console.error("Error fetching liked posts:", err);
        let errorMessage = err.message || "An error occurred while fetching liked posts.";
        if (err.response) {
          errorMessage = `Error ${err.response.status}: ${err.response.data?.message || err.message}`;
          if (err.response.status === 401) errorMessage = "Unauthorized. Please log in again.";
        } else if (err.request) {
          errorMessage = "No response from server.";
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
    [loading, hasMore, posts.length] // Dependencies
  );

  // --- Like/Unlike Post ---
  const handleLikeToggle = async (postId, currentStatus) => {
    if (!USER_ID) {
      setError("You must be logged in to like/unlike posts.");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = posts[postIndex];
    const optimisticStatus = !currentStatus;

    if (optimisticStatus === false) {
      // Optimistically remove from Liked Posts page when unliked
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    } else {
      // Should ideally not happen on this page, but handle if they like again
      const optimisticCount = currentStatus ? originalPost.likeCount - 1 : originalPost.likeCount + 1;
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: Math.max(0, optimisticCount) } : p)));
    }

    try {
      const response = await api.post("/likes/create-delete", { postId, userId: USER_ID });
      if (!response.data.success) {
        console.error(`Backend failed to toggle like for post ${postId}:`, response.data.message);
        // Rollback
        setPosts((prevPosts) => {
          if (!prevPosts.some((p) => p.id === postId)) {
            // If removed optimistically
            const newPosts = [...prevPosts];
            newPosts.splice(postIndex, 0, originalPost); // Add back at original position
            return newPosts;
          } else {
            // If only status/count updated
            return prevPosts.map((p) => (p.id === postId ? originalPost : p));
          }
        });
        setError(response.data.message || "Could not update like status.");
      } else {
        console.log(`Like status toggled for post ${postId}: ${response.data.data.message}`);
        setError(null);
        // If NOT removing optimistically on unlike, you might need to refresh or update state here based on response
      }
    } catch (err) {
      console.error("Error toggling like status:", err);
      // Rollback (same logic as above)
      setPosts((prevPosts) => {
        if (!prevPosts.some((p) => p.id === postId)) {
          const newPosts = [...prevPosts];
          newPosts.splice(postIndex, 0, originalPost);
          return newPosts;
        } else {
          return prevPosts.map((p) => (p.id === postId ? originalPost : p));
        }
      });
      let errorMsg = "Could not update like status.";
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      setError(errorMsg);
    }
  };

  // --- Bookmark/Unbookmark Post ---
  const handleBookmarkToggle = async (postId, currentStatus) => {
    if (!USER_ID) {
      setError("You must be logged in to bookmark posts.");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = posts[postIndex];
    const optimisticStatus = !currentStatus;

    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));

    try {
      const response = await api.post("/bookmarks/create-delete", { postId, userId: USER_ID });
      if (!response.data.success) {
        console.error(`Backend failed to toggle bookmark for post ${postId}:`, response.data.message);
        setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p))); // Rollback
        setError(response.data.message || "Could not update bookmark status.");
      } else {
        console.log(`Bookmark status toggled for post ${postId}: ${response.data.data.message}`);
        setError(null);
      }
    } catch (err) {
      console.error("Error toggling bookmark status:", err);
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p))); // Rollback
      let errorMsg = "Could not update bookmark status.";
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      setError(errorMsg);
    }
  };

  // --- Delete Post ---
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    const postId = postToDelete; // Keep track of ID for rollback if needed
    const originalPosts = [...posts]; // Backup original state

    // Optimistic Deletion
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setIsDeleteDialogOpen(false); // Close modal immediately
    setPostToDelete(null);

    try {
      const response = await api.delete(`/posts/${postId}`);
      if (response.data.success) {
        setError(null); // Success! No need to do anything else.
        console.log(`Post ${postId} deleted successfully.`);
      } else {
        console.error(`Backend failed to delete post ${postId}:`, response.data.message);
        setError(response.data.message || "Failed to delete post.");
        setPosts(originalPosts); // Rollback
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("An error occurred while deleting the post.");
      setPosts(originalPosts); // Rollback
    } finally {
      // Ensure modal state is cleared even if deletion failed and modal was already closed
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // --- Open Comment Modal ---
  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title });
    setIsCommentModalOpen(true);
  };

  // --- Callback for Comment Modal ---
  const handleCommentAdded = (postId) => {
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  // --- Intersection Observer Setup ---
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          console.log("Last liked post visible, loading more...");
          loadMoreLikedPosts(page, false);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, initialLoading, loadMoreLikedPosts]
  );

  // --- Effect for Initial Load Only ---
  useEffect(() => {
    console.log("Liked Posts component mounted, loading initial posts...");
    loadMoreLikedPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

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

  // --- Return JSX ---
  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">My Liked Posts</h1>
        {error && !loading && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Error!</span> {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* === Loading States === */}
          {initialLoading &&
            Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" /> {/* Skeleton for date */}
                    </div>
                  </div>
                  <Skeleton className="h-7 w-7" /> {/* Skeleton for more button */}
                </CardHeader>
                <Skeleton className="aspect-square w-full" />
                <CardContent className="pt-3 pb-2 px-3 space-y-2">
                  <Skeleton className="h-4 w-1/4" /> {/* Skeleton for type badge */}
                  <Skeleton className="h-5 w-5/6" /> {/* Skeleton for Title */}
                  <Skeleton className="h-4 w-full" /> {/* Skeleton for Description line 1 */}
                  <Skeleton className="h-4 w-3/4" /> {/* Skeleton for Description line 2 */}
                  <Skeleton className="h-4 w-1/2" /> {/* Skeleton for Tags */}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-2 pb-3 px-3">
                  <div className="flex space-x-1">
                    <Skeleton className="h-7 w-16" /> {/* Like button + count */}
                    <Skeleton className="h-7 w-16" /> {/* Comment button + count */}
                  </div>
                  <Skeleton className="h-7 w-7" /> {/* Bookmark button */}
                </CardFooter>
              </Card>
            ))}

          {/* === Content Display === */}
          {!initialLoading &&
            posts.length > 0 &&
            posts.map((post, index) => {
              if (!post) return null;
              const isLastElement = posts.length === index + 1;
              return (
                <TooltipProvider key={`${post.id}-${index}`}>
                  {" "}
                  {/* Wrap card in provider for multiple tooltips */}
                  <Card className="overflow-hidden flex flex-col" ref={isLastElement ? lastPostElementRef : null}>
                    {/* Card Header with User Info, Date, and Delete Option */}
                    <CardHeader className="flex flex-row items-center justify-between space-x-2 p-3">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center space-x-2 cursor-pointer overflow-hidden flex-grow">
                            {" "}
                            {/* Added flex-grow */}
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              {" "}
                              {/* Added flex-shrink-0 */}
                              <AvatarImage src={formatImageUrl(post.avatar)} alt={post.username} />
                              <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate">{post.username}</p>
                              {/* Display createdAt */}
                              {post.createdAt && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-xs text-muted-foreground truncate flex items-center">
                                      <Clock className="h-3 w-3 mr-1 inline-block" /> {/* Optional icon */}
                                      {post.createdAt} {/* Display raw date/time string */}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Posted on: {post.createdAt}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage src={formatImageUrl(post.avatar)} />
                              <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{post.username}</h4>
                              <p className="text-sm text-muted-foreground">Level {post.level || 1} Artist</p>
                              {/* Add more details here if needed */}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>

                      {/* Delete Dropdown if post belongs to the current user */}
                      {USER_ID === post.userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onSelect={(e) => {
                                e.preventDefault();
                                setPostToDelete(post.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </CardHeader>

                    {/* Image Carousel */}
                    <ImageCarousel images={post.images} title={post.title} aspectRatio="square" />

                    {/* Card Content with Type, Title, Description, and Tags */}
                    <CardContent className="pt-3 pb-2 px-3 flex-grow space-y-1.5">
                      {" "}
                      {/* Added space-y */}
                      {/* Display Type */}
                      {post.type && (
                        <Badge variant="outline" className={`text-xs capitalize font-medium ${getTypeColor(post.type)}`}>
                          {post.type}
                        </Badge>
                      )}
                      {/* Display Title */}
                      <h3 className="text-base font-semibold line-clamp-2">{post.title}</h3>
                      {/* Display Description (Truncated with Tooltip) */}
                      {post.description && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground line-clamp-2 cursor-default">{post.description}</p>
                          </TooltipTrigger>
                          {/* Show tooltip only if description is actually truncated (more complex logic) or always show */}
                          <TooltipContent side="bottom" align="start" className="max-w-[300px] whitespace-normal">
                            <p>{post.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {/* Display Tags */}
                      {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {" "}
                          {/* Added pt-1 */}
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs capitalize">
                              #{tag}
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

                    {/* Card Footer - Action Buttons */}
                    <CardFooter className="flex justify-between items-center border-t pt-2 pb-3 px-3">
                      <div className="flex space-x-1">
                        {/* Like Button */}
                        <HoverCard openDelay={200} closeDelay={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`flex items-center space-x-1 h-7 px-1 rounded-l-md ${post.postLikeStatus ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
                                  onClick={() => handleLikeToggle(post.id, post.postLikeStatus)}
                                  disabled={!USER_ID}
                                >
                                  <Heart className={`h-4 w-4 ${post.postLikeStatus ? "fill-current" : ""}`} />
                                </Button>
                                <HoverCardTrigger asChild>
                                  <span
                                    className={`cursor-pointer text-xs font-medium h-7 flex items-center pr-1.5 pl-1 border-l border-transparent hover:bg-accent rounded-r-md ${
                                      post.postLikeStatus ? "text-red-500" : "text-muted-foreground"
                                    }`}
                                  >
                                    {post.likeCount || 0}
                                  </span>
                                </HoverCardTrigger>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{!USER_ID ? "Login to interact" : post.postLikeStatus ? "Unlike" : "Like"}</p>
                            </TooltipContent>
                          </Tooltip>
                          <HoverCardContent className="w-auto p-0" side="top" align="start">
                            {post.id && <LikesHoverCard postId={post.id} />}
                          </HoverCardContent>
                        </HoverCard>

                        {/* Comment Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-7 px-1.5 text-muted-foreground hover:text-foreground" onClick={() => openCommentModal(post)}>
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-xs">{post.commentCount || 0}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View or add comments</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Bookmark Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${post.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={() => handleBookmarkToggle(post.id, post.bookmarkStatus)}
                            disabled={!USER_ID}
                          >
                            <Bookmark className={`h-4 w-4 ${post.bookmarkStatus ? "fill-current" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{!USER_ID ? "Login to bookmark" : post.bookmarkStatus ? "Remove bookmark" : "Bookmark"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardFooter>
                  </Card>
                </TooltipProvider>
              );
            })}
        </div>{" "}
        {/* End Grid */}
        {/* === End of Content States === */}
        {loading && !initialLoading && <div className="text-center py-6 text-muted-foreground col-span-full">Loading more...</div>}
        {!initialLoading && !loading && posts.length === 0 && !error && (
          <div className="text-center py-10 col-span-full">
            <p className="text-muted-foreground">You haven't liked any posts yet.</p>
          </div>
        )}
        {!loading && !hasMore && posts.length > 0 && <div className="text-center py-6 text-muted-foreground col-span-full">End of liked posts ✨</div>}
      </div>{" "}
      {/* End Container */}
      {/* --- Modals --- */}
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
          currentUser={USER_DATA ? { id: USER_DATA.id, username: USER_DATA.username, avatar: USER_DATA.avatar, level: USER_DATA.level || 1 } : null}
        />
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the post.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
