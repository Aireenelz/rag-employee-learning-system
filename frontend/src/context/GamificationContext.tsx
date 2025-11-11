import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import type { UserGamificationStats, Badge, BadgesResponse, ActivityType } from "../utils/gamification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface GamificationContextType {
    stats: UserGamificationStats | null;
    badges: Badge[];
    totalEarnedBadges: number;
    loading: boolean;
    newBadge: Badge | null;
    clearNewBadge: () => void;
    trackActivity: (activityType: ActivityType, metadata?: Record<string, any>) => Promise<void>;
    refreshStats: () => Promise<void>;
    refreshBadges: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserGamificationStats | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [totalEarnedBadges, setTotalEarnedBadges] = useState(0);
    const [loading, setLoading] = useState(true);
    const [newBadge, setNewBadge] = useState<Badge | null>(null);
    const [previousEarnedCount, setPreviousEarnedCount] = useState(0);

    const fetchStats = useCallback(async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/gamification/stats/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching gamification stats:", error);
        }
    }, [user?.id]);

    const fetchBadges = useCallback(async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/gamification/badges/${user.id}`);
            if (response.ok) {
                const data: BadgesResponse = await response.json();

                // Check if a new badge is earned
                if (previousEarnedCount > 0 && data.total_earned > previousEarnedCount) {
                    // Find the newly earned badge
                    const earnedBadges = data.badges.filter(b => b.earned);

                    // Sort by earned_at date to get the most recent
                    earnedBadges.sort((a,b) => {
                        if (!a.earned_at || !b.earned_at) return 0;
                        return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime();
                    });

                    // Show notification for the most recently earned badge
                    if (earnedBadges.length > 0) {
                        setNewBadge(earnedBadges[0]);
                    }
                }

                setBadges(data.badges);
                setTotalEarnedBadges(data.total_earned);
                setPreviousEarnedCount(data.total_earned);
            }
        } catch (error) {
            console.error("Error fetching badges:", error);
        }
    }, [user?.id, previousEarnedCount]);

    const trackActivity = useCallback(async (activityType: ActivityType, metadata?: Record<string, any>) => {
        if (!user?.id) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/gamification/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    activity_type: activityType,
                    metadata: metadata || {}
                })
            });

            if (response.ok) {
                // Refresh stats and badges after tracking
                await Promise.all([fetchStats(), fetchBadges()]);
            }
        } catch (error) {
            console.error("Error tracking activity:", error);
        }
    }, [user?.id, fetchStats, fetchBadges]);

    const clearNewBadge = useCallback(() => {
        setNewBadge(null);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (user?.id) {
                setLoading(true);
                await Promise.all([fetchStats(), fetchBadges()]);
                setLoading(false)
            } else {
                setStats(null);
                setBadges([]);
                setTotalEarnedBadges(0);
                setPreviousEarnedCount(0);
                setLoading(false);
            }
        };

        loadData();
    }, [user?.id, fetchStats, fetchBadges]);

    const refreshStats = useCallback(async () => {
        await fetchStats();
    }, [fetchStats]);

    const refreshBadges = useCallback(async () => {
        await fetchBadges();
    }, [fetchBadges]);

    const value = {
        stats,
        badges,
        totalEarnedBadges,
        loading,
        newBadge,
        clearNewBadge,
        trackActivity,
        refreshStats,
        refreshBadges
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error("useGamification must be used within a GamificationProvider");
    }
    return context;
};