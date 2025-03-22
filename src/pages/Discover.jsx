"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Heart } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Discover() {
  const [activeTab, setActiveTab] = useState("artworks");

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

  const featuredArtists = [
    {
      id: 1,
      name: "Kai Nakamura",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
      bio: "Digital Illustration",
      level: 15,
    },
    {
      id: 2,
      name: "Sofia Martinez",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      bio: "Character Design",
      level: 22,
    },
    {
      id: 3,
      name: "Alex Kim",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      bio: "Manga Artist",
      level: 19,
    },
    {
      id: 4,
      name: "Emily Johnson",
      avatar: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=100&auto=format&fit=crop",
      bio: "Concept Art",
      level: 18,
    },
    {
      id: 5,
      name: "David Rodriguez",
      avatar: "https://images.unsplash.com/photo-1521119989659-a83eee242995?q=80&w=100&auto=format&fit=crop",
      bio: "Traditional Painting",
      level: 20,
    },
    {
      id: 6,
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=100&auto=format&fit=crop",
      bio: "Anime Art",
      level: 24,
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
    <div className="grid grid-cols-1 space-y-6 p-4 md:p-6">
      {/* Search and Filter Section */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle>Discover</CardTitle>
          <CardDescription>Find new artworks, and artists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search for artworks, artists, type, or tags..." className="pl-10" />
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Popular Tags</h3>
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex gap-2">
                {popularTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="artworks" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
        </TabsList>

        {/* Artworks Tab */}
        <TabsContent value="artworks" className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArtworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden group h-full flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className={getTypeColor(artwork.type)}>
                      {artwork.type.charAt(0).toUpperCase() + artwork.type.slice(1)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 flex-grow">
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
                            <Heart className="h-4 w-4 mr-1 fill-primary text-primary" />
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
          <div className="space-y-4">
            {featuredArtists.map((artist) => (
              <Card key={artist.id} className="overflow-hidden">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={artist.avatar} alt={artist.name} />
                      <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-medium">{artist.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">{artist.bio}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline">View Profile</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
