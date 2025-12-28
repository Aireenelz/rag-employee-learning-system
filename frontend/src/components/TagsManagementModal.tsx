import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faPlus,
    faTrash,
    faSave,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { useAuthFetch } from "../utils/useAuthFetch";

interface TagsManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TagsManagementModal: React.FC<TagsManagementModalProps> = ({ 
    isOpen, 
    onClose, 
    onUpdateSuccess 
}) => {
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const { authFetch } = useAuthFetch();

    // Fetch current tags when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchTags();
        }
    }, [isOpen]);

    const fetchTags = async () => {
        try {
            setIsLoading(true);
            const response = await authFetch(`${API_BASE_URL}/api/tags`);
            
            if (response.ok) {
                const data = await response.json();
                setTags(data.tags);
            } else {
                setError("Failed to load tags");
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
            setError("Error loading tags");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = () => {
        const trimmedTag = newTag.trim();
        
        if (!trimmedTag) {
            setError("Tag cannot be empty");
            return;
        }
        
        if (tags.includes(trimmedTag)) {
            setError("Tag already exists");
            return;
        }
        
        setTags([...tags, trimmedTag]);
        setNewTag("");
        setError("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = async () => {
        if (tags.length === 0) {
            setError("At least one tag is required");
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const response = await authFetch(`${API_BASE_URL}/api/tags`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tags }),
            });

            if (response.ok) {
                alert("Tags updated successfully!");
                onUpdateSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "Failed to update tags");
            }
        } catch (error) {
            console.error("Error saving tags:", error);
            setError("Error saving tags");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            setNewTag("");
            setError("");
            onClose();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isSaving) {
            handleAddTag();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-bold">Manage Tags</h2>
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
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <>
                            {/* Add new tag */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Add New Tag
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={isSaving}
                                        placeholder="Enter tag name..."
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        disabled={isSaving || !newTag.trim()}
                                        className="px-4 py-2 bg-els-primarybutton text-white rounded-lg hover:bg-els-primarybuttonhover disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                            </div>

                            {/* Current tags */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Current Tags ({tags.length})
                                </label>
                                {tags.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No tags added yet
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                                        {tags.map((tag, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                                            >
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {tag}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveTag(tag)}
                                                    disabled={isSaving}
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border-gray-300 bg-els-secondarybutton rounded-lg hover:bg-els-secondarybuttonhover disabled:opacity-50"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading || tags.length === 0}
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

export default TagsManagementModal;