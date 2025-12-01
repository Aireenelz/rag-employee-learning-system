import React from "react";
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

    const dailyMetrics = [
        { key: 'searches', label: 'Searches', color: 'bg-blue-500', hoverColor: 'bg-blue-600' },
        { key: 'documentViews', label: 'Document Views', color: 'bg-purple-500', hoverColor: 'bg-purple-600' },
        { key: 'activeUsers', label: 'Active Users', color: 'bg-green-500', hoverColor: 'bg-green-600' }
    ];

    const dailyData = [
        { label: 'Mon', searches: 180, documentViews: 120, activeUsers: 45 },
        { label: 'Tue', searches: 220, documentViews: 150, activeUsers: 52 },
        { label: 'Wed', searches: 195, documentViews: 135, activeUsers: 48 },
        { label: 'Thu', searches: 230, documentViews: 130, activeUsers: 58 },
        { label: 'Fri', searches: 245, documentViews: 135, activeUsers: 62 },
        { label: 'Sat', searches: 130, documentViews: 85, activeUsers: 28 },
        { label: 'Sun', searches: 95, documentViews: 68, activeUsers: 22 }
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
                    data={dailyData}
                    metrics={dailyMetrics}
                />
            </div>
        </div>
    );
};

export default ReportsOverview;