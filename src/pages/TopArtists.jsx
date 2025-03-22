"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Users, Trophy, TrendingUp, Filter, Calendar, Image, Heart, Crown, Palette, BookOpen, PenTool, Brush } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

export default function TopArtists() {
  const [timeframe, setTimeframe] = useState("week");
  const [category, setCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Top artists data
  const topArtists = [
    {
      id: 1,
      rank: 1,
      name: "Liam Parker",
      username: "@liamparker",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop",
      level: 32,
      specialty: "Digital Illustration",
      bio: "Award-winning digital artist specializing in fantasy and sci-fi illustrations. Creating immersive worlds and characters for over 10 years.",
      stats: {
        followers: 24567,
        likes: 187432,
        artworks: 342,
        challenges: 28,
        wins: 12,
      },
      badges: ["Master Illustrator", "Challenge Champion", "Community Leader"],
      featured: true,
      trending: true,
      categories: ["illustration", "digital"],
      featuredArtwork: {
        title: "Ethereal Forest",
        imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop",
        likes: 2547,
      },
    },
    {
      id: 2,
      rank: 2,
      name: "Zoe Chen",
      username: "@zoechen",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
      level: 29,
      specialty: "Character Design",
      bio: "Character designer and concept artist with a passion for creating unique personalities through art. My work focuses on diversity and storytelling.",
      stats: {
        followers: 21345,
        likes: 156789,
        artworks: 287,
        challenges: 22,
        wins: 9,
      },
      badges: ["Character Master", "Style Innovator", "Rising Star"],
      featured: true,
      trending: true,
      categories: ["illustration", "character", "digital"],
      featuredArtwork: {
        title: "Cyberpunk Hero",
        imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
        likes: 2103,
      },
    },
    {
      id: 3,
      rank: 3,
      name: "Hiroshi Tanaka",
      username: "@hiroshitanaka",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
      level: 28,
      specialty: "Manga Artist",
      bio: "Manga artist with 15 years of experience. My work blends traditional Japanese manga styles with contemporary themes and storytelling techniques.",
      stats: {
        followers: 19876,
        likes: 143256,
        artworks: 256,
        challenges: 19,
        wins: 7,
      },
      badges: ["Manga Expert", "Storyteller", "Traditional Master"],
      featured: false,
      trending: true,
      categories: ["manga", "traditional"],
      featuredArtwork: {
        title: "Moonlit Wanderer",
        imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=1000&auto=format&fit=crop",
        likes: 1876,
      },
    },
    {
      id: 4,
      rank: 4,
      name: "Emma Waters",
      username: "@emmawaters",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
      level: 26,
      specialty: "Environmental Art",
      bio: "Environmental artist specializing in landscapes and natural scenes. My work explores the beauty and fragility of our natural world.",
      stats: {
        followers: 17654,
        likes: 132456,
        artworks: 231,
        challenges: 17,
        wins: 5,
      },
      badges: ["Nature Specialist", "Color Master", "Detail Expert"],
      featured: true,
      trending: false,
      categories: ["illustration", "landscape", "digital"],
      featuredArtwork: {
        title: "Ocean Dreams",
        imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop",
        likes: 1654,
      },
    },
    {
      id: 5,
      rank: 5,
      name: "Marcus Reed",
      username: "@marcusreed",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      level: 25,
      specialty: "Novel Writer",
      bio: "Author and illustrator creating fantasy worlds through both words and images. My work focuses on immersive storytelling and character development.",
      stats: {
        followers: 15432,
        likes: 121345,
        artworks: 198,
        challenges: 15,
        wins: 4,
      },
      badges: ["Storyteller", "World Builder", "Creative Writer"],
      featured: false,
      trending: true,
      categories: ["novel", "fantasy"],
      featuredArtwork: {
        title: "The Last Guardian",
        imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1000&auto=format&fit=crop",
        likes: 1432,
      },
    },
    {
      id: 6,
      rank: 6,
      name: "Yuki Sato",
      username: "@yukisato",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
      level: 24,
      specialty: "Traditional Art",
      bio: "Traditional artist working with watercolors and ink. My work is inspired by Japanese culture and the natural world.",
      stats: {
        followers: 14321,
        likes: 109876,
        artworks: 176,
        challenges: 14,
        wins: 3,
      },
      badges: ["Traditional Master", "Cultural Heritage", "Technique Expert"],
      featured: true,
      trending: false,
      categories: ["traditional", "illustration"],
      featuredArtwork: {
        title: "Sakura Dreams",
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
        likes: 1321,
      },
    },
  ];

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Specialties" },
    { value: "illustration", label: "Illustrators" },
    { value: "manga", label: "Manga Artists" },
    { value: "novel", label: "Novel Writers" },
    { value: "digital", label: "Digital Artists" },
    { value: "traditional", label: "Traditional Artists" },
    { value: "character", label: "Character Designers" },
  ];

  // Timeframes for filtering
  const timeframes = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

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

  // Helper function to get specialty icon
  const getSpecialtyIcon = (specialty) => {
    if (specialty.includes("Illustration")) return <Palette className="h-4 w-4 text-primary" />;
    if (specialty.includes("Character")) return <PenTool className="h-4 w-4 text-blue-500" />;
    if (specialty.includes("Manga")) return <BookOpen className="h-4 w-4 text-purple-500" />;
    if (specialty.includes("Environmental")) return <Image className="h-4 w-4 text-green-500" />;
    if (specialty.includes("Novel")) return <BookOpen className="h-4 w-4 text-amber-500" />;
    if (specialty.includes("Traditional")) return <Brush className="h-4 w-4 text-orange-500" />;
    return <Palette className="h-4 w-4" />;
  };

  // Filter artists based on selected category and tab
  const filteredArtists = topArtists
    .filter((artist) => {
      if (category === "all") return true;
      return artist.categories.includes(category);
    })
    .filter((artist) => {
      if (activeTab === "all") return true;
      if (activeTab === "trending") return artist.trending;
      if (activeTab === "featured") return artist.featured;
      return true;
    });

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-yellow-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
              <div>
                <CardTitle className="text-2xl">Top Artists</CardTitle>
                <CardDescription>The most popular artists on the platform</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="mb-4" />
      </Card>

      {/* Top Artist Spotlight (Rank #1) */}
      {filteredArtists.length > 0 && (
        <Card className="overflow-hidden border-none shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <img src={filteredArtists[0].featuredArtwork.imageUrl || "/placeholder.svg"} alt={filteredArtists[0].featuredArtwork.title} className="w-full h-full object-cover min-h-[300px]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent md:hidden"></div>
              <div className="absolute bottom-4 left-4 md:hidden">
                <Badge className={`${getRankBadgeStyle(1)} px-3 py-1`}>
                  <Crown className="h-3 w-3 mr-1" />
                  #1 Top Artist
                </Badge>
              </div>
            </div>

            <div className="md:col-span-2 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRankBadgeStyle(1)} px-3 py-1 hidden md:flex`}>
                      <Crown className="h-3 w-3 mr-1" />
                      #1 Top Artist
                    </Badge>
                    {filteredArtists[0].trending && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-blue-500">
                    <AvatarImage src={filteredArtists[0].avatar} alt={filteredArtists[0].name} />
                    <AvatarFallback>{filteredArtists[0].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{filteredArtists[0].name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{filteredArtists[0].username}</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        Level {filteredArtists[0].level}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1">
                      {getSpecialtyIcon(filteredArtists[0].specialty)}
                      <span className="ml-1 text-sm">{filteredArtists[0].specialty}</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{filteredArtists[0].bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {filteredArtists[0].badges.map((badge, index) => (
                    <Badge key={index} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Separator className="mb-4" />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{filteredArtists[0].stats.followers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{filteredArtists[0].stats.likes.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{filteredArtists[0].stats.artworks}</p>
                    <p className="text-sm text-muted-foreground">Artworks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{filteredArtists[0].stats.challenges}</p>
                    <p className="text-sm text-muted-foreground">Challenges</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{filteredArtists[0].stats.wins}</p>
                    <p className="text-sm text-muted-foreground">Wins</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">View Profile</Button>
                  <Button variant="outline">Message</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.slice(1).map((artist) => (
          <Card key={artist.id} className="overflow-hidden h-full flex flex-col">
            <div className="relative h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
              <div className="absolute top-2 left-2">
                <Badge className={`${getRankBadgeStyle(artist.rank)} px-2 py-1`}>#{artist.rank}</Badge>
              </div>
              {artist.trending && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-transparent">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                </div>
              )}
              <div className="absolute -bottom-10 left-4">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage src={artist.avatar} alt={artist.name} />
                  <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardContent className="pt-12 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground">{artist.username}</p>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  Level {artist.level}
                </Badge>
              </div>

              <div className="flex items-center mt-2">
                {getSpecialtyIcon(artist.specialty)}
                <span className="ml-1 text-sm">{artist.specialty}</span>
              </div>

              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{artist.bio}</p>

              <div className="flex flex-wrap gap-1 mt-3">
                {artist.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="font-bold">{artist.stats.followers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="font-bold">{artist.stats.artworks}</p>
                  <p className="text-xs text-muted-foreground">Artworks</p>
                </div>
                <div>
                  <p className="font-bold">{artist.stats.wins}</p>
                  <p className="text-xs text-muted-foreground">Wins</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <img src={artist.featuredArtwork.imageUrl || "/placeholder.svg"} alt={artist.featuredArtwork.title} className="w-16 h-16 object-cover rounded-md" />
                <div className="text-sm">
                  <p className="font-medium">Featured Work</p>
                  <p className="text-xs text-muted-foreground">{artist.featuredArtwork.title}</p>
                  <div className="flex items-center mt-1">
                    <Heart className="h-3 w-3 text-primary mr-1" />
                    <span className="text-xs">{artist.featuredArtwork.likes.toLocaleString()} likes</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1">
                  View Profile
                </Button>
                <Button className="flex-1">Follow</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Artist Leaderboard */}
      <Card className="border-t-4 border-t-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            Artist Leaderboard
          </CardTitle>
          <CardDescription>Top performers based on engagement and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 mx-4">
              {topArtists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 text-center font-bold">
                      {artist.rank === 1 ? (
                        <span className="text-yellow-500">1</span>
                      ) : artist.rank === 2 ? (
                        <span className="text-gray-400">2</span>
                      ) : artist.rank === 3 ? (
                        <span className="text-amber-700">3</span>
                      ) : (
                        <span className="text-muted-foreground">{artist.rank}</span>
                      )}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={artist.avatar} alt={artist.name} />
                      <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{artist.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{artist.specialty}</span>
                        <span className="mx-1">•</span>
                        <span>Level {artist.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">{artist.stats.followers.toLocaleString()} followers</p>
                      <p className="text-xs text-muted-foreground">{artist.stats.wins} challenge wins</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
