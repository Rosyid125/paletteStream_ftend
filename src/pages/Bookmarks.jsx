import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Trash2, Clock, Loader2 } from "lucide-react"; // Added Loader2, ensure Trash2, MoreHorizontal are present
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Import DialogClose

// Komponen yang relevan
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { CommentModal } from "@/components/CommentModal";

// Instance Axios
import api from "./../api/axiosInstance"; // Pastikan path ini benar

const POSTS_PER_PAGE = 12; // Atau sesuaikan dengan limit di API Anda jika berbeda

export default function BookmarkedPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  // --- State for Delete Confirmation Dialog ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null); // Store the ID of the post to be deleted
  // USER DATA AND USER ID
  const [USER_DATA, setUserData] = useState(null);
  const [USER_ID, setUserId] = useState(null);

  const observer = useRef();

  // --- *** Gunakan useEffect untuk membaca localStorage saat komponen mount/lokasi berubah *** ---
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData); // Set user data if needed
        setUserId(parsedData?.id);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        // Handle error, maybe clear invalid data
        localStorage.removeItem("user");
        setUserData(null);
        setUserId(null);
      }
    } else {
      setUserData(null);
      setUserId(null);
    }
  }, []); // Kosongkan dependency array agar hanya dijalankan saat mount

  // --- Helper function to format image URLs ---
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/storage/avatars/noimage.png"; // Default avatar
    const cleanedPath = imagePath.replace(/\\+/g, "/");
    // Jika sudah URL absolut atau path /storage
    if (cleanedPath.startsWith("http") || cleanedPath.startsWith("/storage")) {
      // Jika path storage dan baseURL ada, gabungkan
      return cleanedPath.startsWith("/storage") && api.defaults.baseURL ? `${api.defaults.baseURL}${cleanedPath}` : cleanedPath;
    }
    // Jika path relatif dan baseURL ada
    if (api.defaults.baseURL) {
      const baseUrl = api.defaults.baseURL.endsWith("/") ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
      const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
      return `${baseUrl}/${relativePath}`;
    }
    // Fallback jika baseURL tidak ada (seharusnya tidak terjadi dengan Axios instance)
    return cleanedPath;
  };

  // --- Function Fetch Bookmarked Posts ---
  const loadMoreBookmarkedPosts = useCallback(
    async (currentPage, isInitialLoad) => {
      if ((loading && !isInitialLoad) || (!hasMore && !isInitialLoad)) return;

      console.log(`Fetching Bookmarked Posts - Page ${currentPage} (Initial: ${isInitialLoad})`);
      setLoading(true);
      if (isInitialLoad) {
        setInitialLoading(true);
        setError(null);
        setPosts([]);
        setPage(1);
        setHasMore(true);
      }

      if (!USER_ID) {
        setError("User not logged in. Cannot fetch bookmarked posts.");
        setLoading(false);
        setInitialLoading(false);
        setHasMore(false);
        return;
      }

      try {
        // Ganti endpoint ke /posts/bookmarked/{USER_ID}
        const response = await api.get(`/posts/bookmarked/${USER_ID}`, {
          params: { page: currentPage, limit: POSTS_PER_PAGE },
        });
        const result = response.data;

        if (result.success && Array.isArray(result.data)) {
          const fetchedData = result.data;
          console.log("Fetched Bookmarked Posts Sample:", fetchedData[0]);

          // Proses data mirip dengan LikedPosts, pastikan field ada
          const processedData = fetchedData.map((post) => ({
            ...post,
            // --- Ensure all necessary fields exist and have default values ---
            id: post.id, // Essential for keys and actions
            userId: post.userId ?? null, // Essential for ownership check
            username: post.username ?? "Unknown User",
            avatar: post.avatar ?? null,
            level: post.level ?? 1,
            createdAt: post.createdAt ?? null, // Tanggal post dibuat
            // bookmarkedAt: post.bookmarkedAt ?? null, // Jika API menyediakan tanggal bookmark
            type: post.type ?? "unknown",
            title: post.title ?? "Untitled Post",
            description: post.description ?? "",
            // Ensure images are processed correctly
            images: Array.isArray(post.images) ? post.images.map((img) => formatImageUrl(img)) : [],
            tags: Array.isArray(post.tags) ? post.tags : [],
            postLikeStatus: post.postLikeStatus === undefined ? false : post.postLikeStatus,
            bookmarkStatus: post.bookmarkStatus === undefined ? true : post.bookmarkStatus, // Default true for halaman bookmark
            likeCount: post.likeCount === undefined ? 0 : Number(post.likeCount) || 0,
            commentCount: post.commentCount === undefined ? 0 : Number(post.commentCount) || 0,
          }));

          setPosts((prevPosts) => (isInitialLoad ? processedData : [...prevPosts, ...processedData]));
          setPage(currentPage + 1);
          setHasMore(processedData.length === POSTS_PER_PAGE);
          setError(null);
        } else {
          console.error("API error or invalid bookmarked posts data:", result);
          setHasMore(false);
          if (isInitialLoad || posts.length === 0) {
            setError(result.message || "Failed to fetch bookmarked posts.");
          }
        }
      } catch (err) {
        console.error("Error fetching bookmarked posts:", err);
        let errorMessage = err.message || "An error occurred while fetching bookmarked posts.";
        if (err.response) {
          errorMessage = `Error ${err.response.status}: ${err.response.data?.message || err.message}`;
          if (err.response.status === 401) errorMessage = "Unauthorized. Please log in again.";
        } else if (err.request) {
          errorMessage = "No response from server.";
        }
        setError(errorMessage);
        setHasMore(false); // Hentikan jika ada error
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setInitialLoading(false);
        }
      }
    },
    [loading, hasMore, posts.length] // Dependencies
  );

  // --- Like/Unlike Post (Tetap sama, tidak menghapus dari list bookmark) ---
  const handleLikeToggle = async (postId, currentStatus) => {
    if (!USER_ID) {
      setError("You must be logged in to like/unlike posts.");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const originalPost = posts[postIndex];
    const optimisticStatus = !currentStatus;
    const optimisticCount = optimisticStatus ? originalPost.likeCount + 1 : Math.max(0, originalPost.likeCount - 1);

    // Optimistic Update: Hanya update status like dan count
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: optimisticCount } : p)));

    try {
      const response = await api.post("/likes/create-delete", { postId, userId: USER_ID });
      if (!response.data.success) {
        console.error(`Backend failed to toggle like for post ${postId}:`, response.data.message);
        // Rollback
        setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p)));
        setError(response.data.message || "Could not update like status.");
      } else {
        console.log(`Like status toggled for post ${postId}: ${response.data.data.message}`);
        // Jika sukses, state sudah optimis, mungkin hanya perlu refresh count dari response jika beda
        // Opsional: Update count dari response jika backend mengembalikannya
        if (response.data.data?.likeCount !== undefined) {
          setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, likeCount: response.data.data.likeCount } : p)));
        }
        setError(null);
      }
    } catch (err) {
      console.error("Error toggling like status:", err);
      // Rollback
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? originalPost : p)));
      let errorMsg = "Could not update like status.";
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      setError(errorMsg);
    }
  };

  // --- Bookmark/Unbookmark Post (Unbookmark akan menghapus dari list) ---
  const handleBookmarkToggle = async (postId, currentStatus) => {
    if (!USER_ID) {
      setError("You must be logged in to bookmark/unbookmark posts.");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const originalPost = posts[postIndex];
    const optimisticStatus = !currentStatus;

    // Optimistic Update:
    if (optimisticStatus === false) {
      // Hapus dari list jika di-unbookmark
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    } else {
      // Jika di-bookmark lagi (seharusnya tidak terjadi di page ini, tapi handle saja)
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));
    }

    try {
      const response = await api.post("/bookmarks/create-delete", { postId, userId: USER_ID });
      if (!response.data.success) {
        console.error(`Backend failed to toggle bookmark for post ${postId}:`, response.data.message);
        // Rollback: Kembalikan post jika tadi dihapus, atau revert status jika diubah
        setPosts((prevPosts) => {
          if (!prevPosts.some((p) => p.id === postId) && !optimisticStatus) {
            // Jika dihapus dan statusnya jadi false (unbookmark gagal)
            const newPosts = [...prevPosts];
            newPosts.splice(postIndex, 0, originalPost); // Tambah kembali di posisi semula
            return newPosts;
          } else {
            // Jika hanya status yg diubah atau kasus lain
            return prevPosts.map((p) => (p.id === postId ? originalPost : p));
          }
        });
        setError(response.data.message || "Could not update bookmark status.");
      } else {
        console.log(`Bookmark status toggled for post ${postId}: ${response.data.data.message}`);
        // Jika sukses dan post dihapus, tidak perlu lakukan apa-apa.
        // Jika sukses dan status diubah (kasus bookmark lagi), state sudah optimis.
        setError(null);
      }
    } catch (err) {
      console.error("Error toggling bookmark status:", err);
      // Rollback: Sama seperti di atas
      setPosts((prevPosts) => {
        if (!prevPosts.some((p) => p.id === postId) && !optimisticStatus) {
          const newPosts = [...prevPosts];
          newPosts.splice(postIndex, 0, originalPost);
          return newPosts;
        } else {
          return prevPosts.map((p) => (p.id === postId ? originalPost : p));
        }
      });
      let errorMsg = "Could not update bookmark status.";
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      setError(errorMsg);
    }
  };

  // --- *** UPDATED: Delete Post Function *** ---
  const handleDeletePost = async () => {
    if (!postToDelete) return; // Exit if no post is selected
    const postId = postToDelete;
    const originalPosts = [...posts]; // Backup original posts for potential rollback

    // Optimistic Deletion: Remove the post from the UI immediately
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setIsDeleteDialogOpen(false); // Close the dialog
    setPostToDelete(null); // Reset the post ID to delete

    try {
      // Use the specified endpoint structure: DELETE /api/posts/delete/{postId}
      const response = await api.delete(`/posts/delete/${postId}`);

      if (response.data.success) {
        setError(null); // Clear any previous errors
        console.log(`Post ${postId} deleted successfully.`);
        // Post is already removed from UI optimistically, no further action needed
      } else {
        // Deletion failed on the backend, rollback UI
        console.error(`Backend failed to delete post ${postId}:`, response.data.message);
        setError(response.data.message || "Failed to delete post.");
        setPosts(originalPosts); // Restore the original posts list
      }
    } catch (err) {
      // Network or other error occurred, rollback UI
      console.error("Error deleting post:", err);
      setError(err.response?.data?.message || "An error occurred while deleting the post.");
      setPosts(originalPosts); // Restore the original posts list
    } finally {
      // Ensure dialog is closed and state is reset even if already done
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };
  // --- *** End of Delete Post Function *** ---

  // --- Open Comment Modal (Tetap sama) ---
  const openCommentModal = (post) => {
    // Ensure post and post.id are valid before opening
    if (post && typeof post.id !== "undefined") {
      setSelectedPostForModal({ id: post.id, title: post.title });
      setIsCommentModalOpen(true);
    } else {
      console.warn("Attempted to open comment modal for invalid post:", post);
      setError("Could not open comments for this post.");
    }
  };

  // --- Callback for Comment Modal (Tetap sama) ---
  const handleCommentAdded = (postId) => {
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };

  // --- Intersection Observer Setup (Tetap sama) ---
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          console.log("Last bookmarked post visible, loading more...");
          loadMoreBookmarkedPosts(page, false); // Panggil fungsi fetch bookmark
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, initialLoading, loadMoreBookmarkedPosts] // Ganti dependency ke loadMoreBookmarkedPosts
  );

  // --- Effect for Initial Load Only ---
  useEffect(() => {
    console.log("Bookmarked Posts component mounted, loading initial posts...");
    loadMoreBookmarkedPosts(1, true); // Panggil fungsi fetch bookmark
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [USER_ID]);

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
        {/* Ganti Judul */}
        <h1 className="text-2xl font-bold mb-6">My Bookmarked Posts</h1>
        {error && !loading && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Error!</span> {error}
            {/* Optional: Clear error button */}
            {/* <button onClick={() => setError(null)} className="ml-2 font-semibold underline">Dismiss</button> */}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* === Loading States === */}
          {initialLoading &&
            Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
              // Skeleton tetap sama
              <Card key={`skeleton-${index}`} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-7" />
                </CardHeader>
                <Skeleton className="aspect-square w-full" />
                <CardContent className="pt-3 pb-2 px-3 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-2 pb-3 px-3">
                  <div className="flex space-x-1">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                  <Skeleton className="h-7 w-7" />
                </CardFooter>
              </Card>
            ))}

          {/* === Content Display === */}
          {!initialLoading &&
            posts.length > 0 &&
            posts.map((post, index) => {
              // --- Add checks for essential post data ---
              if (!post || typeof post.id === "undefined" || typeof post.userId === "undefined") {
                console.warn("Skipping rendering invalid post data:", post);
                return null; // Don't render if essential data is missing
              }
              const isLastElement = posts.length === index + 1;
              return (
                <TooltipProvider key={`${post.id}-${index}`}>
                  <Card className="overflow-hidden flex flex-col" ref={isLastElement ? lastPostElementRef : null}>
                    {/* Card Header */}
                    <CardHeader className="flex flex-row items-center justify-between space-x-2 p-3">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center space-x-2 cursor-pointer overflow-hidden flex-grow">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={formatImageUrl(post.avatar)} alt={post.username} />
                              <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate">{post.username}</p>
                              {post.createdAt && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-xs text-muted-foreground truncate flex items-center">
                                      <Clock className="h-3 w-3 mr-1 inline-block" />
                                      {/* Format date nicely */}
                                      {post.createdAt}
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
                        {/* HoverCard Content for User Profile Preview */}
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage src={formatImageUrl(post.avatar)} />
                              <AvatarFallback>{post.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">@{post.username}</h4>
                              <p className="text-sm text-muted-foreground">Level {post.level || 1} Artist</p>
                              {/* Add more user details if available */}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>

                      {/* --- *** Delete Dropdown (Conditional Render) *** --- */}
                      {USER_ID === post.userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* --- *** Delete Post Menu Item *** --- */}
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault(); // Prevent menu closing immediately
                                setPostToDelete(post.id); // Set the ID of the post to delete
                                setIsDeleteDialogOpen(true); // Open the confirmation dialog
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                            </DropdownMenuItem>
                            {/* Add other options like 'Edit Post' here later if needed */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </CardHeader>

                    {/* Image Carousel tetap sama */}
                    <ImageCarousel images={post.images} title={post.title} aspectRatio="square" />

                    {/* Card Content tetap sama */}
                    <CardContent className="pt-3 pb-2 px-3 flex-grow space-y-1.5">
                      {post.type && (
                        <Badge asChild variant="outline" className={`${getTypeColor(post.type)} capitalize cursor-pointer`} onClick={() => navigate(`/posts/type?query=${encodeURIComponent(post.type)}&page=1&limit=9`)}>
                          <span>{post.type || "Unknown"}</span>
                        </Badge>
                      )}
                      <h3 className="text-base font-semibold line-clamp-2">{post.title}</h3>
                      {post.description && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground line-clamp-2 cursor-default">{post.description}</p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start" className="max-w-[300px] whitespace-normal">
                            <p>{post.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
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

                    {/* Card Footer - Action Buttons */}
                    <CardFooter className="flex justify-between items-center border-t pt-2 pb-3 px-3">
                      <div className="flex space-x-1">
                        {/* Like Button (Handler tetap sama) */}
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

                        {/* Comment Button (Handler tetap sama) */}
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

                      {/* Bookmark Button (Handler diubah ke handleBookmarkToggle) */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            // Selalu tampilkan biru karena ini halaman bookmark, kecuali jika logic unbookmark gagal & status revert
                            className={`h-7 w-7 ${post.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={() => handleBookmarkToggle(post.id, post.bookmarkStatus)}
                            disabled={!USER_ID}
                          >
                            {/* Ikon tetap Bookmark, tapi bisa juga pakai BookmarkMinus jika status true untuk unbookmark */}
                            <Bookmark className={`h-4 w-4 ${post.bookmarkStatus ? "fill-current" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {/* Tooltip disesuaikan */}
                          <p>{!USER_ID ? "Login to interact" : post.bookmarkStatus ? "Remove bookmark" : "Bookmark"}</p>
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
        {loading && !initialLoading && (
          <div className="col-span-full flex justify-center items-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading more bookmarks...
          </div>
        )}
        {/* Ganti pesan empty state */}
        {!initialLoading && !loading && posts.length === 0 && !error && (
          <div className="text-center py-10 col-span-full">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't bookmarked any posts yet.</p>
            {/* Tambahkan tombol atau link untuk explore jika perlu */}
            {/* <Button variant="outline" className="mt-4">Explore Posts</Button> */}
          </div>
        )}
        {/* Ganti pesan end of list */}
        {!loading && !hasMore && posts.length > 0 && <div className="text-center py-6 text-muted-foreground col-span-full">End of bookmarked posts ✨</div>}
      </div>{" "}
      {/* End Container */}
      {/* --- Modals --- */}
      {/* Comment Modal (Tetap sama) */}
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
          // Format avatar URL for current user in modal
          currentUser={USER_DATA ? { id: USER_DATA.id, username: USER_DATA.username, avatar: formatImageUrl(USER_DATA.avatar), level: USER_DATA.level || 1 } : null}
        />
      )}
      {/* --- *** Delete Confirmation Dialog *** --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the post and all associated data.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* Use DialogClose for the cancel button */}
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
