import { fetchMe, refreshToken } from "@/services/authService";

export const authMiddleware = async (navigate) => {
  try {
    const user = await fetchMe();

    return user; // Jika berhasil, kembalikan data user
  } catch (error) {
    console.error("Error fetching user:", error.message);

    if (error.message === "Token expired" || error.message === "Invalid token") {
      try {
        await refreshToken(); // Refresh token
        const user = await fetchMe(); // Fetch ulang data user

        return user;
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError.message);
        navigate("/login"); // Redirect ke login jika gagal
      }
    } else {
      navigate("/login"); // Redirect ke login untuk error lain
    }
  }
};
