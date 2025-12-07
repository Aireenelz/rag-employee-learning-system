import React from "react";

interface TableColumn {
    key: string;
    label: string;
    align?: "left" | "center" | "right";
    width?: string;
}

interface TableRow {
    [key: string]: string | number;
}

interface DataTableProps {
    title: string;
    description: string;
    columns: TableColumn[];
    data: TableRow[];
}

const DataTable: React.FC<DataTableProps> = ({ title, description, columns, data }) => {
    const getTextAlign = (align?: string) => {
        switch (align) {
            case "center": return "text-center";
            case "right": return "text-right";
            default: return "text-left";
        }
    };

    const getTrendColor = (value: string | number) => {
        const strValue = String(value);
        if (strValue.includes("%")) {
            const numValue = parseFloat(strValue);
            return numValue >= 0 ? "text-green-600" : "text-red-600";
        }
        return "text-gray-900";
    };

    const formatValue = (value: string | number) => {
        if (typeof value === "number") {
            return value.toLocaleString();
        }
        return value;
    };
    
    return (
        <div className="h-full bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {/* Table container */}
            <div>
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 bg-white">
                    {columns.map((column, index) => (
                        <div
                            key={index}
                            className={`${column.width || "col-span-4"} ${getTextAlign(column.align)}`}
                        >
                            <span className="text-sm font-semibold text-gray-500">
                                {column.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Table body */}
                <div className="divide-y divide-gray-100">
                    {data.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 transition-colors"
                        >
                            {columns.map((column, colIndex) => {
                                const value = row[column.key];
                                const isPercentage = String(value).includes("%");

                                return (
                                    <div
                                        key={colIndex}
                                        className={`${column.width || 'col-span-4'} ${getTextAlign(column.align)}`}
                                    >
                                        <span className={`text-base ${
                                            isPercentage
                                                ? `${getTrendColor(value)}`
                                                : "text-gray-900"
                                        }`}>
                                            {formatValue(value)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DataTable;