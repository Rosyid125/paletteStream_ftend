import { useState, useEffect, useRef, useCallback } from "react"; // Added useEffect, useRef, useCallback
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Keep for potential future use inside card? Currently unused.
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton
import { Trophy, Palette, BookOpen, PenTool, Brush, Image, ChevronRight } from "lucide-react";

export default function TopArtists() {
  const navigate = useNavigate();
  const [displayedArtists, setDisplayedArtists] = useState([]); // Artists currently shown
  const [page, setPage] = useState(1); // Next page to fetch
  const [pageSize, setPageSize] = useState(10); // Items per page
  const [hasMore, setHasMore] = useState(true); // Are there more artists to load?
  const [loading, setLoading] = useState(false); // Is data currently being fetched?
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Track if first fetch is done

  // Ref for the observer target element
  const observer = useRef();

  // --- Full List of Top Artists (Simulated Data Source) ---
  const allTopArtists = [
    // (Keep your existing full array of artist objects here)
    // Make sure you have more than 10 artists to test the lazy load
    {
      id: 1,
      rank: 1,
      name: "Liam Parker",
      username: "@liamparker",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop",
      level: 32,
      exp: 1_250_800,
      specialty: "Digital Illustration",
      stats: { followers: 24567, likes: 187432, artworks: 342, challenges: 28, wins: 12 },
      achievementCount: 45,
      badgeCount: 3,
      categories: ["illustration", "digital"],
    },
    {
      id: 2,
      rank: 2,
      name: "Zoe Chen",
      username: "@zoechen",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
      level: 29,
      exp: 985_500,
      specialty: "Character Design",
      stats: { followers: 21345, likes: 156789, artworks: 287, challenges: 22, wins: 9 },
      achievementCount: 38,
      badgeCount: 3,
      categories: ["illustration", "character", "digital"],
    },
    {
      id: 3,
      rank: 3,
      name: "Hiroshi Tanaka",
      username: "@hiroshitanaka",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
      level: 28,
      exp: 890_200,
      specialty: "Manga Artist",
      stats: { followers: 19876, likes: 143256, artworks: 256, challenges: 19, wins: 7 },
      achievementCount: 30,
      badgeCount: 3,
      categories: ["manga", "traditional"],
    },
    {
      id: 4,
      rank: 4,
      name: "Emma Waters",
      username: "@emmawaters",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
      level: 26,
      exp: 750_000,
      specialty: "Environmental Art",
      stats: { followers: 17654, likes: 132456, artworks: 231, challenges: 17, wins: 5 },
      achievementCount: 25,
      badgeCount: 3,
      categories: ["illustration", "landscape", "digital"],
    },
    {
      id: 5,
      rank: 5,
      name: "Marcus Reed",
      username: "@marcusreed",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      level: 25,
      exp: 680_400,
      specialty: "Novel Writer",
      stats: { followers: 15432, likes: 121345, artworks: 198, challenges: 15, wins: 4 },
      achievementCount: 22,
      badgeCount: 3,
      categories: ["novel", "fantasy"],
    },
    {
      id: 6,
      rank: 6,
      name: "Yuki Sato",
      username: "@yukisato",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
      level: 24,
      exp: 615_900,
      specialty: "Traditional Art",
      stats: { followers: 14321, likes: 109876, artworks: 176, challenges: 14, wins: 3 },
      achievementCount: 18,
      badgeCount: 3,
      categories: ["traditional", "illustration"],
    },
    {
      id: 7,
      rank: 7,
      name: "Alex Kim",
      username: "@alexkim",
      avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&auto=format&fit=crop",
      level: 23,
      exp: 580_100,
      specialty: "Concept Artist",
      stats: { followers: 13987, likes: 101234, artworks: 165, challenges: 12, wins: 2 },
      achievementCount: 15,
      badgeCount: 2,
      categories: ["illustration", "digital", "concept"],
    },
    {
      id: 8,
      rank: 8,
      name: "Priya Sharma",
      username: "@priyasharma",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
      level: 22,
      exp: 550_600,
      specialty: "Anime Style",
      stats: { followers: 13542, likes: 98765, artworks: 150, challenges: 11, wins: 2 },
      achievementCount: 14,
      badgeCount: 2,
      categories: ["illustration", "anime", "digital"],
    },
    {
      id: 9,
      rank: 9,
      name: "David Rodriguez",
      username: "@davidrod",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop",
      level: 21,
      exp: 510_300,
      specialty: "Portrait Painting",
      stats: { followers: 12876, likes: 92345, artworks: 135, challenges: 10, wins: 1 },
      achievementCount: 12,
      badgeCount: 1,
      categories: ["traditional", "portrait"],
    },
    {
      id: 10,
      rank: 10,
      name: "Sofia Martinez",
      username: "@sofimartinez",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop",
      level: 20,
      exp: 480_000,
      specialty: "Fantasy Illustration",
      stats: { followers: 12100, likes: 88760, artworks: 120, challenges: 9, wins: 1 },
      achievementCount: 10,
      badgeCount: 1,
      categories: ["illustration", "fantasy", "digital"],
    },
    {
      id: 11,
      rank: 11,
      name: "Kai Nakamura",
      username: "@kainakamura",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop",
      level: 19,
      exp: 450_500,
      specialty: "Sci-Fi Concepts",
      stats: { followers: 11500, likes: 85000, artworks: 110, challenges: 8, wins: 1 },
      achievementCount: 9,
      badgeCount: 1,
      categories: ["illustration", "scifi", "concept"],
    },
    {
      id: 12,
      rank: 12,
      name: "Emily Johnson",
      username: "@emilyj",
      avatar: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=100&auto=format&fit=crop",
      level: 18,
      exp: 420_800,
      specialty: "Character Art",
      stats: { followers: 11000, likes: 81000, artworks: 100, challenges: 7, wins: 0 },
      achievementCount: 8,
      badgeCount: 1,
      categories: ["illustration", "character"],
    },
    // --- Add more artists here to ensure total > pageSize * initial pages ---
    {
      id: 13,
      rank: 13,
      name: "Artist 13",
      username: "@artist13",
      avatar: "/placeholder.svg",
      level: 17,
      exp: 400000,
      specialty: "Abstract",
      stats: { followers: 10500, likes: 78000, artworks: 95, challenges: 6, wins: 0 },
      achievementCount: 7,
      badgeCount: 1,
      categories: ["abstract"],
    },
    {
      id: 14,
      rank: 14,
      name: "Artist 14",
      username: "@artist14",
      avatar: "/placeholder.svg",
      level: 16,
      exp: 380000,
      specialty: "Surrealism",
      stats: { followers: 10000, likes: 75000, artworks: 90, challenges: 5, wins: 0 },
      achievementCount: 6,
      badgeCount: 1,
      categories: ["surrealism"],
    },
    {
      id: 15,
      rank: 15,
      name: "Artist 15",
      username: "@artist15",
      avatar: "/placeholder.svg",
      level: 15,
      exp: 360000,
      specialty: "Pixel Art",
      stats: { followers: 9500, likes: 72000, artworks: 85, challenges: 4, wins: 0 },
      achievementCount: 5,
      badgeCount: 1,
      categories: ["digital", "pixel"],
    },
    {
      id: 16,
      rank: 16,
      name: "Artist 16",
      username: "@artist16",
      avatar: "/placeholder.svg",
      level: 14,
      exp: 340000,
      specialty: "Photography",
      stats: { followers: 9000, likes: 70000, artworks: 80, challenges: 3, wins: 0 },
      achievementCount: 4,
      badgeCount: 1,
      categories: ["photography"],
    },
    {
      id: 17,
      rank: 17,
      name: "Artist 17",
      username: "@artist17",
      avatar: "/placeholder.svg",
      level: 13,
      exp: 320000,
      specialty: "Sculpture",
      stats: { followers: 8500, likes: 68000, artworks: 75, challenges: 2, wins: 0 },
      achievementCount: 3,
      badgeCount: 0,
      categories: ["sculpture"],
    },
    {
      id: 18,
      rank: 18,
      name: "Artist 18",
      username: "@artist18",
      avatar: "/placeholder.svg",
      level: 12,
      exp: 300000,
      specialty: "Animation",
      stats: { followers: 8000, likes: 65000, artworks: 70, challenges: 1, wins: 0 },
      achievementCount: 2,
      badgeCount: 0,
      categories: ["animation"],
    },
    {
      id: 19,
      rank: 19,
      name: "Artist 19",
      username: "@artist19",
      avatar: "/placeholder.svg",
      level: 11,
      exp: 280000,
      specialty: "Comics",
      stats: { followers: 7500, likes: 62000, artworks: 65, challenges: 0, wins: 0 },
      achievementCount: 1,
      badgeCount: 0,
      categories: ["comics", "manga"],
    },
    {
      id: 20,
      rank: 20,
      name: "Artist 20",
      username: "@artist20",
      avatar: "/placeholder.svg",
      level: 10,
      exp: 260000,
      specialty: "Street Art",
      stats: { followers: 7000, likes: 60000, artworks: 60, challenges: 0, wins: 0 },
      achievementCount: 0,
      badgeCount: 0,
      categories: ["streetart", "traditional"],
    },
  ];

  // --- Fetching Logic (for Infinite Scroll) ---
  const fetchArtists = useCallback(
    async (pageNum) => {
      if (loading) return; // Prevent multiple fetches
      setLoading(true);
      console.log(`Fetching page: ${pageNum}`);

      try {
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        await delay(500); // Simulate network delay

        // --- No filtering, just pagination ---
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const newArtists = allTopArtists.slice(startIndex, endIndex);

        setDisplayedArtists((prev) => (pageNum === 1 ? newArtists : [...prev, ...newArtists]));
        setHasMore(endIndex < allTopArtists.length);
        setPage((prev) => prev + 1); // Increment page number for the *next* fetch
      } catch (error) {
        console.error("Error fetching artists:", error);
        // Handle error state if needed
      } finally {
        setLoading(false);
        if (pageNum === 1) {
          setInitialLoadComplete(true); // Mark initial load done
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [pageSize, loading]
  ); // Add loading to prevent race conditions

  // --- Effect for Initial Data Load ---
  useEffect(() => {
    // Fetch page 1 initially
    fetchArtists(1);
  }, [fetchArtists]); // fetchArtists is wrapped in useCallback

  // --- Intersection Observer Setup ---
  const lastArtistElementRef = useCallback(
    (node) => {
      if (loading) return; // Don't observe while loading
      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      observer.current = new IntersectionObserver((entries) => {
        // If the target element is intersecting and there's more data
        if (entries[0].isIntersecting && hasMore) {
          console.log("Intersection detected, fetching next page...");
          fetchArtists(page); // Fetch the next page
        }
      });

      if (node) observer.current.observe(node); // Start observing the new target node
    },
    [loading, hasMore, fetchArtists, page]
  ); // Dependencies

  // Helper function to get rank text style (unchanged)
  const getRankStyle = (rank) => {
    if (rank === 1) return "text-yellow-500 font-bold";
    if (rank === 2) return "text-gray-400 font-bold";
    if (rank === 3) return "text-amber-700 font-bold";
    return "text-muted-foreground";
  };

  // Helper function to get specialty icon (unchanged)
  const getSpecialtyIcon = (specialty) => {
    if (specialty.includes("Illustration")) return <Palette className="h-3 w-3" />;
    if (specialty.includes("Character")) return <PenTool className="h-3 w-3" />;
    if (specialty.includes("Manga")) return <BookOpen className="h-3 w-3" />;
    if (specialty.includes("Environmental")) return <Image className="h-3 w-3" />;
    if (specialty.includes("Novel")) return <BookOpen className="h-3 w-3" />;
    if (specialty.includes("Traditional")) return <Brush className="h-3 w-3" />;
    return <Palette className="h-3 w-3" />;
  };

  // --- Render Loading Skeleton ---
  const renderSkeleton = (key) => (
    <Card key={key} className="overflow-hidden">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <Skeleton className="w-10 h-6 flex-shrink-0" /> {/* Rank */}
        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" /> {/* Avatar */}
        <div className="flex-grow space-y-2 text-center sm:text-left">
          <Skeleton className="h-6 w-3/4 sm:w-1/2" /> {/* Name */}
          <Skeleton className="h-4 w-1/2 sm:w-1/3" /> {/* Username */}
          <Skeleton className="h-4 w-2/3 sm:w-1/2" /> {/* Specialty/Level */}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-2 flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 border-dashed">
          {[...Array(8)].map(
            (
              _,
              i // 8 stats
            ) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-5 w-10 mx-auto sm:mx-0 sm:ml-auto" />
                <Skeleton className="h-3 w-12 mx-auto sm:mx-0 sm:ml-auto" />
              </div>
            )
          )}
        </div>
        <Skeleton className="hidden lg:block h-5 w-5 ml-4" /> {/* Chevron */}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-yellow-500">
        <CardHeader>
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl">Top Artists</CardTitle>
              <CardDescription>Discover the leading creators on the platform</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Top Artists List Area */}
      <div className="space-y-4">
        {/* Initial Loading Skeletons */}
        {!initialLoadComplete && loading && <>{Array.from({ length: 5 }).map((_, index) => renderSkeleton(`initial-skeleton-${index}`))}</>}

        {/* Displayed Artists */}
        {displayedArtists.map((artist, index) => {
          // Attach ref to the last element
          if (displayedArtists.length === index + 1) {
            return (
              <div ref={lastArtistElementRef} key={artist.id}>
                <ArtistCard artist={artist} />
              </div>
            );
          } else {
            return <ArtistCard key={artist.id} artist={artist} />;
          }
        })}

        {/* Loading More Indicator */}
        {loading && page > 1 && <>{Array.from({ length: 3 }).map((_, index) => renderSkeleton(`loading-skeleton-${index}`))}</>}

        {/* Empty State */}
        {initialLoadComplete && displayedArtists.length === 0 && !loading && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">No top artists available at the moment.</CardContent>
          </Card>
        )}

        {/* End of List Message */}
        {!loading && !hasMore && displayedArtists.length > 0 && (
          <div className="text-center text-muted-foreground py-6">
            <p>You've reached the end of the list!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Artist Card Component --- (Extracted for clarity)
function ArtistCard({ artist }) {
  const navigate = useNavigate();

  const getRankStyle = (rank) => {
    if (rank === 1) return "text-yellow-500 font-bold";
    if (rank === 2) return "text-gray-400 font-bold";
    if (rank === 3) return "text-amber-700 font-bold";
    return "text-muted-foreground";
  };

  const getSpecialtyIcon = (specialty) => {
    // (Same logic as before)
    if (specialty.includes("Illustration")) return <Palette className="h-3 w-3" />;
    if (specialty.includes("Character")) return <PenTool className="h-3 w-3" />;
    if (specialty.includes("Manga")) return <BookOpen className="h-3 w-3" />;
    if (specialty.includes("Environmental")) return <Image className="h-3 w-3" />;
    if (specialty.includes("Novel")) return <BookOpen className="h-3 w-3" />;
    if (specialty.includes("Traditional")) return <Brush className="h-3 w-3" />;
    return <Palette className="h-3 w-3" />;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${artist.id}`)}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Rank */}
        <div className={`w-10 text-center text-xl ${getRankStyle(artist.rank)} flex-shrink-0`}>#{artist.rank}</div>

        {/* Avatar */}
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarImage src={artist.avatar} alt={artist.name} />
          <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Artist Info */}
        <div className="flex-grow text-center sm:text-left">
          <h3 className="font-bold text-lg">{artist.name}</h3>
          <p className="text-sm text-muted-foreground">{artist.username}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              {getSpecialtyIcon(artist.specialty)} {artist.specialty}
            </span>
            <span className="hidden sm:inline">•</span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-transparent px-1.5 py-0.5 text-xs">
              {" "}
              Lvl {artist.level}{" "}
            </Badge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-2 text-center sm:text-right text-sm flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 border-dashed">
          <div title="Followers">
            <p className="font-semibold">{artist.stats.followers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div title="Total Likes">
            <p className="font-semibold">{artist.stats.likes.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
          <div title="Artworks">
            <p className="font-semibold">{artist.stats.artworks}</p>
            <p className="text-xs text-muted-foreground">Artworks</p>
          </div>
          <div title="Experience">
            <p className="font-semibold">{artist.exp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">EXP</p>
          </div>
          <div title="Challenges Entered">
            <p className="font-semibold">{artist.stats.challenges}</p>
            <p className="text-xs text-muted-foreground">Challenges</p>
          </div>
          <div title="Challenge Wins">
            <p className="font-semibold">{artist.stats.wins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div title="Achievements Unlocked">
            <p className="font-semibold">{artist.achievementCount}</p>
            <p className="text-xs text-muted-foreground">Achieve</p>
          </div>
          <div title="Badges Earned">
            <p className="font-semibold">{artist.badgeCount}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Action / Indicator */}
        <div className="hidden lg:flex items-center pl-4 text-muted-foreground hover:text-primary">
          <ChevronRight className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
