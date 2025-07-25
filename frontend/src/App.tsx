import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSideBar from "./components/AppSideBar";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <AppSideBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1 overflow-y-auto bg-els-secondarybackground">
        <div className="h-full w-full p-5">
          <Outlet />
        </div>
      </div>
    </div>
  )
}