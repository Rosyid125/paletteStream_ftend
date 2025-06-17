import React from "react";
import { Outlet, useLocation } from "react-router-dom"; // Tambahkan useLocation
import Navbar from "@/components/Navbar"; //Mengapa tidak menggunakan kurung karena dalam satu file hanya ada satu fungsi
import ShadcnSidebar from "@/components/ShadcnSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar"; //Mengapa menggunakan kurung karena dalam satu file ada banyak fungsi
import Cookies from "js-cookie";
import AuthSessionRefresher from "@/components/AuthSessionRefresher";

export default function Layout() {
  // Ambil cookie yang disimpan untuk menentukan apakah sidebar terbuka atau tidak
  const theme = Cookies.get("sidebar_state") === "true";
  const location = useLocation(); // Dapatkan lokasi saat ini
  const isAdminPage = location.pathname.startsWith("/admin"); // Deteksi halaman admin
  return (
    <SidebarProvider defaultOpen={theme}>
      <AuthSessionRefresher />
      <div className={`wrapper w-full min-h-screen${isAdminPage ? " admin-layout" : ""}`}>
        <Navbar className="Navbar w-full" />
        <div className="main-content flex min-h-0">
          <div className="Sidebar hidden md:block">
            <ShadcnSidebar />
          </div>
          <div className="md:hidden">
            <SidebarTrigger className="fixed top-16 left-4 z-50 bg-background border shadow-md" />
          </div>
          <div className="Outlet flex-1 w-full min-w-0 overflow-x-hidden px-2 sm:px-4 md:px-6">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
