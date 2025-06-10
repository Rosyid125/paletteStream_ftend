import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Calendar, Clock, Users, Heart, MessageCircle, ArrowRight, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChallengeSubmissionCard({ submission, showRanking = false, rank = null }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const post = submission.post;

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Trophy className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Ranking Badge */}
      {showRanking && rank && rank <= 3 && (
        <div className="absolute top-2 left-2 z-10">
          <Badge
            variant="secondary"
            className={`
              flex items-center gap-1 px-2 py-1
              ${rank === 1 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : ""}
              ${rank === 2 ? "bg-gray-400/10 text-gray-600 border-gray-400/20" : ""}
              ${rank === 3 ? "bg-amber-600/10 text-amber-700 border-amber-600/20" : ""}
            `}
          >
            {getRankIcon(rank)}#{rank}
          </Badge>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {post?.images?.[0] && (
          <>
            {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
            <img
              src={getFullImageUrl(post.images[0])}
              alt={post.title || "Untitled"}
              className={`
                w-full h-full object-cover transition-all duration-300
                ${imageLoaded ? "opacity-100" : "opacity-0"}
                group-hover:scale-105
              `}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary" className="shadow-lg">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Post</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold truncate mb-2 group-hover:text-primary transition-colors">{post?.title || "Untitled"}</h3>

        {/* Artist Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center min-w-0 flex-1">
            <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
              <AvatarImage src={getFullImageUrl(post?.user?.profile?.avatar)} />
              <AvatarFallback className="text-xs">{post?.user?.firstName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">{post?.user?.profile?.username || "Unknown"}</span>
          </div>

          {/* Post Stats */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-shrink-0">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{post?.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{post?.comments_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Submission Date */}
        <div className="text-xs text-muted-foreground">Submitted {formatDate(submission.created_at)}</div>
      </CardContent>
    </Card>
  );
}
