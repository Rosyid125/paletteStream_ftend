import api from "@/api/axiosInstance";

// Get available report reasons
export const getReportReasons = () => api.get("/reports/reasons");

// Report a post
export const reportPost = (postId, data) => api.post(`/reports/posts/${postId}`, data);

// Admin: Get reported posts
export const getReportedPosts = (params) => api.get("/admin/posts/reported", { params });

// Admin: Get reports for specific post
export const getPostReports = (postId) => api.get(`/admin/posts/${postId}/reports`);

// Admin: Get all reports
export const getAllReports = (params) => api.get("/admin/reports", { params });

// Admin: Get report statistics
export const getReportStatistics = () => api.get("/admin/reports/statistics");

// Admin: Update report status
export const updateReportStatus = (reportId, status) => api.put(`/admin/reports/${reportId}/status`, { status });

// Admin: Delete report
export const deleteReport = (reportId) => api.delete(`/admin/reports/${reportId}`);
