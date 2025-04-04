import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Bookmark, Award, TrendingUp, Clock, CheckCircle2, Trophy, Star, FlameIcon as Fire, ChevronLeft, ChevronRight } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [feedTab, setFeedTab] = useState("illustration");
  const [page, setPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(10); // Items per page (can be made dynamic)
  const [total, setTotal] = useState(0); // Total number of items (from API)
  const [posts, setPosts] = useState([]); // The array of posts for the *current* page
  const [loading, setLoading] = useState(true); // Loading state indicator

  //Dummy API integration
  const fetchPosts = async (currentPage, currentpageSize, type) => {
    setLoading(true);
    try {
      // Simulate fetching data with a delay and filtering
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      await delay(500); // Simulate network latency

      const filteredData = artPosts.filter((post) => post.type === type);

      const startIndex = (currentPage - 1) * currentpageSize;
      const endIndex = startIndex + currentpageSize;
      const paginatedPosts = filteredData.slice(startIndex, endIndex);

      const response = {
        total: filteredData.length,
        page: currentPage,
        pageSize: currentpageSize,
        results: paginatedPosts,
      };
      setPosts(response.results);
      setTotal(response.total);
      setPage(response.page);
      setPageSize(response.pageSize);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      // Handle errors (e.g., display an error message)
    }
  };

  useEffect(() => {
    fetchPosts(page, pageSize, feedTab);
  }, [page, pageSize, feedTab]); // Refetch when page, pageSize, or feedTab changes

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / pageSize)) {
      //Important page validation
      setPage(newPage);
    }
  };

  const artPosts = [
    {
      id: 1,
      title: "Crimson Dreams",
      description: "A vibrant digital painting depicting a dreamlike landscape with crimson skies and ethereal figures.",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
      author: {
        name: "Mika Chen",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
        level: 12,
      },
      likes: 342,
      comments: 28,
      shares: 15,
      timeAgo: "2 hours ago",
      tags: ["fantasy", "digital", "portrait"],
    },
    {
      id: 2,
      title: "Urban Legends: Chapter 3",
      description: "The third chapter of a thrilling manga series set in a gritty urban environment, filled with supernatural mysteries and action-packed scenes.",
      type: "manga",
      imageUrl: "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?q=80&w=1000&auto=format&fit=crop",
      author: {
        name: "Takeshi Yamada",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
        level: 24,
      },
      likes: 876,
      comments: 134,
      shares: 67,
      timeAgo: "1 day ago",
      tags: ["manga", "action", "urban"],
    },
    {
      id: 3,
      title: "Whispers in the Wind",
      description: "A captivating novel that weaves a tale of love, loss, and redemption, set against the backdrop of a mystical world where the wind carries secrets of the past.",
      type: "novel",
      imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1000&auto=format&fit=crop",
      author: {
        name: "Elena Frost",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
        level: 18,
      },
      likes: 523,
      comments: 89,
      shares: 32,
      timeAgo: "3 days ago",
      tags: ["fantasy", "romance", "novel"],
    },
    {
      id: 4,
      title: "Another Illustration",
      description: "Another illustration for testing purposes.",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
      author: {
        name: "Mika Chen",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
        level: 12,
      },
      likes: 342,
      comments: 28,
      shares: 15,
      timeAgo: "2 hours ago",
      tags: ["fantasy", "digital", "portrait"],
    },
    {
      id: 5,
      title: "Another Manga",
      description: "Another manga for testing purposes.",
      type: "manga",
      imageUrl: "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?q=80&w=1000&auto=format&fit=crop",
      author: {
        name: "Takeshi Yamada",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
        level: 24,
      },
      likes: 876,
      comments: 134,
      shares: 67,
      timeAgo: "1 day ago",
      tags: ["manga", "action", "urban"],
    },
    {
      id: 6,
      title: "Another Novel",
      description: "Another novel for testing purposes.",
      type: "novel",
      imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1000&auto=format&fit=crop",
      author: {
        name: "Elena Frost",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
        level: 18,
      },
      likes: 523,
      comments: 89,
      shares: 32,
      timeAgo: "3 days ago",
      tags: ["fantasy", "romance", "novel"],
    },
  ];

  const dummyUserData = {
    level: 7,
    exp: 320,
    expToNextLevel: 500,
  };

  const challenges = [
    {
      id: 1,
      title: "Weekly Theme: Mythology",
      description: "Create artwork inspired by myths and legends from around the world.",
      deadline: "5 days left",
      participants: 234,
      prize: "2000 XP + Mythologist Badge",
    },
    {
      id: 2,
      title: "Character Design Challenge",
      description: "Design an original character with a detailed backstory.",
      deadline: "2 days left",
      participants: 187,
      prize: "1500 XP + Character Creator Badge",
    },
  ];

  const badges = [
    {
      id: 1,
      title: "First Upload",
      description: "Upload your first artwork",
      icon: <Star className="h-5 w-5 text-yellow-500" />,
    },
    {
      id: 2,
      title: "Rising Star",
      description: "Reach 100 followers",
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 3,
      title: "Challenge Champion",
      description: "Win your first challenge",
      icon: <Trophy className="h-5 w-5 text-primary" />,
    },
    {
      id: 4,
      title: "Consistent Creator",
      description: "Upload 5 artworks in a week",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    },
    {
      id: 5,
      title: "Art Critic",
      description: "Leave 10 comments",
      icon: <MessageCircle className="h-5 w-5 text-purple-500" />,
    },
    {
      id: 6,
      title: "Weekly Winner",
      description: "Win the weekly challenge",
      icon: <Award className="h-5 w-5 text-pink-500" />,
    },
  ];

  const achievements = [
    { id: 1, name: "Upload 10 Artworks", progress: 10, total: 10, completed: true },
    { id: 2, name: "Receive 100 Likes", progress: 100, total: 100, completed: true },
    { id: 3, name: "Win a Challenge", progress: 1, total: 1, completed: true },
    { id: 4, name: "Upload 50 Artworks", progress: 25, total: 50, completed: false },
    { id: 5, name: "Receive 1000 Likes", progress: 100, total: 1000, completed: false },
    { id: 6, name: "Win 5 Challenges", progress: 1, total: 5, completed: false },
  ];

  const recommendedArtists = [
    {
      id: 1,
      name: "Kai Nakamura",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
      specialty: "Digital Illustration",
      level: 15,
    },
    {
      id: 2,
      name: "Sofia Martinez",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      specialty: "Character Design",
      level: 22,
    },
    {
      id: 3,
      name: "Alex Kim",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      specialty: "Manga Artist",
      level: 19,
    },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "illustration":
        return "text-primary bg-primary/10 hover:bg-primary/20";
      case "manga":
        return "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
      case "novel":
        return "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
      default:
        return "text-primary bg-primary/10 hover:bg-primary/20";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-4 md:p-6">
      {/* Main Feed - 2/3 width on large screens */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Feed</CardTitle>
            <Tabs
              defaultValue="illustration"
              value={feedTab}
              onValueChange={(value) => {
                setFeedTab(value);
                setPage(1); //VERY IMPORTANT, Reset the page
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="illustration">Illustration</TabsTrigger>
                <TabsTrigger value="manga">Manga</TabsTrigger>
                <TabsTrigger value="novel">Novel</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="space-y-6">
              {loading ? (
                // Show skeletons while loading
                Array.from({ length: pageSize }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardHeader>
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="pt-4">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-4 w-12 mr-1" />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex space-x-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </CardFooter>
                  </Card>
                ))
              ) : posts.length === 0 ? (
                // Handle the case where there are no posts
                <p>No posts found for this category.</p>
              ) : (
                // Display the posts
                posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Avatar className="cursor-pointer">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <Avatar>
                                  <AvatarImage src={post.author.avatar} />
                                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">{post.author.name}</h4>
                                  <p className="text-sm">Level {post.author.level} Artist</p>
                                  <div className="flex items-center pt-2">
                                    <Button variant="outline" size="sm" className="mr-2">
                                      View Profile
                                    </Button>
                                    <Button size="sm">Follow</Button>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div>
                            <p className="font-medium text-sm">{post.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Level {post.author.level} • {post.timeAgo}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getTypeColor(post.type)}>
                          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <div className="relative aspect-video w-full overflow-hidden">
                      <img src={post.imageUrl || "/placeholder.svg"} alt={post.title} className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" />
                    </div>

                    <CardContent className="pt-4">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{post.description}</p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex space-x-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Like this post</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Comment on this post</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save to bookmarks</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardFooter>
                  </Card>
                ))
              )}

              {/* Pagination Controls */}
              {!loading && (
                <div className="flex justify-center mt-4 space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" disabled>
                    {page} / {Math.ceil(total / pageSize)}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handlePageChange(page + 1)} disabled={page === Math.ceil(total / pageSize)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - 1/3 width on large screens */}

      <div className="space-y-6">
        {/* Active Challenges */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 text-primary mr-2" />
              Active Challenges
            </CardTitle>
            <CardDescription>Compete and earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {challenge.deadline}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                    <span>{challenge.participants} participants</span>
                    <span className="font-medium text-foreground">{challenge.prize}</span>
                  </div>
                  <Button className="w-full mt-3">Join Challenge</Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Challenges
            </Button>
          </CardFooter>
        </Card>

        {/* Gamification Hub */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 text-amber-500 mr-2" />
              Gamification Hub
            </CardTitle>
            <CardDescription>Track your progress and missions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* User's EXP and Level */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Level {dummyUserData.level}</h3>
              <p className="text-sm text-muted-foreground">
                EXP: {dummyUserData.exp} / {dummyUserData.expToNextLevel}
              </p>
              <Progress value={(dummyUserData.exp / dummyUserData.expToNextLevel) * 100} />
            </div>

            <Separator className="my-4" />

            {/* Badges */}
            <div>
              <h3 className="font-medium mb-3">Badges</h3>
              <ScrollArea className="h-[180px] pr-4">
                <div className="grid grid-cols-2 gap-2">
                  {badges.map((badge) => (
                    <Card key={badge.id} className="overflow-hidden border-none shadow-sm">
                      <CardContent className="p-3 flex items-center space-x-2">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">{badge.icon}</div>
                        <div>
                          <p className="font-medium text-sm">{badge.title}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <Separator className="my-4" />
            <div>
              <h3 className="font-medium mb-3">Achievements</h3>
              <ScrollArea className="h-[180px] pr-4">
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="w-full pr-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <Badge variant={achievement.completed ? "secondary" : "outline"} className="ml-2">
                            {achievement.completed ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            Progress: {achievement.progress}/{achievement.total}
                          </span>
                          <span>{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.total) * 100} className={`h-2 w-full mt-1 ${achievement.completed ? "bg-green-100" : ""}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Recommended for You */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Fire className="h-5 w-5 text-blue-500 mr-2" />
              Recommended for You
            </CardTitle>
            <CardDescription>Artists you might like</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedArtists.map((artist) => (
              <div key={artist.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={artist.avatar} alt={artist.name} />
                        <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src={artist.avatar} />
                          <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">{artist.name}</h4>
                          <p className="text-sm">{artist.specialty}</p>
                          <p className="text-sm">Level {artist.level} Artist</p>
                          <div className="flex items-center pt-2">
                            <Button variant="outline" size="sm" className="mr-2">
                              View Profile
                            </Button>
                            <Button size="sm">Follow</Button>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <div>
                    <p className="font-medium text-sm">{artist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {artist.specialty} • Level {artist.level}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">
              View More
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
