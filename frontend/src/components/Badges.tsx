import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAward,
    faCircleQuestion,
    faBookmark,
    faHeartPulse,
    faArrowTrendUp,
    faArrowTrendDown,
    faCheck
} from "@fortawesome/free-solid-svg-icons";
import { type BadgeType } from "../data/badgeData";

const Badges: React.FC<{ badges: BadgeType[] }> = ({ badges }) => {
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "faAward":
                return faAward;
            case "faCircleQuestion":
                return faCircleQuestion;
            case "faBookmark":
                return faBookmark;
            case "faHeartPulse":
                return faHeartPulse;
            case "faArrowTrendUp":
                return faArrowTrendUp;
            case "faArrowTrendDown":
                return faArrowTrendDown;
            default:
                return faAward;
        }
    };

    const getIconBgColor = (iconName: string) => {
        if (iconName.includes("Award")) return "bg-pink-100 text-pink-600";
        if (iconName.includes("Question")) return "bg-blue-100 text-blue-600";
        if (iconName.includes("Bookmark")) return "bg-purple-100 text-purple-600";
        if (iconName.includes("Pulse")) return "bg-green-100 text-green-600";
        if (iconName.includes("TrendUp")) return "bg-orange-100 text-orange-600";
        if (iconName.includes("TrendDown")) return "bg-red-100 text-red-600";
        return "bg-gray-100 text-gray-600";
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow"
                >
                    {/* Badge logo and Checkmark if earned */}
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${getIconBgColor(badge.icon)}`}>
                            <FontAwesomeIcon icon={getIcon(badge.icon)} className="text-xl"></FontAwesomeIcon>
                        </div>
                        {badge.earned && (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-green-600"/>
                            </div>
                        )}
                    </div>

                    {/* Badge title and description */}
                    <div>
                        <h3 className="font-semibold text-gray-900">{badge.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
                    </div>

                    {/* Earned date or progress bar */}
                    {badge.earned ? (
                        <div className="flex items-center text-sm text-green-600">
                            <FontAwesomeIcon icon={getIcon(badge.icon)} className="w-4 h-4 mr-2"></FontAwesomeIcon>
                            Earned on {badge.earnedDate}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${badge.progress}%`}}></div>
                            </div>
                            <div className="flex justify-start text-sm">
                                <span>{badge.progress}% completed</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Badges;