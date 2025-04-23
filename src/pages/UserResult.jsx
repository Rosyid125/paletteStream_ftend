import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // Use Link for navigation
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Loader2 } from "lucide-react"; // Using Users icon
import api from "../api/axiosInstance";
import { toast } from "sonner"; // Optional: for feedback

// --- Constants ---
const RESULTS_PAGE_LIMIT = 20; // Default limit as per endpoint

// --- Helper function to construct full URL for storage paths ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedPath = path.replace(/\\/g, "/");
  let relativePath = normalizedPath;
  if (normalizedPath.startsWith("storage/")) {
    relativePath = normalizedPath;
  } else if (!normalizedPath.startsWith("/api") && !normalizedPath.startsWith("storage/")) {
    relativePath = `/api/${normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath}`;
  }
  const baseUrl = api.defaults.baseURL || window.location.origin;
  const separator = baseUrl.endsWith("/") ? "" : "/";
  try {
    const url = new URL(relativePath, baseUrl + separator);
    return url.href;
  } catch (e) {
    console.error("Error constructing image URL:", e);
    return "/placeholder.svg";
  }
};

// --- Component Start ---
export default function UserResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get search parameters from URL
  const query = searchParams.get("query") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || String(RESULTS_PAGE_LIMIT), 10);

  // State for fetched data and UI control
  const [results, setResults] = useState([]); // Holds user objects
  const [currentPage, setCurrentPage] = useState(initialPage); // Next page to fetch
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Ref for Intersection Observer
  const observer = useRef();

  // --- Fetching Logic ---
  const fetchResults = useCallback(
    async (pageNum, searchQuery) => {
      if (!searchQuery) {
        setResults([]);
        setHasMore(false);
        setInitialLoadComplete(true);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        return;
      }

      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      console.log(`Fetching user results page: ${pageNum}, query: ${searchQuery}`);

      try {
        const params = {
          query: searchQuery,
          page: pageNum,
          limit: limit,
          // No viewerId needed for user search typically
        };
        // --- Use the correct endpoint ---
        const response = await api.get("/users/search", { params });

        if (response.data?.success && Array.isArray(response.data.data)) {
          const fetchedData = response.data.data;

          // Basic processing for consistency (e.g., default level)
          const processedData = fetchedData.map((user) => ({
            ...user,
            id: Number(user.id),
            level: Number(user.level) || 1,
            exp: Number(user.exp) || 0,
            avatar: user.avatar || null,
            username: user.username || "Unknown User",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
          }));

          setResults((prevResults) => (pageNum === 1 ? processedData : [...prevResults, ...processedData]));
          setCurrentPage(pageNum + 1);
          setHasMore(processedData.length === limit);
        } else {
          setError(response.data?.message || "Failed to fetch users.");
          if (pageNum === 1) setResults([]);
          setHasMore(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "An error occurred.");
        if (pageNum === 1) setResults([]);
        setHasMore(false);
      } finally {
        if (pageNum === 1) {
          setLoading(false);
          setInitialLoadComplete(true);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [limit] // Dependency: only limit affects how many are fetched per page
  );

  // --- Effect for Initial Load and Query Change ---
  useEffect(() => {
    setResults([]);
    setCurrentPage(1);
    setHasMore(true);
    setInitialLoadComplete(false);
    setLoadingMore(false);
    setLoading(true);
    fetchResults(1, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Re-run ONLY when the 'query' from the URL changes

  // --- Intersection Observer Setup ---
  const lastResultRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("Intersection observer triggered fetch for next user page");
          fetchResults(currentPage, query);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchResults, currentPage, query] // Dependencies
  );

  // --- Render Loading Skeleton for User ---
  const renderSkeleton = (key) => (
    <Card key={key} className="overflow-hidden">
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-5 w-3/4" /> {/* Username */}
          <Skeleton className="h-4 w-1/2" /> {/* Name */}
          <Skeleton className="h-5 w-16 rounded-md" /> {/* Level Badge */}
        </div>
        <Skeleton className="h-9 w-24 rounded-md " /> {/* View Profile Button Placeholder */}
      </CardContent>
    </Card>
  );

  // --- Main Render ---
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <Card className="border-t-4 border-t-cyan-500">
        {" "}
        {/* Adjusted border color */}
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-500" /> {/* Users Icon */}
            <CardTitle>User Search Results</CardTitle>
          </div>
          <CardDescription>
            Showing users matching: <span className="font-semibold text-foreground">"{query}"</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Message Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          {" "}
          <CardContent className="p-4 text-center text-destructive">Error: {error}</CardContent>{" "}
        </Card>
      )}

      {/* Results List Area */}
      <div className="mt-6">
        {/* Initial Loading Skeletons */}
        {loading && <div className="space-y-4"> {Array.from({ length: 5 }).map((_, index) => renderSkeleton(`initial-skeleton-${index}`))} </div>}

        {/* Displayed Results List */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((user, index) => (
              <div ref={results.length === index + 1 ? lastResultRef : null} key={`${user.id}-${index}`}>
                {/* User Card component */}
                <UserCard user={user} />
              </div>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && <div className="space-y-4 mt-6"> {Array.from({ length: 3 }).map((_, index) => renderSkeleton(`loading-skeleton-${index}`))} </div>}

        {/* Empty State */}
        {initialLoadComplete && !loading && results.length === 0 && !error && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            <p>No users found matching "{query}".</p>
            <Button variant="link" onClick={() => navigate("/discover")} className="mt-2">
              Back to Discover
            </Button>
          </div>
        )}

        {/* End of List Message */}
        {!loading && !loadingMore && !hasMore && results.length > 0 && initialLoadComplete && (
          <div className="text-center text-muted-foreground py-10 col-span-full">
            {" "}
            <p>You've reached the end of the search results.</p>{" "}
          </div>
        )}
      </div>

      {/* No Comment Modal Needed for User Search */}
    </div>
  );
}

// --- User Card Component ---
function UserCard({ user }) {
  const navigate = useNavigate();
  // Combine first and last name, fallback to username
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
  const avatarUrl = getFullStorageUrl(user.avatar);

  // Navigate to profile on card click
  const handleNavigate = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    // Make the whole card clickable (more accessible than just wrapping in Link)
    // Or use Link component for the whole card if preferred styling allows.
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleNavigate}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <Avatar className="h-16 w-16 flex-shrink-0 border">
          <AvatarImage src={avatarUrl} alt={user.username} />
          <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-grow text-center sm:text-left">
          <h3 className="font-semibold text-lg">{user.username}</h3>
          {/* Show display name only if different from username */}
          {displayName !== user.username && <p className="text-sm text-muted-foreground">{displayName}</p>}
          <div className="mt-1">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-transparent">
              Level {user.level}
            </Badge>
          </div>
        </div>
        {/* Keep button for visual consistency, action handled by card onClick */}
        <Button variant="outline" size="sm" className="mt-3 sm:mt-0 sm:ml-auto" tabIndex={-1}>
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
