// --- Import necessary components and hooks ---
// ... (keep existing imports)
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Bookmark, Award, Clock, CheckCircle2, Trophy, Star, FlameIcon as Fire, TrendingUp, MoreHorizontal, Trash2 } from "lucide-react"; // Keep MoreHorizontal, Trash2
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Keep Dropdown
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Import Dialog components for delete confirmation

// --- Import new components ---
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { CommentModal } from "@/components/CommentModal"; // <-- IMPORT COMMENT MODAL

// --- Import instance Axios ---
import api from "./../api/axiosInstance";

// --- Constants ---
const USER_DATA = JSON.parse(localStorage.getItem("user")); // Get full user object
const USER_ID = USER_DATA?.id;
const POSTS_PER_PAGE = 9;

export default function Home() {
  // ... (keep existing state: posts, page, loading, initialLoading, hasMore, error)
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // --- State for Modals ---
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null); // Store { id, title }
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const observer = useRef();

  // --- Helper function to format image URLs ---
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/avatars/noimage.png"; // Consistent default
    const cleanedPath = imagePath.replace(/\\/g, "/");

    // Check if it's already a full URL or a path starting with /storage/
    if (cleanedPath.startsWith("http") || cleanedPath.startsWith("/storage")) {
      // Prepend base URL only if it's a /storage path and base URL is defined
      return cleanedPath.startsWith("/storage") && api.defaults.baseURL ? `${api.defaults.baseURL}${cleanedPath}` : cleanedPath;
    }
    // Handle potentially relative paths assuming they relate to the base URL
    if (api.defaults.baseURL) {
      const baseUrl = api.defaults.baseURL.endsWith("/") ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
      const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
      return `${baseUrl}/${relativePath}`;
    }
    // Fallback if base URL isn't set and path isn't absolute
    return cleanedPath;
  };

  // --- Function Fetch Data using Axios ---
  const loadMorePosts = useCallback(
    async (currentPage, isInitialLoad) => {
      if ((loading && !isInitialLoad) || (!hasMore && !isInitialLoad)) return; // Adjusted condition

      console.log(`Fetching page ${currentPage} (Initial: ${isInitialLoad})`);
      setLoading(true);
      if (isInitialLoad) {
        setInitialLoading(true);
        setError(null);
        setPosts([]);
        setPage(1);
        setHasMore(true);
      }

      try {
        // Ensure USER_ID is available before fetching
        if (!USER_ID) {
          throw new Error("User not logged in. Cannot fetch home feed.");
        }

        const response = await api.get(`/posts/home/${USER_ID}`, {
          params: { page: currentPage, limit: POSTS_PER_PAGE },
        });
        const result = response.data;

        if (result.success && Array.isArray(result.data)) {
          const fetchedData = result.data;
          setPosts((prevPosts) => (isInitialLoad ? fetchedData : [...prevPosts, ...fetchedData]));
          setPage(currentPage + 1);
          setHasMore(fetchedData.length === POSTS_PER_PAGE);
          setError(null); // Clear error on successful fetch
        } else {
          console.error("API error or invalid data:", result);
          setHasMore(false);
          // Set error only if it's initial load or no posts were ever loaded
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
            // Potentially redirect to login here
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
    // Include USER_ID in dependencies if it could change (though unlikely from localStorage)
    [loading, hasMore, posts.length] // Removed page state from deps, managed internally
  );

  // --- Like/Unlike Post ---
  const handleLikeToggle = async (postId, currentStatus) => {
    // Find the index of the post to update its state optimistically
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return; // Post not found

    const originalPost = posts[postIndex];
    const optimisticStatus = !currentStatus;
    const optimisticCount = currentStatus ? originalPost.likeCount - 1 : originalPost.likeCount + 1;

    // Optimistic UI update
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: optimisticCount } : p)));

    try {
      if (optimisticStatus) {
        // If liking
        await api.post("/likes", { post_id: postId, user_id: USER_ID }); // Ensure user_id is handled backend/passed
        console.log(`Post ${postId} liked`);
      } else {
        // If unliking
        // The backend might need the like ID, or handle deletion by postId + userId
        // Assuming deletion by postId and authenticated user for now:
        await api.delete(`/likes/post/${postId}`); // Adjust endpoint if needed
        console.log(`Post ${postId} unliked`);
      }
      // API call successful, optimistic state is correct. Optionally refetch post details if needed.
      setError(null); // Clear any previous interaction errors
    } catch (err) {
      console.error(`Error ${optimisticStatus ? "liking" : "unliking"} post:`, err);
      // Revert optimistic update on failure
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p)));
      setError(`Could not ${optimisticStatus ? "like" : "unlike"} the post. Please try again.`);
      // Optionally show a toast notification
    }
  };

  // --- Delete Post ---
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    // Consider adding a deleting state if it takes time
    try {
      const response = await api.delete(`/posts/${postToDelete}`);
      if (response.data.success) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postToDelete));
        setError(null);
      } else {
        setError(response.data.message || "Failed to delete post.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("An error occurred while deleting the post.");
    } finally {
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // --- Open Comment Modal ---
  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title }); // Store id and title
    setIsCommentModalOpen(true);
  };

  // --- Callback for Comment Modal ---
  const handleCommentAdded = (postId) => {
    // Increment comment count in the main posts state
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  // --- Intersection Observer Setup --- (Keep as is)
  const lastPostElementRef = useCallback(
    /* ... same code ... */
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          console.log("Last element visible, loading more...");
          loadMorePosts(page, false); // Use the current page state
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, initialLoading, loadMorePosts] // Add loadMorePosts dependency
  );

  // --- Effect for Initial Load Only --- (Keep as is)
  useEffect(() => {
    console.log("Component mounted, loading initial posts...");
    const timerId = setTimeout(() => loadMorePosts(1, true), 0);
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array

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

  // --- Dummy Data Sidebar (Remains the same) ---
  const dummyUserData = { level: 5, exp: 1250, expToNextLevel: 2000 };
  const challenges = [
    { id: 1, title: "Fantasy World", description: "Create a stunning fantasy landscape.", deadline: "3 days left", participants: 152, prize: "Exclusive Badge" },
    { id: 2, title: "Character Design", description: "Design an original sci-fi hero.", deadline: "1 week left", participants: 88, prize: "$50 Voucher" },
  ];
  const badges = [
    { id: 1, title: "First Steps", description: "Posted first artwork", icon: <Star className="h-4 w-4 text-yellow-500" /> },
    { id: 2, title: "Community Member", description: "Liked 10 posts", icon: <Heart className="h-4 w-4 text-red-500" /> },
    { id: 3, title: "Rising Star", description: "Reached Level 5", icon: <TrendingUp className="h-4 w-4 text-green-500" /> },
    { id: 4, title: "Bookworm", description: "Read 5 novels", icon: <Bookmark className="h-4 w-4 text-blue-500" /> },
  ];
  const achievements = [
    { id: 1, name: "Illustrator Initiate", progress: 5, total: 10, completed: false },
    { id: 2, name: "Manga Mania", progress: 2, total: 5, completed: false },
    { id: 3, name: "Daily Creator", progress: 7, total: 7, completed: true },
    { id: 4, name: "Feedback Champion", progress: 25, total: 50, completed: false },
  ];
  const recommendedArtists = [
    { id: 101, name: "Aqua Stellar", specialty: "Illustrator", level: 15, avatar: "/avatars/aqua.png" },
    { id: 102, name: "Kenjiro", specialty: "Manga Artist", level: 12, avatar: "/avatars/kenjiro.png" },
    { id: 103, name: "Luna Writes", specialty: "Novelist", level: 8, avatar: "/avatars/luna.png" },
  ];

  return (
    <>
      {" "}
      {/* Use Fragment to wrap everything including the modals */}
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
                {/* === Loading States === */}
                {initialLoading /* ... Skeleton code remains the same ... */ &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={`skeleton-${index}`} className="overflow-hidden">
                      {/* ... */}
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
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Skeleton className="h-4 w-12 mr-1 rounded" />
                          <Skeleton className="h-4 w-16 mr-1 rounded" />
                        </div>
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

                {/* === Content Display === */}
                {!initialLoading &&
                  posts.length > 0 &&
                  posts.map((post, index) => {
                    const isLastElement = posts.length === index + 1;
                    return (
                      <Card key={`${post.id}-${index}`} className="overflow-hidden" ref={isLastElement ? lastPostElementRef : null}>
                        {/* Card Header */}
                        <CardHeader className="pb-2 space-y-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              {/* Avatar Hover Card */}
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Avatar className="cursor-pointer h-10 w-10">
                                    <AvatarImage src={formatImageUrl(post.avatar)} alt={post.username} />
                                    <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                  </Avatar>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  {/* ... hover content ... */}
                                  <div className="flex justify-between space-x-4">
                                    <Avatar>
                                      <AvatarImage src={formatImageUrl(post.avatar)} />
                                      <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                      <h4 className="text-sm font-semibold">{post.username}</h4>
                                      <p className="text-sm text-muted-foreground">Level {post.level || 1} Artist</p>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                              <div>
                                <p className="font-medium text-sm">{post.username}</p>
                                <p className="text-xs text-muted-foreground">Level {post.level || 1}</p>
                                <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={`${getTypeColor(post.type)} capitalize`}>
                                {post.type || "Unknown"}
                              </Badge>
                              {/* --- Delete Dropdown --- */}
                              {USER_ID === post.userId && (
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
                                        setPostToDelete(post.id);
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
                        <ImageCarousel images={post.images} title={post.title} />

                        {/* Card Content */}
                        <CardContent className="pt-4">
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{post.description}</p>
                          {/* ... tags ... */}
                          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs capitalize">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>

                        {/* Card Footer - WITH UPDATED LIKE/COMMENT BUTTONS */}
                        <CardFooter className="flex justify-between border-t pt-4">
                          <div className="flex space-x-4">
                            {/* --- Like Button with Hover Card --- */}
                            <HoverCard openDelay={200} closeDelay={100}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    {/* Button triggers like action, count triggers hover */}
                                    <div className="flex items-center">
                                      {" "}
                                      {/* Group button and hover trigger */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`flex items-center space-x-1 h-8 pl-1 pr-2 rounded-l-md ${post.postLikeStatus ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`} // Adjusted styling
                                        onClick={() => handleLikeToggle(post.id, post.postLikeStatus)} // <-- ADD ONCLICK
                                      >
                                        <Heart className={`h-4 w-4 ${post.postLikeStatus ? "fill-current" : ""}`} />
                                      </Button>
                                      {/* Hover trigger is now just the count */}
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
                                    <p>{post.postLikeStatus ? "Unlike" : "Like"} this post</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {/* --- Likes Hover Content --- */}
                              <HoverCardContent className="w-auto p-0" side="top" align="start">
                                {" "}
                                {/* Adjust side/align */}
                                {/* Render only when postId is valid */}
                                {post.id && <LikesHoverCard postId={post.id} />}
                              </HoverCardContent>
                            </HoverCard>

                            {/* --- Comment Button --- */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center space-x-1 h-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => openCommentModal(post)} // <-- ADD ONCLICK
                                  >
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
                          {/* --- Bookmark Button --- */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8">
                                  {" "}
                                  <Bookmark className="h-4 w-4" />{" "}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {" "}
                                <p>Save to bookmarks</p>{" "}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardFooter>
                      </Card>
                    );
                  })}

                {/* === End of Content States === */}
                {loading && !initialLoading && <div className="text-center py-4 text-muted-foreground">Loading more posts...</div>}
                {!initialLoading && !loading && posts.length === 0 && !error && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No posts found yet.</p>
                  </div>
                )}
                {!loading && !hasMore && posts.length > 0 && <div className="text-center py-4 text-muted-foreground">You've reached the end! ✨</div>}
                {error && (
                  <div className="p-4 my-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Error!</span> {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Remains unchanged, using dummy data) */}
        <div className="space-y-6">
          {/* Active Challenges Card */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                {" "}
                <Trophy className="h-5 w-5 text-primary mr-2" /> Active Challenges{" "}
              </CardTitle>
              <CardDescription>Compete and earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden border-none shadow-sm bg-card/50 hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-sm">{challenge.title}</h3>
                      <Badge variant="outline" className="text-xs whitespace-nowrap bg-primary/10 text-primary border-primary/20">
                        {" "}
                        <Clock className="h-3 w-3 mr-1" /> {challenge.deadline}{" "}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
                    <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                      <span>{challenge.participants} participants</span>
                      <span className="font-medium text-primary">{challenge.prize}</span>
                    </div>
                    {/* <Button size="sm" className="w-full mt-3 h-8">Join Challenge</Button> */}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
            <CardFooter>
              {" "}
              <Button variant="outline" className="w-full">
                {" "}
                View All Challenges{" "}
              </Button>{" "}
            </CardFooter>
          </Card>

          {/* Gamification Hub Card */}
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                {" "}
                <Award className="h-5 w-5 text-amber-500 mr-2" /> Gamification Hub{" "}
              </CardTitle>
              <CardDescription>Track your progress and missions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-base">Level {dummyUserData.level}</h3>
                  <p className="text-xs text-muted-foreground">
                    EXP: {dummyUserData.exp} / {dummyUserData.expToNextLevel}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Progress value={(dummyUserData.exp / dummyUserData.expToNextLevel) * 100} className="h-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {" "}
                      <p>{dummyUserData.expToNextLevel - dummyUserData.exp} EXP to next level</p>{" "}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-3 text-sm">Badges Earned</h3>
                <ScrollArea className="h-[100px] pr-3">
                  {" "}
                  {/* Adjusted height */}
                  <div className="grid grid-cols-2 gap-2">
                    {badges.map((badge) => (
                      <Card key={badge.id} className="overflow-hidden border-none shadow-sm bg-card/50">
                        <CardContent className="p-2 flex items-center space-x-2">
                          <div className="flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">{badge.icon}</div>
                          <div>
                            <p className="font-medium text-xs leading-tight">{badge.title}</p>
                            {/* <p className="text-xs text-muted-foreground">{badge.description}</p> */}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-3 text-sm">Achievements</h3>
                <ScrollArea className="h-[150px] pr-3">
                  {" "}
                  {/* Adjusted height */}
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 transition-colors text-xs">
                        <div className="w-full pr-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{achievement.name}</p>
                            <Badge variant={achievement.completed ? "default" : "outline"} className={`h-4 px-1.5 text-[10px] ${achievement.completed ? "bg-green-600/20 text-green-700 border-green-600/30" : ""}`}>
                              {" "}
                              {achievement.completed ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null} {achievement.completed ? "Done" : `${Math.round((achievement.progress / achievement.total) * 100)}%`}{" "}
                            </Badge>
                          </div>
                          <Progress value={(achievement.progress / achievement.total) * 100} className={`h-1 w-full mt-1 ${achievement.completed ? "[&>*]:bg-green-500" : ""}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Recommended for You Card */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                {" "}
                <Fire className="h-5 w-5 text-blue-500 mr-2" /> Recommended for You{" "}
              </CardTitle>
              <CardDescription>Artists you might like</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {recommendedArtists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <HoverCard openDelay={200} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <Avatar className="cursor-pointer h-9 w-9">
                          <AvatarImage src={artist.avatar} alt={artist.name} />
                          <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72">
                        {" "}
                        {/* Adjusted width */}
                        <div className="flex justify-between space-x-3">
                          <Avatar>
                            {" "}
                            <AvatarImage src={artist.avatar} /> <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>{" "}
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{artist.name}</h4>
                            <p className="text-xs">{artist.specialty}</p>
                            <p className="text-xs text-muted-foreground">Level {artist.level} Artist</p>
                            <div className="flex items-center pt-1 space-x-1">
                              <Button variant="outline" size="xs">
                                Profile
                              </Button>
                              <Button size="xs">Follow</Button>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <div>
                      <p className="font-medium text-sm">{artist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {" "}
                        {artist.specialty} • Lvl {artist.level}{" "}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 px-2">
                    {" "}
                    Follow{" "}
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              {" "}
              <Button variant="ghost" className="w-full h-8 text-sm">
                {" "}
                View More{" "}
              </Button>{" "}
            </CardFooter>
          </Card>
        </div>
      </div>
      {/* --- Modals Rendered Outside Main Layout Flow --- */}
      {/* Comment Modal */}
      {isCommentModalOpen && selectedPostForModal && (
        <CommentModal
          postId={selectedPostForModal.id}
          postTitle={selectedPostForModal.title}
          isOpen={isCommentModalOpen}
          onClose={() => {
            setIsCommentModalOpen(false);
            setSelectedPostForModal(null); // Clear selection on close
          }}
          onCommentAdded={handleCommentAdded} // <-- Pass callback
          currentUser={
            USER_DATA
              ? {
                  // Pass current user details
                  id: USER_DATA.id,
                  username: USER_DATA.username,
                  avatar: USER_DATA.avatar,
                  level: USER_DATA.level || 1, // Assuming level is available
                }
              : null
          }
        />
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the post and all associated data.</DialogDescription>
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
    </> // Close Fragment
  );
}
