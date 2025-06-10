import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Trophy, Calendar, Clock, Users, Award, CheckCircle2, ArrowLeft, Star, Crown, Medal, Heart, MessageCircle, Send, Eye, Upload, Target, ArrowRight } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getChallengeById, getChallengeLeaderboard, getChallengeWinners, submitPostToChallenge, getUserChallengeHistory } from "@/services/challengeService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ChallengeSubmissionCard from "@/components/ChallengeSubmissionCard";
import { CommentModal } from "@/components/CommentModal";
import api from "@/api/axiosInstance";

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [winners, setWinners] = useState([]);
  const [userHistory, setUserHistory] = useState({ submissions: [], badges: [] });
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);

  // Load challenge detail
  const fetchChallengeDetail = async () => {
    try {
      setLoading(true);
      const response = await getChallengeById(id);
      if (response.data.success) {
        setChallenge(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to load challenge details");
      navigate("/challenges");
    } finally {
      setLoading(false);
    }
  };

  // Load leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await getChallengeLeaderboard(id);
      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  };

  // Load winners
  const fetchWinners = async () => {
    try {
      const response = await getChallengeWinners(id);
      if (response.data.success) {
        setWinners(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch winners:", err);
    }
  };

  // Load user history
  const fetchUserHistory = async () => {
    if (!user) return;

    try {
      const response = await getUserChallengeHistory();
      if (response.data.success) {
        setUserHistory(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user history:", err);
    }
  };
  // Load user posts
  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const response = await api.get(`/posts/${user.id}`);
      if (response.data.success) {
        setUserPosts(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
    }
  };

  // Handle submit post
  const handleSubmitPost = async () => {
    if (!selectedPost || !challenge) return;

    try {
      setSubmitting(true);
      await submitPostToChallenge(challenge.id, parseInt(selectedPost));

      toast.success("Post berhasil disubmit ke challenge!");

      setSubmitModalOpen(false);
      setSelectedPost("");
      fetchChallengeDetail(); // Refresh challenge
      fetchUserHistory(); // Refresh history
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit post");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view post in comment modal
  const handleViewPost = (postId) => {
    console.log("[ChallengeDetail] handleViewPost called with postId:", postId, "userPosts:", userPosts);
    const post = userPosts.find((p) => p.id.toString() === postId);
    if (post) {
      setSelectedPostForComment(post);
      setCommentModalOpen(true);
    } else {
      console.warn("[ChallengeDetail] Post not found for postId:", postId);
    }
  };

  useEffect(() => {
    if (id) {
      fetchChallengeDetail();
      fetchLeaderboard();
      fetchWinners();

      if (user) {
        fetchUserHistory();
        fetchUserPosts();
      }
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Challenge not found</h3>
          <p className="text-muted-foreground mb-4">The challenge you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/challenges")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(challenge.deadline);
  const isExpired = timeRemaining === "Expired";
  const isActive = !challenge.is_closed && !isExpired;

  // Check if user sudah submit
  const userSubmission = userHistory.submissions.find((sub) => sub.challenge_id === challenge.id);

  // Check if user menang
  const userBadge = userHistory.badges.find((badge) => badge.challenge_id === challenge.id);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/challenges")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challenges
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <p className="text-muted-foreground">Challenge Details</p>
        </div>
      </div>
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative">
          {challenge.badge_img && (
            <div className="h-64 overflow-hidden">
              <img src={getFullImageUrl(challenge.badge_img)} alt={challenge.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
          )}

          <div className={`p-6 ${challenge.badge_img ? "absolute bottom-0 left-0 right-0" : ""}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${challenge.badge_img ? "text-white" : ""}`}>{challenge.title}</h2>
                <p className={`text-lg ${challenge.badge_img ? "text-white/90" : "text-muted-foreground"}`}>{challenge.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                {isActive && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining}
                  </Badge>
                )}
                {challenge.is_closed && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    Closed
                  </Badge>
                )}
                {userBadge && (
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    <Crown className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className={`flex items-center ${challenge.badge_img ? "text-white/80" : "text-muted-foreground"}`}>
                <Users className="h-4 w-4 mr-1" />
                {challenge.challengePosts?.length || 0} submissions
              </div>
              <div className={`flex items-center ${challenge.badge_img ? "text-white/80" : "text-muted-foreground"}`}>
                <Calendar className="h-4 w-4 mr-1" />
                Deadline: {formatDate(challenge.deadline)}
              </div>
              <div className={`flex items-center ${challenge.badge_img ? "text-white/80" : "text-muted-foreground"}`}>
                <Trophy className="h-4 w-4 mr-1" />
                Created by {challenge.creator?.profile?.username || "Admin"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <CardFooter className="flex justify-between border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getFullImageUrl(challenge.creator?.profile?.avatar)} />
              <AvatarFallback>{challenge.creator?.firstName?.[0] || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{challenge.creator?.profile?.username || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{formatDate(challenge.created_at)}</p>
            </div>
          </div>

          {isActive &&
            user &&
            (userSubmission ? (
              <Badge variant="secondary" className="px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Already Submitted
              </Badge>
            ) : (
              <Button onClick={() => setSubmitModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Submit Entry
              </Button>
            ))}

          {!user && (
            <Badge variant="outline" className="px-4 py-2">
              Login to participate
            </Badge>
          )}
        </CardFooter>
      </Card>
      {/* Tabs Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Challenge Submissions</CardTitle>
                <Badge variant="secondary">{challenge.challengePosts?.length || 0} entries</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {challenge.challengePosts && challenge.challengePosts.length > 0 ? (
                <SubmissionGrid submissions={challenge.challengePosts} />
              ) : (
                <div className="text-center py-12">
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground">Be the first to submit your artwork!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Winners Card */}
          {winners.length > 0 && (
            <Card className="border-t-4 border-t-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                  Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {winners.map((winner, index) => (
                    <div key={winner.id} className="flex items-center p-2 rounded-md bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-center justify-center w-8 h-8 mr-3">
                        {index === 0 ? <Crown className="h-5 w-5 text-yellow-500" /> : index === 1 ? <Medal className="h-5 w-5 text-gray-400" /> : <Award className="h-5 w-5 text-amber-600" />}
                      </div>
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={getFullImageUrl(winner.user?.profile?.avatar)} />
                        <AvatarFallback>{winner.user?.firstName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{winner.user?.profile?.username || "Unknown User"}</p>
                        {winner.admin_note && <p className="text-xs text-muted-foreground">{winner.admin_note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Challenge Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 text-blue-500 mr-2" />
                Challenge Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Closed"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Submissions</span>
                <span className="text-sm font-medium">{challenge.challengePosts?.length || 0}</span>
              </div>{" "}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Winners</span>
                <span className="text-sm font-medium">{winners.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Likes</span>
                <span className="text-sm font-medium flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {challenge.challengePosts?.reduce((total, submission) => total + (submission.post?.likeCount || submission.post?.likes_count || 0), 0) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Comments</span>
                <span className="text-sm font-medium flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {challenge.challengePosts?.reduce((total, submission) => total + (submission.post?.commentCount || submission.post?.comments_count || 0), 0) || 0}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{formatDate(challenge.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Deadline</span>
                <span className="text-sm font-medium">{formatDate(challenge.deadline)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>{" "}
      {/* Submit Post Modal */}
      {user && (
        <SubmitPostModal
          open={submitModalOpen}
          onOpenChange={setSubmitModalOpen}
          challenge={challenge}
          userPosts={userPosts}
          selectedPost={selectedPost}
          onSelectedPostChange={setSelectedPost}
          onSubmit={handleSubmitPost}
          submitting={submitting}
          onViewPost={handleViewPost}
        />
      )}
      {/* Comment Modal for Post Preview */}
      {commentModalOpen && selectedPostForComment && (
        <CommentModal
          postId={selectedPostForComment.id}
          isOpen={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false);
            setSelectedPostForComment(null);
          }}
          postTitle={selectedPostForComment.title}
          currentUser={user}
        />
      )}
    </div>
  );
}

// Components
function SubmissionGrid({ submissions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {submissions.map((submission, index) => (
        <ChallengeSubmissionCard key={submission.id} submission={submission} showRanking={true} rank={index + 1} />
      ))}
    </div>
  );
}

function SubmitPostModal({ open, onOpenChange, challenge, userPosts, selectedPost, onSelectedPostChange, onSubmit, submitting, onViewPost }) {
  // Debug: log saat tombol View Post diklik
  const handleViewPostClick = () => {
    console.log("[SubmitPostModal] View Post clicked, selectedPost:", selectedPost);
    onViewPost(selectedPost);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Post to Challenge</DialogTitle>
          <DialogDescription>Submit one of your posts to "{challenge?.title}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select a post:</label>
            <Select value={selectedPost} onValueChange={onSelectedPostChange}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a post to submit" />
              </SelectTrigger>
              <SelectContent>
                {userPosts.map((post) => (
                  <SelectItem key={post.id} value={post.id.toString()}>
                    <div className="flex items-center">
                      {post.images?.[0] && <img src={getFullImageUrl(post.images[0].image_url || post.images[0])} alt={post.title} className="w-6 h-6 rounded object-cover mr-2" />}
                      <span className="truncate">{post.title || "Untitled Post"}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPost && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Selected post will be submitted to the challenge. Make sure it follows the challenge guidelines.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-2 mt-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {selectedPost && (
              <Button variant="outline" onClick={handleViewPostClick}>
                <Eye className="h-4 w-4 mr-1" />
                View Post
              </Button>
            )}
          </div>
          <Button onClick={onSubmit} disabled={!selectedPost || submitting}>
            {submitting ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Submit Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
const getTimeRemaining = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} days left`;
  if (hours > 0) return `${hours} hours left`;
  return "Ending soon";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getFullImageUrl = (imagePath) => {
  // Handle null, undefined, or non-string values
  if (!imagePath || typeof imagePath !== "string") return "/placeholder.svg";

  // Handle empty strings
  if (imagePath.trim() === "") return "/placeholder.svg";

  // Handle absolute URLs
  if (imagePath.startsWith("http")) return imagePath;

  const baseURL = import.meta.env.VITE_API_URL || "";
  const cleanPath = imagePath.replace(/\\/g, "/");

  // For storage files, use the API URL directly without removing /api
  // This handles paths like "storage/avatars/filename.jpg"
  if (cleanPath.startsWith("storage/")) {
    return `${baseURL}/${cleanPath}`;
  }

  // For other paths that start with /, remove /api from base URL
  if (cleanPath.startsWith("/")) {
    return baseURL.replace("/api", "") + cleanPath;
  }

  // For relative paths, add them to the base URL without /api
  return `${baseURL.replace("/api", "")}/${cleanPath}`;
};
