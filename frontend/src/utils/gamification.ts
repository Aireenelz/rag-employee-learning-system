export interface UserGamificationStats {
    user_id: string;
    level: number;
    total_exp: number;
    questions_asked: number;
    documents_viewed: number;
    bookmarks_created: number;
    last_activity_at: string;
    exp_for_next_level: number;
    exp_progress: number;
    exp_progress_percentage: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement_type: string;
    requirement_value: number;
    exp_reward: number;
    earned: boolean;
    earned_at?: string;
    progress: number;
}

export interface BadgesResponse {
    badges: Badge[];
    total_earned: number;
}

export type ActivityType = "question_asked" | "document_viewed" | "bookmark_created" | "document_viewed_thinkinsight";