import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Palette, BookOpen, PenTool, Users, TrendingUp, Heart } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Discover() {
  const popularTags = ["fantasy", "digital", "portrait", "landscape", "character", "anime", "scifi", "traditional", "concept", "fanart"];

  const featuredArtworks = [
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
      likes: 542,
      tags: ["fantasy", "landscape", "digital"],
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
      likes: 876,
      tags: ["scifi", "cyberpunk", "digital"],
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
      likes: 723,
      tags: ["manga", "character", "fantasy"],
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
      likes: 412,
      tags: ["landscape", "digital", "ocean"],
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
      likes: 356,
      tags: ["novel", "fantasy", "adventure"],
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
      likes: 689,
      tags: ["traditional", "japanese", "nature"],
    },
  ];

  const popularCommunities = [
    {
      id: 1,
      name: "Digital Dreamers",
      members: 12453,
      description: "A community for digital artists to share techniques and inspiration.",
      icon: <Palette className="h-10 w-10 text-purple-500" />,
    },
    {
      id: 2,
      name: "Manga Masters",
      members: 8762,
      description: "For manga artists and enthusiasts to discuss styles and storytelling.",
      icon: <BookOpen className="h-10 w-10 text-blue-500" />,
    },
    {
      id: 3,
      name: "Character Creators",
      members: 9341,
      description: "Focus on character design across all mediums and styles.",
      icon: <PenTool className="h-10 w-10 text-red-500" />,
    },
  ];

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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Search and Filter Section */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle>Discover</CardTitle>
          <CardDescription>Find new artworks, artists, and communities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search for artworks, artists, or tags..." className="pl-10" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>Most Recent</DropdownMenuItem>
                <DropdownMenuItem>Most Popular</DropdownMenuItem>
                <DropdownMenuItem>Most Liked</DropdownMenuItem>
                <DropdownMenuItem>Trending</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Popular Tags</h3>
            <ScrollArea className="whitespace-nowrap pb-2" orientation="horizontal">
              <div className="flex gap-2">
                {popularTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="artworks">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
        </TabsList>

        {/* Artworks Tab */}
        <TabsContent value="artworks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden group">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className={getTypeColor(artwork.type)}>
                      {artwork.type.charAt(0).toUpperCase() + artwork.type.slice(1)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{artwork.title}</h3>

                  <div className="flex justify-between items-center mt-2">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-pointer">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={artwork.author.avatar} alt={artwork.author.name} />
                            <AvatarFallback>{artwork.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{artwork.author.name}</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src={artwork.author.avatar} />
                            <AvatarFallback>{artwork.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{artwork.author.name}</h4>
                            <p className="text-sm">Level {artwork.author.level} Artist</p>
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

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                            <span>{artwork.likes}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{artwork.likes} likes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {artwork.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors cursor-pointer">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This is a placeholder for the Artists tab content */}
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle>Artists Tab</CardTitle>
                <CardDescription>This tab will display featured artists</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for the Artists tab will be implemented in the next phase.</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full">
                  View All Artists
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularCommunities.map((community) => (
              <Card key={community.id} className="border-t-4 border-t-red-500 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-muted flex items-center justify-center shadow-sm">{community.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{community.members.toLocaleString()} members</span>
                        </div>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-full p-1 bg-muted">
                            <TrendingUp className="h-5 w-5 text-red-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Trending Community</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{community.description}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="destructive">
                    Join Community
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
