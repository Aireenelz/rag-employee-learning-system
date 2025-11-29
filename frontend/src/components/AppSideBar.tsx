import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faFileAlt,
    faBookmark,
    faUser,
    faSignOut,
    faTrophy,
    faBars,
    faCrown,
    faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "./UserAvatar";
import SignOutConfirmationModal from "./SignOutConfirmationModal";
import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";

interface AppSideBarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const SIDEBAR_BREAKPOINT = 900;

const AppSideBar: React.FC<AppSideBarProps> = ({ isOpen, onToggle }) => {
    const navItems = [
        { label: "AI Assistant", icon: faComments, to: "/" },
        { label: "Documents", icon: faFileAlt, to: "/documents" },
        { label: "Quick Access", icon: faBookmark, to: "/quickaccess" },
        { label: "Profile & Achievements", icon: faUser, to: "/profile" },
        { label: "Reports", icon: faChartSimple, to: "/reports"}
    ];

    const navigate = useNavigate();
    const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
    const { signOut, user, profile } = useAuth();
    const { stats, totalEarnedBadges } = useGamification();

    // Get user initials
    const getUserInitials = () => {
        if (profile?.first_name && profile?.last_name) {
            return (profile.first_name[0] + profile.last_name[0]).toUpperCase();
        }
        return "U";
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (profile?.first_name && profile?.last_name) {
            return `${profile.first_name} ${profile.last_name}`;
        }
        return user?.email || "User";
    };

    // Get user role
    const getUserRole = () => {
        const role = profile?.role;

        if (!role) return "User";
        
        switch (role) {
            case "admin":
                return "Admin";
            case "internal-employee":
                return "Internal Employee";
            case "partner":
                return "Partner";
            default:
                return "User";
        }
    };

    const handleSignOutClick = () => {
        setShowSignOutConfirmation(true);
    };
    
    const handleConfirmSignOut = async () => {
        await signOut();
        setShowSignOutConfirmation(false);
        navigate("/login");
    };

    const handleCancelSignOut = () => {
        setShowSignOutConfirmation(false);
    };

    // Close sidebar on mobile when navigating
    const handleNavClick = () => {
        if (window.innerWidth < SIDEBAR_BREAKPOINT) {
            onToggle();
        }
    };

    // Expanded sidebar
    if (isOpen) {
        return (
            <>
                <div className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-white flex flex-col h-screen shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out lg:translate-x-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    {/* Header with toggle button */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <img
                                    src="/logo_questio_shape.png"
                                    alt="QuestIO Logo"
                                    className="w-6 h-6 object-contain"
                                />
                                <span className="text-sm font-semibold tracking-wide text-gray-800">QuestIO</span>
                            </div>
                            <button 
                                onClick={onToggle}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                aria-label="Collapse sidebar"
                            >
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                        </div>

                        {/* User profile */}
                        <Link 
                            to="/profile"
                            onClick={handleNavClick}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
                        >
                            <UserAvatar initials={getUserInitials()} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</div>
                                <div className="text-xs text-gray-500">{getUserRole()}</div>
                            </div>
                        </Link>
                    </div>

                    {/* Gamification Stats */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                            {/* Crown, level, and XP */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                                        <FontAwesomeIcon icon={faCrown} className="text-white text-xs" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800">Level {stats?.level}</span>
                                </div>
                                <span className="text-xs text-gray-600 font-medium">
                                    {stats?.exp_progress}/{500} XP
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                                    style={{ width: `${stats?.exp_progress_percentage}%` }}
                                />
                            </div>

                            {/* Badges number */}
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                                <FontAwesomeIcon icon={faTrophy} className="h-3 w-3 text-yellow-500" />
                                <span className="font-medium">{totalEarnedBadges} badges earned</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 px-3 py-4 overflow-y-auto">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Navigation</h4>
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <NavLink
                                    to={item.to}
                                    key={item.label}
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm relative group ${
                                        isActive
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm border border-blue-200"
                                            : "hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-transparent"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full" />
                                            )}
                                            
                                            <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Footer - Sign out */}
                    <div className="px-4 py-4 border-t border-gray-200">
                        <button
                            onClick={handleSignOutClick}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-red-600 w-full hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                        >
                            <FontAwesomeIcon icon={faSignOut} className="h-4 w-4 text-red-500"/>
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>

                {/* Sign out confirmation modal */}
                <SignOutConfirmationModal
                    isOpen={showSignOutConfirmation}
                    onConfirm={handleConfirmSignOut}
                    onCancel={handleCancelSignOut}
                />
            </>
        );
    }

    // Collapsed sidebar (desktop only)
    return (
        <div className={`
            hidden lg:flex
            w-16 bg-white flex flex-col h-screen shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out
        `}>
            {/* Toggle button */}
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
                <button 
                    onClick={onToggle}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    aria-label="Expand sidebar"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div>

            {/* User avatar */}
            <div className="flex justify-center py-4 border-b border-gray-200">
                <UserAvatar initials={getUserInitials()} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
                {navItems.map((item) => (
                    <NavLink
                        to={item.to}
                        key={item.label}
                        className={({ isActive }) =>
                            `flex items-center justify-center p-3 rounded-lg transition-all duration-200 relative group ${
                                isActive
                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            }`
                        }
                        title={item.label}
                    >
                        <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default AppSideBar;