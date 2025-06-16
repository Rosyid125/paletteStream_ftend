import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axiosInstance";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        toast({
          title: "Authentication failed",
          description: "No authorization code found.",
        });
        navigate("/login");
        return;
      }

      try {
        // Call the backend callback endpoint which handles both login and registration
        const response = await api.get(`/auth/google/callback?code=${code}`);

        // Set user data to localStorage
        localStorage.setItem("user", JSON.stringify(response.data.data));

        toast({
          title: "Success",
          description: "Welcome to PaletteStream!",
        });

        // Check user role and navigate accordingly
        const role = response.data.data.role;
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      } catch (error) {
        console.error("Google authentication error:", error);
        toast({
          title: "Authentication failed",
          description: error?.response?.data?.message || "Something went wrong",
        });
        navigate("/login");
      }
    };

    handleGoogleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Authenticating with Google...</p>
      </div>
    </div>
  );
}
