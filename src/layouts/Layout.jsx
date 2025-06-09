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
      <div className={`wrapper w-full h-full${isAdminPage ? " admin-layout" : ""}`}>
        <Navbar className="Navbar" />
        <div className="main-content flex">
          <div className="Sidebar">
            <ShadcnSidebar />
          </div>
          <div>
            <SidebarTrigger className="fixed z-50" />
          </div>
          <div className="Outlet flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
