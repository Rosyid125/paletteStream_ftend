const API_URL = "http://localhost:3000/api/auth"; // Sesuaikan dengan URL API kamu

// Utility function untuk fetch dengan kredensial (HTTP-only cookies)
const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
    credentials: "include", // Pastikan cookies dikirim dalam setiap request
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Something went wrong");
  }
  return result;
};

// Fungsi untuk register dan auto login
export const register = async (data) => {
  const response = await fetchWithAuth(`${API_URL}/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  // Save user in localStorage
  localStorage.setItem("user", JSON.stringify(response.user));

  // Auto login setelah berhasil register
  const { email, password } = data;
  const loginResponse = await login({ email, password });

  return { registerResponse: response, loginResponse };
};

// Fungsi untuk login
export const login = async (data) => {
  const response = await fetchWithAuth(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response; // Tidak perlu menyimpan token secara manual, karena sudah dikelola oleh cookies
};

// Fungsi untuk fetch data user yang sedang login (endpoint /me)
export const fetchMe = async () => {
  const response = await fetchWithAuth(`${API_URL}/me`);
  return response; // Mengembalikan data pengguna yang sedang login
};

// Fungsi untuk refresh token (tanpa mengambil dari localStorage)
export const refreshToken = async () => {
  const response = await fetchWithAuth(`${API_URL}/refresh-token`, {
    method: "POST",
  });

  return response; // Token baru otomatis tersimpan dalam cookies
};

// Fungsi untuk logout (menghapus session di backend)
export const logout = async () => {
  await fetchWithAuth(`${API_URL}/logout`, {
    method: "POST",
  });
};
