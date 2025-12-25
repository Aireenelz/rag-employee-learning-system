import React, { useState } from "react";
import { useAuthFetch } from "../utils/useAuthFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faCog,
    faUser,
    faTimes
} from "@fortawesome/free-solid-svg-icons";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    access_level: string;
    access_level_num: number;
    created_at: string;
    updated_at: string;
}

interface FAQAdminModalProps {
    faq: FAQItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = ["Onboarding", "Training & Operational", "Products & Services"];
const ACCESS_LEVELS = [
    { value: "public", label: "Public", description: "Accessible to everyone" },
    { value: "partner", label: "Partner", description: "Partners and internal employees" },
    { value: "internal", label: "Internal", description: "Internal employees only" },
    { value: "admin", label: "Admin", description: "Administrators only" }
];

const categoryIcons: Record<string, any> = {
    "Onboarding": faUser,
    "Training & Operational": faCog,
    "Products & Services": faBoxOpen
};

const FAQAdminModal: React.FC<FAQAdminModalProps> = ({ faq, isOpen, onClose, onSave }) => {
    const { authFetch } = useAuthFetch();
    const [formData, setFormData] = useState({
        question: faq?.question || "",
        answer: faq?.answer || "",
        category: faq?.category || "Onboarding",
        access_level: faq?.access_level || "public",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Reset form when faq changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                question: faq?.question || "",
                answer: faq?.answer || "",
                category: faq?.category || "Onboarding",
                access_level: faq?.access_level || "public",
            });
            setSubmitError("");
        }
    }, [faq, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.question.trim()) {
            setSubmitError("Question is required");
            return;
        }
        if (!formData.answer.trim()) {
            setSubmitError("Answer is required");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        const payload = {
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            category: formData.category,
            access_level: formData.access_level,
        };

        try {
            const url = faq
                ? `${API_BASE_URL}/api/faqs/${faq.id}`
                : `${API_BASE_URL}/api/faqs`;
            
            const response = await authFetch(url, {
                method: faq ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert(`FAQ ${faq ? 'updated' : 'created'} successfully!`);
                onSave();
                handleClose();
            } else {
                const errorData = await response.json();
                setSubmitError(errorData.detail || `Failed to ${faq ? 'update' : 'create'} FAQ`);
            }
        } catch (error) {
            console.error("Error saving FAQ:", error);
            setSubmitError("An error occurred while saving the FAQ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-bold">
                        {faq ? "Edit FAQ" : "Create New FAQ"}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-4 space-y-4">
                        {/* Question */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Question
                            </label>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(e) => setFormData({...formData, question: e.target.value})}
                                disabled={isSubmitting}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-els-primarybutton disabled:opacity-50"
                                placeholder="Enter the FAQ question..."
                            />
                        </div>

                        {/* Answer */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Answer
                            </label>
                            <textarea
                                value={formData.answer}
                                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                                disabled={isSubmitting}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-els-primarybutton disabled:opacity-50"
                                rows={5}
                                placeholder="Enter the FAQ answer..."
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setFormData({...formData, category})}
                                        disabled={isSubmitting}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                            formData.category === category
                                                ? "bg-els-primarybutton text-white"
                                                : "bg-els-secondarybackground text-gray-600 hover:bg-gray-300"
                                        } disabled:opacity-50`}
                                    >
                                        <FontAwesomeIcon icon={categoryIcons[category]} className="mr-2 h-3 w-3"/>
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Access Level */}
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
                                            checked={formData.access_level === level.value}
                                            onChange={(e) => setFormData({...formData, access_level: e.target.value})}
                                            disabled={isSubmitting}
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

                        {/* Error message */}
                        {submitError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{submitError}</p>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 border-gray-300 bg-els-secondarybutton rounded-lg hover:bg-els-secondarybuttonhover disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.question.trim() || !formData.answer.trim()}
                            className="px-4 py-2 bg-els-primarybutton text-white rounded-lg hover:bg-els-primarybuttonhover disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (faq ? "Updating..." : "Creating...") : (faq ? "Update FAQ" : "Create FAQ")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FAQAdminModal;