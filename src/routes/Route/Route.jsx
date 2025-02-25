import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/MainLayout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Deklarasi lazy load ketika page children sedang dimuat
const Home = React.lazy(() => import("@/pages/Home/Home"));
const Profile = React.lazy(() => import("@/pages/Profile/Profile"));

// Rute komponen + halaman
export const router = createBrowserRouter([
  {
    // Komponen statis yang merupakan parents
    path: "/",
    element: <Layout />,
    // Jika ada error pada layout
    errorElement: (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[350px] text-center">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">404</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">Page Not Found</p>
            <Button asChild>
              <Link to="/">Go back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    ),
    // Komponen dinamis yang akah menjadi children dari komponen statis
    children: [
      {
        path: "/",
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-t-4 border-red-600 rounded-full animate-spin"></div>
              </div>
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
              <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-t-4 border-red-600 rounded-full animate-spin"></div>
              </div>
            }
          >
            <Profile />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
