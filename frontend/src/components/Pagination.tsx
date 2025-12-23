import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight
} from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) => {
    // Calculate range of items being displayed
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1 ; i <= totalPages ; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate range around current page
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push("...");
            }

            // Add pages around current page
            for (let i = startPage ; i <= endPage ; i++) {
                pages.push(i);
            }

            // Add ellipses before last page if needed
            if (endPage < totalPages - 1) {
                pages.push("...");
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onPageSizeChange(Number(e.target.value));
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-3">
            {/* Items info and page size selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
                <span className="font-semibold">
                    Showing {startItem} to {endItem} of {totalItems} documents
                </span>
                <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="font-semibold">
                        Show:
                    </label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border rounded px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-els-primarybutton"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    aria-label="Previous page"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === "..." ? (
                                <span className="px-3 py-1.5 text-gray-400">...</span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    className={`px-3 py-1.5 border rounded font-semibold text-sm ${
                                        currentPage === page
                                            ? "bg-els-primarybutton text-white border-els-primarybutton"
                                            : "hover:bg-gray-50"
                                    }`}
                                    aria-label={`Page ${page}`}
                                    aria-current={currentPage === page ? "page" : undefined}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    aria-label="Next page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;