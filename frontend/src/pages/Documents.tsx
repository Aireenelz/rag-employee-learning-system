import { useEffect, useState } from "react";
import DocumentTable from "../components/DocumentTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilter,
    faSearch,
    faTrashCan,
    faUpload,
    faTimes,
    faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import UploadModal from "../components/UploadModal";

interface Document {
    id: string;
    filename: string;
    tags: string[];
    uploadDate: string;
    size: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AVAILABLE_TAGS = ["HR", "IT", "Policies", "Operations", "Products", "Services"];

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

    // Fetch documents from  API
    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/documents`);
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
                setFilteredDocuments(data);
            } else {
                console.error("Failed to fetch documents");
            }
        } catch (error) {
            console.error("Error fetching documents.", error);
        } finally {
            setIsLoading(false);
        }
    }

    // Load documents on component mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    // Filter documents based on search term and selected tags
    useEffect(() => {
        let filtered = documents;

        // Filter by search term
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(doc =>
                doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by selected tags
        if (selectedTags.length > 0) {
            filtered = filtered.filter(doc =>
                selectedTags.some(selectedTag =>
                    doc.tags.includes(selectedTag)
                )
            );
        }

        setFilteredDocuments(filtered);
    }, [searchTerm, documents, selectedTags]);

    // Handle tag selection
    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Clear all tag filters
    const clearTagFilters = () => {
        setSelectedTags([]);
    };

    // Refresh document list after successful upload
    const handleUploadSuccess = () => {
        fetchDocuments();
    };

    // Handle delete operation
    const handleDelete = async () => {
        if (selectedDocuments.length === 0) {
            alert("Please select documents to delete.");
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedDocuments.length} documents(s)?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/documents`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ document_ids: selectedDocuments }),
                });

                if (response.ok) {
                    alert(`${selectedDocuments.length} document(s) deleted successfully!`);
                    setSelectedDocuments([]);
                    fetchDocuments();
                } else {
                    alert("Failed to delete documents.");
                }
            } catch (error) {
                console.error("Delete error: ", error);
                alert("Error deleting documents.");
            }
        }
    };

    return (
        <div className="pb-5">
            {/* Header */}
            <h1 className="text-xl sm:text-2xl font-bold mb-3">
                Document Management
            </h1>

            {/* Main */}
            <div className="flex flex-col h-full w-full border rounded-lg bg-els-mainpanelbackground overflow-hidden">
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 p-3 border-b">
                    {/* Delete button */}
                    <button
                        onClick={handleDelete}
                        disabled={selectedDocuments.length === 0}
                        className="flex items-center justify-center gap-2 bg-els-secondarybutton text-sm text-red-700 font-semibold py-2 px-4 sm:px-5 rounded-lg hover:bg-els-deletebuttonhover hover:text-white disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                        <span>Delete ({selectedDocuments.length})</span>
                    </button>

                    {/* Upload button */}
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-els-primarybutton text-sm font-semibold py-2 px-4 sm:px-5 text-white rounded-lg hover:bg-els-primarybuttonhover cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faUpload} className="h-3 w-3" />
                        <span>Upload</span>
                    </button>
                </div>
                
                {/* Bar for search and filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-3 gap-2">
                    {/* Search */}
                    <div className="flex items-center flex-1 border rounded bg-els-secondarybackground min-w-0">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-600 ml-3 flex-shrink-0"/>
                        <input
                            type="text"
                            placeholder="Search by document name or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-els-secondarybackground text-sm font-semibold focus:outline-none min-w-0"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative flex-shrink-0">
                        {/* Filter button */}
                        <button
                            onClick={() => setIsTagFilterOpen(!isTagFilterOpen)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-els-secondarybackground text-sm font-semibold text-gray-500 border px-4 py-2 rounded-lg hover:bg-els-secondarybuttonhover"
                        >
                            <FontAwesomeIcon icon={faFilter} className="h-4 w-3" />
                            <span>Filter</span>
                            {selectedTags.length > 0 && (
                                <span className="bg-white text-gray-500 rounded-full px-2 py-0.5 text-xs font-bold">
                                    {selectedTags.length}
                                </span>
                            )}
                            <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 transition-transform ${isTagFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Filter dropdown menu */}
                        {isTagFilterOpen && (
                            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border rounded-lg shadow-md z-10">
                                <div className="p-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-800">Filter by Tags</h3>
                                        
                                        {/* Clear all tags button */}
                                        {selectedTags.length > 0 && (
                                            <button
                                                onClick={clearTagFilters}
                                                className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {/* Tags with checkbox */}
                                    <div className="space-y-1.5">
                                        {AVAILABLE_TAGS.map(tag => (
                                            <label key={tag} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                {/* Checkbox for tags */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTags.includes(tag)}
                                                    onChange={() => handleTagToggle(tag)}
                                                    className="mr-3 h-4 w-4 focus:ring-els-primarybutton border-gray-300 rounded"
                                                />
                                                {/* Tag label */}
                                                <span className="text-sm text-gray-700">
                                                    {tag}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active filters display */}
                {selectedTags.length > 0 && (
                    <div className="px-3 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500 font-semibold">Active filters:</span>

                            {selectedTags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 bg-els-secondarybutton text-gray-500 text-xs font-semibold px-2 py-1 rounded-lg"
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleTagToggle(tag)}
                                        className="hover:bg-els-deletebuttonhover hover:text-white rounded-full p-1 flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Document table */}
                <div className="px-3 pb-3 overflow-x-auto">
                    <DocumentTable
                        documents={filteredDocuments}
                        selectedDocuments={selectedDocuments}
                        onSelectionChange={setSelectedDocuments}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* Click outside to close filter dropdown */}
            {isTagFilterOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsTagFilterOpen(false)}
                />
            )}
        </div>
    );
};

export default Documents;