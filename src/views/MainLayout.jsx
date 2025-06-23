import React from "react";
import { Navbar, Sidebar } from "./index";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - Full Width at Top */}
      <div className="fixed top-0 left-0 w-full z-50 shadow-md custom-navbar">
        <Navbar />
      </div>
      {/* Sidebar & Content Container (Below Navbar) */}
      <div className="flex flex-row mt-12">
        {/* Sidebar - Fixed on Left */}
        <div className="w-80 h-screen fixed left-0 top-12 bg-gray-100">
          <Sidebar />
        </div>
        {/* Main Content - Takes Remaining Space */}
        <div className="transition-all duration-300 w-full overflow-x-hidden ml-80">
          {children}
        </div>
      </div>
    </div>
  );
}
