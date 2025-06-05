import api from "../api/axiosInstance";

const API_URL = `/auth`; // Sesuaikan dengan URL API kamu

// Fungsi untuk register dan auto login
export const register = async (data) => {
  const response = await api.post(`${API_URL}/register`, data);

  // Save user in localStorage
  localStorage.setItem("user", JSON.stringify(response.data.data));

  // Auto login setelah berhasil register
  const { email, password } = data;
  const loginResponse = await login({ email, password });

  return { registerResponse: response.data, loginResponse };
};

// Fungsi untuk login
export const login = async (data) => {
  const response = await api.post(`${API_URL}/login`, data);

  // Save user in localStorage
  localStorage.setItem("user", JSON.stringify(response.data.data));

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

// Request OTP untuk register
export const requestRegisterOtp = async (email) => {
  const response = await api.post(`/auth/register/otp`, { email });
  return response.data;
};

// Register user baru dengan OTP
export const registerWithOtp = async (data) => {
  // Register user
  const response = await api.post(`/auth/register`, data);
  // Setelah register sukses, lakukan auto login
  const { email, password } = data;
  const loginResponse = await login({ email, password });
  // login() sudah menyimpan user ke localStorage
  return { registerResponse: response.data, loginResponse };
};

// Request OTP untuk login
export const requestLoginOtp = async (email) => {
  const response = await api.post(`/auth/login/email`, { email });
  return response.data;
};

// Verifikasi OTP untuk login
export const verifyLoginOtp = async (data) => {
  const response = await api.post(`/auth/login/email/verify`, data);
  // Save user in localStorage
  localStorage.setItem("user", JSON.stringify(response.data.data));
  return response.data;
};

// Resend OTP untuk login
export const resendLoginOtp = async (email) => {
  const response = await api.post(`/auth/login/email/resend`, { email });
  return response.data;
};

// Fungsi untuk login/register dengan Google OAuth2
export const loginWithGoogle = () => {
  // Ganti URL jika endpoint backend berbeda
  const baseUrl = import.meta.env.VITE_API_URL || "";
  window.location.href = `${baseUrl}/auth/login/google`;
};
