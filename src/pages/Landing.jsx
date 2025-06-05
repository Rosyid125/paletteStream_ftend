// pages/index.tsx (or your BetterLanding component file)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Rocket,
  Palette,
  Trophy,
  Users,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Quote,
  CheckCircle,
  UserPlus,
  UploadCloud,
  Award,
  Zap,
  Star,
  TrendingUp,
  ChevronsUp,
  ShieldCheck,
  Sparkles, // Ensure all needed icons are imported
} from "lucide-react";
import Navbar from "@/components/Navbar"; // Assuming Navbar is in English already
import { Link } from "react-router-dom";

export default function BetterLanding() {
  // Updated Features focused on Anime/Manga/Novel & Gamification
  const features = [
    {
      title: "Showcase Your Art",
      description: "Beautiful galleries designed for illustrations, manga, and novels.",
      icon: <Palette className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Weekly Art Challenges",
      description: "Compete in themed contests, win prizes, and level up your skills.",
      icon: <Trophy className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Creative Community",
      description: "Connect with fellow anime/manga artists and writers worldwide.",
      icon: <Users className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Level Up & Earn Badges",
      description: "Gain XP, level up your profile, and unlock unique achievement badges.",
      icon: <Award className="h-6 w-6 text-green-500" />, // Using Award icon for achievements/levels
    },
  ];

  // Replaced Stats with Gamification Highlights
  const gamificationHighlights = [
    {
      title: "Experience Points (XP)",
      description: "Earn XP every time you share art, comment, or participate in activities.",
      icon: <Star className="h-8 w-8 text-green-100" />,
    },
    {
      title: "Leveling System",
      description: "Increase your profile level as you gain XP, showcasing your dedication.",
      icon: <ChevronsUp className="h-8 w-8 text-green-100" />,
    },
    {
      title: "Achievements & Badges",
      description: "Unlock unique badges for milestones reached and challenges won.",
      icon: <ShieldCheck className="h-8 w-8 text-green-100" />,
    },
  ];

  // Replaced Testimonials with Beta Buzz / Anticipation
  const betaBuzz = [
    {
      quote: "Finally, a platform focused on the anime/manga art styles I love! Can't wait to join the Beta.",
      source: "Aspiring Beta Creator",
      icon: <Sparkles className="h-5 w-5 text-yellow-400" />,
    },
    {
      quote: "The concept of leveling up while sharing art sounds incredibly motivating. Hope it launches soon!",
      source: "Illustrator",
      icon: <Sparkles className="h-5 w-5 text-yellow-400" />,
    },
    {
      quote: "Really looking forward to the weekly challenges and connecting with other light novel writers.",
      source: "Light Novel Author",
      icon: <Sparkles className="h-5 w-5 text-yellow-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-[#101c19] dark:to-[#1a2a25]">
      <Navbar />
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
            ✨ Join the Beta! ✨
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 dark:from-green-300 dark:to-green-500 dark:text-green-100">Level Up Your Anime Art</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 dark:text-green-100/80">
            PaletteStream: Where creators of anime-style illustrations, manga, and novels connect, share, compete, and grow together through gamification.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                Join Beta Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="dark:border-green-700 dark:text-green-200">
              Learn Features
            </Button>
          </div>
        </div>
      </section>
      {/* Features Section - Updated Content */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-[#16211d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-green-100">Why Choose PaletteStream?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto dark:text-green-100/80">A platform built specifically for the anime, manga, and novel creator ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow text-center md:text-left dark:bg-[#1a2a25] dark:border-green-900 dark:text-green-100">
                <CardHeader>
                  <div className="flex justify-center md:justify-start mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-800">{feature.icon}</div>
                  </div>
                  <CardTitle className="dark:text-green-100">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground dark:text-green-100/80">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works Section - Still Relevant */}
      <section className="py-20 px-4 bg-green-50 dark:bg-[#101c19]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-green-100">Get Started in Minutes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto dark:text-green-100/80">Joining the PaletteStream Beta is simple and quick:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Steps remain conceptually the same */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5 border-2 border-green-200 dark:bg-green-800 dark:border-green-700">
                <UserPlus className="h-8 w-8 text-green-600 dark:text-green-200" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-green-100">Sign Up Free</h3>
              <p className="text-muted-foreground dark:text-green-100/80">Create your account in seconds and set up your creator profile.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5 border-2 border-green-200 dark:bg-green-800 dark:border-green-700">
                <UploadCloud className="h-8 w-8 text-green-600 dark:text-green-200" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-green-100">Upload Your Work</h3>
              <p className="text-muted-foreground dark:text-green-100/80">Easily upload illustrations, manga pages, or novel chapters to your gallery.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5 border-2 border-green-200 dark:bg-green-800 dark:border-green-700">
                <Award className="h-8 w-8 text-green-600 dark:text-green-200" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-green-100">Engage & Grow</h3>
              <p className="text-muted-foreground dark:text-green-100/80">Join challenges, connect with other creators, and get feedback.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Gamification Highlights Section - Replaces Stats */}
      <section id="gamification" className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-800 text-white dark:from-green-900 dark:to-green-800 dark:text-green-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3 dark:text-green-100">Experience the Fun of Gamification!</h2>
            <p className="text-green-100 max-w-2xl mx-auto dark:text-green-200">PaletteStream makes your creative journey more engaging and rewarding.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            {gamificationHighlights.map((highlight, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-700 border-2 border-green-500 mb-5 dark:bg-green-800 dark:border-green-700">{highlight.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white dark:text-green-100">{highlight.title}</h3>
                <p className="text-green-100 dark:text-green-200">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Beta Buzz Section - Replaces Testimonials */}
      <section id="buzz" className="py-20 px-4 bg-white dark:bg-[#16211d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-green-100">Be Part of Something New!</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto dark:text-green-100/80">Hear the buzz from potential users about what makes PaletteStream exciting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {betaBuzz.map((buzz, index) => (
              <Card key={index} className="flex flex-col border border-green-100 shadow-sm dark:bg-[#1a2a25] dark:border-green-900 dark:text-green-100">
                <CardContent className="pt-6 flex-grow">
                  <Quote className="h-6 w-6 text-green-300 mb-4 dark:text-green-200" />
                  <p className="text-muted-foreground italic mb-4 dark:text-green-100/80">"{buzz.quote}"</p>
                </CardContent>
                <CardFooter className="flex items-center gap-3 bg-green-50 p-4 mt-auto border-t border-green-100 dark:bg-green-900 dark:border-green-800">
                  {buzz.icon}
                  <div>
                    <p className="font-semibold text-sm text-green-800 dark:text-green-200">{buzz.source}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section - Updated for Beta */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 md:p-12 text-center border border-green-200 dark:from-[#16211d] dark:to-[#1a2a25] dark:border-green-800">
          <Rocket className="h-12 w-12 mx-auto mb-6 text-green-600 dark:text-green-200" />
          <h2 className="text-3xl font-bold mb-4 dark:text-green-100">Ready to Join the PaletteStream Beta?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto dark:text-green-100/80">
            Be among the first creators to experience PaletteStream. Sign up now to secure your spot in the Beta and help shape the future of our community!
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2 dark:bg-green-700 dark:hover:bg-green-800">
              Get Beta Access <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
      {/* Footer - Assumed English */}
      <footer className="py-8 px-4 border-t bg-white dark:bg-[#101c19]">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground dark:text-green-100/80">
          © {new Date().getFullYear()} PaletteStream. All rights reserved.
          <div className="mt-2">
            <Link href="/privacy" className="hover:text-green-700 mx-2 dark:hover:text-green-300">
              Privacy Policy
            </Link>{" "}
            |
            <Link href="/terms" className="hover:text-green-700 mx-2 dark:hover:text-green-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
