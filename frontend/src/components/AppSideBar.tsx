import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faFileAlt,
    faBookmark,
    faUser,
    faGear,
    faTrophy,
    faBars,
} from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "./UserAvatar";
import { user } from "../data/userData";

const AppSideBar: React.FC = () => {
    const navItems = [
        { label: "AI Assistant", icon: faComments, to: "/" },
        { label: "Documents", icon: faFileAlt, to: "/documents" },
        { label: "Quick Access", icon: faBookmark, to: "/quickaccess" },
        //{ label: "Profile & Achievements", icon: faUser, to: "/profile" },
    ];

    return (
        <div className="w-64 bg-els-primarybackground text-white flex flex-col h-screen p-5">
            {/* Hide side bar */}
            <button className="flex justify-end pb-5 text-white hover:text-gray-200">
                <FontAwesomeIcon icon={faBars} />
            </button>

            {/* Top Section */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <UserAvatar initials={user.initials} />
                    <div>
                        <div className="text-base font-semibold">{user.name}</div>
                        <div className="text-sm text-white/70">{user.role}</div>
                    </div>
                </div>
                <button className="text-white hover:text-gray-200">
                    <FontAwesomeIcon icon={faGear} />
                </button>
            </div>

            {/* User Stats */}
            <div className="mt-6">
                <div className="flex justify-between text-sm">
                    <span>Level {user.level}</span>
                    <span>
                        {user.xp}/{user.maxXp} XP
                    </span>
                </div>
                <div className="w-full h-2 bg-white/30 mt-1 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white/90"
                        style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
                    />
                </div>
                <div className="mt-2 text-sm text-white/80 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrophy} className="h-3 w-3" />
                    <span>{user.badgeCount} badges earned</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-10">
                <h4 className="text-sm text-white/70 mb-3">Navigation</h4>
                <nav className="flex flex-col gap-3">
                    {navItems.map((item) => (
                        <NavLink
                            to={item.to}
                            key={item.label}
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
        </div>
    );
};

export default AppSideBar