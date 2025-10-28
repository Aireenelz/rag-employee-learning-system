import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrophy,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Profile from "../components/Profile";
import Achievements from "../components/Achievements";

const ProfileAchievements: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"profile" | "achievements">("profile");
    return (
        <div className="pb-5">
            {/* Header */}
            <h1 className="text-2xl font-bold mb-3">
                Profile & Achievements
            </h1>
            
            {/* Toggle tabs */}
            <div className="flex mb-4 w-full py-1 px-1 bg-els-mutedbackground rounded-lg text-sm gap-1">
                {/* Profile */}
                <button
                    className={`flex-1 text-center py-2 px-4 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'profile' ? 'bg-els-selectedtab hover:text-gray-600' : 'text-gray-400'
                    }`}
                    onClick={() => setActiveTab('profile')}
                >
                    <FontAwesomeIcon icon={faUser} className="mr-2"/>
                    Profile
                </button>

                {/* Badges & Achievements */}
                <button
                    className={`flex-1 text-center py-2 px-4 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'achievements' ? 'bg-els-selectedtab hover:text-gray-600' : 'text-gray-400'
                    }`}
                    onClick={() => setActiveTab('achievements')}
                >
                    <FontAwesomeIcon icon={faTrophy} className="mr-2"/>
                    Badges & Achievements
                </button>
            </div>
            
            {/* Tab content */}
            <div className="mt-1">
                {activeTab === 'profile' ? <Profile/> : <Achievements/>}
            </div>
        </div>
    );
};

export default ProfileAchievements;