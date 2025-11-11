import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppSideBar from "./components/AppSideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars
} from "@fortawesome/free-solid-svg-icons";
import BadgeNotificationContainer from "./components/BadgeNotificationContainer";

const SIDEBAR_BREAKPOINT = 900;

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= SIDEBAR_BREAKPOINT; // Side bar open by default on large screen
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= SIDEBAR_BREAKPOINT) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Blur background when sidebar open */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <AppSideBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-els-secondarybackground w-full">
        {/* Header with hamburger menu for mobile */}
        <div className="lg:hidden sticky top-0 z-30 bg-els-secondarybackground border-b border-gray-200 px-3 py-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-els-secondarybuttonhover transition-colors"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </div>
      </div>

      {/* Badge notification when user each a new badge */}
      <BadgeNotificationContainer />
    </div>
  );
}