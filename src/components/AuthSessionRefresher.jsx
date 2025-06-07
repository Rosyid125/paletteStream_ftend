import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken, logout } from "@/services/authService";

export default function AuthSessionRefresher() {
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    const user = localStorage.getItem("user");
    if (user) {
      interval = setInterval(async () => {
        try {
          await refreshToken();
        } catch (err) {
          await logout();
          localStorage.removeItem("user");
          navigate("/login");
        }
      }, 10 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [navigate]);

  return null;
}
