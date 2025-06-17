import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchMe } from "@/services/authService";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const error = params.get("error");
      const message = params.get("message");

      if (success === "true") {
        try {
          // Fetch user data since authentication was successful
          await fetchMe();

          toast({
            title: "Success",
            description: message || "Welcome to PaletteStream!",
          });

          // Get user data from localStorage to check role
          const userData = JSON.parse(localStorage.getItem("user") || "{}");
          const role = userData.role;

          if (role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/home");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Authentication failed",
            description: "Could not fetch user data",
          });
          navigate("/login");
        }
      } else {
        // Authentication failed
        toast({
          title: "Authentication failed",
          description: message || error || "Google authentication failed",
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
        <p>Processing Google authentication...</p>
      </div>
    </div>
  );
}
