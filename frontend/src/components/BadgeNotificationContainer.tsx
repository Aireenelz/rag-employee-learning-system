import { useGamification } from "../context/GamificationContext";
import BadgeNotification from "./BadgeNotification";

const BadgeNotificationContainer: React.FC = () => {
    const { newBadge, clearNewBadge } = useGamification();

    if (!newBadge) return null;

    return <BadgeNotification badge={newBadge} onClose={clearNewBadge} />;
};

export default BadgeNotificationContainer;