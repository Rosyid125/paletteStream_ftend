import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Crown, Medal, Award, Star, Users, Clock, Heart, MessageCircle, Eye } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageCarousel } from "@/components/ImageCarousel";
import { getAllChallenges, getChallengeWinners } from "@/services/challengeService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

export default function WeeklyWinners() {
  const [activeTab, setActiveTab] = useState("recent");
  const [challenges, setChallenges] = useState([]);
  const [challengeWinners, setChallengeWinners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Helper function untuk format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function untuk mendapatkan full URL gambar
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;

    const baseURL = api.defaults.baseURL || "";
    const cleanPath = imagePath.replace(/\\/g, "/");

    if (cleanPath.startsWith("/")) {
      return baseURL + cleanPath;
    }
    return `${baseURL}/${cleanPath}`;
  };
  // Load challenges dan winners
  const fetchChallengesAndWinners = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch semua challenges
      const challengesResponse = await getAllChallenges();
      if (challengesResponse.data.success) {
        const allChallenges = challengesResponse.data.data;

        // Filter hanya challenges yang sudah closed dan ada pemenang
        const completedChallenges = allChallenges.filter((challenge) => challenge.is_closed && challenge.userBadges && challenge.userBadges.length > 0);

        setChallenges(completedChallenges);

        // Fetch winners untuk setiap challenge yang sudah selesai
        const winnersData = {};
        for (const challenge of completedChallenges) {
          try {
            const winnersResponse = await getChallengeWinners(challenge.id);
            if (winnersResponse.data.success) {
              winnersData[challenge.id] = winnersResponse.data.data;
            }
          } catch (err) {
            console.error(`Failed to fetch winners for challenge ${challenge.id}:`, err);
          }
        }

        setChallengeWinners(winnersData);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load challenge winners");
      toast.error("Failed to load challenge winners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesAndWinners();
  }, []);

  // Filter challenges berdasarkan tab
  const getFilteredChallenges = () => {
    const now = new Date();

    switch (activeTab) {
      case "recent":
        // Challenges yang selesai dalam 30 hari terakhir
        return challenges
          .filter((challenge) => {
            const deadline = new Date(challenge.deadline);
            const daysDiff = (now - deadline) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
          })
          .sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

      case "all":
        return challenges.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

      case "popular":
        // Sort berdasarkan jumlah submissions
        return [...challenges].sort((a, b) => (b.challengePosts?.length || 0) - (a.challengePosts?.length || 0));

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-32 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Winners</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchChallengesAndWinners}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card className="border-t-4 border-t-yellow-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                Challenge Winners
              </CardTitle>
              <CardDescription>Celebrate the talented artists who won our weekly challenges</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {challenges.length} Completed Challenges
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs untuk filter */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recent Winners</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="all">All Winners</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <ChallengeWinnersList challenges={getFilteredChallenges()} challengeWinners={challengeWinners} getFullImageUrl={getFullImageUrl} formatDate={formatDate} emptyMessage="No recent winners found" />
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <ChallengeWinnersList challenges={getFilteredChallenges()} challengeWinners={challengeWinners} getFullImageUrl={getFullImageUrl} formatDate={formatDate} emptyMessage="No popular challenges found" />
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <ChallengeWinnersList challenges={getFilteredChallenges()} challengeWinners={challengeWinners} getFullImageUrl={getFullImageUrl} formatDate={formatDate} emptyMessage="No completed challenges with winners found" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
// Components
function ChallengeWinnersList({ challenges, challengeWinners, getFullImageUrl, formatDate, emptyMessage }) {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground">Check back later for challenge winners!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {challenges.map((challenge) => (
        <ChallengeWinnersCard key={challenge.id} challenge={challenge} winners={challengeWinners[challenge.id] || []} getFullImageUrl={getFullImageUrl} formatDate={formatDate} />
      ))}
    </div>
  );
}

function ChallengeWinnersCard({ challenge, winners, getFullImageUrl, formatDate }) {
  const submissionCount = challenge.challengePosts?.length || 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{challenge.title}</CardTitle>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                <Crown className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            </div>

            <CardDescription className="text-sm mb-3">{challenge.description}</CardDescription>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Ended: {formatDate(challenge.deadline)}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {submissionCount} participants
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                {winners.length} winners
              </div>
            </div>
          </div>

          {challenge.badge_img && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted ml-4 flex-shrink-0">
              <ImageCarousel images={[getFullImageUrl(challenge.badge_img)]} title="Challenge Badge" className="w-full h-full rounded-lg" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {winners.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              Winners
            </h4>

            <div className="grid gap-4">
              {winners.map((winner, index) => (
                <WinnerCard key={winner.id || index} winner={winner} rank={index + 1} getFullImageUrl={getFullImageUrl} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No winners selected yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WinnerCard({ winner, rank, getFullImageUrl }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case 2:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case 3:
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank Badge */}
          <div className="flex-shrink-0">
            <Badge className={`px-2 py-1 ${getRankColor(rank)}`}>
              {getRankIcon(rank)}
              <span className="ml-1">#{rank}</span>
            </Badge>
          </div>
          {/* User Info */}
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getFullImageUrl(winner.user?.profile?.avatar)} />
              <AvatarFallback>{winner.user?.firstName?.[0]?.toUpperCase() || winner.user?.profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">{winner.user?.profile?.username || `${winner.user?.firstName} ${winner.user?.lastName}`.trim() || "Unknown User"}</h4>
              <p className="text-sm text-muted-foreground">{winner.admin_note || "Congratulations!"}</p>
              {winner.created_at && <p className="text-xs text-muted-foreground">Awarded on {new Date(winner.created_at).toLocaleDateString()}</p>}
            </div>
          </div>
          {/* Winning Post Preview */}
          {winner.challengePost?.post && (
            <div className="flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                      {winner.challengePost.post.images?.[0] && (
                        <ImageCarousel images={[getFullImageUrl(winner.challengePost.post.images[0])]} title={winner.challengePost.post.title || "Winning Post"} className="w-full h-full rounded-md" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-medium">{winner.challengePost.post.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">Winning submission</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
