import React from "react";
import {
    faSearch,
    faFileText,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "./KPICard";
import ClusteredColumnChart from "./ClusteredColumnChart";

interface SearchAnalyticsProps {
    userRole: string;
    timeRange: string;
}

const SearchAnalytics:React.FC<SearchAnalyticsProps> = ({ userRole, timeRange }) => {
    const kpiData = [
        {
            title: "Average Response Time",
            value: "1.2s",
            change: "-0.3s",
            positiveIsBad: true,
        },
        {
            title: "Search Success Rate",
            value: "89.7%",
            change: "+2.1%",
            positiveIsBad: false,
        },
        {
            title: "Zero Results Rate",
            value: "5.8%",
            change: "+0.5%",
            positiveIsBad: true,
        }
    ];

    const monthlySearchMetrics = [
        { key: 'totalSearches', label: 'Total Searches', color: 'bg-gray-800', hoverColor: 'bg-gray-900' },
        { key: 'successfulSearches', label: 'Successful Searches', color: 'bg-gray-500', hoverColor: 'bg-gray-600' }
    ];

    const monthlySearchData = [
        { label: 'Jan', totalSearches: 1420, successfulSearches: 1280 },
        { label: 'Feb', totalSearches: 1580, successfulSearches: 1422 },
        { label: 'Mar', totalSearches: 1720, successfulSearches: 1520 },
        { label: 'Apr', totalSearches: 1780, successfulSearches: 1590 },
        { label: 'May', totalSearches: 1850, successfulSearches: 1650 },
        { label: 'Jun', totalSearches: 1950, successfulSearches: 1720 }
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Frequently Searched Terms */}
                <div className="mb-4">
                    <ClusteredColumnChart 
                        title="Search Trends"
                        description="Monthly search volume and success rates"
                        data={monthlySearchData}
                        metrics={monthlySearchMetrics}
                    />
                </div>

                {/* Search trends */}
                <div className="mb-4">
                    <ClusteredColumnChart 
                        title="Search Trends"
                        description="Monthly search volume and success rates"
                        data={monthlySearchData}
                        metrics={monthlySearchMetrics}
                    />
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-4">
                {kpiData.map((kpi, index) => (
                    <KPICard 
                        key={index}
                        title={kpi.title}
                        value={kpi.value}
                        change={kpi.change}
                        positiveIsBad={kpi.positiveIsBad}
                    />
                ))}
            </div>
        </div>
    );
};

export default SearchAnalytics;