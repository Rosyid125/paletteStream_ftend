import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/MainLayout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import Error404 from "@/errors/Error404/Error404";

// Deklarasi lazy load ketika page children sedang dimuat
const Home = React.lazy(() => import("@/pages/Home/Home"));
const Profile = React.lazy(() => import("@/pages/Profile/Profile"));
const Discover = React.lazy(() => import("@/pages/Discover/Discover"));
const Challenges = React.lazy(() => import("@/pages/Challenges/Challenges"));
const TopArtists = React.lazy(() => import("@/pages/TopArtists/TopArtists"));
const TopArtworks = React.lazy(() => import("@/pages/TopArtworks/TopArtworks"));
const WeeklyWinners = React.lazy(() => import("@/pages/WeeklyWinners/WeeklyWinners"));
const CreatePost = React.lazy(() => import("@/pages/CreatePost/CreatePost"));

// Rute komponen + halaman
export const router = createBrowserRouter([
  {
    // Komponen statis yang merupakan parents
    path: "/",
    element: <Layout />,
    errorElement: <Error404 />,
    // Komponen dinamis yang akah menjadi children dari komponen statis
    children: [
      {
        path: "/home",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <Home />
          </Suspense>
        ),
      },
      {
        path: "profile/:username",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "/discover",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <Discover />
          </Suspense>
        ),
      },
      {
        path: "/challenges",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <Challenges />
          </Suspense>
        ),
      },
      // Second sidebar menus group
      {
        path: "/top-artists",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <TopArtists />
          </Suspense>
        ),
      },
      {
        path: "/top-artworks",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <TopArtworks />
          </Suspense>
        ),
      },
      {
        path: "/weekly-winners",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <WeeklyWinners />
          </Suspense>
        ),
      },
      {
        path: "/post/:type",
        element: (
          <Suspense
            fallback={
              <motion.div className="flex justify-center items-center min-h-screen" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Coins className="w-10 h-10 text-red-600" />
              </motion.div>
            }
          >
            <CreatePost />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
