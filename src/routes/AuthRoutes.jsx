// src/routes/AuthRoutes.jsx
import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";

const LoadingSpinner = () => (
  <motion.div className="fixed inset-0 flex justify-center items-center" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
    <Coins className="w-10 h-10 text-red-600" />
  </motion.div>
);

const Login = React.lazy(() => import("@/pages/Login"));
const Register = React.lazy(() => import("@/pages/Register"));

const AuthRoutes = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Register />
      </Suspense>
    ),
  },
];

export default AuthRoutes;
