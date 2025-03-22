import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Discover from "@/pages/Discover";
import Challenges from "@/pages/Challenges";
import TopArtists from "@/pages/TopArtists";
import TopArtworks from "@/pages/TopArtworks";
import WeeklyWinners from "@/pages/WeeklyWinners";
import CreatePost from "@/pages/CreatePost";
import Bookmarks from "@/pages/Bookmarks";
import Likes from "@/pages/Likes";
import Error404 from "@/errors/Error404/Error404";
import ProtectedRoute from "../components/ProtectedRoute";
import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";

const LoadingSpinner = () => (
  <motion.div className="fixed inset-0 flex justify-center items-center" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
    <Coins className="w-10 h-10 text-red-600" />
  </motion.div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "profile/:userId",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "discover",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Discover />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "challenges",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "top-artists",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <TopArtists />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "top-artworks",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <TopArtworks />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "weekly-winners",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <WeeklyWinners />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "post/:type/:userId",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "bookmarks",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "likes",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Likes />
            </ProtectedRoute>
          </Suspense>
        ),
      },
    ],
  },
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
]);

export default router;
