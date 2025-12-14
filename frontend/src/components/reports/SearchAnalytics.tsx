import React from "react";
import KPICard from "./KPICard";
import ClusteredColumnChart from "./ClusteredColumnChart";
import DataTable from "./DataTable";

interface SearchAnalyticsProps {
    userRole: string;
    timeRange: string;
}

const SearchAnalytics:React.FC<SearchAnalyticsProps> = ({ userRole, timeRange }) => {
    console.log("SearchAnalytics\nuserRole:", userRole, "timeRange:", timeRange)
    const kpiData = [
        {
            title: "Average Response Time",
            value: "1.2s",
            change: "-0.3s from last period",
            positiveIsBad: true,
        },
        {
            title: "Search Success Rate",
            value: "89.7%",
            change: "+2.1% from last period",
            positiveIsBad: false,
        },
        {
            title: "Zero Results Rate",
            value: "5.8%",
            change: "+0.5% from last period",
            positiveIsBad: true,
        }
    ];

    const searchTermsColumns = [
        { key: "term", label: "Search Term", align: "left" as const, width:"col-span-6 "},
        { key: "count", label: "Count", align: "right" as const, width:"col-span-3 "},
        { key: "trend", label: "Trend", align: "right" as const, width:"col-span-3 "},
    ];

    const searchTermsData = [
        { term: "project management", count: 245, trend: "+15%" },
        { term: "employee handbook", count: 189, trend: "+8%" },
        { term: "budget report", count: 156, trend: "+22%" },
        { term: "meeting notes", count: 34, trend: "+5%" },
        { term: "training materials", count: 98, trend: "+18%" }
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
                    <DataTable 
                        title="Most Frequently Searched Terms"
                        description="Popular chatbot queries"
                        columns={searchTermsColumns}
                        data={searchTermsData}
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