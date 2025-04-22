import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Button might be unused now, keep or remove as needed
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ChevronRight, User, Heart, Edit3, Target, Award, ShieldCheck, Star, BookOpen } from "lucide-react"; // Adjusted icons
import api from "../api/axiosInstance"; // Import the axios instance

// --- Helper function to construct full URL for storage paths ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg"; // Default image if path is invalid
  // Check if it's already an absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Get base URL from axios instance
  const baseUrl = api.defaults.baseURL;
  if (!baseUrl) {
    console.error("Axios instance base URL is not configured.");
    return "/placeholder.svg"; // Fallback if base URL is missing
  }

  // Normalize slashes for consistency
  const normalizedPath = path.replace(/\\/g, "/");

  // Remove potential leading slash from path if baseUrl already ends with one, or add if needed
  const pathSegment = normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath;
  const separator = baseUrl.endsWith("/") ? "" : "/";

  try {
    // Construct the full URL
    // Ensure 'storage' is part of the path if it's coming like 'storage/avatars/...'
    // The base URL should ideally be 'http://localhost:3000'
    // And the path might be 'storage/avatars/noimage.png'
    // Resulting in 'http://localhost:3000/storage/avatars/noimage.png'

    // If path already contains 'storage', use it directly. Otherwise, assume it might need 'api/' prefix if not 'storage/'
    // Let's assume paths starting with 'storage/' are correct relative paths from base URL
    let finalPath = pathSegment;
    if (!pathSegment.startsWith("storage/")) {
      // If it's not a storage path, maybe it's another API asset?
      // This part might need adjustment based on how other non-storage assets are served.
      // For now, let's prioritize the 'storage/' paths as seen in the example.
      // If other paths exist, this logic needs refinement.
      console.warn(`Image path "${path}" does not start with 'storage/'. Assuming it's relative to base URL.`);
      // Example: if path is 'avatars/image.png', it becomes '<baseUrl>/avatars/image.png'
    }

    const url = new URL(finalPath, baseUrl + separator); // Use URL constructor for robustness
    return url.href;
  } catch (e) {
    console.error("Error constructing storage URL:", e, `Base: ${baseUrl}`, `Path: ${pathSegment}`);
    return "/placeholder.svg"; // Fallback on error
  }
};

