import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faTimes,
    faUpload,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../utils/supabaseClient";
import { useAuthFetch } from "../utils/useAuthFetch";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const ACCESS_LEVELS = [
    { value: "public", label: "Public", description: "Accessible to everyone" },
    { value: "partner", label: "Partner", description: "Partners and internal employees" },
    { value: "internal", label: "Internal", description: "Internal employees only" },
    { value: "admin", label: "Admin", description: "Administrators only" }
];

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [accessLevel, setAccessLevel] = useState<string>("internal");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [uploadError, setUploadError] = useState<string>("");
    const { authFetch } = useAuthFetch();

    // Fetch available tags when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAvailableTags();
        }
    }, [isOpen]);

    const fetchAvailableTags = async () => {
        try {
            setIsLoadingTags(true);
            const response = await authFetch(`${API_BASE_URL}/api/tags`);
            
            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data.tags);
            } else {
                console.error("Failed to fetch tags");
                // Fallback to default tags
                setAvailableTags(["HR", "IT", "Policies", "Operations", "Products", "Services"]);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
            // Fallback to default tags
            setAvailableTags(["HR", "IT", "Policies", "Operations", "Products", "Services"]);
        } finally {
            setIsLoadingTags(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setUploadError("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            setUploadError("Please select a PDF file.");
            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("File size must be less than 10MB.");
            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
        setUploadError("");
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError("Please select a file to upload");
            return;
        }
        
        if (selectedTags.length === 0) {
            setUploadError("Please select at least one tag");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setUploadError("File size must be less than 10MB");
            return;
        }

        setIsUploading(true);
        setUploadError("");

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("tags", JSON.stringify(selectedTags));
        formData.append("access_level", accessLevel);

        try {
            // Get the current session token
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                throw new Error("You must be logged in to upload documents");
            }

            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Upload successful: ", data);
                alert("Document uploaded successfully.");

                onUploadSuccess();
                resetForm();
                onClose();
            } else {
                const errorData = await response.json();
                setUploadError("Upload failed. Please try again");
                throw new Error(errorData.detail || "Upload failed.");
            }
        } catch (error) {
            console.error("Upload error: ", error);
            setUploadError("An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setSelectedTags([]);
        setAccessLevel("internal");
        setUploadError("");
    };

    const handleClose = () => {
        if (!isUploading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-96 max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-bold">Upload Document</h2>
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* File upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select PDF File (Max 10MB)
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center 
                            ${uploadError 
                            ? 'border-red-300 bg-red-50' 
                            : selectedFile
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-300'
                            }
                        `}>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <FontAwesomeIcon 
                                    icon={uploadError ? faUpload : selectedFile ? faFileAlt : faUpload} 
                                    className={`h-8 w-8 mb-2
                                        ${uploadError
                                            ? "text-gray-400"
                                            : selectedFile
                                            ? "text-blue-400"
                                            : "text-gray-400"
                                        }    
                                    `} 
                                />
                                <span className="text-sm text-gray-600">
                                    {selectedFile ? `${selectedFile.name}` : "Click to select PDF file"}
                                </span>
                            </label>
                        </div>
                        {uploadError && (
                            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                        )}
                    </div>

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
                                        disabled={isUploading}
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
                        {isLoadingTags ? (
                            <div className="flex justify-center items-center py-4">
                                <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 animate-spin text-gray-400" />
                            </div>
                        ) : availableTags.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No tags available
                            </p>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagToggle(tag)}
                                            disabled={isUploading}
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
                                {selectedTags.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Selected: {selectedTags.join(", ")}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
                    {/* Cancel button */}
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border-gray-300 bg-els-secondarybutton rounded-lg hover:bg-els-secondarybuttonhover disabled:opacity-50"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>

                    {/* Upload button */}
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFile || selectedTags.length === 0 || !!uploadError || isLoadingTags}
                        className="px-4 py-2 bg-els-primarybutton text-white rounded-lg hover:bg-els-primarybuttonhover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;