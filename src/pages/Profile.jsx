import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Image, Trophy, Star, Award, Users, Heart, MessageCircle, Share2, Calendar, TrendingUp, CheckCircle2, Crown, MapPin, Globe, Bookmark } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useNavigate } from "react-router-dom"; // Import Link dan useNavigate
import api from "../api/axiosInstance"; // Import axios instance
import { useParams } from "react-router-dom"; // Import useParams

export default function Profile() {
  const navigate = useNavigate(); // Inisialisasi useNavigate

  // State untuk menyimpan data dari API
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [badges, setBadges] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [artworks, setArtworks] = useState(null);
  const [challengeHistory, setChallengeHistory] = useState(null);
  const [loading, setLoading] = useState(true); // Menambahkan state loading

  const [activeTab, setActiveTab] = useState("artworks");

  // useParams hook to get the userId from the URL
  const { userId } = useParams();

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/profiles/profile/${userId}`);
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Handle error (e.g., show error message)
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch user profile data when the component mounts or userId changes
  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Fungsi helper untuk mendapatkan jumlah followers dan following dengan aman
  const getCount = (arr) => {
    if (Array.isArray(arr) && arr.length > 0) {
      // Pastikan properti ada dan merupakan angka
      const countValue = arr[0][Object.keys(arr[0])[0]];
      return typeof countValue === "number" ? countValue : 0;
    }
    return 0;
  };

  const followerCount = getCount(userProfile?.followers);
  const followingCount = getCount(userProfile?.followings);

  // useEffect to set dummy data
  useEffect(() => {
    // Set dummy data for other states
    setUserStats({
      totalUploads: 150,
      totalLikes: 5200,
      totalComments: 800,
      challengesParticipated: 30,
      challengesWon: 5,
    });

    setBadges([
      { id: 1, name: "Early Bird", description: "Joined the platform early.", date: "2023-01-15", icon: "🐦" },
      { id: 2, name: "Art Lover", description: "Liked 50 artworks.", date: "2023-03-20", icon: "❤️" },
      { id: 3, name: "Commentator", description: "Made 100 comments.", date: "2023-05-10", icon: "💬" },
    ]);

    setAchievements([
      { id: 1, name: "First Upload", progress: 100, completed: true },
      { id: 2, name: "100 Likes", progress: 100, completed: true },
      { id: 3, name: "Participate in Challenge", progress: 100, completed: true },
      { id: 4, name: "Win Challenge", progress: 50, completed: false },
    ]);

    setArtworks([
      { id: 1, title: "Sunset Painting", imageUrl: "/placeholder.svg", type: "illustration", date: "2023-07-01", likes: 50, comments: 10 },
      { id: 2, title: "Manga Panel", imageUrl: "/placeholder.svg", type: "manga", date: "2023-07-15", likes: 30, comments: 5 },
      { id: 3, title: "Fantasy Novel Excerpt", imageUrl: "/placeholder.svg", type: "novel", date: "2023-08-01", likes: 70, comments: 20 },
    ]);

    setChallengeHistory([
      { id: 1, title: "Summer Art Challenge", artwork: "Seascape", result: "Top 10", date: "2023-06-20", thumbnail: "/placeholder.svg" },
      { id: 2, title: "Autumn Colors Challenge", artwork: "Fall Trees", result: "Winner", date: "2023-09-15", thumbnail: "/placeholder.svg" },
      { id: 3, title: "Winter Wonderland Challenge", artwork: "Snowy Village", result: "Top 10", date: "2023-12-24", thumbnail: "/placeholder.svg" },
    ]);
  }, []); // Empty dependency array ensures this runs only once

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

  const getResultColor = (result) => {
    switch (result) {
      case "Winner":
        return "bg-yellow-500/10 text-yellow-500";
      case "Top 10":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-muted-foreground/10";
    }
  };

  const handleFollowClick = () => {
    // Logika untuk mengikuti user
    alert(`Following ${userProfile.name}!`);
  };

  const handleMessageClick = () => {
    // Navigasi ke halaman pesan
    navigate("/messages");
  };

  const handleShareClick = (artworkId) => {
    // Logika untuk berbagi artwork
    alert(`Sharing artwork with ID: ${artworkId}!`);
  };

  const handleBookmarkClick = (artworkId) => {
    // Logika untuk menyimpan artwork
    alert(`Saving artwork with ID: ${artworkId}!`);
  };

  const handleViewAllChallengesClick = () => {
    // Navigasi ke halaman challenge
    navigate("/challenges");
  };

  const handleWebsiteClick = () => {
    window.open(`https://${userProfile.website}`, "_blank");
  };

  // Tampilkan pesan loading jika data sedang di-fetch
  if (loading) {
    return <div className="text-center">Loading profile...</div>;
  }

  // Tampilkan pesan error jika data gagal di-fetch
  if (!userProfile) {
    return <div className="text-center">Failed to load profile data. Please try again later.</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Profile Header */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md">
                <AvatarImage src={userProfile?.avatar} alt="Avatar" />
                <AvatarFallback>{userProfile?.username?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>

              <div className="mt-4 text-center md:text-left">
                <h2 className="text-2xl font-bold">{userProfile?.username}</h2>
                <p className="text-muted-foreground">@{userProfile?.username}</p>

                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Level {userProfile?.level}
                  </Badge>
                  <Badge variant="outline">Digital Artist</Badge>
                </div>

                <div className="flex mt-4 space-x-4">
                  <Button onClick={handleFollowClick}>Follow</Button>
                  <Button variant="outline" onClick={handleMessageClick}>
                    Message
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-6 md:mt-0">
              <div className="space-y-4">
                <p>{userProfile?.bio}</p>

                <div className="flex flex-wrap gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-sm cursor-pointer">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>
                            <strong>{followerCount}</strong> Followers
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>People following {userProfile?.username}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-sm cursor-pointer">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>
                            <strong>{followingCount}</strong> Following
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>People {userProfile?.username} follows</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Bagian ini dihilangkan karena tidak ada properti 'joined' di response */}
                  {/* <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>Joined {userProfile.joined}</span>
              </div> */}
                </div>

                <div className="flex flex-wrap gap-4">
                  {userProfile?.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{userProfile?.location}</span>
                    </div>
                  )}

                  {/* Bagian ini dihilangkan karena tidak ada properti 'website' di response */}
                  {/* {userProfile.website && (
                <div className="flex items-center text-sm cursor-pointer" onClick={handleWebsiteClick}>
                  <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-blue-500 hover:underline">{userProfile.website}</span>
                </div>
              )} */}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Level Progress</h3>
                  <div className="flex justify-between text-xs">
                    <span>Level {userProfile?.level}</span>
                    <span>
                      {userProfile?.exp} XP / {userProfile?.exp} XP {/* Sesuaikan dengan logika XP yang benar */}
                    </span>
                  </div>
                  {/* Nilai progress harus antara 0 dan 1 */}
                  <Progress value={userProfile?.exp / 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {/* Sesuaikan dengan logika XP yang benar */}
                    XP to Level {userProfile?.level + 1}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-muted/50 border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                <Image className="h-5 w-5 text-primary mb-1" />
                <span className="font-bold">{userStats?.totalUploads}</span>
                <span className="text-xs text-muted-foreground">Uploads</span>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                <Heart className="h-5 w-5 text-primary mb-1" />
                <span className="font-bold">{userStats?.totalLikes}</span>
                <span className="text-xs text-muted-foreground">Likes</span>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                <MessageCircle className="h-5 w-5 text-primary mb-1" />
                <span className="font-bold">{userStats?.totalComments}</span>
                <span className="text-xs text-muted-foreground">Comments</span>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                <Trophy className="h-5 w-5 text-primary mb-1" />
                <span className="font-bold">{userStats?.challengesParticipated}</span>
                <span className="text-xs text-muted-foreground">Challenges</span>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                <Crown className="h-5 w-5 text-yellow-500 mb-1" />
                <span className="font-bold">{userStats?.challengesWon}</span>
                <span className="text-xs text-muted-foreground">Wins</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="artworks" className="flex items-center">
            <Image className="h-4 w-4 mr-2" />
            Artworks
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Artworks Tab */}
        <TabsContent value="artworks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks?.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden group">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className={`${getTypeColor(artwork.type)} border-transparent text-white`}>
                      {artwork.type.charAt(0).toUpperCase() + artwork.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <h3 className="font-semibold text-white">{artwork.title}</h3>
                      <p className="text-xs text-white/80 mt-1">{artwork.date}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{artwork.title}</h3>
                    <p className="text-xs text-muted-foreground">{artwork.date}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-sm cursor-pointer">
                              <Heart className="h-4 w-4 mr-1 text-primary" />
                              <span>{artwork.likes}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{artwork.likes} likes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-sm cursor-pointer">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              <span>{artwork.comments}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{artwork.comments} comments</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShareClick(artwork.id)}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share artwork</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleBookmarkClick(artwork.id)}>
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save to collection</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 text-purple-500 mr-2" />
                Badges Earned
              </CardTitle>
              <CardDescription>Showcase of your achievements and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map((badge) => (
                  <HoverCard key={badge.id}>
                    <HoverCardTrigger asChild>
                      <Card className="overflow-hidden cursor-pointer hover:border-purple-200 transition-colors">
                        <CardContent className="p-4 flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-4">{badge.icon}</div>
                          <div>
                            <h3 className="font-medium">{badge.name}</h3>
                            <p className="text-xs text-muted-foreground">Earned on {badge.date}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-muted flex items-center justify-center">{badge.icon}</div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">{badge.name}</h4>
                          <p className="text-sm">{badge.description}</p>
                          <p className="text-xs text-muted-foreground">Earned on {badge.date}</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-6">
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 text-green-500 mr-2" />
                Achievements
              </CardTitle>
              <CardDescription>Track your progress towards goals</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {achievements?.map((achievement) => (
                    <Card key={achievement.id} className="overflow-hidden shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            {achievement.completed ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> : <div className="h-5 w-5 rounded-full border-2 border-muted mr-2" />}
                            <h3 className="font-medium">{achievement.name}</h3>
                          </div>
                          <Badge variant={achievement.completed ? "outline" : "secondary"} className={achievement.completed ? "bg-green-500/10 text-green-500" : ""}>
                            {achievement.completed ? "Completed" : `${achievement.progress}%`}
                          </Badge>
                        </div>
                        <Progress value={achievement.progress} className={`h-2 ${achievement.completed ? "bg-green-100" : ""}`} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-6">
          <Card className="border-t-4 border-t-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Challenge History
              </CardTitle>
              <CardDescription>Your participation in community challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {challengeHistory?.map((challenge) => (
                    <Card key={challenge.id} className="overflow-hidden shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4 cursor-pointer">
                                <img src={challenge.thumbnail || "/placeholder.svg"} alt={challenge.artwork} className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <img src={challenge.thumbnail || "/placeholder.svg"} alt={challenge.artwork} className="object-cover w-full h-40 rounded-md" />
                                <h4 className="font-semibold">{challenge.artwork}</h4>
                                <p className="text-sm">Entry for {challenge.title} challenge</p>
                                <p className="text-xs text-muted-foreground">{challenge.date}</p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{challenge.title}</h3>
                              <Badge variant="outline" className={getResultColor(challenge.result)}>
                                {challenge.result}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">Entry: {challenge.artwork}</p>
                            <p className="text-xs text-muted-foreground mt-1">{challenge.date}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleViewAllChallengesClick}>
                View All Challenge Entries
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
