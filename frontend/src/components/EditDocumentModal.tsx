import React, { useState, useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faSave,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { useAuthFetch } from "../utils/useAuthFetch";

interface EditDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateSuccess: () => void;
    document: {
        id: string;
        filename: string;
        tags: string[];
        access_level: string;
    } | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ACCESS_LEVELS = [
    { value: "public", label: "Public", description: "Accessible to everyone" },
    { value: "partner", label: "Partner", description: "Partners and internal employees" },
    { value: "internal", label: "Internal", description: "Internal employees only" },
    { value: "admin", label: "Admin", description: "Administrators only" }
];

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({ isOpen, onClose, onUpdateSuccess, document }) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [accessLevel, setAccessLevel] = useState<string>("internal");
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [error, setError] = useState("");
    const { authFetch } = useAuthFetch();

    useEffect(() => {
        if (isOpen && document) {
            fetchAvailableTags();
            setSelectedTags(document.tags);
            setAccessLevel(document.access_level);
        }
    }, [isOpen, document]);

    const fetchAvailableTags = async () => {
        try {
            setIsLoadingTags(true);
            const response = await authFetch(`${API_BASE_URL}/api/tags`);

            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data.tags);
            } else {
                setError("Failed to load available tags");
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
            setError("Error loading tags");
        } finally {
            setIsLoadingTags(false);
        }
    }

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSave = async () => {
        if (!document) return;

        if (selectedTags.length === 0) {
            setError("Please select at least one tag");
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const response = await authFetch(`${API_BASE_URL}/api/documents/${document.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tags: selectedTags,
                    access_level: accessLevel
                })
            });

            if (response.ok) {
                alert("Document updated successfully!");
                onUpdateSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "Failed to update document metadata");
            }
        } catch (error) {
            console.error("Error updating document:", error);
            setError("Error updating document");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            setError("");
            onClose();
        }
    };

    if (!isOpen || !document) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-96 max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                    <div>
                        <h2 className="text-xl font-bold">Upload Document</h2>
                        <p className="text-sm text-gray-500 mt-1">{document.filename}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {isLoadingTags ? (
                        <div className="flex justify-center items-center py-8">
                            <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <>
                            {/* Access level selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Access Level
                                </label>
                                <div className="space-y-2">
                                    {ACCESS_LEVELS.map((level) => (
                                        <label
                                            key={level.value}
                                            className="flex items-start p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="access_level"
                                                value={level.value}
                                                checked={accessLevel === level.value}
                                                onChange={(e) => setAccessLevel(e.target.value)}
                                                disabled={isSaving}
                                                className="mt-1 h-4 w-4 text-els-primarybutton focus:ring-els-primarybutton"
                                            />
                                            <div className="ml-3">
                                                <div className="text-sm font-semibold text-gray-800">
                                                    {level.label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {level.description}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Tags selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tags
                                </label>
                                {availableTags.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No tags available
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                disabled={isSaving}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                                    selectedTags.includes(tag)
                                                        ? "bg-els-primarybutton text-white"
                                                        : "bg-els-secondarybackground text-gray-600 hover:bg-gray-300"
                                                } disabled:opacity-50`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedTags.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Selected: {selectedTags.join(", ")}
                                    </p>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
                    {/* Cancel button */}
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border-gray-300 bg-els-secondarybutton rounded-lg hover:bg-els-secondarybuttonhover disabled:opacity-50"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>

                    {/* Upload button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoadingTags || selectedTags.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-els-primarybutton text-white rounded-lg hover:bg-els-primarybuttonhover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={isSaving ? faSpinner : faSave} className={isSaving ? "animate-spin" : ""} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
        );
};

export default EditDocumentModal;