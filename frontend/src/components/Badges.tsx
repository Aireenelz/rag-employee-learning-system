import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck
} from "@fortawesome/free-solid-svg-icons";
import type { Badge } from "../utils/gamification";
import { formatDate } from "../utils/dateUtils";

interface BadgesProps {
    badges: Badge[];
}

const Badges: React.FC<BadgesProps> = ({ badges }) => {
    const getIconBgColor = (requirementType: string) => {
        switch (requirementType) {
            case "questions_asked":
                return "bg-red-100 text-red-600";
            case "documents_viewed":
                return "bg-orange-100 text-orange-600";
            case "bookmarks_created":
                return "bg-yellow-100 text-yellow-600";
            case "level_reached":
                return "bg-blue-100 text-blue-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className={`border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow ${
                        badge.earned
                            ? "bg-white"
                            : "bg-gray-50 opacity-75"
                    }`}
                >
                    {/* Badge icon and Checkmark if earned */}
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg text-3xl ${getIconBgColor(badge.requirement_type)}`}>
                            {badge.icon}
                        </div>
                        {badge.earned && (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-green-600"/>
                            </div>
                        )}
                    </div>

                    {/* Badge title and description */}
                    <div>
                        <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
                    </div>

                    {/* EXP reward if earn the badge */}
                    {badge.exp_reward > 0 && (
                        <div className="inline-block">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                +{badge.exp_reward} XP
                            </span>
                        </div>
                    )}

                    {/* Earned date or progress bar */}
                    {badge.earned ? (
                        <div className="flex items-center text-sm text-green-600 font-medium">
                            <span className="mr-2">✅</span>
                            Earned on {badge.earned_at ? formatDate(badge.earned_at) : ""}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.round(badge.progress)}%` }}></div>
                            </div>
                            <div className="flex justify-start text-sm">
                                <span className="text-gray-600">{Math.round(badge.progress)}% completed</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Badges;