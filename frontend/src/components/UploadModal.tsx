import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faTimes,
    faUpload,
} from "@fortawesome/free-solid-svg-icons";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [fileError, setFileError] = useState<string>("");

    const availableTags = ["HR", "IT", "Policies", "Operations", "Products", "Services", ];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFileError("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            setFileError("Please select a PDF file.");
            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError("File size must be less that 10MB.");
            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
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
            alert("Please select a file.");
            return;
        }
        
        if (selectedTags.length === 0) {
            alert("Please select at least one tag.");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            alert("File size must be less than 10MB.")
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("tags", JSON.stringify(selectedTags));

        try {
            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Upload successful: ", data);
                alert("Document uploaded successfully.");

                // Reset form
                setSelectedFile(null);
                setSelectedTags([]);
                setFileError("");
                onUploadSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Upload failed.");
            }
        } catch (error) {
            console.error("Upload error: ", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setSelectedTags([]);
        setFileError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Upload Document</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                </div>

                {/* File upload */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select PDF File (Max 10MB)
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center 
                        ${fileError 
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
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center"
                        >
                            <FontAwesomeIcon 
                                icon={fileError ? faUpload : selectedFile ? faFileAlt : faUpload} 
                                className={`h-8 w-8 mb-2
                                    ${fileError
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
                    {fileError && (
                        <p className="mt-2 text-sm text-red-600">{fileError}</p>
                    )}
                </div>

                {/* Tags selection */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Tags
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {availableTags.map(tag => (
                            <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => handleTagToggle(tag)}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm">{tag}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                    {/* Cancel button */}
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 border-gray-300 rounded-lg hover:bg-els-secondarybuttonhover"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>

                    {/* Upload button */}
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFile || !!fileError}
                        className="px-4 py-2 bg-els-primarybutton text-white rounded-lg hover:bg-els-primarybuttonhover disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;