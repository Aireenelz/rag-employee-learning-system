import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
    faEllipsisVertical,
    faCalendar,
} from "@fortawesome/free-solid-svg-icons";

interface Document {
    name: string;
    tags: string[];
    uploadDate: string;
    size: string;
};

const documents: Document[] = [
    {
        name: "Employee Handbook 2023",
        tags: ["HR", "Policies", "Onboarding"],
        uploadDate: "5/15/2023",
        size: "2.4 MB"
    },
    {
        name: "Product Roadmap Q2 2023",
        tags: ["Product", "Strategy"],
        uploadDate: "4/1/2023",
        size: "5.7 MB"
    },
    {
        name: "Security Guidelines 2024",
        tags: ["Security", "IT"],
        uploadDate: "3/12/2023",
        size: "1.2 MB"
    },
    {
        name: "Onboarding Checklist",
        tags: ["HR", "Onboarding"],
        uploadDate: "2/28/2023",
        size: "0.8 MB"
    },
    {
        name: "Q1 Financial Report",
        tags: ["Finance", "Reports"],
        uploadDate: "4/15/2023",
        size: "3.2 MB"
    },
    {
        name: "Employee Handbook 2023",
        tags: ["HR", "Policies"],
        uploadDate: "5/15/2023",
        size: "2.4 MB"
    },
    {
        name: "Product Roadmap Q2 2023",
        tags: ["Product", "Strategy"],
        uploadDate: "4/1/2023",
        size: "5.7 MB"
    },
    {
        name: "Security Guidelines 2024",
        tags: ["Security", "IT"],
        uploadDate: "3/12/2023",
        size: "1.2 MB"
    },
    {
        name: "Onboarding Checklist",
        tags: ["HR", "Onboarding"],
        uploadDate: "2/28/2023",
        size: "0.8 MB"
    },
    {
        name: "Q1 Financial Report",
        tags: ["Finance", "Reports"],
        uploadDate: "4/15/2023",
        size: "3.2 MB"
    }
];

const DocumentTable: React.FC = () => {
    return (
        <div className="border rounded">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="text-left border-b">
                        <th className="py-2 pl-3"></th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Document</th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Tags</th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Upload Date</th>
                        <th className="p-2 text-sm font-semibold text-gray-400">Size</th>
                        <th className="p-2 text-sm font-semibold text-gray-400 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                            {/* Checkbox */}
                            <td className="py-2 pl-3"><input type="checkbox"/></td>

                            {/* Document Name */}
                            <td className="py-4 px-2 flex items-center gap-2 text-sm font-semibold">
                                <FontAwesomeIcon icon={faFileAlt} className="text-blue-500"/>
                                {doc.name}
                            </td>

                            {/* Tags */}
                            <td className="py-4 px-2">
                                <div className="flex gap-1 flex-wrap">
                                    {doc.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            
                            {/* Upload date*/}
                            <td className="py-4 px-2 text-sm font-semibold text-gray-400 flex items-center gap-1">
                                <FontAwesomeIcon icon={faCalendar}/>
                                {doc.uploadDate}
                            </td>

                            {/* Size */}
                            <td className="py-4 px-2 text-sm font-semibold text-gray-400">{doc.size}</td>

                            {/* Actions */}
                            <td className="py-4 px-2 text-sm font-semibold flex items-center justify-center">
                                <button
                                    className="px-2 rounded-full hover:bg-els-secondarybuttonhover"
                                >
                                    <FontAwesomeIcon icon={faEllipsisVertical}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DocumentTable;