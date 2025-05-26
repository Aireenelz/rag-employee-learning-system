import { Outlet } from "react-router-dom";
import AppSideBar from "./components/AppSideBar";

export default function App() {
  return (
    <div className="flex h-screen">
      <AppSideBar />
      <div className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}