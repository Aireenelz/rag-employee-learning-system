import { useGamification } from "../context/GamificationContext";
import Badges from "./Badges";

const Achievements: React.FC = () => {
    const { stats, badges, totalEarnedBadges, loading } = useGamification();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <p className="text-gray-500">Loading achievements...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex justify-center items-center py-8">
                <p className="text-gray-500">Unable to load achievements</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            {/* Learning Progress */}
            <div className="space-y-4 bg-white border rounded-lg pt-2 pb-4">
                {/* Card header */}
                <div className="py-2 px-4 flex flex-col">
                    <h2 className="text-lg font-bold">Learning Progress</h2>
                    <p className="text-sm font-semibold text-gray-400">Track your learning journey</p>
                </div>

                {/* Level and XP bar */}
                <div className="pb-2 px-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Level {stats.level}</span>
                        <span className="text-sm font-semibold text-gray-400">{stats.exp_progress}/{500} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${stats.exp_progress_percentage}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-400">
                        {stats.exp_for_next_level} XP to reach level {stats.level + 1}
                    </span>
                </div>

                {/* User interaction stats */}
                <div className="pb-2 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{stats.questions_asked}</p>
                        <p className="text-sm font-semibold text-gray-500">Questions Asked</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{stats.documents_viewed}</p>
                        <p className="text-sm font-semibold text-gray-500">Documents Viewed</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{stats.bookmarks_created}</p>
                        <p className="text-sm font-semibold text-gray-500">Bookmarks Created</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{totalEarnedBadges}</p>
                        <p className="text-sm font-semibold text-gray-500">Badges Earned</p>
                    </div>
                </div>
            </div>

            {/* Your Achievements */}
            <div className="space-y-4 bg-white border rounded-lg pt-2 pb-4">
                {/* Card header */}
                <div className="py-2 px-4 flex flex-col">
                    <h2 className="text-lg font-bold">Your Achievements</h2>
                    <p className="text-sm font-semibold text-gray-400">Badges for your activity milestones</p>
                </div>

                {/* Badges cards */}
                <Badges badges={badges} />
            </div>
        </div>
    );
};

export default Achievements;