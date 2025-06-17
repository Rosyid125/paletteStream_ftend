import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Heart, X, MessageCircle, Bookmark, MoreHorizontal, Edit, Trash2, Flag } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImageCarousel } from "@/components/ImageCarousel";
import { CommentModal } from "@/components/CommentModal";
import { LikesHoverCard } from "@/components/LikesHoverCard";
import { EditPost } from "@/components/EditPost";
import { ReportPostModal } from "@/components/ReportPostModal";
import api from "../api/axiosInstance";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PropTypes from "prop-types";

// --- Constants ---
const ARTWORKS_PAGE_LIMIT = 9;

// --- Helper function to construct full URL for storage paths ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
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
    console.error("Error constructing image URL:", e, `Base: ${baseUrl}`, `Path: ${relativePath}`);
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
export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext
  const [artworks, setArtworks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(ARTWORKS_PAGE_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const [loadingArtworks, setLoadingArtworks] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const CURRENT_USER_ID = user?.id;
  const observer = useRef();
  const [searchType, setSearchType] = useState("post");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [popularTags, setPopularTags] = useState([]);
  const artworkTypes = ["illustration", "manga", "novel"];
  // --- *** NEW: Edit Post State *** ---
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  // --- *** End of Edit Post State *** ---
  // --- *** NEW: Report Post State *** ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  // --- *** End of Report Post State *** ---

  const fetchArtworks = useCallback(
    async (pageNum) => {
      if (loadingArtworks || (pageNum > 1 && !hasMore)) return;
      setLoadingArtworks(true);
      setError(null);
      console.log(`Fetching randomized artworks page: ${pageNum}`);
      try {
        const params = { page: pageNum, limit: limit, viewerId: CURRENT_USER_ID ?? 0 };
        const response = await api.get("/posts/randomized", { params });
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
          setArtworks((prev) => (pageNum === 1 ? processedData : [...prev, ...processedData]));
          setPage(pageNum + 1);
          setHasMore(processedData.length === limit);
        } else {
          setError(response.data?.message || "Failed fetch");
          if (pageNum === 1) setArtworks([]);
          setHasMore(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "An error occurred.");
        if (pageNum === 1) setArtworks([]);
        setHasMore(false);
      } finally {
        setLoadingArtworks(false);
        if (pageNum === 1) setInitialLoadComplete(true);
      }
    },
    [limit, CURRENT_USER_ID, loadingArtworks, hasMore]
  );

  useEffect(() => {
    fetchArtworks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastArtworkElementRef = useCallback(
    (node) => {
      if (loadingArtworks) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchArtworks(page);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingArtworks, hasMore, fetchArtworks, page]
  );

  const handleSearchTypeChange = (value) => {
    setSearchType(value);
    setSearchQuery("");
    setSelectedTags([]);
    setCurrentTagInput("");
    setSelectedType("");
  };
  const addTag = (tagToAdd) => {
    const cleanedTag = tagToAdd.trim().toLowerCase();
    if (cleanedTag && !selectedTags.includes(cleanedTag)) {
      setSelectedTags([...selectedTags, cleanedTag]);
    }
    setCurrentTagInput("");
  };
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };
  const handleTagInputChange = (e) => {
    setCurrentTagInput(e.target.value);
  };
  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(currentTagInput);
    }
  };
  const handleQueryInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // --- *** UPDATED handleSearchSubmit Function *** ---
  const handleSearchSubmit = () => {
    let targetPath = "";
    let queryString = "";
    switch (searchType) {
      case "artist": {
        if (!searchQuery.trim()) {
          console.log("Artist search query empty.");
          return;
        }
        targetPath = "/users/name";
        queryString = new URLSearchParams({
          query: searchQuery.trim(),
          page: 1,
          limit: 10,
        }).toString();
        break;
      }
      case "post": {
        if (!searchQuery.trim()) {
          console.log("Post search query empty.");
          return;
        }
        targetPath = "/posts/title-desc";
        queryString = new URLSearchParams({
          query: searchQuery.trim(),
          page: 1,
          limit: 9,
        }).toString();
        break;
      }
      case "tags": {
        if (selectedTags.length === 0) {
          console.log("No tags selected.");
          return;
        }
        targetPath = "/posts/tags";
        const tagParams = selectedTags.map((tag) => `query=${encodeURIComponent(tag)}`).join("&");
        queryString = `page=1&limit=9&${tagParams}`;
        break;
      }
      case "type": {
        if (!selectedType) {
          console.log("No type selected.");
          return;
        }
        targetPath = "/posts/type";
        queryString = new URLSearchParams({
          query: selectedType,
          page: 1,
          limit: 9,
        }).toString();
        break;
      }
      default: {
        console.warn("Unknown search type:", searchType);
        return;
      }
    }
    const url = `${targetPath}?${queryString}`;
    console.log("Navigating to:", url);
    navigate(url);
  };
  // --- *** END of UPDATED handleSearchSubmit Function *** ---

  const renderSearchInput = () => {
    switch (searchType) {
      case "artist":
        return <Input placeholder="Search by artist name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleQueryInputKeyDown} />;
      case "post":
        return <Input placeholder="Search by title or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleQueryInputKeyDown} />;
      case "tags":
        return (
          <div className="space-y-2">
            {" "}
            <div className="border rounded-md p-2 min-h-[40px] flex flex-wrap gap-1 items-center">
              {" "}
              {selectedTags.length === 0 && <span className="text-sm text-muted-foreground px-1">Selected tags appear here</span>}{" "}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {" "}
                  {tag}{" "}
                  <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-muted-foreground/20" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                    {" "}
                    <X className="h-3 w-3" />{" "}
                  </Button>{" "}
                </Badge>
              ))}{" "}
            </div>{" "}
            <Input placeholder="Type a tag and press Enter or comma..." value={currentTagInput} onChange={handleTagInputChange} onKeyDown={handleTagInputKeyDown} />{" "}
          </div>
        );
      case "type":
        return (
          <Select value={selectedType} onValueChange={setSelectedType}>
            {" "}
            <SelectTrigger>
              {" "}
              <SelectValue placeholder="Select artwork type..." />{" "}
            </SelectTrigger>{" "}
            <SelectContent>
              {" "}
              {artworkTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {" "}
                  {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                </SelectItem>
              ))}{" "}
            </SelectContent>{" "}
          </Select>
        );
      default:
        return null;
    }
  };
  const handleLikeToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      setError("You must be logged in to like posts.");
      return;
    }
    const postIndex = artworks.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = artworks[postIndex];
    const optimisticStatus = !currentStatus;
    const optimisticCount = currentStatus ? originalPost.likeCount - 1 : originalPost.likeCount + 1;
    setArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, postLikeStatus: optimisticStatus, likeCount: Math.max(0, optimisticCount) } : p)));
    setError(null);
    try {
      const response = await api.post("/likes/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "BE error");
    } catch (err) {
      console.error("Like error:", err);
      setArtworks((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.message || "Like failed");
    }
  };
  const handleBookmarkToggle = async (postId, currentStatus) => {
    if (!CURRENT_USER_ID) {
      setError("You must be logged in to bookmark posts.");
      return;
    }
    const postIndex = artworks.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const originalPost = artworks[postIndex];
    const optimisticStatus = !currentStatus;
    setArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarkStatus: optimisticStatus } : p)));
    setError(null);
    try {
      const response = await api.post("/bookmarks/create-delete", { postId, userId: CURRENT_USER_ID });
      if (!response.data.success) throw new Error(response.data.message || "BE error");
    } catch (err) {
      console.error("Bookmark error:", err);
      setArtworks((prev) => prev.map((p) => (p.id === postId ? originalPost : p)));
      setError(err.message || "Bookmark failed");
    }
  };
  const openCommentModal = (post) => {
    setSelectedPostForModal({ id: post.id, title: post.title });
    setIsCommentModalOpen(true);
  };
  const handleCommentAdded = (postId) => {
    setArtworks((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
  };
  // --- *** NEW: Edit and Delete Post Functions *** ---
  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditPostOpen(true);
  };

  const handlePostUpdated = (postId, updatedData) => {
    setArtworks((prevArtworks) => prevArtworks.map((post) => (post.id === postId ? { ...post, ...updatedData } : post)));
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
        setArtworks((prevArtworks) => prevArtworks.filter((post) => post.id !== postId));
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

  useEffect(() => {
    async function fetchPopularTags() {
      try {
        const res = await api.get("/tags/popular", { params: { limit: 10 } });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setPopularTags(res.data.data.map((t) => t.name));
        } else {
          setPopularTags([]);
        }
      } catch {
        setPopularTags([]);
      }
    }
    fetchPopularTags();
  }, []);
  return (
    <div className="grid grid-cols-1 space-y-6 p-2 sm:p-4 md:p-6">
      {/* Search Card */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2 px-3 sm:px-6">
          {" "}
          <CardTitle className="text-lg sm:text-xl">Discover Artworks</CardTitle>
          <CardDescription className="text-sm">Find new artworks or search for specific content</CardDescription>{" "}
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="w-full md:w-40 flex-shrink-0">
              {" "}
              <Select value={searchType} onValueChange={handleSearchTypeChange}>
                {" "}
                <SelectTrigger className="h-9 text-sm">
                  {" "}
                  <SelectValue placeholder="Search By..." />{" "}
                </SelectTrigger>{" "}
                <SelectContent>
                  {" "}
                  <SelectItem value="post">Post (Title/Desc)</SelectItem> <SelectItem value="artist">Artist Name</SelectItem> <SelectItem value="tags">Tags</SelectItem> <SelectItem value="type">Type</SelectItem>{" "}
                </SelectContent>{" "}
              </Select>{" "}
            </div>
            <div className="flex-1 min-w-0"> {renderSearchInput()} </div>
            <Button onClick={handleSearchSubmit} className="w-full md:w-auto">
              {" "}
              <Search className="mr-2 h-4 w-4" /> Search{" "}
            </Button>
          </div>
          <div className="mt-4">
            {" "}
            <h3 className="text-sm font-medium mb-2">Popular Tags</h3>{" "}
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              {" "}
              <div className="flex gap-2">
                {" "}
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={searchType === "tags" ? "secondary" : "outline"}
                    className={`cursor-${searchType === "tags" ? "pointer" : "not-allowed"} ${searchType === "tags" ? "hover:bg-secondary/80" : "opacity-60"} transition-colors`}
                    onClick={() => searchType === "tags" && addTag(tag)}
                    title={searchType !== "tags" ? "Select 'Tags' in 'Search By' to use" : `Add tag: ${tag}`}
                  >
                    {" "}
                    #{tag}{" "}
                  </Badge>
                ))}{" "}
              </div>{" "}
              <ScrollBar orientation="horizontal" />{" "}
            </ScrollArea>{" "}
          </div>
        </CardContent>
      </Card>
      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          {" "}
          <CardContent className="p-4 text-center text-destructive">Error: {error}</CardContent>{" "}
        </Card>
      )}
      {/* Artworks Grid */}
      <div className="mt-6">
        {!initialLoadComplete && loadingArtworks && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"> {Array.from({ length: limit }).map((_, index) => renderSkeleton(`initial-skeleton-${index}`))} </div>}
        {artworks.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {" "}
            {artworks.map((artwork, index) => (
              <div ref={artworks.length === index + 1 ? lastArtworkElementRef : null} key={`${artwork.id}-${artwork.userId}-${index}`}>
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
                />{" "}
              </div>
            ))}{" "}
          </div>
        )}
        {loadingArtworks && page > 1 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6"> {Array.from({ length: 3 }).map((_, index) => renderSkeleton(`loading-skeleton-${index}`))} </div>}
        {initialLoadComplete && artworks.length === 0 && !loadingArtworks && !error && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            {" "}
            <p>No artworks found for discovery.</p>{" "}
          </div>
        )}
        {!loadingArtworks && !hasMore && artworks.length > 0 && initialLoadComplete && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            {" "}
            <p>You&apos;ve scrolled through all discovered artworks!</p>{" "}
          </div>
        )}
      </div>
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
          currentUser={user ? { id: user.id, username: user.username, avatar: getFullStorageUrl(user.avatar), level: user.level || 1 } : null}
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

