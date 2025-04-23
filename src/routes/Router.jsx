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
import EditProfile from "@/pages/EditProfile"; // Assuming this is the correct path
import TitleDescriptionResult from "@/pages/TitleDescriptionResult"; // Assuming this is the correct path
import TagsResult from "@/pages/TagsResult"; // Assuming this is the correct path
import TypeResult from "@/pages/TypeResult"; // Assuming this is the correct path
import UserResult from "@/pages/UserResult"; // Assuming this is the correct path
import Likes from "@/pages/Likes";
import Landing from "@/pages/Landing";
import Error404 from "@/errors/Error404/Error404";
import ProtectedRoute from "../components/ProtectedRoute"; // Assuming correct path
import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Coins, User } from "lucide-react";

const LoadingSpinner = () => (
  <motion.div
    className="fixed inset-0 flex justify-center items-center bg-background/80 z-50" // Added background and z-index
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <Coins className="w-10 h-10 text-primary" /> {/* Use primary color */}
  </motion.div>
);

const router = createBrowserRouter([
  // Route for the Landing Page (unauthenticated users primarily)
  {
    path: "/landing",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Landing />
      </Suspense>
    ),
    // This route does NOT use the main Layout or ProtectedRoute
    errorElement: <Error404 />, // Optional: You might want a simpler error page here
  },

  // Standalone Login and Register routes
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    ),

    errorElement: <Error404 />, // Optional: You might want a simpler error page here
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Register />
      </Suspense>
    ),

    errorElement: <Error404 />, // Optional: You might want a simpler error page here
  },

  // Routes for authenticated users, wrapped in Layout and ProtectedRoute
  {
    path: "/", // This path segment is just for grouping routes under Layout
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      </Suspense>
    ),
    errorElement: <Error404 />, // Catches errors for all child routes
    children: [
      {
        // Path for the authenticated user's home/dashboard
        // It becomes `/home` because the parent path is `/` and this path is relative
        path: "home",
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
        // Note: Path might need adjustment depending on how CreatePost is used.
        // If it's always related to the logged-in user, :userId might not be needed.
        path: "post/:type/:userId?", // Made userId optional if it can be inferred
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
      // EditProfile.jsx
      {
        path: "settings/profile",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <EditProfile /> {/* Assuming Profile component handles editing as well */}
            </ProtectedRoute>
          </Suspense>
        ),
      },
      // TitleDescriptionResult.jsx
      {
        path: "posts/title-desc",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <TitleDescriptionResult /> {/* Assuming this is the correct component */}
            </ProtectedRoute>
          </Suspense>
        ),
      },
      // TagsResult.jsx
      {
        path: "posts/tags",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <TagsResult /> {/* Assuming this is the correct component */}
            </ProtectedRoute>
          </Suspense>
        ),
      },
      // TypeResult.jsx
      {
        path: "posts/type",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <TypeResult /> {/* Assuming this is the correct component */}
            </ProtectedRoute>
          </Suspense>
        ),
      },
      // UserResult.jsx
      {
        path: "users/name",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <UserResult /> {/* Assuming this is the correct component */}
            </ProtectedRoute>
          </Suspense>
        ),
      },
      // Add a catch-all or redirect within the authenticated layout if needed
      // e.g., { path: "*", element: <Navigate to="/home" replace /> }
    ],
  },
]);

export default router;
