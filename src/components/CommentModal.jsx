import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, CornerDownRight } from "lucide-react";
import api from "./../api/axiosInstance"; // Adjust path if necessary
import { Textarea } from "@/components/ui/textarea";

// Helper function to format image URLs (Tetap sama)
const formatImageUrl = (imagePath) => {
  if (!imagePath) return "/storage/avatars/noimage.png"; // Default fallback
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

const COMMENTS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 5;

export function CommentModal({ postId, isOpen, onClose, postTitle, currentUser, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({}); // Store replies keyed by commentId
  const [visibleReplies, setVisibleReplies] = useState({}); // Track which replies are shown
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState({}); // Track loading per commentId
  const [postingComment, setPostingComment] = useState(false);
  const [postingReply, setPostingReply] = useState({}); // Track posting per commentId
  const [error, setError] = useState(null);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [replyPage, setReplyPage] = useState({}); // Track page per commentId
  const [hasMoreReplies, setHasMoreReplies] = useState({}); // Track hasMore per commentId
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState({}); // Track reply input per commentId
  const [showReplyInput, setShowReplyInput] = useState({}); // Track which reply input is visible

  const commentObserver = useRef();
  const replyObservers = useRef({}); // Stores observers keyed by commentId

  // --- Fetching Comments --- (Tetap sama)
  const loadComments = useCallback(
    async (pageToLoad, isInitial = false) => {
      if (loadingComments || (!hasMoreComments && !isInitial)) return;

      setLoadingComments(true);
      if (isInitial) {
        setComments([]);
        setCommentPage(1);
        setHasMoreComments(true);
        setError(null);
      }

      try {
        const response = await api.get(`/comments/${postId}`, {
          params: { page: pageToLoad, limit: COMMENTS_PER_PAGE },
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          const fetchedComments = response.data.data;
          setComments((prev) => (isInitial ? fetchedComments : [...prev, ...fetchedComments]));
          setCommentPage(pageToLoad + 1);
          setHasMoreComments(fetchedComments.length === COMMENTS_PER_PAGE);
          setError(null);
        } else {
          setError("Could not load comments.");
          setHasMoreComments(false);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("An error occurred while loading comments.");
        setHasMoreComments(false);
      } finally {
        setLoadingComments(false);
      }
    },
    [postId, loadingComments, hasMoreComments]
  );

  // --- Fetching Replies --- (Tetap sama)
  const loadReplies = useCallback(async (commentId, pageToLoad = 1, isInitial = false) => {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    if (isInitial) {
      setReplies((prev) => ({ ...prev, [commentId]: [] }));
      setReplyPage((prev) => ({ ...prev, [commentId]: 1 }));
      setHasMoreReplies((prev) => ({ ...prev, [commentId]: true }));
    }

    try {
      const response = await api.get(`/comments/comment-replies/${commentId}`, {
        params: { page: pageToLoad, limit: REPLIES_PER_PAGE },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        const fetchedReplies = response.data.data;
        setReplies((prev) => ({
          ...prev,
          [commentId]: isInitial ? fetchedReplies : [...(prev[commentId] || []), ...fetchedReplies],
        }));
        setReplyPage((prev) => ({ ...prev, [commentId]: pageToLoad + 1 }));
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: fetchedReplies.length === REPLIES_PER_PAGE }));
      } else {
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: false }));
      }
    } catch (err) {
      console.error(`Error fetching replies for comment ${commentId}:`, err);
      setHasMoreReplies((prev) => ({ ...prev, [commentId]: false }));
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  }, []); // No external changing dependencies needed

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
  };

  // --- Posting New Comment --- (Tetap sama, dipanggil oleh handler baru)
  const handlePostComment = useCallback(async () => {
    // Ubah ke useCallback agar stabil
    if (!newComment.trim() || !currentUser?.id || postingComment) return; // Tambah cek postingComment
    setPostingComment(true);
    setError(null);

    try {
      const response = await api.post("/comments/create", {
        post_id: postId,
        user_id: currentUser.id,
        content: newComment.trim(),
      });

      if (response.data.success && response.data.data) {
        const addedComment = {
          ...response.data.data,
          username: currentUser.username,
          avatar: currentUser.avatar,
          level: currentUser.level,
          created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          replies_count: 0,
        };
        setComments((prev) => [addedComment, ...prev]);
        setNewComment("");
        if (onCommentAdded) onCommentAdded(postId);
      } else {
        setError(response.data.message || "Failed to post comment.");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      let errorMsg = "An error occurred while posting the comment.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = `Failed to post comment: ${err.response.data.message}`;
      } else if (err.message) {
        errorMsg = `Failed to post comment: ${err.message}`;
      }
      setError(errorMsg);
    } finally {
      setPostingComment(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newComment, currentUser, postId, onCommentAdded, postingComment]); // Tambahkan dependensi

  // --- Posting New Reply --- (Tetap sama, dipanggil oleh handler baru)
  const handlePostReply = useCallback(
    async (commentId) => {
      // Ubah ke useCallback agar stabil
      const replyContent = newReply[commentId]?.trim();
      // Tambah cek postingReply[commentId]
      if (!replyContent || !currentUser?.id || postingReply[commentId]) return;

      setPostingReply((prev) => ({ ...prev, [commentId]: true }));

      try {
        const response = await api.post("/comments/comment-replies/create", {
          post_comment_id: commentId,
          user_id: currentUser.id,
          content: replyContent,
        });

        if (response.data.success && response.data.data) {
          const addedReply = {
            ...response.data.data,
            username: currentUser.username,
            avatar: currentUser.avatar,
            level: currentUser.level,
            created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setReplies((prev) => ({
            ...prev,
            [commentId]: [...(prev[commentId] || []), addedReply],
          }));
          setNewReply((prev) => ({ ...prev, [commentId]: "" }));
          setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));

          setComments((prevComments) => prevComments.map((c) => (c.id === commentId ? { ...c, replies_count: (c.replies_count || 0) + 1 } : c)));
        } else {
          console.error("Failed to post reply:", response.data.message);
        }
      } catch (err) {
        console.error("Error posting reply:", err);
      } finally {
        setPostingReply((prev) => ({ ...prev, [commentId]: false }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [newReply, currentUser, postingReply]
  ); // Tambahkan dependensi

  // --- Intersection Observer for Comments --- (Tetap sama)
  const lastCommentElementRef = useCallback(
    (node) => {
      if (loadingComments) return;
      if (commentObserver.current) commentObserver.current.disconnect();
      commentObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreComments && !loadingComments) {
          console.log("Comment sentinel visible, loading more comments...");
          loadComments(commentPage);
        }
      });
      if (node) commentObserver.current.observe(node);
    },
    [loadingComments, hasMoreComments, commentPage, loadComments]
  );

  // --- Effect for Initial Load & Cleanup --- (Tetap sama)
  useEffect(() => {
    if (isOpen && postId) {
      console.log("Comment modal opened, loading initial comments.");
      loadComments(1, true);
    } else {
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
      if (commentObserver.current) commentObserver.current.disconnect();
      Object.values(replyObservers.current).forEach((obs) => obs?.disconnect());
      replyObservers.current = {};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]);

  // --- NEW: Handler for Enter key on Comment Input ---
  const handleCommentKeyDown = (event) => {
    // Cek jika Enter ditekan TANPA Shift
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Mencegah newline default
      handlePostComment(); // Panggil fungsi post comment
    }
  };

  // --- NEW: Handler for Enter key on Reply Input ---
  const handleReplyKeyDown = (event, commentId) => {
    // Cek jika Enter ditekan TANPA Shift
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Mencegah newline default
      handlePostReply(commentId); // Panggil fungsi post reply
    }
  };

  // --- Return JSX --- (Modifikasi pada Textarea)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Comments on "{postTitle}"</DialogTitle>
        </DialogHeader>

        {/* Comment List Area */}
        <ScrollArea className="flex-grow p-6 pt-0 overflow-y-auto">
          <div className="space-y-4">
            {error && <p className="text-sm text-red-600 text-center py-4">{error}</p>}

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

              return (
                <div key={comment.id} ref={isLastComment ? lastCommentElementRef : null}>
                  <div className="flex space-x-3 py-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={formatImageUrl(comment.avatar)} alt={comment.username} />
                      <AvatarFallback>{comment.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-semibold text-sm">{comment.username}</span>
                        <span className="text-xs text-muted-foreground">• Lvl {comment.level || 1}</span>
                      </div>
                      <p className="text-sm mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{comment.created_at instanceof Date ? comment.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : comment.created_at}</span>
                        <button onClick={() => toggleReplyInput(comment.id)} className="hover:text-primary font-medium" aria-label={`Reply to ${comment.username}`}>
                          Reply
                        </button>
                        <button onClick={() => toggleReplies(comment.id)} className="hover:text-primary font-medium" aria-expanded={!!visibleReplies[comment.id]}>
                          {visibleReplies[comment.id] ? "Hide" : "View"} Replies ({comment.replies_count || 0}){loadingReplies[comment.id] ? "..." : ""}
                        </button>
                      </div>
                      {/* Reply Input Area */}
                      {showReplyInput[comment.id] && (
                        <div className="mt-2 flex space-x-2 items-start">
                          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                            <AvatarImage src={formatImageUrl(currentUser?.avatar)} />
                            <AvatarFallback>{currentUser?.username?.charAt(0).toUpperCase() || "Me"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            {/* === MODIFIED Textarea for Reply === */}
                            <Textarea
                              placeholder={`Replying to ${comment.username}...`}
                              value={newReply[comment.id] || ""}
                              onChange={(e) => setNewReply((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                              onKeyDown={(e) => handleReplyKeyDown(e, comment.id)} // <-- Tambahkan onKeyDown
                              rows={2}
                              className="text-sm resize-none"
                              aria-label={`Reply input for comment by ${comment.username}`}
                            />
                            {/* === End of MODIFIED Textarea === */}
                            <div className="flex justify-end space-x-2 mt-1.5">
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
                        </div>
                      )}
                      {/* Replies Section */}
                      {visibleReplies[comment.id] && (
                        <div className="mt-3 pl-8 border-l-2 border-muted ml-5" aria-live="polite">
                          {(replies[comment.id] || []).map((reply, replyIndex, arr) => (
                            <div
                              key={reply.id}
                              className="flex space-x-3 py-2"
                              ref={
                                replyIndex === arr.length - 1
                                  ? (node) => {
                                      const currentCommentId = comment.id;
                                      const isLoading = loadingReplies[currentCommentId] || false;
                                      const hasMore = hasMoreReplies[currentCommentId] === undefined ? true : hasMoreReplies[currentCommentId];
                                      const currentPage = replyPage[currentCommentId] || 1;

                                      if (isLoading) return;
                                      if (replyObservers.current[currentCommentId]) {
                                        replyObservers.current[currentCommentId].disconnect();
                                      }
                                      if (node) {
                                        replyObservers.current[currentCommentId] = new IntersectionObserver((entries) => {
                                          if (entries[0].isIntersecting && hasMore && !loadingReplies[currentCommentId]) {
                                            console.log(`Reply sentinel visible for comment ${currentCommentId}, loading more replies...`);
                                            loadReplies(currentCommentId, currentPage);
                                          }
                                        });
                                        replyObservers.current[currentCommentId].observe(node);
                                      } else {
                                        if (replyObservers.current[currentCommentId]) {
                                          replyObservers.current[currentCommentId].disconnect();
                                          delete replyObservers.current[currentCommentId];
                                        }
                                      }
                                    }
                                  : null
                              }
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={formatImageUrl(reply.avatar)} alt={reply.username} />
                                <AvatarFallback>{reply.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                <div className="flex items-baseline space-x-2">
                                  <span className="font-semibold text-xs">{reply.username}</span>
                                  <span className="text-xs text-muted-foreground">• Lvl {reply.level || 1}</span>
                                </div>
                                <p className="text-sm mt-0.5 whitespace-pre-wrap">{reply.content}</p>
                                <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                                  <span>{reply.created_at instanceof Date ? reply.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : reply.created_at}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Loading/Button Replies */}
                          {loadingReplies[comment.id] && <p className="text-xs text-muted-foreground text-center py-2">Loading replies...</p>}
                          {!loadingReplies[comment.id] && hasMoreReplies[comment.id] && (
                            <Button variant="link" size="sm" className="w-full h-6 text-xs mt-1" onClick={() => loadReplies(comment.id, replyPage[comment.id] || 1)}>
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

            {/* Loading/Button Comments */}
            {loadingComments && comments.length > 0 && <p className="text-sm text-muted-foreground text-center py-4">Loading more comments...</p>}
            {!loadingComments && !hasMoreComments && comments.length > 0 && <p className="text-sm text-muted-foreground text-center py-4 italic">End of comments</p>}
          </div>
        </ScrollArea>

        {/* Input Area for New Comment */}
        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
          <div className="flex w-full space-x-3 items-start">
            <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
              <AvatarImage src={formatImageUrl(currentUser?.avatar)} alt={currentUser?.username} />
              <AvatarFallback>{currentUser?.username?.charAt(0).toUpperCase() || "Me"}</AvatarFallback>
            </Avatar>
            <div className="flex-grow space-y-2">
              {/* === MODIFIED Textarea for Comment === */}
              <Textarea
                placeholder="Add a comment... (Press Enter to send, Shift+Enter for new line)" // Update placeholder
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleCommentKeyDown} // <-- Tambahkan onKeyDown
                rows={3}
                className="resize-none"
                aria-label="New comment input"
              />
              {/* === End of MODIFIED Textarea === */}
              <Button onClick={handlePostComment} disabled={postingComment || !newComment.trim()} className="w-full sm:w-auto float-right">
                {postingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// PropTypes (Tetap sama)
CommentModal.propTypes = {
  postId: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  postTitle: PropTypes.string,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string,
    avatar: PropTypes.string,
    level: PropTypes.number,
  }),
  onCommentAdded: PropTypes.func,
};
