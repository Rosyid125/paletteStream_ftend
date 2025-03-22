import api from "../api/axiosInstance";

const API_URL = `/auth`; // Sesuaikan dengan URL API kamu

// Fungsi untuk register dan auto login
export const register = async (data) => {
  const response = await api.post(`${API_URL}/register`, data);

  // Save user in localStorage
  localStorage.setItem("user", JSON.stringify(response.data.user));

  // Auto login setelah berhasil register
  const { email, password } = data;
  const loginResponse = await login({ email, password });

  return { registerResponse: response.data, loginResponse };
};

// Fungsi untuk login
export const login = async (data) => {
  const response = await api.post(`${API_URL}/login`, data);

  // Save user in localStorage
  localStorage.setItem("user", JSON.stringify(response.data.user));

  return response.data;
};

// Fungsi untuk fetch data user yang sedang login (endpoint /me)
export const fetchMe = async () => {
  const response = await api.get(`${API_URL}/me`);
  return response.data; // Mengembalikan data pengguna yang sedang login
};

// Fungsi untuk refresh token (tanpa mengambil dari localStorage)
export const refreshToken = async () => {
  const response = await api.post(`${API_URL}/refresh-token`);
  return response.data; // Token baru otomatis tersimpan dalam cookies
};

// Fungsi untuk logout (menghapus session di backend)
export const logout = async () => {
  await api.post(`${API_URL}/logout`);
};
