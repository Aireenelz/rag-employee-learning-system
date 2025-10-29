import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faEllipsisVertical,
    faCalendar,
    faBookmark,
    faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { bookmarkService } from "../services/bookmarkService";
import { formatDate } from "../utils/dateUtils";

interface Document {
    id: string;
    filename: string;
    tags: string[];
    uploadDate: string;
    size: string;
}

interface DocumentTableProps {
    documents: Document[];
    selectedDocuments: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    isLoading: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DocumentTable: React.FC<DocumentTableProps> = ({documents, selectedDocuments, onSelectionChange, isLoading}) => {
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [bookmarkedDocuments, setBookmarkedDocuments] = useState<Set<string>>(new Set());
    const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());
    const menuRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    // Load bookmarks on mount and when documents change
    useEffect(() => {
        const loadBookmarks = async () => {
            if (!user?.id) return;

            try {
                const bookmarks = await bookmarkService.getUserBookmarks(user.id);
                const bookmarkedIds = new Set(bookmarks.map(b => b.document_id));
                setBookmarkedDocuments(bookmarkedIds);
            } catch (error) {
                console.error("Error loading bookmarks:", error);
            }
        };

        loadBookmarks();
    }, [user?.id, documents]);

    // Selecting all documents
    const handleSelectAll = () => {
        if (selectedDocuments.length === documents.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(documents.map(doc => doc.id));
        }
    };

    // Selecting several documents
    const handleSelectDocument = (documentId: string) => {
        if (selectedDocuments.includes(documentId)) {
            onSelectionChange(selectedDocuments.filter(id => id !== documentId));
        } else {
            onSelectionChange([...selectedDocuments, documentId]);
        }
    };

    // Action to open a document
    const handleOpenDocument = (documentId: string) => {
        const downloadUrl = `${API_BASE_URL}/api/documents/${documentId}/download`;
        window.open(downloadUrl, '_blank');
        setOpenActionMenu(null);
    };

    // Action to bookmark a document
    const handleBookmark = async (documentId: string) => {
        if (!user?.id) {
            alert("Please sign in to bookmark documents");
            return;
        }

        // Add to loading set
        setBookmarkLoading(prev => new Set(prev).add(documentId));

        try {
            const isNowBookmarked = await bookmarkService.toggleBookmark(user.id, documentId);

            // Update local state
            setBookmarkedDocuments(prev => {
                const newSet = new Set(prev);
                if (isNowBookmarked) {
                    newSet.add(documentId);
                } else {
                    newSet.delete(documentId);
                }
                return newSet;
            });
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            alert("Failed to update bookmark. Please try again.");
        } finally {
            // Remove from loading set
            setBookmarkLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(documentId);
                return newSet;
            });
            setOpenActionMenu(null);
        }
    };

    // Open action menu
    const toggleActionMenu = (documentId: string) => {
        setOpenActionMenu(openActionMenu === documentId ? null : documentId);
    };

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenActionMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Loading screen
    if (isLoading) {
        return (
            <div className="border rounded">
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500">Loading documents...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="border rounded">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="text-left border-b">
                        <th className="py-2 pl-3">
                            <input
                                type="checkbox"
                                checked={documents.length > 0 && selectedDocuments.length === documents.length}
                                onChange={handleSelectAll}
                                className="form-checkbox h-4 w-4 text-blue-600"
                            />
                        </th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Document</th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Tags</th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Upload Date</th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Size</th>
                        <th className="p-2 text-sm font-semibold text-gray-400 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                No documents found.
                            </td>
                        </tr>
                    ) : (
                        documents.map((doc) => (
                            <tr key={doc.id} className="border-b hover:bg-gray-50">
                                {/* Checkbox */}
                                <td className="py-2 pl-3">
                                    <input 
                                        type="checkbox"
                                        checked={selectedDocuments.includes(doc.id)}
                                        onChange={() => handleSelectDocument(doc.id)}
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                    />
                                </td>
                                
                                {/* Document name */}
                                <td className="py-4 px-2 text-sm font-semibold">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faFileAlt} className="text-blue-400"/>
                                        {doc.filename}
                                        {bookmarkedDocuments.has(doc.id) && (
                                            <FontAwesomeIcon icon={faBookmark} className="text-yellow-400"/>
                                        )}
                                    </div>
                                </td>

                                {/* Tags */}
                                <td className="py-4 px-2">
                                    <div className="flex gap-1 flex-wrap">
                                        {doc.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="bg-gray-100 text-gray-800 text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                {/* Upload date */}
                                <td className="py-4 px-2 text-sm font-semibold text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faCalendar}/>
                                        {formatDate(doc.uploadDate)}
                                    </div>
                                </td>

                                {/* Size */}
                                <td className="py-4 px-2 text-sm font-semibold text-gray-400">
                                    {doc.size}
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-2 text-sm font-semibold relative">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={() => toggleActionMenu(doc.id)}
                                            className="px-2 rounded-full hover:bg-els-secondarybuttonhover"
                                        >
                                            <FontAwesomeIcon icon={faEllipsisVertical}/>
                                        </button>

                                        {/* Action menu small popup */}
                                        {openActionMenu === doc.id && (
                                            <div
                                                ref={menuRef}
                                                className="absolute right-0 bottom-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48"
                                            >
                                                <div className="py-1">
                                                    {/* Action button to open file */}
                                                    <button
                                                        onClick={() => handleOpenDocument(doc.id)}
                                                        className="w-full text-left px-4 py-2 text-sm font-normal hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <FontAwesomeIcon icon={faExternalLink} className="h-3 w-3"/>
                                                        Open in new tab
                                                    </button>

                                                    {/* Action button to bookmark */}
                                                    <button
                                                        onClick={() => handleBookmark(doc.id)}
                                                        disabled={bookmarkLoading.has(doc.id)}
                                                        className="w-full text-left px-3 py-2 text-sm font-normal hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faBookmark}
                                                            className={bookmarkedDocuments.has(doc.id) ? "text-yellow-400" : ""}
                                                        />
                                                        {bookmarkLoading.has(doc.id)
                                                            ? "Loading..."
                                                            : bookmarkedDocuments.has(doc.id)
                                                                ? "Remove bookmark"
                                                                : "Bookmark"
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DocumentTable;