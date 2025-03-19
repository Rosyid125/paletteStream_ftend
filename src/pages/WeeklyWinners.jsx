"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Trophy, Calendar, ChevronLeft, ChevronRight, Heart, MessageCircle, Bookmark, Award, Crown, Medal, Clock, Users } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WeeklyWinners() {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Weekly challenges data
  const weeklyData = [
    {
      week: "Current Week",
      date: "May 15 - May 21, 2023",
      theme: "Fantasy Worlds",
      description: "Create an immersive fantasy world with unique landscapes, creatures, or architecture.",
      participants: 342,
      status: "active",
      timeRemaining: "3 days left",
      winners: [
        {
          rank: 1,
          title: "Ethereal Forest",
          artist: {
            name: "Liam Parker",
            avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop",
            level: 16,
          },
          imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop",
          votes: 876,
          comments: 124,
          type: "illustration",
        },
        {
          rank: 2,
          title: "Crystal Kingdom",
          artist: {
            name: "Emma Waters",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
            level: 19,
          },
          imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop",
          votes: 754,
          comments: 98,
          type: "illustration",
        },
        {
          rank: 3,
          title: "Dragon's Realm",
          artist: {
            name: "Marcus Reed",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
            level: 21,
          },
          imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1000&auto=format&fit=crop",
          votes: 687,
          comments: 87,
          type: "illustration",
        },
      ],
    },
    {
      week: "Previous Week",
      date: "May 8 - May 14, 2023",
      theme: "Character Design",
      description: "Design an original character with a detailed backstory and unique visual elements.",
      participants: 287,
      status: "completed",
      winners: [
        {
          rank: 1,
          title: "Cyberpunk Hero",
          artist: {
            name: "Zoe Chen",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
            level: 23,
          },
          imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
          votes: 912,
          comments: 143,
          type: "illustration",
        },
        {
          rank: 2,
          title: "Forest Guardian",
          artist: {
            name: "Yuki Sato",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
            level: 25,
          },
          imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
          votes: 843,
          comments: 112,
          type: "illustration",
        },
        {
          rank: 3,
          title: "Moonlit Wanderer",
          artist: {
            name: "Hiroshi Tanaka",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
            level: 28,
          },
          imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=1000&auto=format&fit=crop",
          votes: 765,
          comments: 98,
          type: "manga",
        },
      ],
    },
    {
      week: "Two Weeks Ago",
      date: "May 1 - May 7, 2023",
      theme: "Urban Landscapes",
      description: "Capture the essence of city life through urban landscapes and cityscapes.",
      participants: 256,
      status: "completed",
      winners: [
        {
          rank: 1,
          title: "Neon City",
          artist: {
            name: "Marcus Reed",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
            level: 21,
          },
          imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
          votes: 876,
          comments: 132,
          type: "illustration",
        },
        {
          rank: 2,
          title: "Rainy Streets",
          artist: {
            name: "Emma Waters",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
            level: 19,
          },
          imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop",
          votes: 798,
          comments: 104,
          type: "illustration",
        },
        {
          rank: 3,
          title: "Morning Commute",
          artist: {
            name: "Liam Parker",
            avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop",
            level: 16,
          },
          imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
          votes: 723,
          comments: 87,
          type: "illustration",
        },
      ],
    },
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

  // Helper function to get rank icon
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-3 w-3 mr-1" />;
      case 2:
        return <Medal className="h-3 w-3 mr-1" />;
      case 3:
        return <Award className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const currentWeekData = weeklyData[currentWeek];

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-amber-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-amber-500 mr-2" />
              <div>
                <CardTitle className="text-2xl">Weekly Winners</CardTitle>
                <CardDescription>Celebrating the best artwork from our weekly challenges</CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(Math.min(currentWeek + 1, weeklyData.length - 1))} disabled={currentWeek >= weeklyData.length - 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(Math.max(currentWeek - 1, 0))} disabled={currentWeek <= 0}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="mb-4" />
      </Card>

      {/* Current Week Challenge */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {currentWeekData.date}
                </Badge>
                {currentWeekData.status === "active" && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentWeekData.timeRemaining}
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-2 text-xl md:text-2xl">Challenge: {currentWeekData.theme}</CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{currentWeekData.participants} participants</span>
              </div>

              {currentWeekData.status === "active" ? <Button>Join Challenge</Button> : <Button variant="outline">View All Entries</Button>}
            </div>
          </div>
          <CardDescription className="mt-2">{currentWeekData.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Trophy className="h-5 w-5 text-amber-500 mr-2" />
            {currentWeekData.status === "active" ? "Current Leaders" : "Winners"}
          </h3>

          {/* Top Winner (Rank #1) */}
          {currentWeekData.winners.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <img src={currentWeekData.winners[0].imageUrl || "/placeholder.svg"} alt={currentWeekData.winners[0].title} className="w-full h-[300px] md:h-[400px] object-cover rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg">
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getRankBadgeStyle(1)} px-3 py-1`}>
                        <Crown className="h-3 w-3 mr-1" />
                        First Place
                      </Badge>
                      <Badge variant="outline" className={`${getTypeColor(currentWeekData.winners[0].type)} border-transparent text-white`}>
                        {currentWeekData.winners[0].type.charAt(0).toUpperCase() + currentWeekData.winners[0].type.slice(1)}
                      </Badge>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentWeekData.winners[0].title}</h2>

                    <div className="flex items-center gap-3 mb-4">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={currentWeekData.winners[0].artist.avatar} alt={currentWeekData.winners[0].artist.name} />
                              <AvatarFallback>{currentWeekData.winners[0].artist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-white font-medium">{currentWeekData.winners[0].artist.name}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage src={currentWeekData.winners[0].artist.avatar} />
                              <AvatarFallback>{currentWeekData.winners[0].artist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{currentWeekData.winners[0].artist.name}</h4>
                              <p className="text-sm">Level {currentWeekData.winners[0].artist.level} Artist</p>
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
                        <span>{currentWeekData.winners[0].votes} votes</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{currentWeekData.winners[0].comments} comments</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button className="bg-white text-black hover:bg-white/90">View Artwork</Button>
                      <Button variant="outline" className="text-white border-white hover:bg-white/20">
                        <Heart className="h-4 w-4 mr-2" />
                        Vote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Runners Up (Rank #2 and #3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentWeekData.winners.slice(1, 3).map((winner) => (
              <Card key={winner.rank} className="overflow-hidden group h-full flex flex-col">
                <div className="relative">
                  <img src={winner.imageUrl || "/placeholder.svg"} alt={winner.title} className="aspect-[4/3] w-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getRankBadgeStyle(winner.rank)} px-2 py-1`}>
                      {getRankIcon(winner.rank)}
                      {winner.rank === 2 ? "Second Place" : "Third Place"}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className={`${getTypeColor(winner.type)} border-transparent text-white`}>
                      {winner.type.charAt(0).toUpperCase() + winner.type.slice(1)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{winner.title}</h3>
                  </div>

                  <div className="flex items-center mt-2">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={winner.artist.avatar} alt={winner.artist.name} />
                            <AvatarFallback>{winner.artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{winner.artist.name}</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src={winner.artist.avatar} />
                            <AvatarFallback>{winner.artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{winner.artist.name}</h4>
                            <p className="text-sm">Level {winner.artist.level} Artist</p>
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

                  <Separator className="my-3" />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1 fill-primary text-primary" />
                      <span>{winner.votes} votes</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{winner.comments} comments</span>
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
                          <p>Vote for artwork</p>
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
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-6">
          <Button variant="outline" className="w-full md:w-auto">
            View All {currentWeekData.status === "active" ? "Entries" : "Winners"}
          </Button>
        </CardFooter>
      </Card>

      {/* Previous Challenges */}
      <Card className="border-t-4 border-t-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-500 mr-2" />
            Previous Challenges
          </CardTitle>
          <CardDescription>Browse past weekly challenges and their winners</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4 mx-4">
              {weeklyData.map((week, index) => (
                <Card key={index} className={`overflow-hidden cursor-pointer transition-colors hover:bg-muted/50 ${currentWeek === index ? "border-purple-500" : ""}`} onClick={() => setCurrentWeek(index)}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                            {week.date}
                          </Badge>
                          {week.status === "active" && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                              Active
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{week.theme}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{week.participants} participants</p>
                      </div>

                      {week.winners.length > 0 && (
                        <div className="flex -space-x-2 mt-2 md:mt-0">
                          {week.winners.slice(0, 3).map((winner, idx) => (
                            <Avatar key={idx} className={`h-8 w-8 border-2 ${idx === 0 ? "border-yellow-500" : idx === 1 ? "border-gray-300" : "border-amber-700"}`}>
                              <AvatarImage src={winner.artist.avatar} alt={winner.artist.name} />
                              <AvatarFallback>{winner.artist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
