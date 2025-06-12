import { useState } from "react";
import DocumentTable from "../components/DocumentTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilter,
    faSearch,
    faTrashCan,
    faUpload
} from "@fortawesome/free-solid-svg-icons";
import UploadModal from "../components/UploadModal";

interface Document {
    id: string;
    filename: string;
    tags: string[];
    uploadDate: string;
    size: string;
}

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch documents from  API
    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("http://localhost:8000/api/documents");
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

    // Refresh document list after successful upload
    const handleUploadSuccess = () => {
        fetchDocuments();
    };

    return (
        <div className="pb-5">
            {/* Header */}
            <h1 className="text-2xl font-bold mb-3">
                Document Management
            </h1>

            {/* Main */}
            <div className="flex flex-col h-full w-full border rounded-lg bg-els-mainpanelbackground">
                {/* Buttons */}
                <div className="flex justify-end gap-2 p-3 border-b">
                    {/* Delete button */}
                    <button
                        className="flex items-center gap-2 bg-els-deletebutton text-sm text-red-700 font-semibold py-2 px-5 rounded-lg hover:bg-els-deletebuttonhover hover:text-white"
                    >
                        <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                        Delete
                    </button>

                    {/* Upload button */}
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 bg-els-primarybutton text-sm font-semibold py-2 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faUpload} className="h-3 w-3" />
                        Upload
                    </button>
                </div>
                
                {/* Bar for search and filter */}
                <div className="flex items-center p-3 gap-2">
                    {/* Search */}
                    <div className="flex items-center w-full border rounded bg-els-secondarybackground">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400 ml-3"/>
                        <input
                            type="text"
                            placeholder="Search by document name or tags..."
                            className="w-full px-4 py-2 bg-els-secondarybackground text-sm font-semibold focus:outline-none"
                        />
                    </div>

                    {/* Filter */}
                    <button
                        className="bg-els-secondarybackground text-gray-400 border px-4 py-2 rounded-lg hover:bg-els-secondarybuttonhover"
                    >
                        <FontAwesomeIcon icon={faFilter} className="h-4 w-3"/>
                    </button>
                </div>

                {/* Document table */}
                <div className="px-3 pb-3">
                    <DocumentTable/>
                </div>
            </div>

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default Documents;