// --- Artwork Card Component ---
function ArtworkCard({ artwork, onLikeToggle, onBookmarkToggle, onCommentClick, onEditPost, onDeletePost, onReportPost, currentUserId }) {
  const navigate = useNavigate();
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
          </Link>{" "}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant="outline" className={`${getTypeColor(artwork.type)} capitalize cursor-pointer`} onClick={() => navigate(`/posts/type?query=${encodeURIComponent(artwork.type)}&page=1&limit=9`)}>
              <span>{artwork.type || "Unknown"}</span>
            </Badge>
            {/* --- *** Dropdown Menu for Edit/Delete/Report *** --- */}
            {currentUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentUserId === artwork.userId ? (
                    // Options for post owner
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
                    // Options for other users
                    <DropdownMenuItem onClick={() => onReportPost(artwork)} className="text-red-600">
                      <Flag className="mr-2 h-4 w-4" />
                      Report Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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

ArtworkCard.propTypes = {
  artwork: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    avatar: PropTypes.string,
    username: PropTypes.string,
    level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    postLikeStatus: PropTypes.bool,
    likeCount: PropTypes.number,
    commentCount: PropTypes.number,
    bookmarkStatus: PropTypes.bool,
  }).isRequired,
  onLikeToggle: PropTypes.func.isRequired,
  onBookmarkToggle: PropTypes.func.isRequired,
  onCommentClick: PropTypes.func.isRequired,
  onEditPost: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  onReportPost: PropTypes.func.isRequired,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
