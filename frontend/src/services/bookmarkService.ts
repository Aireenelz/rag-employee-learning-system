import { supabase } from "../utils/supabaseClient";

export interface Bookmark {
    id: string;
    user_id: string;
    document_id: string;
    created_at: string;
}

export const bookmarkService = {
    // Get all bookmarks for current user
    async getUserBookmarks(userId: string): Promise<Bookmark[]> {
        const { data, error } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false});
        
        if (error) {
            console.error("Error fetching bookmarks:", error);
            throw error;
        }

        return data || [];
    },

    // Check if document is bookmarked
    async isBookmarked(userId: string, documentId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from("bookmarks")
            .select("id")
            .eq("user_id", userId)
            .eq("document_id", documentId)
            .single();
        
        if (error && error.code !== "PGRST116") {
            console.error("Error checking bookmark:", error);
            return false;
        }

        return !!data; // get the boolean
    },

    // Add bookmark
    async addBookmark(userId: string, documentId: string): Promise<void> {
        const { error } = await supabase
            .from("bookmarks")
            .insert({ user_id: userId, document_id: documentId});
        
        if (error) {
            console.error("Error adding bookmark:", error);
            throw error;
        }
    },

    // Remove bookmark
    async removeBookmark(userId: string, documentId: string): Promise<void> {
        const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("user_id", userId)
            .eq("document_id", documentId);
        
        if (error) {
            console.error("Error removing bookmark:", error);
            throw error;
        }
    },

    // Toggle bookmark
    async toggleBookmark(userId: string, documentId: string): Promise<boolean> {
        const isCurrentlyBookmarked = await this.isBookmarked(userId, documentId);

        if (isCurrentlyBookmarked) {
            await this.removeBookmark(userId, documentId);
            return false;
        } else {
            await this.addBookmark(userId, documentId);
            return true;
        }
    }
};