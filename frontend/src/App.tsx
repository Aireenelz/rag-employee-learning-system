import { Outlet } from "react-router-dom";
import AppSideBar from "./components/AppSideBar";

export default function App() {
  return (
    <div className="flex h-screen">
      <AppSideBar />
      <div className="flex-1 overflow-y-auto bg-els-secondarybackground">
        <div className="h-full w-full p-5">
          <Outlet />
        </div>
      </div>
    </div>
  )
}