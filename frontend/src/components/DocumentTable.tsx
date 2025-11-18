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
import { useBookmarks } from "../context/BookmarkContext";
import { formatDate } from "../utils/dateUtils";
import { useGamification } from "../context/GamificationContext";
import { useAuthFetch } from "../utils/useAuthFetch";

interface Document {
    id: string;
    filename: string;
    tags: string[];
    uploadDate: string;
    size: string;
    access_level: string;
}

interface DocumentTableProps {
    documents: Document[];
    selectedDocuments: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    isLoading: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ACCESS_LEVEL_CONFIG = {
    public: {
        label: "Public",
        color: "bg-green-100 text-green-800"
    },
    partner: {
        label: "Partner",
        color: "bg-blue-100 text-blue-800"
    },
    internal: {
        label: "Internal",
        color: "bg-yellow-100 text-yellow-800"
    },
    admin: {
        label: "Admin",
        color: "bg-red-100 text-red-800"
    }
};

const DocumentTable: React.FC<DocumentTableProps> = ({ documents, selectedDocuments, onSelectionChange, isLoading }) => {
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());
    const menuRef = useRef<HTMLDivElement>(null);

    const { user, profile } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { trackActivity } = useGamification();
    const { authFetch } = useAuthFetch();

    const isAdmin = profile?.role === "admin";

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
    const handleOpenDocument = async (documentId: string) => {
        try {
            const response = await authFetch(`${API_BASE_URL}/api/documents/${documentId}/download`);

            if (response.ok) {
                // Create blob and open in new tab
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");

                // Cleanup blob url after a delay
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);

                setOpenActionMenu(null);

                // Track document_viewed activity
                if (user?.id) {
                    const document = documents.find(doc => doc.id === documentId);
                    await trackActivity("document_viewed", {
                        document_id: documentId,
                        filename: document?.filename,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                const error = await response.json();
                console.error("Failed to open document:", error);
                alert("Failed to open document");
            }
        } catch (error) {
            console.error("Error opening document:", error);
            alert("Failed to open document. Please try again.");
        }
    };

    // Action to bookmark a document (toggle bookmark)
    const handleBookmarkToggle = async (documentId: string) => {
        if (!user?.id) {
            alert("Please sign in to bookmark documents");
            return;
        }

        // Prevent multiple simultaneous requests
        if (bookmarkLoading.has(documentId)) return;
        
        setBookmarkLoading(prev => new Set(prev).add(documentId));

        try {
            await toggleBookmark(documentId);
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
        );
    }

    return (
        <div className="border rounded">
            <div className="overflow-x-auto md:overflow-x-visible">
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
                        documents.map((doc, index) => (
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
                                        <FontAwesomeIcon icon={faFileAlt} className="text-blue-400 flex-shrink-0"/>
                                        {doc.filename}
                                        {isAdmin && (() => {
                                            const accessConfig = ACCESS_LEVEL_CONFIG[doc.access_level as keyof typeof ACCESS_LEVEL_CONFIG] || ACCESS_LEVEL_CONFIG.public;

                                            return (
                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${accessConfig.color}`} title={`Access Level: ${accessConfig.label}`}>
                                                    <span>{accessConfig.label}</span>
                                                </span>
                                            );
                                        })()}
                                        {isBookmarked(doc.id) && (
                                            <FontAwesomeIcon icon={faBookmark} className="text-yellow-400 flex-shrink-0" title="Bookmarked"/>
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
                                                className={`absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48 ${
                                                    index === 0 ? "top-full" : "bottom-full"
                                                }`}
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
                                                        onClick={() => handleBookmarkToggle(doc.id)}
                                                        disabled={bookmarkLoading.has(doc.id)}
                                                        className="w-full text-left px-3 py-2 text-sm font-normal hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faBookmark}
                                                            className={isBookmarked(doc.id) ? "text-yellow-400" : ""}
                                                        />
                                                        {bookmarkLoading.has(doc.id)
                                                            ? "Loading..."
                                                            : isBookmarked(doc.id)
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
        </div>
    );
};

export default DocumentTable;