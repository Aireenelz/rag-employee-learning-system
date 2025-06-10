import React, { useState } from "react";
import DocumentTable from "../components/DocumentTable";

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
                        className="bg-els-deletebutton text-sm text-red-700 font-semibold py-1.5 px-5 rounded-lg hover:bg-els-deletebuttonhover hover:text-white"
                    >
                        Delete
                    </button>

                    {/* Upload button */}
                    <button
                        className="bg-els-primarybutton text-sm font-semibold py-1.5 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover"
                    >
                        Upload
                    </button>
                </div>
                
                {/* Bar for search and filter */}
                <div className="flex justify-between items-center p-3">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by document name or tags..."
                        className="w-2/3 px-4 py-2 border rounded bg-els-secondarybackground"
                    />

                </div>

                {/* Document table */}
                <div className="p-3">
                    <DocumentTable/>
                </div>
            </div>
        </div>
    );
};

export default Documents;