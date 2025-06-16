import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { registerWithGoogle } from "@/services/authService";
import api from "@/api/axiosInstance";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleRegister = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        toast({ title: "Google register failed", description: "No code found in callback." });
        navigate("/register");
        return;
      }
      try {
        // 1. Fetch Google profile from backend using the configured API instance
        const res = await api.get(`/auth/google/profile?code=${code}`);
        const profile = res.data;

        // 2. Register user to backend
        const regRes = await registerWithGoogle(profile);
        toast({ title: "Registration successful", description: "Welcome to PaletteStream!" });
        navigate("/home");
      } catch (error) {
        toast({ title: "Google register failed", description: error?.message || "Something went wrong" });
        navigate("/register");
      }
    };
    handleGoogleRegister();
    // eslint-disable-next-line
  }, []);

  return <div className="flex items-center justify-center min-h-screen">Registering with Google...</div>;
}
