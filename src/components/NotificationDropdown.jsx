// components/NotificationDropdown.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, RefreshCw, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import NotificationSoundToggle from "@/components/NotificationSoundToggle";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, hasMore, markAsRead, markAllAsRead, handleNotificationClick, loadNotifications, loadMoreNotifications } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const handleNotificationItemClick = (notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to redirect URL using React Router
    const redirectUrl = notification.redirect_url || (notification.data && notification.data.redirect_url);
    if (redirectUrl) {
      // Extract the path from the URL (remove domain if present)
      const path = redirectUrl.startsWith("http") ? new URL(redirectUrl).pathname : redirectUrl;
      navigate(path);
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      await loadMoreNotifications();
    } finally {
      setIsLoadingMore(false);
    }
  };
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && !isLoadingMore && hasMore) {
      handleLoadMore();
    }
  };
  // Reset when dropdown opens
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open && notifications.length === 0) {
      // Load initial notifications when opening for the first time
      loadNotifications();
    }
  };
  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {" "}
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>{" "}
          <div className="flex items-center gap-1">
            <NotificationSoundToggle />

            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-8 px-2 text-xs">
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => loadNotifications()} className="h-8 px-2 text-xs">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>{" "}
        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto" onScroll={handleScroll}>
          {loading && notifications.length === 0 ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification, index) => (
                <NotificationItem key={`notification-${notification.id}-${index}`} notification={notification} onClick={() => handleNotificationItemClick(notification)} onMarkAsRead={() => markAsRead(notification.id)} />
              ))}

              {/* Loading More Indicator */}
              {isLoadingMore && (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-muted-foreground">Loading more...</span>
                  </div>
                </div>
              )}

              {/* Load More Button (fallback if scroll doesn't work) */}
              {!isLoadingMore && hasMore && (
                <div className="p-2 text-center border-t">
                  <Button variant="ghost" size="sm" onClick={handleLoadMore} className="text-xs">
                    Load more notifications
                  </Button>
                </div>
              )}

              {/* No more notifications indicator */}
              {!hasMore && notifications.length > 0 && <div className="p-2 text-center text-xs text-muted-foreground border-t">No more notifications</div>}
            </div>
          )}
        </div>{" "}
        {/* Footer - View All Link */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({ notification, onClick, onMarkAsRead }) {
  const icon = getNotificationIcon(notification.type);

  // Safe date parsing with fallback
  const getTimeAgo = () => {
    try {
      const date = new Date(notification.created_at);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn("Invalid date in notification:", notification.created_at, error);
      return "Just now";
    }
  };

  const timeAgo = getTimeAgo();

  // Extract data from notification based on API structure
  const notificationData = notification.data || {};
  const message = notificationData.message || "Notification";
  const senderUsername = notificationData.sender_username || notificationData.from_username || "";
  // Build title and message based on notification type and data
  const getTitle = () => {
    switch (notification.type) {
      case "message":
        return "New Message";
      case "exp_gain":
        return "EXP Gained";
      case "like":
        return "Post Liked";
      case "comment":
        return "New Comment";
      case "reply":
        return "Comment Reply";
      case "follow":
        return "New Follower";
      case "post_bookmarked":
        return "Post Bookmarked";
      case "achievement_unlocked":
        return "Achievement Unlocked!";
      case "level_up":
        return "Level Up!";
      case "challenge_winner":
        return "Challenge Winner!";
      case "challenge_badge":
        return "Badge Earned!";
      case "challenge_deadline":
        return "Challenge Deadline";
      case "post_leaderboard":
        return "Trending Post!";
      case "post_featured":
        return "Post Featured!";
      case "mention":
        return "You were mentioned";
      case "system":
        return "System Announcement";
      default:
        return "Notification";
    }
  };
  const getMessage = () => {
    const handleUsernameClick = (username, userId) => {
      if (userId) {
        navigate(`/profile/${userId}`);
        setIsOpen(false);
      }
    };

    // Helper to create clickable username
    const createClickableUsername = (username, userId) => {
      if (!username || !userId) return username;
      return (
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            handleUsernameClick(username, userId);
          }}
        >
          {username}
        </span>
      );
    };

    const senderUserId = notificationData.sender_user_id || notificationData.from_user_id;
    const clickableUsername = createClickableUsername(senderUsername, senderUserId);

    switch (notification.type) {
      case "message":
        return <span>{clickableUsername} sent you a message</span>;
      case "exp_gain":
        return notificationData.message || `+${notificationData.exp_amount} EXP gained`;
      case "like":
        return <span>{clickableUsername} liked your post</span>;
      case "comment":
        return <span>{clickableUsername} commented on your post</span>;
      case "reply":
        return <span>{clickableUsername} replied to your comment</span>;
      case "follow":
        return <span>{clickableUsername} started following you</span>;
      case "post_bookmarked":
        return <span>{clickableUsername} bookmarked your post</span>;
      case "achievement_unlocked":
        return `You unlocked "${notificationData.achievement_name}" achievement!`;
      case "level_up":
        return `Congratulations! You reached level ${notificationData.new_level}`;
      case "challenge_winner":
        return `You won ${notificationData.rank}${notificationData.rank === 1 ? "st" : notificationData.rank === 2 ? "nd" : notificationData.rank === 3 ? "rd" : "th"} place in "${notificationData.challenge_title}" challenge!`;
      case "challenge_badge":
        return `You earned "${notificationData.badge_name}" badge from challenge!`;
      case "challenge_deadline":
        return `"${notificationData.challenge_title}" challenge ends in ${notificationData.hours_remaining} hours!`;
      case "post_leaderboard":
        return `Your post is trending in Top ${notificationData.rank}!`;
      case "post_featured":
        return `Your post has been featured!`;
      case "mention":
        return <span>{clickableUsername} mentioned you in a comment</span>;
      case "system":
        return notificationData.message || "System notification";
      default:
        return notificationData.message || message;
    }
  };

  return (
    <DropdownMenuItem
      className={`
        p-4 cursor-pointer focus:bg-muted/50 flex flex-col items-start gap-0
        ${!notification.is_read ? "bg-primary/5 border-l-2 border-l-primary" : ""}
      `}
      onClick={onClick}
    >
      <div className="flex gap-3 w-full">
        <div className={`p-2 rounded-full bg-muted/50 flex-shrink-0 ${getNotificationColor(notification.type)}`}>
          <span className="text-sm">{icon}</span>
        </div>{" "}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${!notification.is_read ? "font-semibold" : ""}`}>{getTitle()}</h4>
            {!notification.is_read && (
              <div
                className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
              />
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{getMessage()}</p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {notification.type && (
              <Badge variant="outline" className="text-xs">
                {notification.type.replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}

// Get notification icon based on type
function getNotificationIcon(type) {
  const icons = {
    like: "❤️",
    comment: "💬",
    reply: "↩️",
    follow: "👥",
    message: "📩",
    post_bookmarked: "🔖",
    achievement_unlocked: "🏆",
    level_up: "⬆️",
    exp_gain: "⭐",
    challenge_winner: "🥇",
    challenge_badge: "🏅",
    challenge_deadline: "⏰",
    post_leaderboard: "📈",
    post_reported: "⚠️",
    post_featured: "✨",
    post_deleted: "🗑️",
    comment_deleted: "🗑️",
    mention: "📌",
    system: "🔔",
  };
  return icons[type] || "🔔";
}

// Get notification color theme based on type
function getNotificationColor(type) {
  const colors = {
    like: "text-red-500",
    comment: "text-blue-500",
    reply: "text-blue-500",
    follow: "text-green-500",
    message: "text-blue-500",
    post_bookmarked: "text-yellow-500",
    achievement_unlocked: "text-yellow-500",
    level_up: "text-green-500",
    exp_gain: "text-yellow-500",
    challenge_winner: "text-yellow-500",
    challenge_badge: "text-yellow-500",
    challenge_deadline: "text-orange-500",
    post_leaderboard: "text-green-500",
    post_reported: "text-red-500",
    post_featured: "text-purple-500",
    post_deleted: "text-red-500",
    comment_deleted: "text-red-500",
    mention: "text-blue-500",
    system: "text-gray-500",
  };
  return colors[type] || "text-gray-500";
}
