import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authMiddleware } from "../middlewares/authMiddleware";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const LoadingSpinner = () => (
    <motion.div className="fixed inset-0 flex justify-center items-center" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
      <Coins className="w-10 h-10 text-red-600" />
    </motion.div>
  );

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await authMiddleware((path) => <Navigate to={path} />);
      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
