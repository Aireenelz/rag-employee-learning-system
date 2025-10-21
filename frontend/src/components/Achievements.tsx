import { useState } from "react";

const Achievements: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Learning Progress */}
            <div className="space-y-4 bg-white border rounded-lg pb-4">
                {/* Card header */}
                <div className="py-2 px-4 flex flex-col">
                    <h2 className="text-lg font-bold">Learning Progress</h2>
                    <h3 className="text-sm font-semibold text-gray-400">Track your learning journey</h3>
                </div>

                {/* Level and XP bar */}
                <div className="pb-2 px-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Level 1</span>
                        <span className="text-sm font-semibold text-gray-400">0/500 XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: "10%" }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-400">8 interactions to reach level 2</span>
                </div>

                {/* User interaction stats */}
                <div className="pb-2 px-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">47</p>
                        <p className="text-sm font-semibold text-gray-500">Questions Asked</p>
                    </div>
                    <div className="bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">15</p>
                        <p className="text-sm font-semibold text-gray-500">Documents Viewed</p>
                    </div>
                    <div className="bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-sm font-semibold text-gray-500">Bookmarks Created</p>
                    </div>
                    <div className="bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm font-semibold text-gray-500">Badges Earned</p>
                    </div>
                </div>
            </div>

            {/* Your Achievements */}
            <div className="space-y-4 bg-white border rounded-lg pb-4">
                {/* Card header */}
                <div className="py-2 px-4 flex flex-col">
                    <h2 className="text-lg font-bold">Your Achievements</h2>
                    <h3 className="text-sm font-semibold text-gray-400">Badges for your acitivity milestones</h3>
                </div>

                {/* Badges cards (import react fc) */}

            </div>
        </div>
    );
};

export default Achievements;