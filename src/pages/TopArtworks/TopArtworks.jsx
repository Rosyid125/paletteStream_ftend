"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Share2, Bookmark, Trophy, TrendingUp, Calendar, Filter, Eye, Crown } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

export default function TopArtworks() {
  const [timeframe, setTimeframe] = useState("week");
  const [category, setCategory] = useState("all");

  // Top artworks data
  const topArtworks = [
    {
      id: 1,
      rank: 1,
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
        views: 15243,
      },
      tags: ["fantasy", "landscape", "digital"],
      trending: true,
      featured: true,
    },
    {
      id: 2,
      rank: 2,
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
        views: 12876,
      },
      tags: ["scifi", "cyberpunk", "digital"],
      trending: true,
      featured: false,
    },
    {
      id: 3,
      rank: 3,
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
        views: 10543,
      },
      tags: ["manga", "character", "fantasy"],
      trending: false,
      featured: true,
    },
    {
      id: 4,
      rank: 4,
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
        views: 9876,
      },
      tags: ["landscape", "digital", "ocean"],
      trending: false,
      featured: false,
    },
    {
      id: 5,
      rank: 5,
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
        views: 8765,
      },
      tags: ["novel", "fantasy", "adventure"],
      trending: true,
      featured: false,
    },
    {
      id: 6,
      rank: 6,
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
        views: 7654,
      },
      tags: ["traditional", "japanese", "nature"],
      trending: false,
      featured: true,
    },
  ];

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "illustration", label: "Illustrations" },
    { value: "manga", label: "Manga" },
    { value: "novel", label: "Novels" },
    { value: "digital", label: "Digital Art" },
    { value: "traditional", label: "Traditional Art" },
  ];

  // Timeframes for filtering
  const timeframes = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

  // Helper function to get type color
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

  // Helper function to get rank badge style
  const getRankBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-300 text-gray-800";
      case 3:
        return "bg-amber-700 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Filter artworks based on selected category
  const filteredArtworks = category === "all" ? topArtworks : topArtworks.filter((artwork) => artwork.type === category || artwork.tags.includes(category));

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-yellow-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
              <div>
                <CardTitle className="text-2xl">Top Artworks</CardTitle>
                <CardDescription>The most popular artworks on the platform</CardDescription>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    {categories.find((c) => c.value === category)?.label || "Category"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                    {categories.map((cat) => (
                      <DropdownMenuRadioItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Timeframe Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Calendar className="h-4 w-4 mr-2" />
                    {timeframes.find((t) => t.value === timeframe)?.label || "Timeframe"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuRadioGroup value={timeframe} onValueChange={setTimeframe}>
                    {timeframes.map((time) => (
                      <DropdownMenuRadioItem key={time.value} value={time.value}>
                        {time.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <div className="mb-4" />
      </Card>

      {/* Featured Artwork (Top 1) */}
      {filteredArtworks.length > 0 && (
        <Card className="overflow-hidden border-none shadow-md">
          <div className="relative">
            <img src={filteredArtworks[0].imageUrl || "/placeholder.svg"} alt={filteredArtworks[0].title} className="w-full h-[300px] md:h-[400px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getRankBadgeStyle(1)} px-3 py-1`}>
                    <Crown className="h-3 w-3 mr-1" />
                    #1 Top Artwork
                  </Badge>
                  <Badge variant="outline" className={getTypeColor(filteredArtworks[0].type)}>
                    {filteredArtworks[0].type.charAt(0).toUpperCase() + filteredArtworks[0].type.slice(1)}
                  </Badge>
                  {filteredArtworks[0].trending && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{filteredArtworks[0].title}</h2>

                <div className="flex items-center gap-3 mb-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={filteredArtworks[0].author.avatar} alt={filteredArtworks[0].author.name} />
                          <AvatarFallback>{filteredArtworks[0].author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-white font-medium">{filteredArtworks[0].author.name}</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src={filteredArtworks[0].author.avatar} />
                          <AvatarFallback>{filteredArtworks[0].author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">{filteredArtworks[0].author.name}</h4>
                          <p className="text-sm">Level {filteredArtworks[0].author.level} Artist</p>
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

                <div className="flex flex-wrap gap-4 text-white">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 fill-primary text-primary" />
                    <span>{filteredArtworks[0].stats.likes.toLocaleString()} likes</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{filteredArtworks[0].stats.comments.toLocaleString()} comments</span>
                  </div>
                  <div className="flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    <span>{filteredArtworks[0].stats.shares.toLocaleString()} shares</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{filteredArtworks[0].stats.views.toLocaleString()} views</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="bg-white text-black hover:bg-white/90">View Artwork</Button>
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top Artworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.slice(1).map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden group h-full flex flex-col">
            <div className="relative">
              <img src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} className="aspect-[4/3] w-full object-cover" />
              <div className="absolute top-2 left-2">
                <Badge className={`${getRankBadgeStyle(artwork.rank)} px-2 py-1`}>#{artwork.rank}</Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className={`${getTypeColor(artwork.type)} border-transparent text-white`}>
                  {artwork.type.charAt(0).toUpperCase() + artwork.type.slice(1)}
                </Badge>
              </div>
              {artwork.trending && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="outline" className="bg-primary/20 text-white border-transparent">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4 flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{artwork.title}</h3>
              </div>

              <div className="flex items-center mt-2">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
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
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {artwork.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1 fill-primary text-primary" />
                  <span>{artwork.stats.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>{artwork.stats.comments.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{artwork.stats.views.toLocaleString()}</span>
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
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Like artwork</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save artwork</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            Artwork Statistics
          </CardTitle>
          <CardDescription>Insights about the top performing artworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Most Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Illustration</span>
                      <span>42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Digital Art</span>
                      <span>28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Manga</span>
                      <span>18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Traditional Art</span>
                      <span>12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/10 text-primary px-3 py-1">
                    #fantasy <span className="ml-1 opacity-70">1.2k</span>
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-500 px-3 py-1">
                    #digital <span className="ml-1 opacity-70">987</span>
                  </Badge>
                  <Badge className="bg-green-500/10 text-green-500 px-3 py-1">
                    #landscape <span className="ml-1 opacity-70">876</span>
                  </Badge>
                  <Badge className="bg-purple-500/10 text-purple-500 px-3 py-1">
                    #character <span className="ml-1 opacity-70">754</span>
                  </Badge>
                  <Badge className="bg-amber-500/10 text-amber-500 px-3 py-1">
                    #anime <span className="ml-1 opacity-70">632</span>
                  </Badge>
                  <Badge className="bg-cyan-500/10 text-cyan-500 px-3 py-1">
                    #scifi <span className="ml-1 opacity-70">521</span>
                  </Badge>
                  <Badge className="bg-pink-500/10 text-pink-500 px-3 py-1">
                    #portrait <span className="ml-1 opacity-70">498</span>
                  </Badge>
                  <Badge className="bg-indigo-500/10 text-indigo-500 px-3 py-1">
                    #fanart <span className="ml-1 opacity-70">432</span>
                  </Badge>
                  <Badge className="bg-orange-500/10 text-orange-500 px-3 py-1">
                    #traditional <span className="ml-1 opacity-70">387</span>
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-500 px-3 py-1">
                    #concept <span className="ml-1 opacity-70">321</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
