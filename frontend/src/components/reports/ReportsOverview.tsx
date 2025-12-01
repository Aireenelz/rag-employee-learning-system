import {
    faSearch,
    faFileText,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "./KPICard";
import ClusteredColumnChart from "./ClusteredColumnChart";

interface ReportsOverviewProps {
    userRole: string;
    timeRange: string;
}

interface ChartDataPoint {
    day: string;
    value: number;
}

const ReportsOverview:React.FC<ReportsOverviewProps> = ({ userRole, timeRange }) => {
    const kpiData = [
        {
            title: "Total Questions",
            value: 1247,
            change: "+12%",
            icon: faSearch
        },
        {
            title: "Documents Viewed",
            value: 892,
            change: "+8%",
            icon: faFileText
        },
        {
            title: "Active Users",
            value: 156,
            change: "+15%",
            icon: faUsers
        }
    ];

    const chartData: ChartDataPoint[] = [
        { day: 'Mon', value: 180 },
        { day: 'Tue', value: 210 },
        { day: 'Wed', value: 150 },
        { day: 'Thu', value: 200 },
        { day: 'Fri', value: 165 },
        { day: 'Sat', value: 230 },
        { day: 'Sun', value: 245 }
    ];

    return (
        <div>
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-4">
                {kpiData.map((kpi, index) => (
                    <KPICard 
                        key={index}
                        title={kpi.title}
                        value={kpi.value}
                        change={kpi.change}
                        icon={kpi.icon}
                    />
                ))}
            </div>

            {/* Daily usage trends */}
            <div>
                <ClusteredColumnChart 
                    title="Daily Usage Trends"
                    description="System usage across the week"
                    data={chartData}
                />
            </div>
        </div>
    );
};

export default ReportsOverview;