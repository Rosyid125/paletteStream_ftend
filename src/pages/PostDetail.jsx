import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, MessageSquare, ArrowLeft, Trash2, CornerDownRight } from "lucide-react";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axiosInstance";

// Helper function to format image URLs
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

const COMMENTS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 5;

export default function PostDetail() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const commentId = searchParams.get("comment");

  const [postInfo, setPostInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Comment-related states (from CommentModal)
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [visibleReplies, setVisibleReplies] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState({});
  const [postingComment, setPostingComment] = useState(false);
  const [postingReply, setPostingReply] = useState({});
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [replyPage, setReplyPage] = useState({});
  const [hasMoreReplies, setHasMoreReplies] = useState({});
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const commentObserver = useRef();
  const replyObservers = useRef({});

  // Refs to store current values for intersection observers
  const loadingCommentsRef = useRef(loadingComments);
  const hasMoreCommentsRef = useRef(hasMoreComments);
  const commentPageRef = useRef(commentPage);

  // Update refs when state changes
  useEffect(() => {
    loadingCommentsRef.current = loadingComments;
  }, [loadingComments]);

  useEffect(() => {
    hasMoreCommentsRef.current = hasMoreComments;
  }, [hasMoreComments]);

  useEffect(() => {
    commentPageRef.current = commentPage;
  }, [commentPage]);
  // Load post data and comments
  const loadPost = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/posts/single/${postId}`);
      if (response.data && response.data.success && response.data.data) {
        setPostInfo(response.data.data);
      } else {
        setError("Post not found");
      }
    } catch (err) {
      console.error("Error loading post:", err);
      setError(err.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [postId]);
  // Load comments
  const loadComments = useCallback(
    async (pageToLoad, isInitial = false) => {
      if (loadingComments || (!hasMoreComments && !isInitial)) return;

      setLoadingComments(true);
      if (isInitial) {
        setComments([]);
        setCommentPage(1);
        setHasMoreComments(true);
      }

      try {
        const response = await api.get(`/comments/${postId}`, {
          params: { page: pageToLoad, limit: COMMENTS_PER_PAGE },
        });

        const commentsData = response.data?.data?.comments;
        const fetchedComments = Array.isArray(commentsData) ? commentsData : [];

        setComments((prev) => (isInitial ? fetchedComments : [...prev, ...fetchedComments]));
        setCommentPage(pageToLoad + 1);
        setHasMoreComments(fetchedComments.length === COMMENTS_PER_PAGE);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setHasMoreComments(false);
      } finally {
        setLoadingComments(false);
      }
    },
    [postId] // Remove loadingComments and hasMoreComments from dependencies
  );

  // Load replies
  const loadReplies = useCallback(async (commentId, pageToLoad = 1, isInitial = false) => {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    if (isInitial) {
      setReplyPage((prev) => ({ ...prev, [commentId]: 1 }));
      setHasMoreReplies((prev) => ({ ...prev, [commentId]: true }));
    }

    try {
      const response = await api.get(`/comments/comment-replies/${commentId}`, {
        params: { page: pageToLoad, limit: REPLIES_PER_PAGE },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        const fetchedReplies = response.data.data;

        setReplies((prevReplies) => {
          const existingReplies = prevReplies[commentId] || [];
          const newRepliesToAdd = fetchedReplies.filter((fetchedReply) => !existingReplies.some((existingReply) => existingReply.id === fetchedReply.id));

          const combinedReplies = isInitial ? newRepliesToAdd : [...existingReplies, ...newRepliesToAdd];
          const finalReplies = combinedReplies.reduce((acc, reply) => {
            if (!acc.some((r) => r.id === reply.id)) {
              acc.push(reply);
            }
            return acc;
          }, []);

          return {
            ...prevReplies,
            [commentId]: finalReplies,
          };
        });

        setReplyPage((prev) => ({ ...prev, [commentId]: pageToLoad + 1 }));
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: fetchedReplies.length === REPLIES_PER_PAGE }));
      } else {
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: false }));
        if (isInitial) {
          setReplies((prev) => ({ ...prev, [commentId]: prev[commentId] || [] }));
        }
      }
    } catch (err) {
      console.error(`Error fetching replies for comment ${commentId}:`, err);
      setHasMoreReplies((prev) => ({ ...prev, [commentId]: false }));
      if (isInitial) {
        setReplies((prev) => ({ ...prev, [commentId]: prev[commentId] || [] }));
      }
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  }, []);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments(1, true);
    }
  }, [postId]); // Only depend on postId, not the functions  // Intersection Observer for Comments
  const lastCommentElementRef = useCallback(
    (node) => {
      if (loadingCommentsRef.current) return;
      if (commentObserver.current) commentObserver.current.disconnect();
      commentObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreCommentsRef.current && !loadingCommentsRef.current) {
          loadComments(commentPageRef.current);
        }
      });
      if (node) commentObserver.current.observe(node);
    },
    [loadComments] // Only depend on loadComments function
  );
  // Intersection Observer for Replies
  const createReplyRefCallback = useCallback(
    (commentId) => (node) => {
      const isLoading = loadingReplies[commentId] || false;
      const hasMore = hasMoreReplies[commentId] !== undefined ? hasMoreReplies[commentId] : true;
      const currentPage = replyPage[commentId] || 1;

      if (isLoading) return;

      if (replyObservers.current[commentId]) {
        replyObservers.current[commentId].disconnect();
      }

      if (node) {
        replyObservers.current[commentId] = new IntersectionObserver((entries) => {
          // Use current state values from the closure
          const currentLoadingReplies = loadingReplies[commentId] || false;
          const currentHasMoreReplies = hasMoreReplies[commentId] !== undefined ? hasMoreReplies[commentId] : true;
          const currentReplyPage = replyPage[commentId] || 1;

          if (entries[0].isIntersecting && currentHasMoreReplies && !currentLoadingReplies) {
            loadReplies(commentId, currentReplyPage);
          }
        });
        replyObservers.current[commentId].observe(node);
      } else {
        if (replyObservers.current[commentId]) {
          replyObservers.current[commentId].disconnect();
          delete replyObservers.current[commentId];
        }
      }
    },
    [loadReplies] // Only depend on loadReplies function
  );

  // Handlers for keyboard input
  const handleCommentKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handlePostComment();
    }
  };

  const handleReplyKeyDown = (event, commentId) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handlePostReply(commentId);
    }
  };

  // Handle like post
  const handleLikePost = useCallback(async () => {
    if (!currentUser || isLiking || !postInfo) return;

    setIsLiking(true);
    try {
      const response = await api.post(`/posts/${postId}/like`);
      if (response.data) {
        setPostInfo((prev) => ({
          ...prev,
          postLikeStatus: response.data.liked,
          likeCount: response.data.likeCount,
        }));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  }, [currentUser, isLiking, postInfo, postId]);

  // Handle bookmark post
  const handleBookmarkPost = useCallback(async () => {
    if (!currentUser || isBookmarking || !postInfo) return;

    setIsBookmarking(true);
    try {
      const response = await api.post(`/posts/${postId}/bookmark`);
      if (response.data) {
        setPostInfo((prev) => ({
          ...prev,
          bookmarkStatus: response.data.bookmarked,
        }));
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
    } finally {
      setIsBookmarking(false);
    }
  }, [currentUser, isBookmarking, postInfo, postId]);
  const handleBackClick = () => {
    navigate(-1);
  };

  // Toggle reply visibility
  const toggleReplies = (commentId) => {
    const isVisible = !visibleReplies[commentId];
    setVisibleReplies((prev) => ({ ...prev, [commentId]: isVisible }));
    if (isVisible && (!replies[commentId] || replies[commentId].length === 0)) {
      loadReplies(commentId, 1, true);
    }
    if (!isVisible) {
      setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));
      setNewReply((prev) => ({ ...prev, [commentId]: "" }));
    }
  };

  // Toggle reply input
  const toggleReplyInput = (commentId) => {
    setShowReplyInput((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    setVisibleReplies((prev) => ({ ...prev, [commentId]: true }));
  };

  // Post new comment
  const handlePostComment = useCallback(async () => {
    if (!newComment.trim() || !currentUser?.id || postingComment) return;
    setPostingComment(true);
    setError(null);

    let postedCommentData = null;

    try {
      const postResponse = await api.post("/comments/create", {
        post_id: parseInt(postId, 10),
        user_id: currentUser.id,
        content: newComment.trim(),
      });

      if (!postResponse.data.success || !postResponse.data.data) {
        throw new Error(postResponse.data.message || "Failed to post comment.");
      }
      postedCommentData = postResponse.data.data;

      const profileResponse = await api.get(`/profiles/mini-profile/${currentUser.id}`);

      if (!profileResponse.data.success || !profileResponse.data.data) {
        console.warn("Comment posted, but failed to fetch mini-profile for optimistic update.");
        throw new Error("Failed to fetch user profile after posting comment.");
      }

      const userProfileData = profileResponse.data.data;

      const addedComment = {
        ...postedCommentData,
        username: userProfileData.username,
        avatar: userProfileData.avatar,
        level: userProfileData.level,
        user_id: currentUser.id,
        created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        replies_count: 0,
      };

      setComments((prev) => [addedComment, ...prev]);
      setNewComment("");

      // Update post info comment count
      setPostInfo((prev) => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1,
      }));
    } catch (err) {
      console.error("Error posting comment or fetching profile:", err);
      let errorMsg = "An error occurred while posting the comment.";
      if (err.response?.data?.message) {
        errorMsg = `Failed to post comment: ${err.response.data.message}`;
      } else if (err.message) {
        errorMsg = `Failed to post comment: ${err.message}`;
      }
      setError(errorMsg);
    } finally {
      setPostingComment(false);
    }
  }, [newComment, currentUser, postId, postingComment]);

  // Post new reply
  const handlePostReply = useCallback(
    async (commentId) => {
      const replyContent = newReply[commentId]?.trim();
      if (!replyContent || !currentUser?.id || postingReply[commentId]) return;

      setPostingReply((prev) => ({ ...prev, [commentId]: true }));
      setError(null);
      let postedReplyData = null;

      try {
        const postResponse = await api.post("/comments/comment-replies/create", {
          post_comment_id: commentId,
          user_id: currentUser.id,
          content: replyContent,
        });

        if (!postResponse.data.success || !postResponse.data.data) {
          throw new Error(postResponse.data.message || "Failed to post reply.");
        }
        postedReplyData = postResponse.data.data;

        const profileResponse = await api.get(`/profiles/mini-profile/${currentUser.id}`);

        if (!profileResponse.data.success || !profileResponse.data.data) {
          console.warn("Reply posted, but failed to fetch mini-profile for optimistic update.");
          throw new Error("Failed to fetch user profile after posting reply.");
        }

        const userProfileData = profileResponse.data.data;

        const addedReply = {
          ...postedReplyData,
          username: userProfileData.username,
          avatar: userProfileData.avatar,
          level: userProfileData.level,
          user_id: currentUser.id,
          created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setReplies((prevReplies) => {
          const currentRepliesForComment = prevReplies[commentId] || [];
          const replyAlreadyExists = currentRepliesForComment.some((reply) => reply.id === addedReply.id);

          if (replyAlreadyExists) {
            console.warn(`Reply ${addedReply.id} already exists for comment ${commentId}`);
            return prevReplies;
          }

          return {
            ...prevReplies,
            [commentId]: [...currentRepliesForComment, addedReply],
          };
        });

        setNewReply((prev) => ({ ...prev, [commentId]: "" }));
        setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));

        setComments((prevComments) => prevComments.map((c) => (c.id === commentId ? { ...c, replies_count: (c.replies_count || 0) + 1 } : c)));
      } catch (err) {
        console.error(`Error posting reply to comment ${commentId}:`, err);
        let errorMsg = "An error occurred while posting the reply.";
        if (err.response?.data?.message) {
          errorMsg = `Failed to post reply: ${err.response.data.message}`;
        } else if (err.message) {
          errorMsg = `Failed to post reply: ${err.message}`;
        }
        setError(errorMsg);
      } finally {
        setPostingReply((prev) => ({ ...prev, [commentId]: false }));
      }
    },
    [newReply, currentUser, postingReply]
  );

  // Delete comment
  const handleDeleteComment = useCallback(
    async (commentIdToDelete) => {
      if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
        return;
      }

      setDeletingId(commentIdToDelete);
      setError(null);

      const originalComments = [...comments];

      setComments((prev) => prev.filter((c) => c.id !== commentIdToDelete));

      try {
        const response = await api.delete(`/comments/delete/${commentIdToDelete}`);

        if (!response.data.success) {
          throw new Error(response.data.message || "Server indicated failure.");
        }

        // Update post info comment count
        setPostInfo((prev) => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 1) - 1),
        }));
      } catch (err) {
        console.error(`Error deleting comment ${commentIdToDelete}:`, err);
        let errorMsg = "An error occurred while deleting the comment.";
        if (err.response?.data?.message) {
          errorMsg = `Failed to delete comment: ${err.response.data.message}`;
        } else if (err.message) {
          errorMsg = `Failed to delete comment: ${err.message}`;
        }
        setError(errorMsg);

        setComments(originalComments);
      } finally {
        setDeletingId(null);
      }
    },
    [comments]
  );

  // Delete reply
  const handleDeleteReply = useCallback(
    async (commentId, replyId) => {
      if (!window.confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
        return;
      }

      setDeletingId(replyId);
      setError(null);

      const originalRepliesForComment = [...(replies[commentId] || [])];
      const originalComments = [...comments];

      setReplies((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || []).filter((r) => r.id !== replyId),
      }));
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, replies_count: Math.max(0, (c.replies_count || 1) - 1) } : c)));

      try {
        const response = await api.delete(`/comments/comment-replies/delete/${replyId}`);

        if (!response.data.success) {
          throw new Error(response.data.message || "Server indicated failure.");
        }
      } catch (err) {
        console.error(`Error deleting reply ${replyId}:`, err);
        let errorMsg = "An error occurred while deleting the reply.";
        if (err.response?.data?.message) {
          errorMsg = `Failed to delete reply: ${err.response.data.message}`;
        } else if (err.message) {
          errorMsg = `Failed to delete reply: ${err.message}`;
        }
        setError(errorMsg);

        setReplies((prev) => ({ ...prev, [commentId]: originalRepliesForComment }));
        setComments(originalComments);
      } finally {
        setDeletingId(null);
      }
    },
    [replies, comments]
  );
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Back button skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div>
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>

            {/* Post info skeleton */}
            <div className="space-y-6">
              {/* User info skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              {/* Title and description skeletons */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Actions skeleton */}
              <div className="flex gap-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !postInfo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Button variant="ghost" onClick={handleBackClick} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadPost} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!postInfo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Button variant="ghost" onClick={handleBackClick} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground">The post you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back button */}
        <Button variant="ghost" onClick={handleBackClick} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Post section */}
          <div className="space-y-6">
            {/* Image section */}
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                {Array.isArray(postInfo.images) && postInfo.images.length > 0 ? (
                  <ImageCarousel images={postInfo.images} title={postInfo.title} className="rounded-lg border aspect-square" />
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Post info */}
            <div className="space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/profile/${postInfo.userId || postInfo.user_id}`)}>
                  <AvatarImage src={formatImageUrl(postInfo.avatar)} alt={postInfo.username} />
                  <AvatarFallback>{postInfo.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg leading-tight truncate cursor-pointer hover:underline" onClick={() => navigate(`/profile/${postInfo.userId || postInfo.user_id}`)}>
                    {postInfo.username}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lvl {postInfo.level || 1} •
                    <span className="cursor-pointer underline hover:text-primary ml-1" onClick={() => navigate(`/posts/type?query=${encodeURIComponent(postInfo.type)}&page=1&limit=9`)}>
                      {postInfo.type}
                    </span>
                    • <span className="ml-1">{postInfo.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Title and description */}
              <div className="space-y-3">
                <h1 className="font-bold text-2xl leading-tight">{postInfo.title}</h1>
                {postInfo.description && <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{postInfo.description}</p>}
              </div>

              {/* Tags */}
              {Array.isArray(postInfo.tags) && postInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {postInfo.tags.map((tag, idx) => (
                    <span
                      key={tag + idx}
                      className="bg-muted px-3 py-1 rounded-full text-sm text-primary cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => navigate(`/posts/tags?page=1&limit=9&query=${encodeURIComponent(tag)}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`flex items-center gap-2 ${postInfo.postLikeStatus ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                  onClick={handleLikePost}
                  disabled={isLiking || !currentUser}
                >
                  <Heart className={`h-5 w-5 ${postInfo.postLikeStatus ? "fill-current" : ""}`} />
                  <span>{postInfo.likeCount || 0}</span>
                  {isLiking && <span className="text-xs">...</span>}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className={`flex items-center gap-2 ${postInfo.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-blue-500"}`}
                  onClick={handleBookmarkPost}
                  disabled={isBookmarking || !currentUser}
                >
                  <Bookmark className={`h-5 w-5 ${postInfo.bookmarkStatus ? "fill-current" : ""}`} />
                  <span>{postInfo.bookmarkStatus ? "Saved" : "Save"}</span>
                  {isBookmarking && <span className="text-xs">...</span>}
                </Button>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-5 w-5" />
                  <span>{postInfo.commentCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="space-y-6">
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Comments ({postInfo?.commentCount || 0})</h2>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>

              <ScrollArea className="h-[600px] p-4">
                <div className="space-y-4">
                  {/* Comment input */}
                  {currentUser && (
                    <div className="space-y-2 pb-4 border-b">
                      <Textarea
                        placeholder="Add a comment... (Press Enter to send, Shift+Enter for new line)"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleCommentKeyDown}
                        rows={3}
                        className="resize-none"
                        disabled={postingComment}
                      />
                      <Button onClick={handlePostComment} disabled={postingComment || !newComment.trim()} className="w-full">
                        {postingComment ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  )}

                  {/* Comments loading skeletons */}
                  {loadingComments &&
                    comments.length === 0 &&
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`comment-skeleton-${index}`} className="flex space-x-3 py-2">
                        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                        <div className="flex-grow space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                      </div>
                    ))}

                  {/* No comments message */}
                  {!loadingComments && comments.length === 0 && !error && <p className="text-sm text-muted-foreground text-center py-6">Be the first to comment!</p>}

                  {/* Display comments */}
                  {comments.map((comment, index) => {
                    const isLastComment = comments.length === index + 1;
                    const canDeleteComment = currentUser && currentUser.id === comment.user_id;

                    return (
                      <div key={comment.id || `comment-${index}`} ref={isLastComment ? lastCommentElementRef : null} className={commentId && comment.id.toString() === commentId ? "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2" : ""}>
                        <div className="flex space-x-3 py-3">
                          <Avatar className="h-10 w-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/profile/${comment.user_id}`)}>
                            <AvatarImage src={formatImageUrl(comment.avatar)} alt={comment.username} />
                            <AvatarFallback>{comment.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>

                          <div className="flex-grow min-w-0">
                            <div className="flex items-baseline space-x-2">
                              <span className="font-semibold text-sm truncate cursor-pointer hover:underline" onClick={() => navigate(`/profile/${comment.user_id}`)}>
                                {comment.username}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">• Lvl {comment.level || 1}</span>
                            </div>

                            <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>

                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                              <span className="truncate">{comment.created_at instanceof Date ? comment.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : comment.created_at}</span>

                              <button onClick={() => toggleReplyInput(comment.id)} className="hover:text-primary font-medium flex-shrink-0">
                                Reply
                              </button>

                              <button onClick={() => toggleReplies(comment.id)} className="hover:text-primary font-medium flex-shrink-0">
                                {visibleReplies[comment.id] ? "Hide" : "View"} Replies ({comment.replies_count || 0}){loadingReplies[comment.id] ? "..." : ""}
                              </button>

                              {canDeleteComment && (
                                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-red-500 hover:text-red-700" onClick={() => handleDeleteComment(comment.id)} disabled={deletingId === comment.id}>
                                  {deletingId === comment.id ? <span className="px-1">Deleting...</span> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                              )}
                            </div>

                            {/* Reply input */}
                            {showReplyInput[comment.id] && (
                              <div className="mt-2 space-y-2">
                                <Textarea
                                  placeholder={`Replying to ${comment.username}...`}
                                  value={newReply[comment.id] || ""}
                                  onChange={(e) => setNewReply((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                  onKeyDown={(e) => handleReplyKeyDown(e, comment.id)}
                                  rows={2}
                                  className="text-sm resize-none w-full"
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => {
                                      setShowReplyInput((prev) => ({ ...prev, [comment.id]: false }));
                                      setNewReply((prev) => ({ ...prev, [comment.id]: "" }));
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handlePostReply(comment.id)} disabled={postingReply[comment.id] || !newReply[comment.id]?.trim()}>
                                    {postingReply[comment.id] ? "Posting..." : "Reply"}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {visibleReplies[comment.id] && (
                              <div className="mt-3 pl-8 border-l-2 border-muted ml-5">
                                {(replies[comment.id] || []).map((reply, replyIndex, arr) => {
                                  const canDeleteReply = currentUser && currentUser.id === reply.user_id;
                                  const isLastReply = replyIndex === arr.length - 1;

                                  return (
                                    <div key={reply.id || `reply-${comment.id}-${replyIndex}`} className="flex space-x-3 py-2" ref={isLastReply ? createReplyRefCallback(comment.id) : null}>
                                      <Avatar className="h-8 w-8 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/profile/${reply.user_id}`)}>
                                        <AvatarImage src={formatImageUrl(reply.avatar)} alt={reply.username} />
                                        <AvatarFallback>{reply.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                      </Avatar>

                                      <div className="flex-grow min-w-0">
                                        <div className="flex items-baseline space-x-2">
                                          <span className="font-semibold text-xs truncate cursor-pointer hover:underline" onClick={() => navigate(`/profile/${reply.user_id}`)}>
                                            {reply.username}
                                          </span>
                                          <span className="text-xs text-muted-foreground flex-shrink-0">• Lvl {reply.level || 1}</span>
                                        </div>

                                        <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{reply.content}</p>

                                        <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                                          <span className="truncate">{reply.created_at instanceof Date ? reply.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : reply.created_at}</span>

                                          {canDeleteReply && (
                                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-red-500 hover:text-red-700" onClick={() => handleDeleteReply(comment.id, reply.id)} disabled={deletingId === reply.id}>
                                              {deletingId === reply.id ? <span className="px-1">Deleting...</span> : <Trash2 className="h-3 w-3" />}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}

                                {loadingReplies[comment.id] && <p className="text-xs text-muted-foreground text-center py-2">Loading replies...</p>}

                                {!loadingReplies[comment.id] && hasMoreReplies[comment.id] && (
                                  <Button variant="link" size="sm" className="w-full h-6 text-xs mt-1" onClick={() => loadReplies(comment.id, replyPage[comment.id])}>
                                    Load More Replies
                                  </Button>
                                )}

                                {!loadingReplies[comment.id] && !hasMoreReplies[comment.id] && replies[comment.id]?.length > 0 && <p className="text-xs text-muted-foreground text-center py-2 italic">End of replies</p>}

                                {!loadingReplies[comment.id] && !hasMoreReplies[comment.id] && !replies[comment.id]?.length && <p className="text-xs text-muted-foreground text-center py-2">No replies yet.</p>}
                              </div>
                            )}
                          </div>
                        </div>

                        {index < comments.length - 1 && <Separator className="my-2" />}
                      </div>
                    );
                  })}

                  {/* Loading more comments */}
                  {loadingComments && comments.length > 0 && <p className="text-sm text-muted-foreground text-center py-4">Loading more comments...</p>}

                  {!loadingComments && !hasMoreComments && comments.length > 0 && <p className="text-sm text-muted-foreground text-center py-4 italic">End of comments</p>}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
