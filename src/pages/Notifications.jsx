// pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Check, CheckCheck, Filter, RefreshCw } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, loadNotifications, handleNotificationClick } = useNotifications();

  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter notifications based on active tab and filter type
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread" && notification.is_read) return false;
    if (filterType !== "all" && notification.type !== filterType) return false;
    return true;
  });

  // Load notifications with filters
  const handleLoadNotifications = (params = {}) => {
    const loadParams = {
      page: currentPage,
      limit: 20,
      ...params,
    };

    if (activeTab === "unread") {
      loadParams.unread_only = true;
    }

    if (filterType !== "all") {
      loadParams.type = filterType;
    }

    loadNotifications(loadParams);
  };

  // Reload notifications when filters change
  useEffect(() => {
    handleLoadNotifications();
  }, [activeTab, filterType, currentPage]);

  // Get notification types for filter
  const notificationTypes = [
    { value: "all", label: "All Types" },
    { value: "like", label: "Likes" },
    { value: "comment", label: "Comments" },
    { value: "reply", label: "Replies" },
    { value: "follow", label: "Follows" },
    { value: "message", label: "Messages" },
    { value: "achievement_unlocked", label: "Achievements" },
    { value: "level_up", label: "Level Up" },
    { value: "challenge_winner", label: "Challenge Winners" },
    { value: "mention", label: "Mentions" },
    { value: "system", label: "System" },
  ];

  // Handle notification click with React Router navigation
  const handleLocalNotificationClick = (notification) => {
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
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleLoadNotifications()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button variant="default" size="sm" onClick={markAllAsRead} disabled={loading}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Unread
          </TabsTrigger>
        </TabsList>{" "}
        <TabsContent value="all" className="mt-6">
          <NotificationsList notifications={filteredNotifications} loading={loading} onNotificationClick={handleLocalNotificationClick} onMarkAsRead={markAsRead} />
        </TabsContent>
        <TabsContent value="unread" className="mt-6">
          <NotificationsList notifications={filteredNotifications} loading={loading} onNotificationClick={handleLocalNotificationClick} onMarkAsRead={markAsRead} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationsList({ notifications, loading, onNotificationClick, onMarkAsRead }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground">When you get notifications, they'll show up here.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
        <NotificationCard key={`notification-${notification.id}-${index}`} notification={notification} onClick={() => onNotificationClick(notification)} onMarkAsRead={() => onMarkAsRead(notification.id)} />
      ))}
    </div>
  );
}

function NotificationCard({ notification, onClick, onMarkAsRead }) {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

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
    switch (notification.type) {
      case "message":
        return `${senderUsername} sent you a message: "${notificationData.message_content}"`;
      case "exp_gain":
        return notificationData.message || `+${notificationData.exp_amount} EXP gained - ${notificationData.reason}`;
      case "like":
        return `${senderUsername} liked your post`;
      case "comment":
        return `${senderUsername} commented on your post`;
      case "reply":
        return `${senderUsername} replied to your comment`;
      case "follow":
        return `${senderUsername} started following you`;
      case "post_bookmarked":
        return `${senderUsername} bookmarked your post`;
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
        return `${senderUsername} mentioned you in a comment`;
      case "system":
        return notificationData.message || "System notification";
      default:
        return notificationData.message || "New notification";
    }
  };

  return (
    <Card className={`cursor-pointer transition-colors hover:bg-muted/50 ${!notification.is_read ? "border-l-4 border-l-primary bg-primary/5" : ""}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-full bg-muted/50 flex-shrink-0 ${color}`}>
            <span className="text-lg">{icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={`font-medium ${!notification.is_read ? "font-semibold" : ""}`}>{getTitle()}</h4>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}

                <Badge variant="outline" className="text-xs">
                  {notification.type.replace("_", " ")}
                </Badge>
              </div>
            </div>{" "}
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{getMessage()}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>

              {!notification.is_read && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
