import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark,
    faList,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import FAQs from "../components/FAQs";
import YourBookmarks from "../components/YourBookmarks";

const QuickAccess: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"bookmarks" | "faq">("bookmarks");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="pb-5">
            {/* Header */}
            <h1 className="text-2xl font-bold mb-3">
                Quick Access
            </h1>

            {/* Toggle tabs */}
            <div className="flex mb-4 w-full py-1 px-1 bg-els-mutedbackground rounded-lg text-sm gap-1">
                {/* Your Bookmarks */}
                <button
                    className={`flex-1 text-center py-2 px-4 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'bookmarks' ? 'bg-els-selectedtab hover:text-gray-600' : 'text-gray-400'
                    }`}
                    onClick={() => {
                        setActiveTab('bookmarks');
                        setSearchQuery("");
                    }}
                >
                    <FontAwesomeIcon icon={faBookmark} className="mr-2"/>
                    Your Bookmarks
                </button>

                {/* Frequently Asked Questions */}
                <button
                    className={`flex-1 text-center py-2 px-4 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'faq' ? 'bg-els-selectedtab hover:text-gray-600' : 'text-gray-400'
                    }`}
                    onClick={() => {
                        setActiveTab('faq');
                        setSearchQuery("");
                    }}
                >
                    <FontAwesomeIcon icon={faList} className="mr-2"/>
                    Frequently Asked Questions
                </button>
            </div>

            {/* Main panel */}
            <div className="flex flex-col h-full w-full border rounded-lg bg-els-mainpanelbackground p-3">
                {/* Search bar */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold text-gray-400">
                        Search through {activeTab === "bookmarks" ? "your bookmarks" : "FAQs"}
                    </h2>
                    <div>
                        <div className="flex items-center w-full border rounded bg-els-secondarybackground">
                            <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400 ml-3"/>
                            <input
                                type="text"
                                placeholder="Search by document name or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-els-secondarybackground text-sm font-semibold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Tab content */}
                <div className="mt-8">
                    {activeTab === 'bookmarks' ? (
                        <YourBookmarks searchQuery={searchQuery} />
                    ) : (
                        <FAQs searchQuery={searchQuery} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickAccess;