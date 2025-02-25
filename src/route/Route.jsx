import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layouts/Layout";
import Profile from "@/pages/Profile";

// Deklarasi lazy load ketika page children sedang dimuat
const Home = React.lazy(() => import("../pages/Home"));

// Rute komponen + halaman
export const router = createBrowserRouter([
  {
    // Komponen statis yang merupakan parents
    path: "/",
    element: <Layout />,
    // Jika ada error pada layout
    // errorElement: <div>404</div>,
    // Komponen dinamis yang akah menjadi children dari komponen statis
    children: [
      {
        path: "/",
        element: (
          // Suspense digunakan untuk pesan/tampilan pada saat memuat
          <Suspense fallback={<div>Loading...</div>}>
            <Profile />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
