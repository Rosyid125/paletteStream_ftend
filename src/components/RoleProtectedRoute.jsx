import React from "react";
import { Navigate } from "react-router-dom";

// Placeholder hook for authentication - replace with your actual auth logic
const useAuth = () => {
  // Example: Fetch user from context, local storage, or state management
  const user = { role: "admin" }; // Simulate an admin user
  // const user = { role: 'user' }; // Simulate a non-admin user
  // const user = null; // Simulate no user logged in

  return { isAuthenticated: !!user, userRole: user?.role };
};

const RoleProtectedRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "admin") {
    // Redirect to a 'not authorized' page or home page if not admin
    return <Navigate to="/home" replace />;
  }

  // Render the children (admin page) if authenticated and has admin role
  return <>{children}</>;
};

export default RoleProtectedRoute;
