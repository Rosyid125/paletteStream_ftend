import React from "react";
import { Outlet } from "react-router-dom"; //Mengapa menggunakan kurung karena dalam satu file ada banyak fungsi //Outlet digunakan untuk merender children
import Navbar from "@/components/Navbar"; //Mengapa tidak menggunakan kurung karena dalam satu file hanya ada satu fungsi
import ShadcnSidebar from "@/components/ShadcnSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout() {
  return (
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
  );
}
