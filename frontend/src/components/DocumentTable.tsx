import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faEllipsisVertical,
    faCalendar,
} from "@fortawesome/free-solid-svg-icons";

interface Document {
    id: string;
    filename: string;
    tags: string[];
    uploadDate: string;
    size: string;
};

interface DocumentTableProps {
    documents: Document[];
    selectedDocuments: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    isLoading: boolean;
}

const DocumentTable: React.FC<DocumentTableProps> = ({documents, selectedDocuments, onSelectionChange, isLoading}) => {
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [bookmarkedDocuments, setBookmarkedDocuments] = useState<string[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);

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
    const handleOpenDocument = async (documentId: string, filename: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/documents/${documentId}/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');

                // Clean up the URL after a delay to ensure it's loaded
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            } else {
                alert("Failed to open document");
            }
        } catch (error) {
            console.error("Open document error: ", error);
            alert("Error opening document");
        }
        setOpenActionMenu(null);
    };

    // Action to bookmark a document
    const handleBookmark = (documentId: string) => {
        if (bookmarkedDocuments.includes(documentId)) {
            setBookmarkedDocuments(prev => prev.filter(id => id !== documentId));
        } else {
            setBookmarkedDocuments(prev => [...prev, documentId]);
        }
        setOpenActionMenu(null);
    };

    // Date formatting
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "numeric",
            year: "numeric"
        });
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
                    <div className="text-gray-500">Loading documents...</div>
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

                                {/* Tags */}

                                {/* Upload date */}

                                {/* Size */}

                                {/* Actions */}
                                
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DocumentTable;