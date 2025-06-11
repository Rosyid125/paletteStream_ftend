// services/notificationService.js
import api from "@/api/axiosInstance";

export const notificationService = {
  // Get user notifications with pagination and filters
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.type) queryParams.append("type", params.type);
    if (params.unread_only) queryParams.append("unread_only", params.unread_only);

    const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  // Mark specific notification as read
  markNotificationAsRead: async (notificationId) => {
    const response = await api.post("/notifications/read", {
      notification_id: notificationId,
    });
    return response.data;
  },

  // Mark notifications by type as read
  markNotificationsByTypeAsRead: async (type) => {
    const response = await api.post("/notifications/read", {
      type: type,
    });
    return response.data;
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    const response = await api.post("/notifications/mark-all-read");
    return response.data;
  },

  // Get notifications by type
  getNotificationsByType: async (type, params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const url = `/notifications/type/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get available notification types
  getNotificationTypes: async () => {
    const response = await api.get("/notifications/types");
    return response.data;
  },
};
