import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  Image, 
  BookOpen, 
  Trophy, 
  Star, 
  Award, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Crown
} from 'lucide-react';

export default function Profile() {
  const userProfile = {
    name: "Jane Painter",
    username: "@janepainter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    bio: "Digital artist and illustrator specializing in fantasy and character design. Always looking to improve and connect with fellow artists!",
    level: 7,
    xp: 2450,
    xpToNextLevel: 750,
    followers: 342,
    following: 128,
    joined: "March 2023",
    location: "Tokyo, Japan",
    website: "janepainter.art"
  };
  
  const userStats = {
    totalUploads: 47,
    totalLikes: 1243,
    totalComments: 356,
    challengesParticipated: 8,
    challengesWon: 1
  };
  
  const badges = [
    { id: 1, name: "First Upload", icon: <Star className="h-5 w-5 text-yellow-500" />, date: "Mar 15, 2023" },
    { id: 2, name: "10 Comments", icon: <MessageCircle className="h-5 w-5 text-blue-500" />, date: "Apr 2, 2023" },
    { id: 3, name: "Weekly Winner", icon: <Trophy className="h-5 w-5 text-red-500" />, date: "May 18, 2023" },
    { id: 4, name: "100 Likes", icon: <Heart className="h-5 w-5 text-pink-500" />, date: "Jun 7, 2023" },
    { id: 5, name: "Consistent Creator", icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, date: "Jul 22, 2023" },
    { id: 6, name: "Rising Star", icon: <TrendingUp className="h-5 w-5 text-purple-500" />, date: "Aug 15, 2023" }
  ];
  
  const achievements = [
    { id: 1, name: "Upload 10 Artworks", progress: 100, completed: true },
    { id: 2, name: "Receive 100 Likes", progress: 100, completed: true },
    { id: 3, name: "Win a Challenge", progress: 100, completed: true },
    { id: 4, name: "Upload 50 Artworks", progress: 94, completed: false },
    { id: 5, name: "Receive 1000 Likes", progress: 80, completed: false },
    { id: 6, name: "Win 5 Challenges", progress: 20, completed: false }
  ];
  
  const artworks = [
    {
      id: 1,
      title: "Enchanted Forest",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop",
      likes: 142,
      comments: 28,
      date: "2 weeks ago"
    },
    {
      id: 2,
      title: "Cyberpunk Portrait",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
      likes: 98,
      comments: 15,
      date: "1 month ago"
    },
    {
      id: 3,
      title: "Ocean Dreams",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop",
      likes: 76,
      comments: 12,
      date: "2 months ago"
    },
    {
      id: 4,
      title: "Mountain Serenity",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
      likes: 124,
      comments: 18,
      date: "3 months ago"
    },
    {
      id: 5,
      title: "Urban Sketches",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1000&auto=format&fit=crop",
      likes: 87,
      comments: 9,
      date: "3 months ago"
    },
    {
      id: 6,
      title: "Character Study",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=1000&auto=format&fit=crop",
      likes: 112,
      comments: 21,
      date: "4 months ago"
    }
  ];
  
  const challengeHistory = [
    {
      id: 1,
      title: "Fantasy Landscapes",
      result: "Winner",
      date: "May 2023",
      artwork: "Enchanted Forest",
      thumbnail: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Character Design",
      result: "Top 10",
      date: "June 2023",
      artwork: "Cyberpunk Hero",
      thumbnail: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Mythology Reimagined",
      result: "Participant",
      date: "July 2023",
      artwork: "Ocean Dreams",
      thumbnail: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=200&auto=format&fit=crop"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="mt-4 text-center md:text-left">
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                <p className="text-muted-foreground">{userProfile.username}</p>
                
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    Level {userProfile.level}
                  </Badge>
                  <Badge variant="outline">Digital Artist</Badge>
                </div>
                
                <div className="flex mt-4 space-x-4">
                  <Button className="bg-red-600 hover:bg-red-700">Follow</Button>
                  <Button variant="outline">Message</Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 mt-6 md:mt-0">
              <div className="space-y-4">
                <p>{userProfile.bio}</p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span><strong>{userProfile.followers}</strong> Followers</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span><strong>{userProfile.following}</strong> Following</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>Joined {userProfile.joined}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Level Progress</h3>
                  <div className="flex justify-between text-xs">
                    <span>Level {userProfile.level}</span>
                    <span>{userProfile.xp} XP / {userProfile.xp + userProfile.xpToNextLevel} XP</span>
                  </div>
                  <Progress value={userProfile.xp / (userProfile.xp + userProfile.xpToNextLevel) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">{userProfile.xpToNextLevel} XP to Level {userProfile.level + 1}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <Image className="h-5 w-5 text-red-500 mb-1" />
              <span className="font-bold">{userStats.totalUploads}</span>
              <span className="text-xs text-muted-foreground">Uploads</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <Heart className="h-5 w-5 text-red-500 mb-1" />
              <span className="font-bold">{userStats.totalLikes}</span>
              <span className="text-xs text-muted-foreground">Likes</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <MessageCircle className="h-5 w-5 text-red-500 mb-1" />
              <span className="font-bold">{userStats.totalComments}</span>
              <span className="text-xs text-muted-foreground">Comments</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <Trophy className="h-5 w-5 text-red-500 mb-1" />
              <span className="font-bold">{userStats.challengesParticipated}</span>
              <span className="text-xs text-muted-foreground">Challenges</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <Crown className="h-5 w-5 text-yellow-500 mb-1" />
              <span className="font-bold">{userStats.challengesWon}</span>
              <span className="text-xs text-muted-foreground">Wins</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Content */}
      <Tabs defaultValue="artworks">
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
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-red-500/10 text-white border-red-500/50">
                      {artwork.type.charAt(0).toUpperCase() + artwork.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold">{artwork.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{artwork.date}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-3">
                      <div className="flex items-center text-sm">
                        <Heart className="h-4 w-4 mr-1 text-red-500" />
                        <span>{artwork.likes}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{artwork.comments}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
              <CardDescription>Showcase of your achievements and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex items-center p-4 rounded-lg border">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-4">
                      {badge.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground">Earned on {badge.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Track your progress towards goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {achievements.map((achievement) => (
                  <div key={achievement.id}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        {achievement.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        <h3 className="font-medium">{achievement.name}</h3>
                      </div>
                      <Badge variant={achievement.completed ? "outline" : "secondary"} className={
                        achievement.completed ? "bg-green-500/10 text-green-500" : ""
                      }>
                        {achievement.completed ? "Completed" : `${achievement.progress}%`}
                      </Badge>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Challenge History</CardTitle>
              <CardDescription>Your participation in community challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {challengeHistory.map((challenge) => (
                  <div key={challenge.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4">
                      <img 
                        src={challenge.thumbnail} 
                        alt={challenge.artwork}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{challenge.title}</h3>
                        <Badge variant="outline" className={
                          challenge.result === "Winner" 
                            ? "bg-yellow-500/10 text-yellow-500" 
                            : challenge.result === "Top 10"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-muted-foreground/10"
                        }>
                          {challenge.result}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">Entry: {challenge.artwork}</p>
                      <p className="text-xs text-muted-foreground mt-1">{challenge.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Challenge Entries</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}