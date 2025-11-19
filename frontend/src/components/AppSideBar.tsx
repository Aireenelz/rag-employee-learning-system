import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faFileAlt,
    faBookmark,
    faUser,
    faSignOut,
    faTrophy,
    faBars,
    faChartLine,
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
        { label: "Reports", icon: faChartLine, to: "/reports"}
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
                    w-64 bg-els-primarybackground text-white flex flex-col h-screen p-4 pt-2 transition-all duration-300 ease-in-out lg:translate-x-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    {/* Toggle button */}
                    <div className="h-10 flex items-center justify-start mb-3">
                        <button 
                            onClick={onToggle}
                            className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/10 rounded"
                            aria-label="Toggle sidebar"
                        >
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                    </div>

                    {/* Top Section */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <UserAvatar initials={getUserInitials()} />
                            <div>
                                <div className="text-sm font-semibold">{getUserDisplayName()}</div>
                                <div className="text-xs text-white/70">{getUserRole()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Gamification Stats */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm">
                            <span>Level {stats?.level}</span>
                            <span>
                                {stats?.exp_progress}/{500} XP
                            </span>
                        </div>
                        <div className="w-full h-2 bg-white/30 mt-1 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/90"
                                style={{ width: `${stats?.exp_progress_percentage}%` }}
                            />
                        </div>
                        <div className="mt-2 text-sm text-white/80 flex items-center gap-2">
                            <FontAwesomeIcon icon={faTrophy} className="h-3 w-3" />
                            <span>{totalEarnedBadges} badges earned</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-10 flex-1">
                        <h4 className="text-sm text-white/70 mb-3">Navigation</h4>
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <NavLink
                                    to={item.to}
                                    key={item.label}
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                                        isActive
                                            ? "bg-white/20 font-medium"
                                            : "hover:bg-white/10 text-white/90"
                                        }`
                                    }
                                >
                                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Sign out */}
                    <div className="mt-auto mb-2">
                        <button
                            onClick={handleSignOutClick}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white w-full hover:bg-white/10"
                        >
                            <FontAwesomeIcon icon={faSignOut} className="h-4 w-4"/>
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
            w-12 bg-els-primarybackground text-white flex flex-col h-screen py-2 transition-all duration-300 ease-in-out
        `}>
            {/* Toggle button */}
            <div className="h-10 flex items-center justify-center mb-3">
                <button 
                    onClick={onToggle}
                    className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/10 rounded"
                    aria-label="Expand sidebar"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div>

            {/* User avatar */}
            <div className="flex justify-center mb-6">
                <UserAvatar initials={getUserInitials()} />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 px-1">
                {navItems.map((item) => (
                    <NavLink
                        to={item.to}
                        key={item.label}
                        className={({ isActive }) =>
                            `flex items-center justify-center p-3 rounded-md transition-all duration-200 ${
                                isActive
                                    ? "bg-white/20 font-medium"
                                    : "hover:bg-white/10"
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