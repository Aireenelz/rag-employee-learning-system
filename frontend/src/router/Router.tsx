import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import AiAssistant from "../pages/AiAssistant";
import Documents from "../pages/Documents";
import QuickAccess from "../pages/QuickAccess";
import ProfileAchievements from "../pages/ProfileAchievements";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />, // shared layout (sidebar + outlet)
        children: [
            { path: "/", element: <AiAssistant /> },
            { path: "/documents", element: <Documents /> },
            { path: "/quickaccess", element: <QuickAccess /> },
            { path: "/profile", element: <ProfileAchievements /> },
        ]
    }
])

export default function AppRouter() {
    return <RouterProvider router={router} />
}