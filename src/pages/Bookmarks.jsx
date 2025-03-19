import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Bookmark, BookmarkMinus, Heart, MessageCircle, Share2, Filter, Search, Grid3X3, List, Trash2, MoreHorizontal, Calendar, Clock, ImageIcon, BookOpen, BookMarked } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BookmarksPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState(BOOKMARKED_POSTS);

  // Filter posts based on search query, type filter, and collection
  const filteredPosts = bookmarkedPosts.filter((post) => {
    const matchesSearch = searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || post.type === filterType;

    const matchesCollection = selectedCollection === "all" || post.collections.includes(selectedCollection);

    return matchesSearch && matchesType && matchesCollection;
  });

  // Sort posts based on sort option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime();
    } else if (sortBy === "popular") {
      return b.stats.likes - a.stats.likes;
    } else {
      return 0;
    }
  });

  // Handle removing a bookmark
  const handleRemoveBookmark = (id) => {
    setBookmarkedPosts(bookmarkedPosts.filter((post) => post.id !== id));
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

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bookmark className="h-6 w-6 text-blue-500 mr-2" />
              <div>
                <CardTitle className="text-2xl">Bookmarks</CardTitle>
                <CardDescription>Your saved artworks and content</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Grid View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search bookmarks..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="illustration">Illustrations</SelectItem>
                  <SelectItem value="manga">Manga</SelectItem>
                  <SelectItem value="novel">Novels</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" value={selectedCollection} onValueChange={setSelectedCollection}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Bookmarks</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
              <TabsTrigger value="reference">Reference</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bookmarks Content */}
      {sortedPosts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No bookmarks found</h3>
          <p className="text-muted-foreground mb-6">{searchQuery || filterType !== "all" || selectedCollection !== "all" ? "Try adjusting your filters or search query" : "Start bookmarking posts to save them for later"}</p>
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
                          setItemToDelete(post.id);
                          setConfirmDeleteOpen(true);
                        }}
                      >
                        <BookmarkMinus className="h-4 w-4 mr-2" />
                        Remove Bookmark
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Heart className="h-4 w-4 mr-2" />
                        Like Post
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
                  <span>Bookmarked on {formatDate(post.bookmarkedAt)}</span>
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
                            setItemToDelete(post.id);
                            setConfirmDeleteOpen(true);
                          }}
                        >
                          <BookmarkMinus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove bookmark</p>
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
                                    setItemToDelete(post.id);
                                    setConfirmDeleteOpen(true);
                                  }}
                                >
                                  <BookmarkMinus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove bookmark</p>
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
                                <Heart className="h-4 w-4 mr-2" />
                                Like Post
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
                          <span>{formatDate(post.bookmarkedAt)}</span>
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
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Bookmark</DialogTitle>
            <DialogDescription>Are you sure you want to remove this bookmark? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (itemToDelete !== null) {
                  handleRemoveBookmark(itemToDelete);
                  setConfirmDeleteOpen(false);
                  setItemToDelete(null);
                }
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sample data for bookmarked posts
const BOOKMARKED_POSTS = [
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
    bookmarkedAt: "2023-05-15T14:30:00Z",
    collections: ["favorites", "inspiration"],
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
    bookmarkedAt: "2023-05-20T09:15:00Z",
    collections: ["reference"],
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
    bookmarkedAt: "2023-06-02T18:45:00Z",
    collections: ["favorites"],
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
    bookmarkedAt: "2023-06-10T11:20:00Z",
    collections: ["inspiration"],
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
    bookmarkedAt: "2023-06-15T15:10:00Z",
    collections: ["reference"],
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
    bookmarkedAt: "2023-06-22T08:30:00Z",
    collections: ["favorites", "inspiration"],
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
    bookmarkedAt: "2023-06-25T14:20:00Z",
    collections: ["reference"],
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
    bookmarkedAt: "2023-07-01T10:15:00Z",
    collections: ["favorites"],
  },
];
