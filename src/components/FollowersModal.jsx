import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, UserMinus, MessageCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

// Helper function to construct full URL for storage paths
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.replace(/\\/g, "/");
  let relativePath = normalizedPath;

  if (normalizedPath.startsWith("storage/")) {
    relativePath = normalizedPath;
  } else if (!normalizedPath.startsWith("/api") && !normalizedPath.startsWith("storage/")) {
    relativePath = normalizedPath;
  }

  const baseUrl = api.defaults.baseURL || window.location.origin;
  const separator = baseUrl.endsWith("/") ? "" : "/";

  try {
    const url = new URL(relativePath, baseUrl + separator);
    return url.href;
  } catch (e) {
    console.error("Error constructing image URL:", e, `Base: ${baseUrl}`, `Path: ${relativePath}`);
    return "/placeholder.svg";
  }
};

const FollowersModal = ({ isOpen, onClose, userId, userProfile, initialTab = "followers" }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // State for tabs
  const [activeTab, setActiveTab] = useState(initialTab);

  // State for followers
  const [followers, setFollowers] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState(null);
  const [followersPagination, setFollowersPagination] = useState({});
  const [followersPage, setFollowersPage] = useState(1);

  // State for following
  const [following, setFollowing] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState(null);
  const [followingPagination, setFollowingPagination] = useState({});
  const [followingPage, setFollowingPage] = useState(1);

  // State for follow actions
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [followActionLoading, setFollowActionLoading] = useState(new Set());

  // Fetch followers
  const fetchFollowers = async (page = 1) => {
    if (!userId) return;

    setFollowersLoading(true);
    setFollowersError(null);

    try {
      const response = await api.get(`/follows/${userId}/followers`, {
        params: { page, limit: 20 },
      });

      if (response.data.success) {
        setFollowers(response.data.data || []);
        setFollowersPagination(response.data.pagination || {});
        setFollowersPage(page);

        // Check which users current user is following
        if (currentUser?.id) {
          const userIds = response.data.data?.map((user) => user.user_id) || [];
          checkFollowingStatus(userIds);
        }
      } else {
        setFollowersError(response.data.message || "Failed to load followers");
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowersError(error.response?.data?.message || "Failed to load followers");
    } finally {
      setFollowersLoading(false);
    }
  };

  // Fetch following
  const fetchFollowing = async (page = 1) => {
    if (!userId) return;

    setFollowingLoading(true);
    setFollowingError(null);

    try {
      const response = await api.get(`/follows/${userId}/following`, {
        params: { page, limit: 20 },
      });

      if (response.data.success) {
        setFollowing(response.data.data || []);
        setFollowingPagination(response.data.pagination || {});
        setFollowingPage(page);

        // Check which users current user is following
        if (currentUser?.id) {
          const userIds = response.data.data?.map((user) => user.user_id) || [];
          checkFollowingStatus(userIds);
        }
      } else {
        setFollowingError(response.data.message || "Failed to load following");
      }
    } catch (error) {
      console.error("Error fetching following:", error);
      setFollowingError(error.response?.data?.message || "Failed to load following");
    } finally {
      setFollowingLoading(false);
    }
  };
  // Check following status for multiple users
  const checkFollowingStatus = async (userIds) => {
    if (!currentUser?.id || userIds.length === 0) return;

    try {
      // For now, we'll assume the API doesn't return follow status
      // So we'll start with empty set and update based on user actions
      const followingSet = new Set();
      setFollowingUsers(followingSet);
    } catch (error) {
      console.error("Error checking following status:", error);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (targetUserId, currentlyFollowing) => {
    if (!currentUser?.id || targetUserId === currentUser.id) return;

    setFollowActionLoading((prev) => new Set([...prev, targetUserId]));

    try {
      await api.post(`/follows/create-delete/${targetUserId}`);

      // Update local state
      setFollowingUsers((prev) => {
        const newSet = new Set(prev);
        if (currentlyFollowing) {
          newSet.delete(targetUserId);
        } else {
          newSet.add(targetUserId);
        }
        return newSet;
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowActionLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  // Handle user profile navigation
  const handleUserClick = (username) => {
    const userIdFromData = followers.find((u) => u.username === username)?.user_id || following.find((u) => u.username === username)?.user_id;
    if (userIdFromData) {
      navigate(`/profile/${userIdFromData}`);
      onClose();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown";
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen && userId) {
      if (activeTab === "followers") {
        fetchFollowers(1);
      } else {
        fetchFollowing(1);
      }
    }
  }, [isOpen, userId, activeTab]);

  useEffect(() => {
    if (isOpen && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFollowers([]);
      setFollowing([]);
      setFollowersPage(1);
      setFollowingPage(1);
      setFollowersError(null);
      setFollowingError(null);
    }
  }, [isOpen]);

  // Render user list item
  const renderUserItem = (user, isFollowing) => {
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
    const avatarUrl = getFullStorageUrl(user.avatar);
    const isCurrentUser = currentUser?.id === user.user_id;
    const userIsFollowing = followingUsers.has(user.user_id);
    const isFollowLoading = followActionLoading.has(user.user_id);

    return (
      <div key={user.user_id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-offset-2 ring-offset-background hover:ring-primary/50 transition-all" onClick={() => handleUserClick(user.username)}>
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{user.first_name?.charAt(0) || user.username?.charAt(0) || "?"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-sm cursor-pointer hover:text-primary transition-colors truncate" onClick={() => handleUserClick(user.username)}>
                {displayName}
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            {user.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {isFollowing ? "Following" : "Followed"} since {formatDate(user.followed_at)}
            </p>
          </div>
        </div>

        {!isCurrentUser && currentUser?.id && (
          <div className="flex items-center space-x-2 ml-3">
            <Button variant={userIsFollowing ? "outline" : "default"} size="sm" onClick={() => handleFollowToggle(user.user_id, userIsFollowing)} disabled={isFollowLoading} className="min-w-[80px]">
              {isFollowLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : userIsFollowing ? (
                <>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render pagination
  const renderPagination = (pagination, currentPage, onPageChange) => {
    if (!pagination.total_pages || pagination.total_pages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-4 py-4 border-t">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={!pagination.has_prev}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {pagination.current_page} of {pagination.total_pages}
        </span>

        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={!pagination.has_next}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl max-h-[90vh] p-0 rounded-lg sm:rounded-xl overflow-x-hidden" style={{ width: "100%", minWidth: 0 }}>
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Users className="h-5 w-5" />
            <span>{userProfile?.username ? `@${userProfile.username}` : "User"}</span>
          </DialogTitle>
        </DialogHeader>{" "}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full gap-1 px-2 sm:px-6 mb-2 sm:mb-4 bg-background rounded-t-lg border-b border-border" style={{ boxSizing: "border-box" }}>
            <TabsTrigger value="followers" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-1 px-2 sm:px-3">
              <span>Followers</span>
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                {userProfile?.followers ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-1 px-2 sm:px-3">
              <span>Following</span>
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                {userProfile?.followings ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="mt-0">
            <ScrollArea className="h-[60vh] sm:h-[450px] px-1 sm:px-0">
              {followersLoading ? (
                renderSkeleton()
              ) : followersError ? (
                <div className="flex items-center justify-center h-40 text-center p-4">
                  <div>
                    <p className="text-red-500 font-medium mb-1">⚠️ Failed to load followers</p>
                    <p className="text-sm text-muted-foreground mb-3">{followersError}</p>
                    <Button variant="outline" size="sm" onClick={() => fetchFollowers(followersPage)} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : followers.length > 0 ? (
                <div>
                  <div className="px-1 sm:px-2">{followers.map((user) => renderUserItem(user, false))}</div>
                  {renderPagination(followersPagination, followersPage, fetchFollowers)}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-center">
                  <div>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No followers yet</p>{" "}
                    <p className="text-sm text-muted-foreground mt-1">
                      {userProfile?.username === currentUser?.username ? "Keep creating amazing content to attract followers!" : `${userProfile?.first_name || userProfile?.username} hasn't gained any followers yet.`}
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="following" className="mt-0">
            <ScrollArea className="h-[60vh] sm:h-[450px] px-1 sm:px-0">
              {followingLoading ? (
                renderSkeleton()
              ) : followingError ? (
                <div className="flex items-center justify-center h-40 text-center p-4">
                  <div>
                    <p className="text-red-500 font-medium mb-1">⚠️ Failed to load following</p>
                    <p className="text-sm text-muted-foreground mb-3">{followingError}</p>
                    <Button variant="outline" size="sm" onClick={() => fetchFollowing(followingPage)} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : following.length > 0 ? (
                <div>
                  <div className="px-1 sm:px-2">{following.map((user) => renderUserItem(user, true))}</div>
                  {renderPagination(followingPagination, followingPage, fetchFollowing)}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-center">
                  <div>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Not following anyone</p>{" "}
                    <p className="text-sm text-muted-foreground mt-1">
                      {userProfile?.username === currentUser?.username ? "Discover amazing artists to follow!" : `${userProfile?.first_name || userProfile?.username} isn't following anyone yet.`}
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
