import api from "@/api/axiosInstance";

// Public Endpoints - Mendapatkan semua challenges
export const getAllChallenges = () => api.get("/challenges");

// Public Endpoints - Mendapatkan challenges yang aktif
export const getActiveChallenges = () => api.get("/challenges/active");

// Public Endpoints - Mendapatkan challenge berdasarkan ID
export const getChallengeById = (id) => api.get(`/challenges/${id}`);

// Public Endpoints - Mendapatkan leaderboard challenge
export const getChallengeLeaderboard = (id) => api.get(`/challenges/${id}/leaderboard`);

// Public Endpoints - Mendapatkan pemenang challenge
export const getChallengeWinners = (id) => api.get(`/challenges/${id}/winners`);

// User Endpoints - Submit post ke challenge
export const submitPostToChallenge = (challengeId, postId) => api.post(`/challenges/${challengeId}/submit-post`, { postId });

// User Endpoints - Mendapatkan history challenge user
export const getUserChallengeHistory = () => api.get("/user/challenge-history");

// Admin Endpoints - Membuat challenge baru
export const createChallenge = (formData) =>
  api.post("/challenges", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Admin Endpoints - Update challenge
export const updateChallenge = (id, formData) =>
  api.put(`/challenges/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Admin Endpoints - Tutup challenge
export const closeChallenge = (id) => api.put(`/challenges/${id}/close`);

// Admin Endpoints - Hapus challenge
export const deleteChallenge = (id) => api.delete(`/challenges/${id}`);

// Admin Endpoints - Pilih pemenang
export const selectWinners = (challengeId, winnerUserIds, adminNote) =>
  api.post(`/challenges/${challengeId}/select-winners`, {
    winnerUserIds,
    adminNote,
  });
