import api from "../api/axiosInstance";

const API_URL = `/auth`;

// Fungsi untuk register dan auto login
export const register = async (data) => {
  const response = await api.post(`${API_URL}/register`, data);

  localStorage.setItem("user", JSON.stringify(response.data.data));

  const { email, password } = data;
  const loginResponse = await login({ email, password });

  return { registerResponse: response.data, loginResponse };
};

// Fungsi untuk login
export const login = async (data, navigate) => {
  const response = await api.post(`${API_URL}/login`, data);

  localStorage.setItem("user", JSON.stringify(response.data.data));

  console.log("Login data:", response.data.data.role);

  const role = response.data.data.role;

  // Jika ada navigate, arahkan ke halaman yang sesuai
  if (role === "admin" && navigate) {
    navigate("/admin/dashboard");
    console.log("Navigating to admin dashboard");
  } else if (navigate) {
    navigate("/home");
  }
  return {
    ...response.data,
  };
};

// Fungsi untuk fetch data user yang sedang login (endpoint /me)
export const fetchMe = async () => {
  const response = await api.get(`${API_URL}/me`);
  // Simpan user info di localStorage
  localStorage.setItem("user", JSON.stringify(response.data.data));
  // Kembalikan data user agar bisa diakses langsung
  return response.data;
};

// Fungsi untuk mendapatkan accessToken dan refreshToken dari backend untuk websocket
export const refreshTokenAndGet = async () => {
  const response = await api.post(`${API_URL}/ws/refresh-token-and-get`);
  return response.data;
};

// Fungsi untuk refresh token (otomatis pakai cookie, accessToken baru akan dikirim di response)
export const refreshToken = async () => {
  const response = await api.post(`${API_URL}/refresh-token`);
  // Kembalikan accessToken baru agar bisa di-set ke state app
  return response.data;
};

export const logout = async () => {
  await api.post(`${API_URL}/logout`);
  // Hapus user info di localStorage saat logout
  localStorage.removeItem("user");
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
  // Simpan user info di localStorage setelah login sukses
  localStorage.setItem("user", JSON.stringify(response.data.data));
  // Kembalikan data user
  return {
    ...response.data,
  };
};

// Resend OTP untuk login
export const resendLoginOtp = async (email) => {
  const response = await api.post(`/auth/login/email/resend`, { email });
  return response.data;
};

// Fungsi untuk login/register dengan Google OAuth2
export const loginWithGoogle = async () => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  window.location.href = `${baseUrl}/auth/login/google`;
  // Jalankan fetchMe
  await fetchMe();
};

export const forgotPasswordRequest = async (email) => {
  const response = await api.post(`/auth/forgot-password`, { email });
  return response.data;
};

export const forgotPasswordVerify = async ({ email, otp }) => {
  const response = await api.post(`/auth/forgot-password/verify`, { email, otp });
  return response.data;
};

export const forgotPasswordReset = async ({ email, otp, newPassword }) => {
  const response = await api.post(`/auth/forgot-password/reset`, { email, otp, newPassword });
  return response.data;
};
