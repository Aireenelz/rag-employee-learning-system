interface ChartDataPoint {
    day: string;
    value: number;
}

interface ColumnChartProps {
    title: string;
    description: string;
    data: ChartDataPoint[];
}

const ClusteredColumnChart: React.FC<ColumnChartProps> = ({ title, description, data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 200;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            {/* Title and description */}
            <p className="text-2xl font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500 mb-3">{description}</p>

            {/* Datapoints */}
            <div className="flex items-end justify-between h-60 px-4 pt-4">
                {data.map((item, index) => {
                    const columnHeight = (item.value / maxValue) * chartHeight;

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                            <div className="w-full flex items-end justify-center" style={{ height: chartHeight }}>
                                <div
                                    className="bg-black w-12 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                    style={{ height: `${columnHeight}px`}}
                                    title={`${item.day}: ${item.value}`}
                                />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{item.day}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClusteredColumnChart;