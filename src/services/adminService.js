import api from "@/api/axiosInstance";

// USERS
export const fetchAdminUsers = (params) => api.get("/admin/users", { params });
export const createAdminUser = (data) => api.post("/admin/users", data);
export const banUser = (id) => api.put(`/admin/users/${id}/ban`);
export const editUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// POSTS
export const fetchAdminPosts = (params) => api.get("/admin/posts", { params });
export const deletePost = (id) => api.delete(`/admin/posts/${id}`);

// REPORTS
export const fetchReportedPosts = (params) => api.get("/admin/posts/reported", { params });
export const fetchAllReports = (params) => api.get("/admin/reports", { params });
export const updateReportStatus = (reportId, data) => api.put(`/admin/reports/${reportId}/status`, data);
export const getReportStats = () => api.get("/admin/reports/statistics");

// DASHBOARD
export const fetchAdminDashboard = () => api.get("/admin/dashboard");
export const fetchAdminTrends = () => api.get("/admin/dashboard/trends");
