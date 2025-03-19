// src/routes/MainRoutes.jsx
import React, { Suspense } from "react";
import Layout from "@/layouts/Layout";
import Error404 from "@/errors/Error404/Error404";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
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
import ProtectedRoute from "../components/ProtectedRoute";

const LoadingSpinner = () => (
  <motion.div className="fixed inset-0 flex justify-center items-center" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
    <Coins className="w-10 h-10 text-red-600" />
  </motion.div>
);

const routes = [
  { path: "/home", component: Home },
  { path: "profile/:username", component: Profile },
  { path: "/discover", component: Discover },
  { path: "/challenges", component: Challenges },
  { path: "/top-artists", component: TopArtists },
  { path: "/top-artworks", component: TopArtworks },
  { path: "/weekly-winners", component: WeeklyWinners },
  { path: "/post/:type", component: CreatePost },
  { path: "/bookmarks", component: Bookmarks },
  { path: "/likes", component: Likes },
];

const MainRoutes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error404 />,
    children: routes.map(({ path, component: Component }) => ({
      path,
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <ProtectedRoute>
            <Component />
          </ProtectedRoute>
        </Suspense>
      ),
    })),
  },
];

export default MainRoutes;