export default function TopArtists() {
  const navigate = useNavigate();
  const [displayedArtists, setDisplayedArtists] = useState([]);
  const [page, setPage] = useState(1); // Next page to fetch
  const [limit] = useState(10); // Items per page (from API)
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(null); // Added error state

  const observer = useRef();

  // --- Fetching Logic (Using Axios) ---
  const fetchArtists = useCallback(
    async (pageNum) => {
      if (loading || !hasMore) return; // Prevent multiple fetches or fetching when no more data
      setLoading(true);
      setError(null); // Reset error on new fetch attempt
      console.log(`Fetching page: ${pageNum}, limit: ${limit}`);

      try {
        const response = await api.get(`/users/leaderboard?page=${pageNum}&limit=${limit}`);

        if (response.data && response.data.success) {
          const newArtists = response.data.data || []; // Ensure data is an array

          // Add rank based on position (global position, considering pagination)
          const startIndex = (pageNum - 1) * limit;
          const artistsWithRank = newArtists.map((artist, index) => ({
            ...artist,
            rank: startIndex + index + 1, // Calculate global rank
          }));

          setDisplayedArtists((prev) => (pageNum === 1 ? artistsWithRank : [...prev, ...artistsWithRank]));
          setHasMore(newArtists.length === limit); // If we received less than the limit, there are no more pages
          setPage((prev) => prev + 1); // Increment page number for the *next* fetch
        } else {
          // Handle API error response (e.g., success: false)
          console.error("API Error:", response.data?.message || "Unknown API error");
          setError(response.data?.message || "Failed to fetch artists.");
          setHasMore(false); // Stop fetching on API error
        }
      } catch (err) {
        console.error("Network or Axios error fetching artists:", err);
        setError(err.message || "An error occurred while fetching data.");
        setHasMore(false); // Stop fetching on network/axios error
      } finally {
        setLoading(false);
        if (pageNum === 1) {
          setInitialLoadComplete(true); // Mark initial load done
        }
      }
    },
    [limit, loading, hasMore] // Dependencies for useCallback
  );

  // --- Effect for Initial Data Load ---
  useEffect(() => {
    // Reset state if component re-mounts or conditions change drastically
    // setDisplayedArtists([]);
    // setPage(1);
    // setHasMore(true);
    // setInitialLoadComplete(false);
    fetchArtists(1); // Fetch page 1 initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch only on mount

  // --- Intersection Observer Setup ---
  const lastArtistElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("Intersection detected, fetching next page...");
          // Fetch the *current* value of 'page' which represents the *next* page to fetch
          fetchArtists(page);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchArtists, page] // Dependencies
  );

  // --- Render Loading Skeleton ---
  const renderSkeleton = (key) => (
    <Card key={key} className="overflow-hidden">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <Skeleton className="w-10 h-6 flex-shrink-0" /> {/* Rank */}
        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" /> {/* Avatar */}
        <div className="flex-grow space-y-2 text-center sm:text-left">
          <Skeleton className="h-6 w-3/4 sm:w-1/2" /> {/* Username */}
          <Skeleton className="h-4 w-1/2 sm:w-1/3" /> {/* Level */}
        </div>
        {/* Adjusted Skeleton for new stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-2 flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 border-dashed">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-1 text-center sm:text-right">
              <Skeleton className="h-5 w-10 mx-auto sm:mx-0 sm:ml-auto" />
              <Skeleton className="h-3 w-12 mx-auto sm:mx-0 sm:ml-auto" />
            </div>
          ))}
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

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 text-center text-destructive">Error: {error}</CardContent>
        </Card>
      )}

      {/* Top Artists List Area */}
      <div className="space-y-4">
        {/* Initial Loading Skeletons */}
        {!initialLoadComplete && loading && <>{Array.from({ length: 5 }).map((_, index) => renderSkeleton(`initial-skeleton-${index}`))}</>}

        {/* Displayed Artists */}
        {displayedArtists.map((artist, index) => (
          <div
            ref={displayedArtists.length === index + 1 ? lastArtistElementRef : null}
            key={artist.userId} // Use userId as the key
          >
            <ArtistCard artist={artist} rank={artist.rank} /> {/* Pass calculated rank */}
          </div>
        ))}

        {/* Loading More Indicator */}
        {loading && page > 1 && <>{Array.from({ length: 3 }).map((_, index) => renderSkeleton(`loading-skeleton-${index}`))}</>}

        {/* Empty State */}
        {initialLoadComplete && displayedArtists.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">No top artists found.</CardContent>
          </Card>
        )}

        {/* End of List Message */}
        {!loading && !hasMore && displayedArtists.length > 0 && initialLoadComplete && (
          <div className="text-center text-muted-foreground py-6">
            <p>You've reached the end of the list!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Artist Card Component ---
function ArtistCard({ artist, rank }) {
  // Accept rank as a prop
  const navigate = useNavigate();

  // Helper function to get rank text style
  const getRankStyle = (r) => {
    if (r === 1) return "text-yellow-500 font-bold";
    if (r === 2) return "text-gray-400 font-bold";
    if (r === 3) return "text-amber-700 font-bold";
    return "text-muted-foreground";
  };

  // Helper function to format large numbers (optional)
  const formatStat = (num) => {
    if (num >= 10000) return (num / 1000).toFixed(1) + "k";
    if (num >= 1000) return (num / 1000).toFixed(0) + "k";
    return num;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${artist.userId}`)}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Rank */}
        <div className={`w-10 text-center text-xl ${getRankStyle(rank)} flex-shrink-0`}>#{rank}</div>

        {/* Avatar */}
        <Avatar className="h-16 w-16 flex-shrink-0">
          {/* Use getFullStorageUrl helper */}
          <AvatarImage src={getFullStorageUrl(artist.avatar)} alt={artist.username} />
          <AvatarFallback>{artist.username ? artist.username.charAt(0).toUpperCase() : "?"}</AvatarFallback>
        </Avatar>

        {/* Artist Info */}
        <div className="flex-grow text-center sm:text-left">
          <h3 className="font-bold text-lg">{artist.username}</h3>
          {/* Removed username line as it's now the main title */}
          {/* Display Level */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground mt-1">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-transparent px-1.5 py-0.5 text-xs">
              Lvl {artist.level}
            </Badge>
            {/* Optional: Display Score */}
            {artist.score !== undefined && (
              <span className="flex items-center gap-1" title="Leaderboard Score">
                <Star className="h-3 w-3 text-yellow-500" /> {artist.score.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Stats Section - Updated for new data structure */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-2 text-center sm:text-right text-sm flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 border-dashed">
          <div title="Followers">
            <p className="font-semibold">{formatStat(artist.followers)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <User className="h-3 w-3" />
              Followers
            </p>
          </div>
          <div title="Total Likes Received">
            <p className="font-semibold">{formatStat(artist.likes)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <Heart className="h-3 w-3" />
              Likes
            </p>
          </div>
          <div title="Posts Created">
            <p className="font-semibold">{formatStat(artist.posts)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <Edit3 className="h-3 w-3" />
              Posts
            </p>
          </div>
          <div title="Experience Points">
            <p className="font-semibold">{formatStat(artist.exp)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <BookOpen className="h-3 w-3" />
              EXP
            </p>
          </div>
          <div title="Challenges Entered">
            <p className="font-semibold">{formatStat(artist.challanges)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <Target className="h-3 w-3" />
              Challenges
            </p>
          </div>
          <div title="Challenge Wins">
            <p className="font-semibold">{formatStat(artist.challangeWins)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <Trophy className="h-3 w-3" />
              Wins
            </p>
          </div>
          <div title="Achievements Unlocked">
            <p className="font-semibold">{formatStat(artist.achievements)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <Award className="h-3 w-3" />
              Achieve
            </p>
          </div>
          <div title="Badges Earned">
            <p className="font-semibold">{formatStat(artist.badges)}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
              <ShieldCheck className="h-3 w-3" />
              Badges
            </p>
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
