import React from "react"; //Mengapa tidak menggunakan kurung karena dalam satu file hanya ada satu fungsi
import { Outlet } from "react-router-dom"; //Mengapa menggunakan kurung karena dalam satu file ada banyak fungsi //Outlet digunakan untuk merender children
import Navbar from "./partials/Navbar";
import Sidebar from "./partials/Sidebar";

const Layout = () => {
  return (
    <>
      <div data-theme="dark" className="wrapper">
        <Navbar className="Navbar" />
        <div className="main-content">
          <div className="Sidebar">
            <Sidebar />
          </div>
          <div className="Outlet">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
