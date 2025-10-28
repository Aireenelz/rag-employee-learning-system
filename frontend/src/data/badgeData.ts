export const badgeData = [
    {
        id: 1,
        title: "Early Adopter",
        description: "One of the first to use the system",
        icon: "faAward",
        earned: true,
        earnedDate: "21/10/2025",
        progress: 100
    },
    {
        id: 2,
        title: "Knowledge Seeker",
        description: "Asked 25 questions",
        icon: "faCircleQuestion",
        earned: true,
        earnedDate: "21/10/2025",
        progress: 100
    },
    {
        id: 3,
        title: "Bookmark Master",
        description: "Created 10 bookmarks",
        icon: "faBookmark",
        earned: true,
        earnedDate: "21/10/2025",
        progress: 100
    },
    {
        id: 4,
        title: "Active Learner",
        description: "Used the platform for 30 consecutive days",
        icon: "faHeartPulse",
        earned: false,
        earnedDate: "",
        progress: 60
    },
    {
        id: 5,
        title: "Strategic Thinking Veteran",
        description: "Viewed 2 ThinkInsight versions",
        icon: "faArrowTrendUp",
        earned: false,
        earnedDate: "",
        progress: 50
    },
    {
        id: 6,
        title: "Critical Thinking Veteran",
        description: "Viewed 2 ThinkOut versions",
        icon: "faArrowTrendDown",
        earned: false,
        earnedDate: "",
        progress: 25
    },
];

export type BadgeType = typeof badgeData[number];