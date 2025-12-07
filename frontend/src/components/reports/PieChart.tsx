import React, { useState } from "react";

interface PieChartDataPoint {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    title: string;
    description: string;
    data: PieChartDataPoint[];
}

const PieChart: React.FC<PieChartProps> = ({ title, description, data }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Calculate total and percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithPercentages = data.map(item => ({
        ...item,
        percentage: ((item.value / total) * 100).toFixed(0)
    }));

    // Calculate pie slice paths
    let cumulativePercentage = 0;
    const slices = dataWithPercentages.map((item, index) => {
        const startAngle = (cumulativePercentage / 100) * 360;
        const endAngle = ((cumulativePercentage + parseFloat(item.percentage)) / 100) * 360;
        cumulativePercentage += parseFloat(item.percentage);

        // Convert angles to radians
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        // Calculate coordinates
        const centerX = 250;
        const centerY = 200;
        const radius = 120;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArcFlag = parseFloat(item.percentage) > 50 ? 1 : 0;

        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        // Calculate label position (outside the slice)
        const labelAngle = (startAngle + endAngle) / 2;
        const labelRad = (labelAngle - 90) * (Math.PI / 180);
        const labelDistance = radius + 20;
        const labelX = centerX + labelDistance * Math.cos(labelRad);
        const labelY = centerY + labelDistance * Math.sin(labelRad);

        // Determine text anchor based on position
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (labelX > centerX + 10) {
            textAnchor = 'start';
        } else if (labelX < centerX - 10) {
            textAnchor = 'end';
        }

        return {
            ...item,
            pathData,
            labelX,
            labelY,
            textAnchor,
            index
        };
    });

    return (
        <div className="h-full bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            
            {/* Pie chart container */}
            <div className="flex-1 flex items-center justify-center relative">
                {/* Svg box */}
                <svg viewBox="0 0 500 400" className="w-full max-w-2xl">
                    {/* Pie slices */}
                    {slices.map((slice, index) => (
                        <g key={index}>
                            <path
                                d={slice.pathData}
                                fill={slice.color}
                                stroke="white"
                                strokeWidth="3"
                                className={`transition-all duration-200 cursor-pointer ${
                                    hoveredIndex === index ? "opacity-80" : "opacity-100"
                                }`}
                                style={{
                                    filter: hoveredIndex === index ? "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" : "none"
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />

                            {/* Labels */}
                            <text
                                x={slice.labelX}
                                y={slice.labelY}
                                textAnchor={slice.textAnchor}
                                className="text-base font-semibold fill-gray-900 pointer-events-none"
                                style={{ fontSize: "15px" }}
                            >
                                {slice.label} {slice.percentage}%
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredIndex !== null && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-none z-10">
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-600 mb-1">
                                {slices[hoveredIndex].label}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {slices[hoveredIndex].value.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                                {slices[hoveredIndex].percentage}% of total
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieChart;