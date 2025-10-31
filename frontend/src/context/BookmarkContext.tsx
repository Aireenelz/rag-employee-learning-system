import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { bookmarkService } from "../services/bookmarkService";

interface BookmarkContextType {
    bookmarks: Set<string>;
    isLoading: boolean;
    isBookmarked: (documentId: string) => boolean;
    toggleBookmark: (documentId: string) => Promise<void>;
    refreshBookmarks: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    // Load bookmarks when user changes
    const loadBookmarks = useCallback(async () => {
        if (!user?.id) {
            setBookmarks(new Set());
            return;
        }

        try {
            setIsLoading(true);
            const userBookmarks = await bookmarkService.getUserBookmarks(user.id);
            const bookmarkedIds = new Set(userBookmarks.map(b => b.document_id));
            setBookmarks(bookmarkedIds);
            console.log("loadBookmarks() from BookmarkContext.tsx ran")
        } catch (error) {
            console.error("Error loading bookmarks:", error);
            setBookmarks(new Set());
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Load bookmarks on mount and when user changes
    useEffect(() => {
        loadBookmarks();
    }, [loadBookmarks]);

    // Check if a document is bookmarked
    const isBookmarked = useCallback((documentId: string): boolean => {
        return bookmarks.has(documentId);
    }, [bookmarks]);

    // Toggle bookmark status
    const toggleBookmark = useCallback(async (documentId: string) => {
        if (!user?.id) {
            throw new Error("User must be logged in to bookmark documents");
        }

        try {
            const isCurrentlyBookmarked = bookmarks.has(documentId);
            
            if (isCurrentlyBookmarked) {
                await bookmarkService.removeBookmark(user.id, documentId);
                setBookmarks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(documentId);
                    return newSet;
                });
            } else {
                await bookmarkService.addBookmark(user.id, documentId);
                setBookmarks(prev => new Set(prev).add(documentId));
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            throw error;
        }
    }, [user?.id, bookmarks]);

    const value = {
        bookmarks,
        isLoading,
        isBookmarked,
        toggleBookmark,
        refreshBookmarks: loadBookmarks
    };

    return (
        <BookmarkContext.Provider value={value}>
            {children}
        </BookmarkContext.Provider>
    );
};

export const useBookmarks = () => {
    const context = useContext(BookmarkContext);
    if (context === undefined) {
        throw new Error("useBookmarks must be used within a BookmarkProvider");
    }
    return context;
};