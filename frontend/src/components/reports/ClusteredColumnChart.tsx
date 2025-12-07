import React, { useState } from "react";

interface DataPoint {
    label: string;
    [key: string]: string | number;
}

interface MetricConfig {
    key: string;
    label: string;
    color: string;
    hoverColor: string;
}

interface ClusteredColumnChartProps {
    title: string;
    description: string;
    data: DataPoint[];
    metrics: MetricConfig[];
}

const ClusteredColumnChart: React.FC<ClusteredColumnChartProps> = ({ title, description, data, metrics }) => {
    const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);
    const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
    
    // Calculate max value across all metrics
    const maxValue = Math.max(
        ...data.flatMap(d =>
            metrics.map(m => Number(d[m.key]) || 0)
        )
    );

    const chartHeight = 240;

    return (
        <div className="h-full bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {/* Legend */}
            <div className="flex justify-end flex-wrap gap-4 mb-6">
                {metrics.map((metric) => (
                    <div key={metric.key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${metric.color}`} />
                        <span className="text-sm text-gray-600">{metric.label}</span>
                    </div>
                ))}
            </div>

            {/* Column chart container */}
            <div className="relative">
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <span className="text-xs text-gray-400">
                                {Math.round((maxValue * (4 - i)) / 4).toLocaleString()}
                            </span>
                            <div className="flex-1 border-t border-gray-100" />
                        </div>
                    ))}
                </div>

                {/* Chart columns */}
                <div
                    className="flex items-end justify-between gap-1 px-4 pt-4 ml-8 mr-5"
                    style={{ height: `${chartHeight + 60}px` }}
                >
                    {data.map((item, groupIndex) => (
                        <div
                            key={groupIndex}
                            className="flex flex-col items-center flex-1"
                            onMouseEnter={() => setHoveredGroup(groupIndex)}
                            onMouseLeave={() => setHoveredGroup(null)}
                        >
                            {/* Tooltip */}
                            {hoveredGroup === groupIndex && (
                                <div className="absolute -top-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 min-w-[200px]">
                                    <div className="font-semibold text-gray-900 mb-2 text-sm">
                                        {item.label}
                                    </div>
                                    <div className="space-y-1.5">
                                        {metrics.map((metric) => (
                                            <div key={metric.key} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">{metric.label}</span>
                                                <span className="font-semibold text-gray-900">
                                                    {Number(item[metric.key] || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clustered columns container */}
                            <div 
                                className="w-full flex items-end justify-center gap-0.5 z-10"
                                style={{ height: chartHeight }}
                            >
                                {metrics.map((metric) => {
                                    const value = Number(item[metric.key]) || 0;
                                    const columnHeight = (value / maxValue) * chartHeight;

                                    return (
                                        <div
                                            key={metric.key}
                                            className={`flex-1 rounded-t transition-all duration-200 cursor-pointer ${
                                                hoveredGroup === groupIndex && hoveredMetric === metric.key
                                                    ? metric.hoverColor + ' shadow-lg'
                                                    : metric.color
                                            }`}
                                            style={{ 
                                                height: `${columnHeight}px`,
                                                maxWidth: `${48 / metrics.length}px`
                                            }}
                                            onMouseEnter={() => setHoveredMetric(metric.key)}
                                            onMouseLeave={() => setHoveredMetric(null)}
                                        />
                                    );
                                })}
                            </div>

                            {/* Label */}
                            <span className={`text-xs font-medium mt-2 transition-colors ${
                                hoveredGroup === groupIndex ? "text-gray-900" : "text-gray-500"
                            }`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClusteredColumnChart;