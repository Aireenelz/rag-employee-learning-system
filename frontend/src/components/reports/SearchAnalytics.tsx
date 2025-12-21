import React, { useEffect, useState } from "react";
import KPICard from "./KPICard";
import ClusteredColumnChart from "./ClusteredColumnChart";
// import DataTable from "./DataTable";
import { useAuthFetch } from "../../utils/useAuthFetch";
import { calculateChange } from "../../utils/kpiDataUtils";

interface SearchAnalyticsProps {
    userRole: string;
    timeRange: string;
}

interface KPIData {
    avg_response_time_ms: number;
    avg_response_time_display: string;
    search_success_rate: number;
    zero_results_rate: number;
    previous_avg_response_time_ms: number;
    previous_search_success_rate: number;
    previous_zero_results_rate: number;
}

interface DailyTrend {
    label: string;
    totalSearches: number;
    successfulSearches: number;
    [key: string]: string | number;
}

interface SearchAnalyticsResponse {
    kpis: KPIData;
    daily_trends: DailyTrend[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SearchAnalytics:React.FC<SearchAnalyticsProps> = ({ userRole, timeRange }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analyticsData, setAnalyticsData] = useState<SearchAnalyticsResponse | null>(null);

    const { authFetch } = useAuthFetch();

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await authFetch(`${API_BASE_URL}/api/analytics/search-analytics?user_role=${userRole}&time_range=${timeRange}`, {
                method: "GET",
                headers: { "Content-Type": "application/json"}
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch analytics");
            }
            
            const data: SearchAnalyticsResponse = await response.json();
            setAnalyticsData(data);
            console.log(data)
        } catch (error) {
            console.error("Error fetch analytics:", error);
            setError("An error occured");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [userRole,timeRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading search analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 mb-2">Error loading search analytics</div>
                <div className="text-sm text-gray-500">{error}</div>
                <button
                    onClick={fetchAnalytics}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No data available</div>
            </div>
        );
    }
    
    const kpiData = [
        {
            title: "Average Response Time",
            value: analyticsData.kpis.avg_response_time_display,
            change: `${calculateChange(analyticsData.kpis.avg_response_time_ms / 1000, analyticsData.kpis.previous_avg_response_time_ms / 1000)}s compared to last period`,
            positiveIsBad: true,
        },
        {
            title: "Search Success Rate",
            value: `${analyticsData.kpis.search_success_rate.toFixed(1)}%`,
            change: `${calculateChange(analyticsData.kpis.search_success_rate, analyticsData.kpis.previous_search_success_rate)}% compared to last period`,
            positiveIsBad: false,
        },
        {
            title: "Zero Results Rate",
            value: `${analyticsData.kpis.zero_results_rate.toFixed(1)}%`,
            change: `${calculateChange(analyticsData.kpis.zero_results_rate, analyticsData.kpis.previous_zero_results_rate)}% compared to last period`,
            positiveIsBad: true,
        }
    ];

    // const searchTermsColumns = [
    //     { key: "term", label: "Search Term", align: "left" as const, width:"col-span-9 "},
    //     { key: "count", label: "Count", align: "right" as const, width:"col-span-3 "},
    // ];

    // const searchTermsData = [
    //     { term: "project management", count: 245 },
    //     { term: "employee handbook", count: 189 },
    //     { term: "budget report", count: 156 },
    //     { term: "meeting notes", count: 34 },
    //     { term: "training materials", count: 98 }
    // ];

    const dailySearchMetrics = [
        { key: 'totalSearches', label: 'Total Searches', color: 'bg-gray-800', hoverColor: 'bg-gray-900' },
        { key: 'successfulSearches', label: 'Successful Searches', color: 'bg-gray-500', hoverColor: 'bg-gray-600' }
    ];

    const dailySearchData = analyticsData.daily_trends;

    // Determine chart description based on time range
    const getChartDescription = () => {
        const days = parseInt(timeRange);
        if (days <= 7) {
            return "Last 7 days chronological";
        } else {
            return `Search volume by day of week (${days} days aggregated)`;
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Most Frequently Searched Terms */}
                {/* <div className="mb-4">
                    <DataTable 
                        title="Most Frequently Searched Terms"
                        description="Popular chatbot queries"
                        columns={searchTermsColumns}
                        data={searchTermsData}
                    />
                </div> */}

                {/* Search trends */}
                <div className="mb-4">
                    <ClusteredColumnChart 
                        title="Search Trends"
                        description={getChartDescription()}
                        data={dailySearchData}
                        metrics={dailySearchMetrics}
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