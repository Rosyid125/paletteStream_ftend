import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, redirect to home, otherwise to landing
  return user ? <Navigate to="/home" replace /> : <Navigate to="/landing" replace />;
}
