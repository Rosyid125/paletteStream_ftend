import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Trophy, Calendar, Clock, Users, Award, CheckCircle2, ArrowRight, Star, Crown, Medal } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Challenges() {
  const [activeTab, setActiveTab] = useState("active");

  const activeChallenges = [
    {
      id: 1,
      title: "Mythology Reimagined",
      description: "Create artwork inspired by myths and legends from around the world. Reimagine mythological characters or scenes in your unique style.",
      category: "Illustration",
      deadline: "5 days left",
      participants: 234,
      prize: "2000 XP + Mythologist Badge",
      coverImage: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=1000&auto=format&fit=crop",
      topEntries: [
        {
          id: 101,
          title: "Medusa's Gaze",
          artist: "Elena Frost",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=200&auto=format&fit=crop",
          votes: 87,
        },
        {
          id: 102,
          title: "Thor's Journey",
          artist: "Marcus Reed",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1614957004131-9e8f2a13123c?q=80&w=200&auto=format&fit=crop",
          votes: 76,
        },
      ],
    },
    {
      id: 2,
      title: "Character Design Challenge",
      description: "Design an original character with a detailed backstory. Focus on personality traits that are reflected in the visual design.",
      category: "Character Design",
      deadline: "2 days left",
      participants: 187,
      prize: "1500 XP + Character Creator Badge",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
      topEntries: [
        {
          id: 201,
          title: "Aria the Explorer",
          artist: "Takeshi Yamada",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
          votes: 92,
        },
      ],
    },
    {
      id: 3,
      title: "Futuristic Cityscape",
      description: "Envision a city of the future. Consider technology, architecture, transportation, and daily life in your design.",
      category: "Environment Design",
      deadline: "7 days left",
      participants: 156,
      prize: "1800 XP + Visionary Badge",
      coverImage: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
      topEntries: [],
    },
  ];

  const upcomingChallenges = [
    {
      id: 4,
      title: "Emotions in Motion",
      description: "Create a piece that captures a complex emotion through character expression, composition, and color.",
      category: "Illustration",
      startDate: "Starts in 3 days",
      duration: "2 weeks",
      prize: "2200 XP + Empath Badge",
    },
    {
      id: 5,
      title: "Manga Panel Challenge",
      description: "Design a compelling manga panel that tells a story in a single frame.",
      category: "Manga",
      startDate: "Starts in 5 days",
      duration: "10 days",
      prize: "1700 XP + Manga Master Badge",
    },
  ];

  const pastChallenges = [
    {
      id: 6,
      title: "Fantasy Landscapes",
      description: "Create an immersive fantasy landscape that tells a story.",
      category: "Environment Design",
      participants: 312,
      winner: {
        name: "Mika Chen",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
        artwork: "Floating Islands of Avalon",
        thumbnail: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&auto=format&fit=crop",
      },
    },
    {
      id: 7,
      title: "Character Expressions",
      description: "Showcase a character displaying a range of emotions.",
      category: "Character Design",
      participants: 245,
      winner: {
        name: "Kai Nakamura",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
        artwork: "The Many Faces of Kira",
        thumbnail: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=200&auto=format&fit=crop",
      },
    },
  ];

  const yourChallenges = [
    {
      id: 101,
      title: "Mythology Reimagined",
      status: "In Progress",
      deadline: "5 days left",
      progress: 60,
      tasks: [
        { id: 1, title: "Submit initial concept", completed: true },
        { id: 2, title: "Complete rough draft", completed: true },
        { id: 3, title: "Finalize artwork", completed: false },
        { id: 4, title: "Submit final entry", completed: false },
      ],
    },
    {
      id: 102,
      title: "Character Design Challenge",
      status: "Not Started",
      deadline: "2 days left",
      progress: 0,
      tasks: [
        { id: 1, title: "Submit initial concept", completed: false },
        { id: 2, title: "Complete character design", completed: false },
        { id: 3, title: "Write character backstory", completed: false },
        { id: 4, title: "Submit final entry", completed: false },
      ],
    },
  ];

  const leaderboard = [
    {
      id: 1,
      name: "Mika Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
      level: 24,
      wins: 12,
      badges: 8,
    },
    {
      id: 2,
      name: "Takeshi Yamada",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
      level: 22,
      wins: 9,
      badges: 7,
    },
    {
      id: 3,
      name: "Elena Frost",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
      level: 20,
      wins: 7,
      badges: 6,
    },
    {
      id: 4,
      name: "Marcus Reed",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      level: 19,
      wins: 6,
      badges: 5,
    },
    {
      id: 5,
      name: "Sofia Martinez",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      level: 18,
      wins: 5,
      badges: 4,
    },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case "Illustration":
        return "text-primary bg-primary/10 hover:bg-primary/20";
      case "Character Design":
        return "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
      case "Environment Design":
        return "text-green-500 bg-green-500/10 hover:bg-green-500/20";
      case "Manga":
        return "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
      default:
        return "text-primary bg-primary/10 hover:bg-primary/20";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-blue-500 bg-blue-500/10";
      case "Not Started":
        return "text-amber-500 bg-amber-500/10";
      case "Completed":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-4 md:p-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Main Challenge Content */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 text-primary mr-2" />
                Challenges
              </CardTitle>
              <Button>Create Challenge</Button>
            </div>
            <CardDescription>Compete with other artists and earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-0">
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>

              {/* Active Challenges Tab */}
              <TabsContent value="active" className="space-y-6 mt-6">
                {activeChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden group">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={challenge.coverImage || "/placeholder.svg"} alt={challenge.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className={`${getCategoryColor(challenge.category)} border-transparent text-white`}>
                            {challenge.category}
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-2 text-sm text-white/80 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {challenge.deadline}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Time remaining to submit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    <CardContent className="pt-4">
                      <p className="text-muted-foreground">{challenge.description}</p>

                      <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-muted-foreground mr-1" />
                                <span className="text-sm text-muted-foreground">{challenge.participants} participants</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of artists participating</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <Award className="h-4 w-4 text-primary mr-1" />
                                <span className="text-sm font-medium">{challenge.prize}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Prize for winning the challenge</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {challenge.topEntries.length > 0 && (
                        <div className="mt-4">
                          <Accordion type="single" collapsible>
                            <AccordionItem value="top-entries" className="border-none">
                              <AccordionTrigger className="py-2 text-sm font-medium">Top Entries</AccordionTrigger>
                              <AccordionContent>
                                <ScrollArea className="whitespace-nowrap pb-2" orientation="horizontal">
                                  <div className="flex space-x-4">
                                    {challenge.topEntries.map((entry) => (
                                      <div key={entry.id} className="flex-shrink-0 w-28">
                                        <HoverCard>
                                          <HoverCardTrigger asChild>
                                            <div className="relative h-28 w-28 rounded-md overflow-hidden cursor-pointer">
                                              <img src={entry.thumbnail || "/placeholder.svg"} alt={entry.title} className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" />
                                            </div>
                                          </HoverCardTrigger>
                                          <HoverCardContent className="w-80">
                                            <div className="space-y-2">
                                              <img src={entry.thumbnail || "/placeholder.svg"} alt={entry.title} className="object-cover w-full h-40 rounded-md" />
                                              <h4 className="font-semibold">{entry.title}</h4>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                  <Avatar className="h-6 w-6 mr-2">
                                                    <AvatarImage src={entry.avatar} />
                                                    <AvatarFallback>{entry.artist.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                  <span>{entry.artist}</span>
                                                </div>
                                                <div className="flex items-center">
                                                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                                  <span>{entry.votes} votes</span>
                                                </div>
                                              </div>
                                            </div>
                                          </HoverCardContent>
                                        </HoverCard>
                                        <div className="mt-1">
                                          <div className="flex items-center">
                                            <Avatar className="h-4 w-4 mr-1">
                                              <AvatarImage src={entry.avatar} />
                                              <AvatarFallback>{entry.artist.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs truncate">{entry.artist}</span>
                                          </div>
                                          <div className="flex items-center text-xs text-muted-foreground">
                                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                            {entry.votes} votes
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline">View Details</Button>
                      <Button>Join Challenge</Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>

              {/* Upcoming Challenges Tab */}
              <TabsContent value="upcoming" className="space-y-6 mt-6">
                {upcomingChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden group border-l-4" style={{ borderLeftColor: challenge.category === "Illustration" ? "#ef4444" : "#8b5cf6" }}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{challenge.title}</CardTitle>
                          <CardDescription>{challenge.category}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {challenge.startDate}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{challenge.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-muted-foreground">Duration: {challenge.duration}</span>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm font-medium">{challenge.prize}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline">View Details</Button>
                      <Button variant="secondary">Set Reminder</Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>

              {/* Past Challenges Tab */}
              <TabsContent value="past" className="space-y-6 mt-6">
                {pastChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden group border-l-4" style={{ borderLeftColor: challenge.category === "Environment Design" ? "#22c55e" : "#3b82f6" }}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{challenge.title}</CardTitle>
                          <CardDescription>{challenge.category}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{challenge.description}</p>
                      <div className="flex items-center mt-4">
                        <Users className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm text-muted-foreground">{challenge.participants} participants</span>
                      </div>

                      <div className="mt-4 p-4 rounded-lg bg-muted/50">
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                          Winner
                        </h4>
                        <div className="flex items-center">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3 cursor-pointer">
                                <img src={challenge.winner.thumbnail || "/placeholder.svg"} alt={challenge.winner.artwork} className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <img src={challenge.winner.thumbnail || "/placeholder.svg"} alt={challenge.winner.artwork} className="object-cover w-full h-40 rounded-md" />
                                <h4 className="font-semibold">{challenge.winner.artwork}</h4>
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={challenge.winner.avatar} />
                                    <AvatarFallback>{challenge.winner.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span>{challenge.winner.name}</span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div>
                            <h5 className="font-medium">{challenge.winner.artwork}</h5>
                            <div className="flex items-center mt-1">
                              <Avatar className="h-4 w-4 mr-1">
                                <AvatarImage src={challenge.winner.avatar} />
                                <AvatarFallback>{challenge.winner.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{challenge.winner.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline">View All Entries</Button>
                      <Button variant="secondary">View Winner's Profile</Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="mt-1"></div>
          </CardFooter>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Your Challenges */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Medal className="h-5 w-5 text-blue-500 mr-2" />
              Your Challenges
            </CardTitle>
            <CardDescription>Track your participation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {yourChallenges.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {yourChallenges.map((challenge) => (
                    <Card key={challenge.id} className="overflow-hidden shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{challenge.title}</h3>
                          <Badge variant="outline" className={getStatusColor(challenge.status)}>
                            {challenge.status}
                          </Badge>
                        </div>

                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <Progress value={challenge.progress} className={`h-2 ${challenge.progress > 0 ? "bg-blue-100" : ""}`} />
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="tasks" className="border-b-0">
                            <AccordionTrigger className="py-2 text-xs font-medium">Tasks</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1">
                                {challenge.tasks.map((task) => (
                                  <div key={task.id} className="flex items-center text-xs">
                                    {task.completed ? <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground mr-1" />}
                                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {challenge.deadline}
                          </span>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                            Continue
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium">No Active Challenges</h3>
                <p className="text-sm text-muted-foreground mt-1">Join a challenge to start competing!</p>
                <Button className="mt-4">Browse Challenges</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-t-4 border-t-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              Challenge Leaderboard
            </CardTitle>
            <CardDescription>Top performers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 text-center font-bold">
                        {index === 0 ? (
                          <span className="text-yellow-500">1</span>
                        ) : index === 1 ? (
                          <span className="text-gray-400">2</span>
                        ) : index === 2 ? (
                          <span className="text-amber-700">3</span>
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Avatar className="cursor-pointer">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{user.name}</h4>
                              <p className="text-sm">Level {user.level} Artist</p>
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
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Level {user.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{user.wins} wins</p>
                      <p className="text-xs text-muted-foreground">{user.badges} badges</p>
                    </div>
                  </div>
                ))}

                <Separator className="my-2" />

                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 text-center font-bold">
                      <span className="text-muted-foreground">24</span>
                    </div>
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" />
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">You</p>
                      <p className="text-xs text-muted-foreground">Level 7</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">1 win</p>
                    <p className="text-xs text-muted-foreground">3 badges</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Full Leaderboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
