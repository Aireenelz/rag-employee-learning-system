import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthFetch } from "../utils/useAuthFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faCog,
    faList,
    faUser,
    faPlus,
    faEdit,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import FAQAdminModal from "./FAQAdminModal";

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

interface FAQsProps {
    searchQuery: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FAQs: React.FC<FAQsProps> = ({ searchQuery }) => {
    const categories = ["All", "Onboarding", "Training & Operational", "Products & Services"];
    const categoryIcons: Record<string, any> = {
        "All": faList,
        "Onboarding": faUser,
        "Training & Operational": faCog,
        "Products & Services": faBoxOpen
    };

    const { profile } = useAuth();
    const { authFetch } = useAuthFetch();

    const userRole = profile?.role
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

    const fetchFaqs = async () => {
        try {
            setIsLoading(true);
            const response = await authFetch(`${API_BASE_URL}/api/faqs`);
            
            if (response.ok) {
                const data = await response.json();
                setFaqs(data);
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleDelete = async (faqId: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;

        try {
            const response = await authFetch(`${API_BASE_URL}/api/faqs/${faqId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("FAQ deleted successfully!");
                await fetchFaqs();
            }
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            alert("Failed to delete FAQ");
        }
    };

    const handleOpenModal = (faq: FAQItem | null = null) => {
        setEditingFaq(faq);
        setShowAdminModal(true);
    };

    const handleCloseModal = () => {
        setShowAdminModal(false);
        setEditingFaq(null);
    };

    // When first open, filter by category
    let filteredFaqs = selectedCategory === "All"
        ? faqs
        : faqs.filter(faq => faq.category === selectedCategory);
    
    // Filter faqs based on search query
    if (searchQuery.trim() !== "") {
        filteredFaqs = filteredFaqs.filter(faq => {
            const query = searchQuery.toLowerCase();
            return (
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query)
            );
        });
    }

    if (isLoading) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-sm font-semibold">Loading FAQs...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Admin controls */}
            {userRole === "admin" && (
                <div className="flex justify-end px-1">
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="bg-els-primarybackground text-white px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add New FAQ
                    </button>
                    
                </div>
            )}
            
            {/* FAQ Categories */}
            <div className="text-sm font-semibold flex flex-col gap-2 px-1 mb-4">
                <h2>FAQ Categories</h2>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex items-center gap-1 px-4 py-1 text-xs font-semibold rounded-md border hover:border-gray-400 ${
                                category === selectedCategory
                                    ? "bg-els-primarybackground text-white"
                                    : "bg-els-secondarybackground"
                            }`}
                        >
                            <FontAwesomeIcon icon={categoryIcons[category]} className="mr-2"/>
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ cards */}
            <div className="px-1">
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm font-semibold">No FAQs found</p>
                        <p className="text-xs mt-1">Try adjusting your search query or category filter</p>
                    </div>
                ) : (
                    filteredFaqs.map((faq) => (
                        <div key={faq.id} className="border rounded-md my-6 pb-3">
                            {/* Icon and question */}
                            <div className="bg-els-cardheaderbackground rounded-t-md border-b py-2 px-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="flex items-center gap-3 font-semibold text-md">
                                        <FontAwesomeIcon icon={categoryIcons[faq.category]} className="mr-2 h-3 w-3"/>
                                        {faq.question}
                                    </h3>
                                    {userRole === "admin" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(faq)}
                                                className="text-blue-500 hover:text-blue-800"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(faq.id)}
                                                className="text-red-500 hover:text-red-800"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Answer */}
                            <div className="py-2 px-4">
                                <p className="text-sm">{faq.answer}</p>
                            </div>

                            {/* Category */}
                            <div className="py-2 px-4 flex flex-wrap gap-2">
                                <span className="bg-els-mainpanelbackground text-xs font-semibold px-2 py-0.5 rounded-full border">
                                    <FontAwesomeIcon icon={categoryIcons[faq.category]} className="mr-2 h-3 w-2"/>
                                    {faq.category}
                                </span>
                                {userRole === "admin" && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        Access: {faq.access_level}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Admin modal */}
            <FAQAdminModal
                faq={editingFaq}
                isOpen={showAdminModal}
                onClose={handleCloseModal}
                onSave={fetchFaqs}
            />
        </div>
    );
};

export default FAQs;