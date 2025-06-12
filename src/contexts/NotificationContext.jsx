// contexts/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { notificationService } from "@/services/notificationService";
import notificationSocket from "@/services/notificationSocket";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  socket: null,
  hasMore: true,
  isConnected: false,
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
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth(); // Initialize WebSocket connection using the new service
  useEffect(() => {
    if (!user) {
      // Clean up socket if user logs out
      notificationSocket.disconnect();
      setSocket(null);
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(true);
      setCurrentPage(1);
      setIsConnected(false);
      return;
    }

    // Connect to WebSocket using the new service
    const socketConnection = notificationSocket.connect();
    setSocket(socketConnection); // Register callbacks for new notifications
    const unsubscribeNotification = notificationSocket.onNewNotification((notification) => {
      console.log("New notification received via service:", notification);

      // Ensure notification has valid created_at field
      const normalizedNotification = {
        ...notification,
        created_at: notification.created_at || new Date().toISOString(),
      };

      // Validate the created_at field
      try {
        const testDate = new Date(normalizedNotification.created_at);
        if (isNaN(testDate.getTime())) {
          console.warn("Invalid created_at in notification, using current time:", notification.created_at);
          normalizedNotification.created_at = new Date().toISOString();
        }
      } catch (error) {
        console.warn("Error parsing created_at in notification:", error);
        normalizedNotification.created_at = new Date().toISOString();
      }

      // Add new notification to the list
      setNotifications((prev) => [normalizedNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Register callbacks for connection changes
    const unsubscribeConnection = notificationSocket.onConnectionChange((connected) => {
      console.log("WebSocket connection status changed:", connected);
      setIsConnected(connected);

      if (connected) {
        // Reload notifications when reconnected to ensure sync
        loadNotifications();
        loadUnreadCount();
      }
    }); // Set initial connection status
    setIsConnected(notificationSocket.getConnectionStatus().isConnected);

    // Load initial data
    loadNotifications();
    loadUnreadCount();

    return () => {
      // Cleanup
      unsubscribeNotification();
      unsubscribeConnection();
      notificationSocket.disconnect();
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
          // Normalize notifications to ensure valid created_at fields
          const normalizedData = response.data.map((notification) => {
            const normalizedNotification = {
              ...notification,
              created_at: notification.created_at || new Date().toISOString(),
            };

            // Validate the created_at field
            try {
              const testDate = new Date(normalizedNotification.created_at);
              if (isNaN(testDate.getTime())) {
                console.warn("Invalid created_at in API notification, using current time:", notification.created_at);
                normalizedNotification.created_at = new Date().toISOString();
              }
            } catch (error) {
              console.warn("Error parsing created_at in API notification:", error);
              normalizedNotification.created_at = new Date().toISOString();
            }

            return normalizedNotification;
          });

          if (append) {
            setNotifications((prev) => [...prev, ...normalizedData]);
          } else {
            setNotifications(normalizedData);
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
  }, []); // Handle notification click
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
    isConnected,
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
