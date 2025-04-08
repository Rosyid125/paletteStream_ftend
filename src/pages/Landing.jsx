import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Heart, MessageCircle, Trophy, CheckCircle, Minus, Calendar, Clock, Briefcase, PenTool, Users, MessageSquare, ChevronRight } from "lucide-react";
// Removed 'useState' as it was not used
// Removed 'Image' import from 'next/image'

export default function LandingPageContinued() {
  // This component would be imported into the main landing page
  // or these sections could be added to the existing landing page

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for anyone",
      features: ["Everything"],
      limitations: ["Nothing"],
      cta: "Get Started",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "What types of art can I share on PaletteStream?",
      answer: "PaletteStream supports a wide range of creative content including digital illustrations, traditional art, manga, comics, animations, novels, and short stories. We welcome artists of all styles and experience levels.",
    },
    {
      question: "How do the weekly challenges work?",
      answer:
        "Each week, we announce a new theme or prompt. Artists have 7 days to create and submit their work. Our community votes on submissions, and winners receive prizes including featured placement, digital badges, and sometimes sponsored rewards from our partners.",
    },
    {
      question: "Can I sell my artwork through PaletteStream?",
      answer:
        "Yes! Pro and Studio members can enable commission requests, set up a store to sell prints and digital downloads, and connect with clients looking for custom work. We handle the payment processing and only take a small fee on completed transactions.",
    },
    {
      question: "How does the leveling system work?",
      answer:
        "You earn experience points through regular activity like posting artwork, receiving likes and comments, participating in challenges, and completing your profile. As you level up, you unlock new features, badges, and opportunities exclusive to your level.",
    },
    {
      question: "Is my work protected on PaletteStream?",
      answer: "Yes, you retain full copyright of your work. We offer watermarking options, download restrictions, and clear attribution on all shared content. Our terms of service strictly prohibit unauthorized use of any creator's work.",
    },
  ];

  // NOTE: Ensure these image paths point to files accessible in your 'public' folder
  // or are served correctly by your development/build setup.
  const featuredWorks = [
    {
      title: "Celestial Guardian",
      artist: "Mika Chen",
      artistAvatar: "/placeholder-avatar.svg",
      image: "/placeholder-art-3x4-1.svg",
      likes: 1243,
      comments: 89,
    },
    {
      title: "Neon Samurai",
      artist: "Takeshi Yamada",
      artistAvatar: "/placeholder-avatar.svg",
      image: "/placeholder-art-3x4-2.svg",
      likes: 958,
      comments: 67,
    },
    {
      title: "Forest Spirit",
      artist: "Elena Petrova",
      artistAvatar: "/placeholder-avatar.svg",
      image: "/placeholder-art-3x4-3.svg",
      likes: 1567,
      comments: 124,
    },
    {
      title: "Cyberpunk City",
      artist: "Marcus Wong",
      artistAvatar: "/placeholder-avatar.svg",
      image: "/placeholder-art-3x4-4.svg",
      likes: 2103,
      comments: 156,
    },
    {
      title: "Ocean Dreams",
      artist: "Sofia Garcia",
      artistAvatar: "/placeholder-avatar.svg",
      image: "/placeholder-art-3x4-5.svg",
      likes: 876,
      comments: 42,
    },
  ];

  const upcomingChallenges = [
    {
      title: "Mythical Creatures",
      startDate: "May 15, 2024",
      duration: "7 days",
      prize: "$500 + Featured Spotlight",
      sponsor: "Digital Arts Magazine",
      image: "/placeholder-challenge-1.svg",
    },
    {
      title: "Future Cities",
      startDate: "May 22, 2024",
      duration: "10 days",
      prize: "Wacom Tablet + Pro Membership",
      sponsor: "Wacom",
      image: "/placeholder-challenge-2.svg",
    },
    {
      title: "Character Design: Heroes",
      startDate: "June 1, 2024",
      duration: "14 days",
      prize: "Portfolio Review by Studio Executives",
      sponsor: "Animation Studios Inc.",
      image: "/placeholder-challenge-3.svg",
    },
  ];

  const blogPosts = [
    {
      title: "10 Tips to Improve Your Digital Painting Skills",
      excerpt: "Professional artists share their secrets to mastering digital art techniques and workflows.",
      author: "Mika Chen",
      authorAvatar: "/placeholder-avatar.svg",
      date: "April 28, 2024",
      readTime: "8 min read",
      image: "/placeholder-blog-1.svg",
    },
    {
      title: "From Hobby to Career: Building Your Art Business",
      excerpt: "Learn how successful artists turned their passion into a sustainable creative career.",
      author: "Takeshi Yamada",
      authorAvatar: "/placeholder-avatar.svg",
      date: "April 22, 2024",
      readTime: "12 min read",
      image: "/placeholder-blog-2.svg",
    },
    {
      title: "The Evolution of Manga: Trends and Techniques",
      excerpt: "Exploring how manga art styles have evolved and what's trending in the industry today.",
      author: "Elena Petrova",
      authorAvatar: "/placeholder-avatar.svg",
      date: "April 15, 2024",
      readTime: "10 min read",
      image: "/placeholder-blog-3.svg",
    },
  ];

  const howItWorks = [
    {
      title: "Create Your Portfolio",
      description: "Sign up and build your personalized creative portfolio to showcase your best work.",
      icon: <PenTool className="h-6 w-6 text-primary" />,
    },
    {
      title: "Connect with Community",
      description: "Follow other artists, join groups, and engage with a global creative community.",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      title: "Participate in Challenges",
      description: "Join weekly themed challenges to push your skills and win recognition and prizes.",
      icon: <Trophy className="h-6 w-6 text-primary" />,
    },
    {
      title: "Grow Your Career",
      description: "Get discovered by clients, sell your work, and build your professional presence.",
      icon: <Briefcase className="h-6 w-6 text-primary" />,
    },
  ];

  const partners = [
    { name: "Wacom", logo: "/placeholder-logo-wacom.svg" },
    { name: "Adobe", logo: "/placeholder-logo-adobe.svg" },
    { name: "Clip Studio", logo: "/placeholder-logo-clipstudio.svg" },
    { name: "Procreate", logo: "/placeholder-logo-procreate.svg" },
    { name: "Blender", logo: "/placeholder-logo-blender.svg" },
    { name: "Digital Arts Magazine", logo: "/placeholder-logo-digitalarts.svg" },
  ];

  // Generic fallback image path (ensure this exists in your public folder)
  const fallbackImage = "/placeholder-fallback.svg";

  return (
    <div className="min-h-screen">
      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How PaletteStream Works</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">Your journey from creating art to building a thriving creative career</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute top-12 left-6 -ml-px w-0.5 h-[calc(100%-96px)] bg-primary/20 z-0 hidden md:block" />
            <div className="space-y-10 md:space-y-12">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative z-10 flex items-start gap-4 md:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 md:border-4 border-background">{step.icon}</div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              Gallery
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Artworks</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">Discover trending creations from our talented community</p>
          </div>

          <Carousel className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <CarouselContent className="-ml-4">
              {featuredWorks.map((work, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden border shadow-sm h-full flex flex-col">
                    {/* Replaced next/image with img tag */}
                    <div className="relative aspect-[3/4] w-full">
                      <img
                        src={work.image || fallbackImage}
                        alt={work.title}
                        loading="lazy" // Basic lazy loading
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        // Basic error handling (optional): sets src to fallback if original fails
                        onError={(e) => {
                          if (e.currentTarget.src !== fallbackImage) {
                            e.currentTarget.src = fallbackImage;
                          }
                        }}
                      />
                    </div>
                    <CardFooter className="p-4 flex-col items-start gap-3 mt-auto">
                      <div className="flex items-center justify-between w-full">
                        <h3 className="font-medium truncate">{work.title}</h3>
                        <div className="flex gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{work.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{work.comments}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-6 w-6">
                          {/* AvatarImage uses standard img, so it's fine */}
                          <AvatarImage src={work.artistAvatar || fallbackImage} alt={`${work.artist} avatar`} />
                          <AvatarFallback>{work.artist ? work.artist[0] : "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground truncate">{work.artist}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
            <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
          </Carousel>

          <div className="text-center mt-12">
            <Button variant="outline">View Gallery</Button>
          </div>
        </div>
      </section>

      {/* Upcoming Challenges Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              Challenges
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Art Challenges</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">Test your skills, win prizes, and gain recognition with our themed challenges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {upcomingChallenges.map((challenge, index) => (
              <Card key={index} className="overflow-hidden flex flex-col h-full">
                {/* Replaced next/image with img tag */}
                <div className="relative h-40 w-full">
                  <img
                    src={challenge.image || fallbackImage}
                    alt={challenge.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      if (e.currentTarget.src !== fallbackImage) {
                        e.currentTarget.src = fallbackImage;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-primary text-primary-foreground border-0">Upcoming</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg md:text-xl">{challenge.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{challenge.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{challenge.duration}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{challenge.prize}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>Sponsored by {challenge.sponsor}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button variant="outline" className="w-full">
                    Set Reminder
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button>View All Challenges</Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">Flexible options to support your creative journey at any stage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`flex flex-col h-full ${plan.popular ? "border-primary ring-2 ring-primary shadow-lg relative" : "border"}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-primary text-primary-foreground border-0 px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="ml-1 text-muted-foreground">{plan.period}</span>}
                  </div>
                  <CardDescription className="mt-2 min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 py-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="text-sm font-medium text-muted-foreground">Limitations:</h4>
                        <ul className="space-y-2 mt-2">
                          {plan.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Minus className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                              <span className="text-sm text-muted-foreground">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-6">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Trusted by Industry Leaders</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">We partner with top creative brands to bring you the best tools and opportunities</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center max-w-5xl mx-auto">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center justify-center p-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition duration-300">
                {/* Replaced next/image with img tag, using width/height attributes */}
                <img
                  src={partner.logo || fallbackImage}
                  alt={`${partner.name} logo`}
                  width={120}
                  height={60}
                  loading="lazy"
                  className="object-contain" // Ensures logo aspect ratio is maintained
                  onError={(e) => {
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              Resources
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">Tips, tutorials, and insights to help you grow as a creative professional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <Card key={index} className="overflow-hidden flex flex-col h-full">
                {/* Replaced next/image with img tag */}
                <div className="relative h-48 w-full">
                  <img
                    src={post.image || fallbackImage}
                    alt={post.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      if (e.currentTarget.src !== fallbackImage) {
                        e.currentTarget.src = fallbackImage;
                      }
                    }}
                  />
                </div>
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      {/* AvatarImage is fine */}
                      <AvatarImage src={post.authorAvatar || fallbackImage} alt={`${post.author} avatar`} />
                      <AvatarFallback>{post.author ? post.author[0] : "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{post.author}</span>
                  </div>
                  <CardTitle className="text-lg md:text-xl leading-snug">
                    {/* Make title a link (replace # with actual path) */}
                    <a href="#" className="hover:text-primary transition-colors">
                      {post.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-3">{post.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 mt-auto">
                  {/* Use an actual link or button action */}
                  <Button variant="ghost" asChild className="gap-1 p-0 h-auto text-primary hover:text-primary">
                    {/* Replace # with actual link */}
                    <a href="#">
                      Read article <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline">View All Articles</Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">Find answers to common questions about PaletteStream</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base md:text-lg font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center p-6 bg-muted/30 rounded-lg border">
              <h3 className="text-lg font-medium mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">Our support team is ready to help you with any questions you might have.</p>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
