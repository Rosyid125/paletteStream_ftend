import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Trophy, Calendar, Clock, Users, Award, CheckCircle2, ArrowRight, Star, Crown, Medal, Heart, MessageCircle, Send, Eye, Upload, Target } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllChallenges, getActiveChallenges, getChallengeById, getChallengeLeaderboard, getChallengeWinners, submitPostToChallenge, getUserChallengeHistory } from "@/services/challengeService";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/loading-spinner";
import api from "@/api/axiosInstance";

export default function Challenges() {
  const [activeTab, setActiveTab] = useState("active");
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [userHistory, setUserHistory] = useState({ submissions: [], badges: [] });
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedPost, setSelectedPost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useContext(AuthContext);

  // Load semua challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await getAllChallenges();
      if (response.data.success) {
        setChallenges(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch challenges");
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  // Load active challenges
  const fetchActiveChallenges = async () => {
    try {
      const response = await getActiveChallenges();
      if (response.data.success) {
        setActiveChallenges(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch active challenges:", err);
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

  // Load user posts untuk submission
  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const response = await api.get("/posts/my-posts");
      if (response.data.success) {
        setUserPosts(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
    }
  };

  // Handle submit post to challenge
  const handleSubmitPost = async () => {
    if (!selectedPost || !selectedChallenge) return;

    try {
      setSubmitting(true);
      await submitPostToChallenge(selectedChallenge.id, parseInt(selectedPost));

      toast.success("Post berhasil disubmit ke challenge!");

      setSubmitModalOpen(false);
      setSelectedPost("");
      fetchUserHistory(); // Refresh history
      fetchChallenges(); // Refresh challenges
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit post");
    } finally {
      setSubmitting(false);
    }
  };

  // Load data saat component mount
  useEffect(() => {
    fetchChallenges();
    fetchActiveChallenges();
    if (user) {
      fetchUserHistory();
      fetchUserPosts();
    }
  }, [user]);

  // Filter challenges berdasarkan status
  const getFilteredChallenges = () => {
    const now = new Date();

    switch (activeTab) {
      case "active":
        return challenges.filter((challenge) => !challenge.is_closed && new Date(challenge.deadline) > now);
      case "completed":
        return challenges.filter((challenge) => challenge.is_closed || new Date(challenge.deadline) <= now);
      default:
        return challenges;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 text-primary mr-2" />
                Weekly Challenges
              </CardTitle>
              <CardDescription>Compete with other artists and earn exclusive badges</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {challenges.length} Total Challenges
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenges List - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Browse Challenges</CardTitle>
              <CardDescription>Find active challenges to participate in</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6">
                  <ChallengesList
                    challenges={getFilteredChallenges()}
                    onSubmit={(challenge) => {
                      setSelectedChallenge(challenge);
                      setSubmitModalOpen(true);
                    }}
                    userHistory={userHistory}
                    user={user}
                  />
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                  <ChallengesList challenges={getFilteredChallenges()} showWinners={true} userHistory={userHistory} user={user} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* User Stats */}
          {user && <UserStatsCard userHistory={userHistory} />}

          {/* Quick Actions */}
          <QuickActionsCard />
        </div>
      </div>

      {/* Submit Post Modal */}
      {user && (
        <SubmitPostModal
          open={submitModalOpen}
          onOpenChange={setSubmitModalOpen}
          challenge={selectedChallenge}
          userPosts={userPosts}
          selectedPost={selectedPost}
          onSelectedPostChange={setSelectedPost}
          onSubmit={handleSubmitPost}
          submitting={submitting}
        />
      )}
    </div>
  );
}

// Components
function ChallengesList({ challenges, onSubmit, showWinners, userHistory, user }) {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No challenges found</h3>
        <p className="text-muted-foreground">Check back later for new challenges!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} onSubmit={onSubmit} showWinners={showWinners} userHistory={userHistory} user={user} />
      ))}
    </div>
  );
}

function ChallengeCard({ challenge, onSubmit, showWinners, userHistory, user }) {
  const timeRemaining = getTimeRemaining(challenge.deadline);
  const isExpired = timeRemaining === "Expired";
  const isActive = !challenge.is_closed && !isExpired;

  // Check if user sudah submit ke challenge ini
  const userSubmission = userHistory.submissions.find((sub) => sub.challenge_id === challenge.id);

  // Check if user menang di challenge ini
  const userBadge = userHistory.badges.find((badge) => badge.challenge_id === challenge.id);

  return (
    <Card className="overflow-hidden group">
      {/* Challenge Header */}
      <div className="relative">
        {challenge.badge_img && (
          <div className="h-48 overflow-hidden">
            <img src={getFullImageUrl(challenge.badge_img)} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        )}

        <div className={`p-6 ${challenge.badge_img ? "absolute bottom-0 left-0 right-0" : ""}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-xl font-bold ${challenge.badge_img ? "text-white" : ""}`}>{challenge.title}</h3>
            <div className="flex gap-2">
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

          <p className={`text-sm mb-4 ${challenge.badge_img ? "text-white/90" : "text-muted-foreground"}`}>{challenge.description}</p>

          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center ${challenge.badge_img ? "text-white/80" : "text-muted-foreground"}`}>
              <Users className="h-4 w-4 mr-1" />
              {challenge.challengePosts?.length || 0} submissions
            </div>
            <div className={`flex items-center ${challenge.badge_img ? "text-white/80" : "text-muted-foreground"}`}>
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(challenge.deadline)}
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Content */}
      <CardContent className="pt-4">
        {/* Creator Info */}
        <div className="flex items-center mb-4">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={getFullImageUrl(challenge.creator?.profile?.avatar)} />
            <AvatarFallback>{challenge.creator?.firstName?.[0] || "A"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Created by {challenge.creator?.profile?.username || "Admin"}</p>
            <p className="text-xs text-muted-foreground">{formatDate(challenge.created_at)}</p>
          </div>
        </div>

        {/* Submissions Preview */}
        {challenge.challengePosts && challenge.challengePosts.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Recent Submissions</h4>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-3 pb-2">
                {challenge.challengePosts.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex-shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                            {submission.post?.images?.[0] && <img src={getFullImageUrl(submission.post.images[0])} alt={submission.post.title} className="w-full h-full object-cover" />}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{submission.post?.title || "Untitled"}</p>
                          <p className="text-xs">by {submission.post?.user?.profile?.username}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
                {challenge.challengePosts.length > 5 && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center border border-dashed border-muted-foreground/25">
                    <span className="text-xs text-muted-foreground">+{challenge.challengePosts.length - 5}</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Winners Section (untuk completed challenges) */}
        {showWinners && challenge.userBadges && challenge.userBadges.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-semibold mb-3 flex items-center">
              <Crown className="h-4 w-4 text-yellow-600 mr-1" />
              Winners
            </h4>
            <div className="space-y-2">
              {challenge.userBadges.map((badge, index) => (
                <div key={badge.id} className="flex items-center">
                  <div className="flex items-center justify-center w-6 h-6 mr-2">
                    {index === 0 ? (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="h-4 w-4 text-gray-400" />
                    ) : index === 2 ? (
                      <Award className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Star className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={getFullImageUrl(badge.user?.profile?.avatar)} />
                    <AvatarFallback>{badge.user?.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{badge.user?.profile?.username || "Unknown User"}</span>
                    {badge.admin_note && <p className="text-xs text-muted-foreground">{badge.admin_note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Challenge Actions */}
      <CardFooter className="flex justify-between border-t">
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>

        {isActive &&
          user &&
          (userSubmission ? (
            <Badge variant="secondary" className="px-3 py-1">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Submitted
            </Badge>
          ) : (
            <Button size="sm" onClick={() => onSubmit(challenge)}>
              <Upload className="h-4 w-4 mr-1" />
              Submit Post
            </Button>
          ))}

        {!user && (
          <Badge variant="outline" className="px-3 py-1">
            Login to participate
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

function UserStatsCard({ userHistory }) {
  const totalSubmissions = userHistory.submissions?.length || 0;
  const totalBadges = userHistory.badges?.length || 0;

  return (
    <Card className="border-t-4 border-t-purple-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
          <Medal className="h-5 w-5 text-purple-500 mr-2" />
          Your Progress
        </CardTitle>
        <CardDescription>Challenge participation stats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalSubmissions}</div>
            <div className="text-xs text-muted-foreground">Submissions</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalBadges}</div>
            <div className="text-xs text-muted-foreground">Badges Won</div>
          </div>
        </div>

        {userHistory.badges && userHistory.badges.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Recent Badges</h4>
            <div className="space-y-2">
              {userHistory.badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center p-2 rounded-md bg-muted/20">
                  {badge.badge_img ? (
                    <img src={getFullImageUrl(badge.badge_img)} alt="Badge" className="w-8 h-8 rounded-full mr-2" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{badge.challenge?.title || "Challenge Badge"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(badge.awarded_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card className="border-t-4 border-t-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 text-blue-500 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Trophy className="h-4 w-4 mr-2" />
          View All Winners
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Challenge Leaderboard
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Award className="h-4 w-4 mr-2" />
          My Submissions
        </Button>
      </CardContent>
    </Card>
  );
}

function SubmitPostModal({ open, onOpenChange, challenge, userPosts, selectedPost, onSelectedPostChange, onSubmit, submitting }) {
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
                      {post.images?.[0] && <img src={getFullImageUrl(post.images[0])} alt={post.title} className="w-6 h-6 rounded object-cover mr-2" />}
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

        <DialogFooter className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
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
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http")) return imagePath;

  const baseURL = import.meta.env.VITE_API_URL || "";
  const cleanPath = imagePath.replace(/\\/g, "/");

  if (cleanPath.startsWith("/")) {
    return baseURL.replace("/api", "") + cleanPath;
  }
  return `${baseURL.replace("/api", "")}/${cleanPath}`;
};
