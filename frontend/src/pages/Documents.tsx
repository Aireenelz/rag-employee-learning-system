import React, { useState } from "react";
import DocumentTable from "../components/DocumentTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilter,
    faSearch,
    faTrash,
    faUpload
} from "@fortawesome/free-solid-svg-icons";

const Documents: React.FC = () => {
    return (
        <div>
            {/* Header */}
            <h1 className="text-2xl font-bold mb-4">
                Document Management
            </h1>

            <div className="flex flex-col h-full w-full border rounded-lg bg-els-mainpanelbackground">
                {/* Buttons */}
                <div className="flex justify-end gap-2 p-3 border-b">
                    {/* Delete button */}
                    <button
                        className="flex items-center gap-2 bg-els-deletebutton text-sm text-red-700 font-semibold py-2 px-5 rounded-lg hover:bg-els-deletebuttonhover hover:text-white"
                    >
                        <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                        Delete
                    </button>

                    {/* Upload button */}
                    <button
                        className="flex items-center gap-2 bg-els-primarybutton text-sm font-semibold py-2 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover"
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
                            className="px-4 py-2 bg-els-secondarybackground text-sm font-semibold"
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
        </div>
    );
};

export default Documents;