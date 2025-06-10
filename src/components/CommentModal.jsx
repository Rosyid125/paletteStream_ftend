import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
// Import icons for delete, like, and bookmark functionality
import { MessageSquare, CornerDownRight, Trash2, Heart, Bookmark } from "lucide-react";
import api from "@/api/axiosInstance";
import { Textarea } from "@/components/ui/textarea";
import { ImageCarousel } from "@/components/ImageCarousel";
import { useNavigate } from "react-router-dom";

// Helper function to format image URLs (Tetap sama)
const formatImageUrl = (imagePath) => {
  if (!imagePath) return "/storage/avatars/noimage.png"; // Default fallback
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

export function CommentModal({ postId, isOpen, onClose, postTitle, currentUser, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [postInfo, setPostInfo] = useState(null); // Store post details
  const [replies, setReplies] = useState({});
  const [visibleReplies, setVisibleReplies] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState({});
  const [postingComment, setPostingComment] = useState(false);
  const [postingReply, setPostingReply] = useState({});
  const [error, setError] = useState(null);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [replyPage, setReplyPage] = useState({});
  const [hasMoreReplies, setHasMoreReplies] = useState({});
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  // State to track which comment/reply is being deleted (optional, for loading state on button)
  const [deletingId, setDeletingId] = useState(null);
  // State for like and bookmark functionality
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const commentObserver = useRef();
  const replyObservers = useRef({});
  const navigate = useNavigate(); // Initialize useNavigate

  // --- Fetching Comments & Post Info (NEW) ---
  const loadComments = useCallback(
    async (pageToLoad, isInitial = false) => {
      if (loadingComments || (!hasMoreComments && !isInitial)) return;

      setLoadingComments(true);
      if (isInitial) {
        setComments([]);
        setCommentPage(1);
        setHasMoreComments(true);
        setError(null); // Reset error on initial load
        setPostInfo(null); // Reset post info
      }

      try {
        const response = await api.get(`/comments/${postId}`, {
          params: { page: pageToLoad, limit: COMMENTS_PER_PAGE },
        });
        // Ambil dari response.data.data sesuai response baru
        const postData = response.data?.data?.post;
        const commentsData = response.data?.data?.comments;
        if (postData) {
          setPostInfo(postData);
        }
        const fetchedComments = Array.isArray(commentsData) ? commentsData : !commentsData ? [] : commentsData;
        setComments((prev) => (isInitial ? fetchedComments : [...prev, ...fetchedComments]));
        setCommentPage(pageToLoad + 1);
        setHasMoreComments(fetchedComments.length === COMMENTS_PER_PAGE);
        setError(null); // Clear error on success
      } catch (err) {
        console.error("Error fetching post/comments:", err);
        setError("An error occurred while loading comments.");
        setHasMoreComments(false);
      } finally {
        setLoadingComments(false);
      }
    },
    [postId, loadingComments, hasMoreComments]
  );

  // --- Fetching Replies --- (MODIFIED to prevent duplicates on fetch)
  const loadReplies = useCallback(
    async (commentId, pageToLoad = 1, isInitial = false) => {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
      if (isInitial) {
        // Don't reset replies here if we want optimistic ones to potentially persist
        // setReplies((prev) => ({ ...prev, [commentId]: [] })); // Comment this out or adjust logic
        setReplyPage((prev) => ({ ...prev, [commentId]: 1 }));
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: true }));
      }

      try {
        const response = await api.get(`/comments/comment-replies/${commentId}`, {
          params: { page: pageToLoad, limit: REPLIES_PER_PAGE },
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          const fetchedReplies = response.data.data;

          // ***** FIX: Check for existing IDs before adding fetched replies *****
          setReplies((prevReplies) => {
            const existingReplies = prevReplies[commentId] || [];
            // Filter out any fetched replies that *already exist* in the state by ID
            const newRepliesToAdd = fetchedReplies.filter((fetchedReply) => !existingReplies.some((existingReply) => existingReply.id === fetchedReply.id));

            // If it's an initial load, we *replace* the existing ones for that comment
            // ONLY with the newly fetched ones (after filtering).
            // If it's not an initial load (e.g., infinite scroll), we append the filtered new ones.
            const combinedReplies = isInitial
              ? newRepliesToAdd // Replace with the filtered results of the initial fetch
              : [...existingReplies, ...newRepliesToAdd]; // Append the filtered new results

            // Ensure optimistic replies added *after* this fetch started aren't lost
            // (This check might be redundant if the filter above works correctly, but adds safety)
            // Example: If an optimistic reply was added while fetch was in progress
            const finalReplies = combinedReplies.reduce((acc, reply) => {
              if (!acc.some((r) => r.id === reply.id)) {
                acc.push(reply);
              }
              return acc;
            }, []);

            return {
              ...prevReplies,
              // Use finalReplies which has duplicates removed, respecting isInitial logic implicitly
              [commentId]: finalReplies,
            };
          });
          // ***** END FIX *****

          setReplyPage((prev) => ({ ...prev, [commentId]: pageToLoad + 1 }));
          // Base hasMoreReplies on the length of raw fetchedReplies before filtering
          setHasMoreReplies((prev) => ({ ...prev, [commentId]: fetchedReplies.length === REPLIES_PER_PAGE }));
        } else {
          // If fetch failed or returned no data, assume no more pages
          setHasMoreReplies((prev) => ({ ...prev, [commentId]: false }));
          // If it was an initial load and failed, make sure the replies array exists as empty
          if (isInitial) {
            setReplies((prev) => ({ ...prev, [commentId]: prev[commentId] || [] }));
          }
        }
      } catch (err) {
        console.error(`Error fetching replies for comment ${commentId}:`, err);
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: false }));
        // Ensure replies array exists if fetch fails on initial load
        if (isInitial) {
          setReplies((prev) => ({ ...prev, [commentId]: prev[commentId] || [] }));
        }
      } finally {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
      }
    },
    [setReplies, setLoadingReplies, setReplyPage, setHasMoreReplies]
  ); // Keep dependencies minimal, setters are stable

  // --- Toggle Reply Visibility and Load Initial --- (Tetap sama)
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

  // --- Toggle Reply Input Visibility --- (Tetap sama)
  const toggleReplyInput = (commentId) => {
    setShowReplyInput((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    setVisibleReplies((prev) => ({ ...prev, [commentId]: true })); // Ensure replies are visible when opening input
  };

  // --- Posting New Comment --- (Tetap sama - with optimistic updates)
  const handlePostComment = useCallback(async () => {
    if (!newComment.trim() || !currentUser?.id || postingComment) return;
    setPostingComment(true);
    setError(null); // Clear previous errors

    let postedCommentData = null;

    try {
      const postResponse = await api.post("/comments/create", {
        post_id: postId,
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
        // Ensure user_id is present for delete check
        user_id: currentUser.id, // Explicitly add from currentUser if not returned by create API
        created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        replies_count: 0,
      };

      setComments((prev) => [addedComment, ...prev]);
      setNewComment("");
      if (onCommentAdded) onCommentAdded(postId);
    } catch (err) {
      console.error("Error posting comment or fetching profile:", err);
      let errorMsg = "An error occurred while posting the comment.";
      if (err.response?.data?.message) {
        errorMsg = `Failed to post comment: ${err.response.data.message}`;
      } else if (err.message) {
        errorMsg = `Failed to post comment: ${err.message}`;
      }
      if (postedCommentData && err.message.includes("user profile")) {
        errorMsg = "Comment was posted, but there was an issue updating the display immediately.";
      }
      setError(errorMsg); // Set error state
    } finally {
      setPostingComment(false);
    }
  }, [newComment, currentUser, postId, onCommentAdded, postingComment]);

  // --- Posting New Reply --- (MODIFIED to prevent duplicate optimistic adds)
  const handlePostReply = useCallback(
    async (commentId) => {
      const replyContent = newReply[commentId]?.trim();
      if (!replyContent || !currentUser?.id || postingReply[commentId]) return;

      setPostingReply((prev) => ({ ...prev, [commentId]: true }));
      setError(null); // Clear previous errors for this action
      let postedReplyData = null;

      try {
        // 1. Post the reply to the API
        const postResponse = await api.post("/comments/comment-replies/create", {
          post_comment_id: commentId,
          user_id: currentUser.id,
          content: replyContent,
        });

        if (!postResponse.data.success || !postResponse.data.data) {
          throw new Error(postResponse.data.message || "Failed to post reply.");
        }
        postedReplyData = postResponse.data.data; // Contains the new reply's REAL ID

        // 2. Fetch user profile for display data (username, avatar, etc.)
        const profileResponse = await api.get(`/profiles/mini-profile/${currentUser.id}`);

        if (!profileResponse.data.success || !profileResponse.data.data) {
          console.warn("Reply posted, but failed to fetch mini-profile for optimistic update.");
          // Decide if this is critical - maybe proceed with placeholders or fail?
          // For now, we'll throw an error as profile data is needed for display.
          throw new Error("Failed to fetch user profile after posting reply.");
        }

        const userProfileData = profileResponse.data.data;

        // 3. Construct the full reply object for the UI
        const addedReply = {
          ...postedReplyData, // Contains the REAL ID from the backend
          username: userProfileData.username,
          avatar: userProfileData.avatar,
          level: userProfileData.level,
          user_id: currentUser.id, // Ensure user_id is present
          created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), // Or use created_at from postedReplyData if available/formatted
        };

        // 4. ***** FIX: Check before adding to state *****
        setReplies((prevReplies) => {
          const currentRepliesForComment = prevReplies[commentId] || [];
          // Check if this specific reply ID already exists in the state for this comment
          const replyAlreadyExists = currentRepliesForComment.some((reply) => reply.id === addedReply.id);

          if (replyAlreadyExists) {
            console.warn(`Optimistic reply add: Reply ${addedReply.id} already found in state for comment ${commentId}. Skipping duplicate add.`);
            return prevReplies; // Return the previous state unchanged if duplicate found
          }

          // If the reply doesn't exist, add it
          return {
            ...prevReplies,
            [commentId]: [...currentRepliesForComment, addedReply],
          };
        });
        // ***** END FIX *****

        // 5. Clear input and hide input area
        setNewReply((prev) => ({ ...prev, [commentId]: "" }));
        setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));

        // 6. Update the parent comment's reply count (optimistically)
        setComments((prevComments) => prevComments.map((c) => (c.id === commentId ? { ...c, replies_count: (c.replies_count || 0) + 1 } : c)));
      } catch (err) {
        console.error(`Error posting reply to comment ${commentId} or fetching profile:`, err);
        let errorMsg = "An error occurred while posting the reply.";
        if (err.response?.data?.message) {
          errorMsg = `Failed to post reply: ${err.response.data.message}`;
        } else if (err.message) {
          errorMsg = `Failed to post reply: ${err.message}`;
        }
        // Add context if the reply was posted but profile failed
        if (postedReplyData && err.message.includes("user profile")) {
          errorMsg = "Reply was posted, but there was an issue updating the display immediately.";
          // Optional: Could still add the reply with placeholder info or refetch later
        }
        setError(errorMsg); // Display the error
        console.error(errorMsg); // Log for debugging

        // Optional: Rollback? If the API failed, the state wasn't updated yet.
        // If the profile fetch failed *after* posting, the reply count might be off.
        // However, a simple error message is usually sufficient here.
      } finally {
        // Ensure loading state is turned off even if checks above return early
        setPostingReply((prev) => ({ ...prev, [commentId]: false }));
      }
    },
    // Dependencies: Include values read and setters used inside the callback.
    // State setters generally have stable identities, but including them is safer
    // if their identity *could* change (though unlikely with useState/useReducer).
    [newReply, currentUser, postingReply, setReplies, setNewReply, setShowReplyInput, setComments, setPostingReply, setError]
  );

  // --- Deleting Comment --- (Tetap sama)
  const handleDeleteComment = useCallback(
    async (commentId) => {
      // Optional: Add confirmation
      if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
        return;
      }

      setDeletingId(commentId); // Indicate deletion is in progress
      setError(null); // Clear previous errors

      // Find the comment for potential rollback (optional but good practice)
      // const commentToDelete = comments.find((c) => c.id === commentId);
      const originalComments = [...comments]; // Store original state

      // Optimistic Update: Remove comment from UI immediately
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      try {
        const response = await api.delete(`/comments/delete/${commentId}`);

        if (!response.data.success) {
          // Handle API error even if it returns 2xx but success: false
          throw new Error(response.data.message || "Server indicated failure.");
        }
        // Success! Comment is already removed optimistically.
        console.log(`Comment ${commentId} deleted successfully.`);
        // You could potentially update a total comment count elsewhere if needed
        // If onCommentDeleted prop existed: onCommentDeleted(postId);
      } catch (err) {
        console.error(`Error deleting comment ${commentId}:`, err);
        let errorMsg = "An error occurred while deleting the comment.";
        if (err.response?.data?.message) {
          errorMsg = `Failed to delete comment: ${err.response.data.message}`;
        } else if (err.message) {
          errorMsg = `Failed to delete comment: ${err.message}`;
        }
        setError(errorMsg);

        // Rollback optimistic update on failure
        setComments(originalComments);
      } finally {
        setDeletingId(null); // Reset deleting state
      }
    },
    [comments] // Dependency: comments array for finding and filtering
  );

  // --- Deleting Reply --- (Tetap sama)
  const handleDeleteReply = useCallback(
    async (commentId, replyId) => {
      // Optional: Add confirmation
      if (!window.confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
        return;
      }

      setDeletingId(replyId); // Indicate deletion is in progress using replyId
      setError(null); // Clear previous errors

      // Store original state for potential rollback
      const originalRepliesForComment = [...(replies[commentId] || [])];
      const originalComments = [...comments];
      // const parentComment = comments.find((c) => c.id === commentId);

      // Optimistic Update: Remove reply and decrement count
      setReplies((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || []).filter((r) => r.id !== replyId),
      }));
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, replies_count: Math.max(0, (c.replies_count || 1) - 1) } : c)));

      try {
        // IMPORTANT: Use replyId in the endpoint
        const response = await api.delete(`/comments/comment-replies/delete/${replyId}`);

        if (!response.data.success) {
          // Handle API error even if it returns 2xx but success: false
          throw new Error(response.data.message || "Server indicated failure.");
        }
        // Success! Reply is already removed optimistically.
        console.log(`Reply ${replyId} deleted successfully.`);
      } catch (err) {
        console.error(`Error deleting reply ${replyId} (under comment ${commentId}):`, err);
        let errorMsg = "An error occurred while deleting the reply.";
        if (err.response?.data?.message) {
          errorMsg = `Failed to delete reply: ${err.response.data.message}`;
        } else if (err.message) {
          errorMsg = `Failed to delete reply: ${err.message}`;
        }
        setError(errorMsg);

        // Rollback optimistic update on failure
        setReplies((prev) => ({ ...prev, [commentId]: originalRepliesForComment }));
        setComments(originalComments); // Restore original comments array (with original reply count)
      } finally {
        setDeletingId(null); // Reset deleting state
      }
    },
    [replies, comments] // Dependency: replies object and comments array
  );

  // --- Handling Like Post ---
  const handleLikePost = useCallback(async () => {
    if (!currentUser?.id || isLiking || !postInfo) return;

    setIsLiking(true);
    setError(null);

    // Store original state for rollback
    const originalLikeStatus = postInfo.postLikeStatus;
    const originalLikeCount = postInfo.likeCount;

    // Optimistic update
    setPostInfo((prev) => ({
      ...prev,
      postLikeStatus: !prev.postLikeStatus,
      likeCount: prev.postLikeStatus ? prev.likeCount - 1 : prev.likeCount + 1,
    }));

    try {
      const response = await api.post("/likes/create-delete", {
        postId: postId,
        userId: currentUser.id,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update like status.");
      }

      console.log("Like status updated successfully");
    } catch (err) {
      console.error("Error updating like status:", err);
      let errorMsg = "An error occurred while updating like status.";
      if (err.response?.data?.message) {
        errorMsg = `Failed to update like: ${err.response.data.message}`;
      } else if (err.message) {
        errorMsg = `Failed to update like: ${err.message}`;
      }
      setError(errorMsg);

      // Rollback optimistic update
      setPostInfo((prev) => ({
        ...prev,
        postLikeStatus: originalLikeStatus,
        likeCount: originalLikeCount,
      }));
    } finally {
      setIsLiking(false);
    }
  }, [currentUser, isLiking, postInfo, postId]);

  // --- Handling Bookmark Post ---
  const handleBookmarkPost = useCallback(async () => {
    if (!currentUser?.id || isBookmarking || !postInfo) return;

    setIsBookmarking(true);
    setError(null);

    // Store original state for rollback
    const originalBookmarkStatus = postInfo.bookmarkStatus;

    // Optimistic update
    setPostInfo((prev) => ({
      ...prev,
      bookmarkStatus: !prev.bookmarkStatus,
    }));

    try {
      const response = await api.post("/bookmarks/create-delete", {
        postId: postId,
        userId: currentUser.id,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update bookmark status.");
      }

      console.log("Bookmark status updated successfully");
    } catch (err) {
      console.error("Error updating bookmark status:", err);
      let errorMsg = "An error occurred while updating bookmark status.";
      if (err.response?.data?.message) {
        errorMsg = `Failed to update bookmark: ${err.response.data.message}`;
      } else if (err.message) {
        errorMsg = `Failed to update bookmark: ${err.message}`;
      }
      setError(errorMsg);

      // Rollback optimistic update
      setPostInfo((prev) => ({
        ...prev,
        bookmarkStatus: originalBookmarkStatus,
      }));
    } finally {
      setIsBookmarking(false);
    }
  }, [currentUser, isBookmarking, postInfo, postId]);

  // --- Intersection Observer for Comments --- (Tetap sama)
  const lastCommentElementRef = useCallback(
    (node) => {
      if (loadingComments) return;
      if (commentObserver.current) commentObserver.current.disconnect();
      commentObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreComments && !loadingComments) {
          // console.log("Comment sentinel visible, loading more comments...");
          loadComments(commentPage);
        }
      });
      if (node) commentObserver.current.observe(node);
    },
    [loadingComments, hasMoreComments, commentPage, loadComments]
  );

  // --- Intersection Observer for Replies (Tetap sama) ---
  const createReplyRefCallback = useCallback(
    (commentId) => (node) => {
      const isLoading = loadingReplies[commentId] || false;
      const hasMore = hasMoreReplies[commentId] !== undefined ? hasMoreReplies[commentId] : true;
      const currentPage = replyPage[commentId] || 1; // Next page to load is current page number + 1

      if (isLoading) return; // Don't attach observer if already loading

      // Disconnect previous observer for this commentId if it exists
      if (replyObservers.current[commentId]) {
        replyObservers.current[commentId].disconnect();
      }

      if (node) {
        replyObservers.current[commentId] = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingReplies[commentId]) {
            // console.log(`Reply sentinel visible for comment ${commentId}, loading more replies...`);
            loadReplies(commentId, currentPage); // Load the next page
          }
        });
        replyObservers.current[commentId].observe(node);
      } else {
        // Clean up if the node is removed
        if (replyObservers.current[commentId]) {
          replyObservers.current[commentId].disconnect();
          delete replyObservers.current[commentId];
        }
      }
    },
    [loadingReplies, hasMoreReplies, replyPage, loadReplies] // Include dependencies
  );

  // --- Effect for Initial Load & Cleanup --- (Tetap sama)
  useEffect(() => {
    if (isOpen && postId) {
      // console.log("Comment modal opened, loading initial comments.");
      loadComments(1, true);
    } else {
      // Reset all state on close
      setComments([]);
      setReplies({});
      setVisibleReplies({});
      setLoadingComments(false);
      setLoadingReplies({});
      setError(null);
      setCommentPage(1);
      setHasMoreComments(true);
      setReplyPage({});
      setHasMoreReplies({});
      setNewComment("");
      setNewReply({});
      setShowReplyInput({});
      setPostingComment(false);
      setPostingReply({});
      setDeletingId(null); // Reset deleting state
      if (commentObserver.current) commentObserver.current.disconnect();
      Object.values(replyObservers.current).forEach((obs) => obs?.disconnect());
      replyObservers.current = {};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]); // Keep dependencies minimal

  // --- Handler for Enter key on Comment Input --- (Tetap sama)
  const handleCommentKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handlePostComment();
    }
  };

  // --- Handler for Enter key on Reply Input --- (Tetap sama)
  const handleReplyKeyDown = (event, commentId) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handlePostReply(commentId);
    }
  };
  // --- Return JSX --- (Fixed for mobile responsiveness)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[900px] h-[95vh] sm:h-[90vh] flex flex-col p-0 max-w-none">
        <div className="flex flex-col md:flex-row h-full min-h-0">
          {" "}
          {/* Left: Post Detail */}
          <div className="md:w-1/2 w-full border-b md:border-b-0 md:border-r border-muted p-4 sm:p-6 flex flex-col gap-2 min-w-0 max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-y-visible">
            {postInfo && (
              <>
                {" "}
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage src={formatImageUrl(postInfo.avatar)} alt={postInfo.username} />
                    <AvatarFallback>{postInfo.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs sm:text-sm leading-tight truncate">{postInfo.username}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      Lvl {postInfo.level || 1} •
                      <span className="cursor-pointer underline hover:text-primary" onClick={() => navigate(`/posts/type?query=${encodeURIComponent(postInfo.type)}&page=1&limit=9`)}>
                        {postInfo.type}
                      </span>
                      • <span>{postInfo.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="font-bold text-base sm:text-lg leading-tight block truncate">{postInfo.title}</span>
                </div>
                <div className="mb-2 text-xs sm:text-sm text-muted-foreground whitespace-pre-line text-left line-clamp-3 sm:line-clamp-none">{postInfo.description}</div>
                {Array.isArray(postInfo.images) && postInfo.images.length > 0 && (
                  <div className="mb-2">
                    <ImageCarousel images={postInfo.images} title={postInfo.title} className="rounded-lg border" />
                  </div>
                )}{" "}
                {Array.isArray(postInfo.tags) && postInfo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {postInfo.tags.map((tag, idx) => (
                      <span
                        key={tag + idx}
                        className="bg-muted px-2 py-0.5 rounded text-xs text-primary-700 dark:text-primary-300 cursor-pointer hover:underline"
                        onClick={() => navigate(`/posts/tags?page=1&limit=9&query=${encodeURIComponent(tag)}`)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {/* Like and Bookmark buttons */}
                <div className="flex items-center gap-4 pt-2 border-t border-muted">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 h-8 px-3 ${postInfo.postLikeStatus ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                    onClick={handleLikePost}
                    disabled={isLiking || !currentUser}
                  >
                    <Heart className={`h-4 w-4 ${postInfo.postLikeStatus ? "fill-current" : ""}`} />
                    <span className="text-sm">{postInfo.likeCount || 0}</span>
                    {isLiking && <span className="text-xs">...</span>}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 h-8 px-3 ${postInfo.bookmarkStatus ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-blue-500"}`}
                    onClick={handleBookmarkPost}
                    disabled={isBookmarking || !currentUser}
                  >
                    <Bookmark className={`h-4 w-4 ${postInfo.bookmarkStatus ? "fill-current" : ""}`} />
                    <span className="text-sm">{postInfo.bookmarkStatus ? "Saved" : "Save"}</span>
                    {isBookmarking && <span className="text-xs">...</span>}
                  </Button>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">{postInfo.commentCount || 0}</span>
                  </div>
                </div>
              </>
            )}
          </div>{" "}
          {/* Right: Comments */}
          <div className="md:w-1/2 w-full flex flex-col min-h-0 flex-1">
            <DialogHeader className="p-4 sm:p-6 pb-4 border-b md:border-b-0 flex-shrink-0">
              <DialogTitle className="text-left text-sm sm:text-base">Comments on "{postInfo?.title || postTitle}"</DialogTitle>
              {error && <DialogDescription className="text-sm text-red-600 pt-2">{error}</DialogDescription>}
            </DialogHeader>
            <ScrollArea className="flex-1 p-4 sm:p-6 pt-0 overflow-y-auto min-h-0">
              <div className="space-y-4">
                {/* Error display moved to header, but could be kept here too */}

                {/* Skeletons */}
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

                {/* No Comments Message */}
                {!loadingComments && comments.length === 0 && !error && <p className="text-sm text-muted-foreground text-center py-6">Be the first to comment!</p>}

                {/* Display Comments */}
                {comments.map((comment, index) => {
                  const isLastComment = comments.length === index + 1;
                  // Check if the current user owns this comment
                  const canDeleteComment = currentUser && currentUser.id === comment.user_id;
                  return (
                    <div key={comment.id || `comment-${index}`} ref={isLastComment ? lastCommentElementRef : null}>
                      <div className="flex space-x-2 sm:space-x-3 py-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                          <AvatarImage src={formatImageUrl(comment.avatar)} alt={comment.username} />
                          <AvatarFallback>{comment.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-semibold text-sm truncate">{comment.username}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">• Lvl {comment.level || 1}</span>
                          </div>
                          <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>{" "}
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            <span className="truncate">{comment.created_at instanceof Date ? comment.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : comment.created_at}</span>
                            <button onClick={() => toggleReplyInput(comment.id)} className="hover:text-primary font-medium flex-shrink-0" aria-label={`Reply to ${comment.username}`}>
                              Reply
                            </button>
                            <button onClick={() => toggleReplies(comment.id)} className="hover:text-primary font-medium flex-shrink-0" aria-expanded={!!visibleReplies[comment.id]}>
                              {visibleReplies[comment.id] ? "Hide" : "View"} Replies ({comment.replies_count || 0}){loadingReplies[comment.id] ? "..." : ""}
                            </button>
                            {/* --- DELETE COMMENT BUTTON --- */}
                            {canDeleteComment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={deletingId === comment.id} // Disable while deleting this specific comment
                                aria-label={`Delete comment by ${comment.username}`}
                              >
                                {deletingId === comment.id ? <span className="px-1">Deleting...</span> : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            )}
                          </div>{" "}
                          {/* Reply Input Area - Mobile optimized */}
                          {showReplyInput[comment.id] && (
                            <div className="mt-2 space-y-2">
                              <Textarea
                                placeholder={`Replying to ${comment.username}...`}
                                value={newReply[comment.id] || ""}
                                onChange={(e) => setNewReply((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                onKeyDown={(e) => handleReplyKeyDown(e, comment.id)}
                                rows={2}
                                className="text-sm resize-none w-full"
                                aria-label={`Reply input for comment by ${comment.username}`}
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
                          )}{" "}
                          {/* Replies Section - Mobile optimized */}
                          {visibleReplies[comment.id] && (
                            <div className="mt-3 pl-4 sm:pl-8 border-l-2 border-muted ml-2 sm:ml-5" aria-live="polite">
                              {/* Display Replies */}
                              {(replies[comment.id] || []).map((reply, replyIndex, arr) => {
                                // Check if the current user owns this reply
                                const canDeleteReply = currentUser && currentUser.id === reply.user_id;
                                const isLastReply = replyIndex === arr.length - 1;
                                return (
                                  <div
                                    key={reply.id || `reply-${comment.id}-${replyIndex}`}
                                    className="flex space-x-2 sm:space-x-3 py-2"
                                    ref={isLastReply ? createReplyRefCallback(comment.id) : null} // Use the factory function
                                  >
                                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                                      <AvatarImage src={formatImageUrl(reply.avatar)} alt={reply.username} />
                                      <AvatarFallback>{reply.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow min-w-0">
                                      <div className="flex items-baseline space-x-2">
                                        <span className="font-semibold text-xs truncate">{reply.username}</span>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">• Lvl {reply.level || 1}</span>
                                      </div>
                                      <p className="text-xs sm:text-sm mt-0.5 whitespace-pre-wrap break-words">{reply.content}</p>
                                      <div className="flex items-center space-x-2 sm:space-x-3 mt-1 text-xs text-muted-foreground">
                                        <span className="truncate">{reply.created_at instanceof Date ? reply.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : reply.created_at}</span>
                                        {/* --- DELETE REPLY BUTTON --- */}
                                        {canDeleteReply && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-xs text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
                                            // Pass both commentId and replyId
                                            onClick={() => handleDeleteReply(comment.id, reply.id)}
                                            disabled={deletingId === reply.id} // Disable while deleting this specific reply
                                            aria-label={`Delete reply by ${reply.username}`}
                                          >
                                            {deletingId === reply.id ? <span className="px-1">Deleting...</span> : <Trash2 className="h-3 w-3" />}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {/* Loading/Button Replies structure remains the same */} {loadingReplies[comment.id] && <p className="text-xs text-muted-foreground text-center py-2">Loading replies...</p>}
                              {!loadingReplies[comment.id] && hasMoreReplies[comment.id] && (
                                // Load more button now uses the current page state correctly
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

                {/* Loading/Button Comments remains the same */}
                {loadingComments && comments.length > 0 && <p className="text-sm text-muted-foreground text-center py-4">Loading more comments...</p>}
                {!loadingComments && !hasMoreComments && comments.length > 0 && <p className="text-sm text-muted-foreground text-center py-4 italic">End of comments</p>}
              </div>{" "}
            </ScrollArea>
            <DialogFooter className="p-4 sm:p-6 pt-4 border-t flex-shrink-0">
              <div className="flex w-full space-x-2 sm:space-x-3 items-start">
                <div className="flex-grow space-y-2">
                  <Textarea
                    placeholder="Add a comment... (Press Enter to send, Shift+Enter for new line)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    rows={2}
                    className="resize-none text-sm"
                    aria-label="New comment input"
                    disabled={postingComment} // Optionally disable while posting
                  />
                  <Button onClick={handlePostComment} disabled={postingComment || !newComment.trim()} className="w-full sm:w-auto sm:ml-auto text-sm">
                    {postingComment ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// PropTypes (Tetap sama, pastikan currentUser dilewatkan dengan benar)
CommentModal.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  postTitle: PropTypes.string,
  currentUser: PropTypes.shape({
    // Pastikan id ada dan tipenya sesuai
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    username: PropTypes.string,
    avatar: PropTypes.string,
    level: PropTypes.number,
  }), // currentUser can be null/undefined if not logged in
  onCommentAdded: PropTypes.func,
};
