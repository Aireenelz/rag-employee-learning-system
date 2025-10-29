import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faExternalLink,
    faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { bookmarkService } from "../services/bookmarkService";
import { formatDate } from "../utils/dateUtils";

interface YourBookmarksProps {
    searchQuery: string;
}

interface Document {
    id: string;
    filename: string;
    tags: string[];
    uploadDate: string;
    size: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const YourBookmarks: React.FC<YourBookmarksProps> = ({ searchQuery }) => {
    const [bookmarkedDocuments, setBookmarkedDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // Load bookmarked documents
    useEffect(() => {
        const loadBookmarkedDocuments = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // Get user's bookmarks from supabase
                const bookmarks = await bookmarkService.getUserBookmarks(user.id);

                if (bookmarks.length === 0) {
                    setBookmarkedDocuments([]);
                    return;
                }

                // Get document IDs
                const documentIds = bookmarks.map(b => b.document_id);

                // Fetch document details from mongodb
                const response = await fetch(`${API_BASE_URL}/api/documents/batch`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ document_ids: documentIds }),
                });

                if (response.ok) {
                    const documents = await response.json();
                    setBookmarkedDocuments(documents);
                } else {
                    console.error("Failed to fetch bookmarked documents");
                    setBookmarkedDocuments([]);
                }
            } catch (error) {
                console.error("Error loading bookmarked documents:", error);
                setBookmarkedDocuments([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadBookmarkedDocuments();
    }, [user?.id]);

    // Handle opening bookmarked document in new tab
    const handleOpenDocument = (documentId: string) => {
        const downloadUrl = `${API_BASE_URL}/api/documents/${documentId}/download`;
        window.open(downloadUrl, '_blank');
    };

    // Handle removing bookmark
    const handleRemoveBookmark = async (documentId: string) => {
        if (!user?.id) return;

        try {
            await bookmarkService.removeBookmark(user.id, documentId);

            // Update local state
            setBookmarkedDocuments(prev => 
                prev.filter(doc => doc.id !== documentId)
            );
        } catch (error) {
            console.error("Error removing bookmark:", error);
            alert("Failed to remove bookmark. Please try again.");
        }
    };

    // Filter bookmarks based on search query
    const filteredBookmarks = bookmarkedDocuments.filter(bookmark =>
        bookmark.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Loading screen
    if (isLoading) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-sm font-semibold">Loading bookmarks...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {filteredBookmarks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm font-semibold">
                        {searchQuery ? "No bookmarks found" : "No bookmarks yet"}
                    </p>
                    <p className="text-xs mt-1">
                        {searchQuery ? "Try adjusting your search query" : "Bookmark documents from the Documents page to see them here"}
                    </p>
                </div>
            ) : (
                filteredBookmarks.map((bookmark) => (
                    <div
                        key={bookmark.id}
                        className="flex items-center gap-3 border rounded-lg p-3 hover:bg-els-secondarybuttonhover group"
                    >
                        {/* Icon */}
                        <div className="py-2.5 px-4 rounded-lg bg-els-bookmarkeddocumentbackground text-xl">
                            <FontAwesomeIcon icon={faFileAlt} className="text-blue-400" />
                        </div>

                        {/* Bookmarked document details */}
                        <div className="flex flex-col flex-1">
                            <span className="font-semibold text-sm">
                                {bookmark.filename}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-semibold text-xs text-gray-500">
                                    Document • {formatDate(bookmark.uploadDate)}
                                </span>
                                {bookmark.tags.length > 0 && (
                                    <div className="flex gap-1">
                                        {bookmark.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-gray-100 text-gray-800 text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleOpenDocument(bookmark.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Open in new tab"
                            >
                                <FontAwesomeIcon icon={faExternalLink} className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                                onClick={() => handleRemoveBookmark(bookmark.id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                title="Remove bookmark"
                            >
                                <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4 text-red-600" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default YourBookmarks;