// contexts/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  socket: null,
  hasMore: true,
  markAsRead: () => {},
  markAllAsRead: () => {},
  loadNotifications: () => {},
  loadMoreNotifications: () => {},
  loadUnreadCount: () => {},
  handleNotificationClick: () => {},
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) {
      // Clean up socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(true);
      setCurrentPage(1);
      return;
    }

    const socketConnection = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    }); // Listen for new notifications
    socketConnection.on("receive_notification", (notification) => {
      console.log("New notification received:", notification);

      // Add new notification to the list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      showToastNotification(notification);
    });

    // Listen for test notifications (development only)
    socketConnection.on("test_notification", (notification) => {
      console.log("Test notification received:", notification);

      // Add new notification to the list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      showToastNotification(notification);
    });

    // Handle token refresh
    socketConnection.on("refresh_tokens", (tokens) => {
      console.log("Tokens refreshed via WebSocket");
      // Note: Menggunakan HttpOnly cookies, tidak perlu simpan token manual
    });

    // Handle connection events
    socketConnection.on("connect", () => {
      console.log("Notification WebSocket connected:", socketConnection.id);
    });

    socketConnection.on("disconnect", () => {
      console.log("Notification WebSocket disconnected");
    });

    socketConnection.on("connect_error", (error) => {
      console.error("WebSocket connection failed:", error);
    });

    setSocket(socketConnection);

    // Load initial data
    loadNotifications();
    loadUnreadCount();

    return () => {
      socketConnection.disconnect();
    };
  }, [user]);
  // Load notifications from API with pagination
  const loadNotifications = useCallback(
    async (params = {}, append = false) => {
      if (!user) return;

      try {
        setLoading(true);
        const defaultParams = {
          page: append ? currentPage : 1,
          limit: 5,
          ...params,
        };

        const response = await notificationService.getNotifications(defaultParams);

        if (response.success) {
          if (append) {
            setNotifications((prev) => [...prev, ...response.data]);
          } else {
            setNotifications(response.data);
            setCurrentPage(1);
          }

          // Update pagination state
          const hasMoreData = response.data.length === defaultParams.limit;
          setHasMore(hasMoreData);

          if (append) {
            setCurrentPage((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [user, currentPage]
  );

  // Load more notifications (for pagination)
  const loadMoreNotifications = useCallback(async () => {
    if (!user || loading || !hasMore) return;

    await loadNotifications({}, true);
  }, [user, loading, hasMore, loadNotifications]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getUnreadCount();

      if (response.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);

      // Update local state
      setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)));

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllNotificationsAsRead();

      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));

      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  }, []);
  // Show toast notification for real-time notifications
  const showToastNotification = (notification) => {
    const icon = getNotificationIcon(notification.type);

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
          return `${senderUsername} sent you a message`;
        case "exp_gain":
          return notificationData.message || `+${notificationData.exp_amount} EXP gained`;
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
          return `You won ${notificationData.rank}${notificationData.rank === 1 ? "st" : notificationData.rank === 2 ? "nd" : notificationData.rank === 3 ? "rd" : "th"} place!`;
        case "challenge_badge":
          return `You earned "${notificationData.badge_name}" badge!`;
        case "challenge_deadline":
          return `Challenge ends in ${notificationData.hours_remaining} hours!`;
        case "post_leaderboard":
          return `Your post is trending!`;
        case "post_featured":
          return `Your post has been featured!`;
        case "mention":
          return `${senderUsername} mentioned you`;
        case "system":
          return notificationData.message || "System notification";
        default:
          return notificationData.message || "New notification";
      }
    };

    toast.custom(
      (t) => (
        <div
          className="bg-background border rounded-lg shadow-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => {
            handleNotificationClick(notification);
            toast.dismiss(t);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-xl flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{getTitle()}</h4>
              <p className="text-xs text-muted-foreground mt-1 truncate">{getMessage()}</p>
            </div>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
      }
    );
  };
  // Handle notification click
  const handleNotificationClick = useCallback(
    (notification) => {
      // Mark as read if not already read
      if (!notification.is_read) {
        markAsRead(notification.id);
      }

      // Navigate to redirect URL - check both locations
      const redirectUrl = notification.redirect_url || (notification.data && notification.data.redirect_url);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    [markAsRead]
  );
  const value = {
    notifications,
    unreadCount,
    loading,
    socket,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    loadMoreNotifications,
    loadUnreadCount,
    handleNotificationClick,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Get notification icon based on type
function getNotificationIcon(type) {
  const icons = {
    like: "❤️",
    comment: "💬",
    reply: "↩️",
    follow: "👥",
    message: "📩",
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
    mention: "@",
    system: "🔔",
  };
  return icons[type] || "🔔";
}
