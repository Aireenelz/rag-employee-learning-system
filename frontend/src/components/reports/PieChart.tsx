import React, { useState } from "react";

interface PieChartData {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    title: string;
    description: string;
    data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ title, description, data }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="h-full bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            
            {/* Pie chart container */}
            <div>
                pie chart
            </div>
        </div>
    );
};

export default PieChart;