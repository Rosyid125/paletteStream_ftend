import React from "react";
import { Outlet } from "react-router-dom"; //Mengapa menggunakan kurung karena dalam satu file ada banyak fungsi //Outlet digunakan untuk merender children
import Navbar from "@/components/Navbar"; //Mengapa tidak menggunakan kurung karena dalam satu file hanya ada satu fungsi
import ShadcnSidebar from "@/components/ShadcnSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar"; //Mengapa menggunakan kurung karena dalam satu file ada banyak fungsi
import Cookies from "js-cookie";

export default function Layout() {
  // Ambil cookie yang disimpan untuk menentukan apakah sidebar terbuka atau tidak
  const theme = Cookies.get("sidebar_state") === "true";

  return (
    <SidebarProvider defaultOpen={theme}>
      <div className="wrapper w-full h-full">
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
