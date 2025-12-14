import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import AiAssistant from "../pages/AiAssistant";
import Documents from "../pages/Documents";
import QuickAccess from "../pages/QuickAccess";
import ProfileAchievements from "../pages/ProfileAchievements";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProtectedRoute from "./ProtectedRoute";
import Reports from "../pages/Reports";
import AdminRoute from "./AdminRoute";

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <App /> {/* shared layout (sidebar + outlet) */}
            </ProtectedRoute>
        ),
        children: [
            { path: "/", element: <AiAssistant /> },
            { path: "/documents", element: <Documents /> },
            { path: "/quickaccess", element: <QuickAccess /> },
            { path: "/profile", element: <ProfileAchievements /> },
            {
                path: "/reports", 
                element: (
                    <AdminRoute>
                        <Reports />
                    </AdminRoute>
                )
            },
        ]
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />
}