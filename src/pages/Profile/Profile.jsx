import { User, Mail, MapPin, Calendar, LinkIcon, PenTool, BookOpen, BookMarked, Award, Star, Zap, Target, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Crown, Gamepad } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

const achievements = [
  { icon: Trophy, title: "First Win", description: "Won your first game" },
  { icon: Star, title: "Rising Star", description: "Reached level 10" },
  { icon: Zap, title: "Speed Demon", description: "Completed a game in under 1 minute" },
  { icon: Target, title: "Sharpshooter", description: "Hit 100 targets" },
  { icon: Flame, title: "On Fire", description: "5-day login streak" },
];

const badges = [{ icon: Crown, title: "Top 10 Human Being", description: "Better than 90% of players" }];

export default function Profile() {
  return (
    <main className="flex-1 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden shadow-lg">
          {/* Banner */}
          <div className="relative h-24 w-full bg-gradient-to-r from-red-500 to-purple-600">
            <div className="absolute -bottom-10 left-6">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src="/placeholder-avatar.jpg" alt="@artlover" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardHeader className="pt-12">
            <div className="flex flex-col items-center text-center">
              <CardTitle>Art Lover</CardTitle>
              <p className="text-sm text-muted-foreground">@artlover</p>
            </div>
          </CardHeader>

          {/* Follow Stats */}
          <div className="flex justify-center gap-6 border-b pb-4">
            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold">1.2K</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold">780</p>
              <p className="text-sm text-muted-foreground">Followings</p>
            </div>
          </div>

          <CardContent>
            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-2 mt-4">
                <User className="h-4 w-4 opacity-70" />
                <span>Digital Artist</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-70" />
                <span>artlover@palettestream.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 opacity-70" />
                <span>Tokyo, Japan</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 opacity-70" />
                <span>Joined March 2023</span>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 opacity-70" />
                <a href="https://artlover.palettestream.com" className="text-blue-500 hover:underline">
                  https://artlover.palettestream.com
                </a>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <Button>Edit Profile</Button>
              <Button variant="outline">Follow</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Gamepad className="h-6 w-6 text-red-600" />
              Player Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Level 7</p>
                <p className="text-2xl font-bold">3,542 XP</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="h-10 w-10 rounded-full p-2">
                      <Award className="h-6 w-6" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gold Badge</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress to Level 8</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="flex justify-between">
              <div>
                <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Achievements
                </h3>
                <div className="grid gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <achievement.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Badges
                </h3>
                <div className="grid gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 150, damping: 10 }}>
                          <badge.icon className="h-5 w-5 text-primary" />
                        </motion.div>
                      </div>
                      <div>
                        <p className="font-medium">{badge.title}</p>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="illustrations" className="mt-6">
        <TabsList>
          <TabsTrigger value="illustrations">Illustrations</TabsTrigger>
          <TabsTrigger value="mangas">Mangas</TabsTrigger>
          <TabsTrigger value="novels">Novels</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        <TabsContent value="illustrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Illustrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>User's illustrations will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mangas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Mangas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>User's mangas will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="novels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5" />
                Novels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>User's novels will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ongoing">
                <TabsList>
                  <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="ongoing">
                  <p>User's ongoing challenges will be displayed here.</p>
                </TabsContent>
                <TabsContent value="completed">
                  <p>User's completed challenges will be displayed here.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
