// src/components/LikesHoverCard.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import api from "./../api/axiosInstance"; // Adjust path if necessary

// Helper function to format image URLs (can be imported from a shared utils file)
const formatImageUrl = (imagePath) => {
  if (!imagePath) return "/storage/avatars/noimage.png"; // Default fallback
  const cleanedPath = imagePath.replace(/\\/g, "/");

  if (cleanedPath.startsWith("http") || cleanedPath.startsWith("/storage")) {
    return cleanedPath.startsWith("/storage") ? `${api.defaults.baseURL}${cleanedPath}` : cleanedPath;
  }
  // Assuming relative paths need the base URL
  const baseUrl = api.defaults.baseURL.endsWith("/") ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
  const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
  return `${baseUrl}/${relativePath}`;
};

export function LikesHoverCard({ postId }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Using a high limit as per example, pagination might be overkill for a hover card
  const LIKES_LIMIT = 50;

  useEffect(() => {
    if (!postId) return; // Don't fetch if postId is not provided

    const fetchLikes = async () => {
      setLoading(true);
      setError(null);
      setLikes([]); // Clear previous likes

      try {
        console.log(`Fetching likes for post ID: ${postId}`);
        const response = await api.get(`/likes/${postId}`, {
          params: {
            page: 1, // Fetch first page
            limit: LIKES_LIMIT,
          },
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          setLikes(response.data.data);
          if (response.data.data.length === 0) {
            console.log(`No likes found for post ${postId}`);
          }
        } else {
          console.error("Failed to fetch likes or invalid data:", response.data);
          setError("Could not load likes.");
        }
      } catch (err) {
        console.error("Error fetching likes:", err);
        setError("An error occurred while loading likes.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [postId]); // Refetch if postId changes

  return (
    <div className="p-4 w-64">
      {" "}
      {/* Added padding and width */}
      <h4 className="text-sm font-semibold mb-2">Liked by</h4>
      <ScrollArea className="h-[150px]">
        {" "}
        {/* Adjust height as needed */}
        <div className="space-y-3 pr-3">
          {loading &&
            // Skeletons for loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`like-skeleton-${index}`} className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}

          {!loading && error && <p className="text-xs text-red-600">{error}</p>}

          {!loading && !error && likes.length === 0 && <p className="text-xs text-muted-foreground">No likes yet.</p>}

          {!loading &&
            !error &&
            likes.length > 0 &&
            likes.map((like) => (
              <div key={like.user_id} className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={formatImageUrl(like.avatar)} alt={like.username} />
                  <AvatarFallback>{like.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium leading-none">{like.username}</p>
                  <p className="text-xs text-muted-foreground">Level {like.level || 1}</p>
                </div>
                {/* Optional: Add a follow button? */}
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

LikesHoverCard.propTypes = {
  postId: PropTypes.number.isRequired,
};
