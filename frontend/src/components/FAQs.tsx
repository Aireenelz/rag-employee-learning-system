import React, { useState } from "react";
import { faqData } from "../data/faqData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faCog,
    faList,
    faUser,
} from "@fortawesome/free-solid-svg-icons";

interface FAQsProps {
    searchQuery: string;
}

const FAQs: React.FC<FAQsProps> = ({ searchQuery }) => {
    const categories = ["All", "Onboarding", "Training & Operational", "Products & Services"];
    
    const categoryIcons: Record<string, any> = {
        "All": faList,
        "Onboarding": faUser,
        "Training & Operational": faCog,
        "Products & Services": faBoxOpen
    };

    const [selectedCategory, setSelectedCategory] = useState("All");

    // When first open, filter by category
    let filteredFaqs = selectedCategory === "All"
        ? faqData
        : faqData.filter(faq => faq.category === selectedCategory);
    
    // Filter faqs based on search query
    if (searchQuery.trim() !== "") {
        filteredFaqs = filteredFaqs.filter(faq => {
            const query = searchQuery.toLowerCase();
            return (
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query) ||
                faq.tags.some(tag => tag.toLowerCase().includes(query))
            );
        });
    }

    return (
        <div>
            {/* FAQ Categories */}
            <div className="text-sm font-semibold flex flex-col gap-2 px-1 mb-4">
                <h2>
                    FAQ Categories
                </h2>
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

            {/* FAQ card */}
            <div className="px-1">
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm font-semibold">No FAQs found</p>
                        <p className="text-xs mt-1">Try adjusting your search query or category filter</p>
                    </div>
                ) : (
                    filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border rounded-md my-6 pb-3"
                        >
                            {/* Icon and question */}
                            <div className="bg-els-cardheaderbackground rounded-t-md border-b py-2 px-4">
                                <h3 className="flex items-center gap-3 font-semibold text-md">
                                    <FontAwesomeIcon icon={categoryIcons[faq.category]} className="mr-2 h-3 w-3"/>
                                    {faq.question}
                                </h3>
                            </div>

                            {/* Answer */}
                            <div className="py-2 px-4">
                                <p className="text-sm">
                                    {faq.answer}
                                </p>
                            </div>

                            {/* Tags + category */}
                            <div className="py-2 px-4 flex flex-wrap gap-2">
                                {faq.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                <span className="bg-els-mainpanelbackground text-xs font-semibold px-2 py-0.5 rounded-full border">
                                    <FontAwesomeIcon icon={categoryIcons[faq.category]} className="mr-2 h-3 w-2"/>
                                    {faq.category}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FAQs;