import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-els-secondarybackground">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-els-primarybutton mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (profile?.role !== "admin") {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
};

export default AdminRoute;