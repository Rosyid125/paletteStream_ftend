import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Heart, HeartOff, MessageCircle, Share2, Search, Grid3X3, List, MoreHorizontal, Calendar, Clock, ImageIcon, BookOpen, BookMarked, Bookmark } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LikesPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [confirmUnlikeOpen, setConfirmUnlikeOpen] = useState(false);
  const [itemToUnlike, setItemToUnlike] = useState(null);
  const [likedPosts, setLikedPosts] = useState(LIKED_POSTS);

  // Filter posts based on search query, type filter, and time period
  const filteredPosts = likedPosts.filter((post) => {
    const matchesSearch = searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || post.type === filterType;

    const matchesTimePeriod =
      activeTab === "all" || (activeTab === "today" && isToday(new Date(post.likedAt))) || (activeTab === "week" && isThisWeek(new Date(post.likedAt))) || (activeTab === "month" && isThisMonth(new Date(post.likedAt)));

    return matchesSearch && matchesType && matchesTimePeriod;
  });

  // Sort posts based on sort option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.likedAt).getTime() - new Date(b.likedAt).getTime();
    } else if (sortBy === "popular") {
      return b.stats.likes - a.stats.likes;
    } else {
      return 0;
    }
  });

  // Handle unliking a post
  const handleUnlike = (id) => {
    setLikedPosts(likedPosts.filter((post) => post.id !== id));
  };

  // Helper function to get type color
  const getTypeColor = (type) => {
    switch (type) {
      case "illustration":
        return "text-red-500 bg-red-500/10 hover:bg-red-500/20";
      case "manga":
        return "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
      case "novel":
        return "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
      default:
        return "text-primary bg-primary/10 hover:bg-primary/20";
    }
  };

  // Helper function to get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "illustration":
        return <ImageIcon className="h-4 w-4" />;
      case "manga":
        return <BookOpen className="h-4 w-4" />;
      case "novel":
        return <BookMarked className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Date helper functions
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    return date >= oneWeekAgo;
  };

  const isThisMonth = (date) => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return date >= oneMonthAgo;
  };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <CardTitle>Liked Posts</CardTitle>
        <CardDescription>View and manage your liked posts</CardDescription>
      </div>
      {/* Liked Posts Content */}
      {sortedPosts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No liked posts found</h3>
          <p className="text-muted-foreground mb-6">{searchQuery || filterType !== "all" || activeTab !== "all" ? "Try adjusting your filters or search query" : "Start liking posts to see them here"}</p>
          <Button>Explore Content</Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden group h-full flex flex-col">
              <div className="relative">
                <img src={post.imageUrl || "/placeholder.svg"} alt={post.title} className="aspect-[4/3] w-full object-cover" />
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className={`${getTypeColor(post.type)} border-transparent text-white`}>
                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          setItemToUnlike(post.id);
                          setConfirmUnlikeOpen(true);
                        }}
                      >
                        <HeartOff className="h-4 w-4 mr-2" />
                        Unlike Post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Bookmark
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                </div>

                <div className="flex items-center mt-2">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{post.author.name}</span>
                      </div>
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
                </div>

                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Liked on {formatDate(post.likedAt)}</span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                    <span>{post.stats.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{post.stats.comments}</span>
                  </div>
                  <div className="flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    <span>{post.stats.shares}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1">
                    View
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          onClick={() => {
                            setItemToUnlike(post.id);
                            setConfirmUnlikeOpen(true);
                          }}
                        >
                          <HeartOff className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Unlike post</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {sortedPosts.map((post) => (
                  <div key={post.id} className="flex p-4 gap-4 hover:bg-muted/50 transition-colors">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <img src={post.imageUrl || "/placeholder.svg"} alt={post.title} className="h-full w-full object-cover rounded-md" />
                      <Badge variant="outline" className={`${getTypeColor(post.type)} border-transparent text-white absolute bottom-1 right-1 text-[10px] px-1 py-0`}>
                        {getTypeIcon(post.type)}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{post.title}</h3>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setItemToUnlike(post.id);
                                    setConfirmUnlikeOpen(true);
                                  }}
                                >
                                  <HeartOff className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Unlike post</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Bookmark className="h-4 w-4 mr-2" />
                                Bookmark
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flex items-center mt-1">
                        <Avatar className="h-4 w-4 mr-1">
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{post.author.name}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(post.likedAt)}</span>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex items-center text-xs">
                            <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                            <span>{post.stats.likes}</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span>{post.stats.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmUnlikeOpen} onOpenChange={setConfirmUnlikeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlike Post</DialogTitle>
            <DialogDescription>Are you sure you want to unlike this post? It will be removed from your liked posts.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (itemToUnlike !== null) {
                  handleUnlike(itemToUnlike);
                  setConfirmUnlikeOpen(false);
                  setItemToUnlike(null);
                }
              }}
            >
              Unlike
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sample data for liked posts
const LIKED_POSTS = [
  {
    id: 1,
    title: "Ethereal Forest",
    type: "illustration",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Liam Parker",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop",
      level: 16,
    },
    stats: {
      likes: 2547,
      comments: 342,
      shares: 128,
    },
    likedAt: "2023-05-15T14:30:00Z",
  },
  {
    id: 2,
    title: "Cyberpunk City",
    type: "illustration",
    imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Zoe Chen",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
      level: 23,
    },
    stats: {
      likes: 2103,
      comments: 276,
      shares: 95,
    },
    likedAt: "2023-05-20T09:15:00Z",
  },
  {
    id: 3,
    title: "Moonlit Wanderer",
    type: "manga",
    imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Hiroshi Tanaka",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
      level: 28,
    },
    stats: {
      likes: 1876,
      comments: 231,
      shares: 87,
    },
    likedAt: "2023-06-02T18:45:00Z",
  },
  {
    id: 4,
    title: "Ocean Dreams",
    type: "illustration",
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Emma Waters",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
      level: 19,
    },
    stats: {
      likes: 1654,
      comments: 198,
      shares: 76,
    },
    likedAt: "2023-06-10T11:20:00Z",
  },
  {
    id: 5,
    title: "The Last Guardian",
    type: "novel",
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Marcus Reed",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      level: 21,
    },
    stats: {
      likes: 1432,
      comments: 187,
      shares: 65,
    },
    likedAt: "2023-06-15T15:10:00Z",
  },
  {
    id: 6,
    title: "Sakura Dreams",
    type: "illustration",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Yuki Sato",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
      level: 25,
    },
    stats: {
      likes: 1321,
      comments: 165,
      shares: 54,
    },
    likedAt: "2023-06-22T08:30:00Z",
  },
  {
    id: 7,
    title: "Dragon's Realm",
    type: "manga",
    imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Jin Lee",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      level: 22,
    },
    stats: {
      likes: 1287,
      comments: 154,
      shares: 48,
    },
    likedAt: "2023-06-25T14:20:00Z",
  },
  {
    id: 8,
    title: "Whispers in the Wind",
    type: "novel",
    imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1000&auto=format&fit=crop",
    author: {
      name: "Elena Frost",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
      level: 18,
    },
    stats: {
      likes: 1198,
      comments: 143,
      shares: 42,
    },
    likedAt: "2023-07-01T10:15:00Z",
  },
];
