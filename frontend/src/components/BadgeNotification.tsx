import { useEffect, useState } from "react";
import type { Badge } from "../utils/gamification";

interface BadgeNotificationProps {
    badge: Badge;
    onClose: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto close after 10 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 10000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
            isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
        }`}>
            <div className="bg-white border-2 border-green-400 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start gap-3">
                    {/* Badge icon */}
                    <div className="text-4xl">
                        {badge.icon}
                    </div>

                    {/* Badge information */}
                    <div className="flex-1">
                        <h4 className="font-bold text-green-600 mb-1">🎉 New Badge Unlocked!</h4>
                        <p className="font-semibold text-gray-800">{badge.name}</p>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                        {badge.exp_reward > 0 && (
                            <p className="text-xs text-blue-600 font-semibold mt-2">+{badge.exp_reward} XP earned!</p>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="px-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BadgeNotification;