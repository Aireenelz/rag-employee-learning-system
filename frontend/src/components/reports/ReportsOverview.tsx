import React, { useEffect, useState } from "react";
import {
    faSearch,
    faFileText,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "./KPICard";
import ClusteredColumnChart from "./ClusteredColumnChart";
import { useAuthFetch } from "../../utils/useAuthFetch";
import { calculateChangePercentage } from "../../utils/kpiDataUtils";

interface ReportsOverviewProps {
    userRole: string;
    timeRange: string;
}

interface KPIData {
    total_questions: number;
    documents_viewed: number;
    total_users: number;
    previous_total_questions: number;
    previous_documents_viewed: number;
    previous_total_users: number;
}

interface DailyUsageTrend {
    label: string;
    searches: number;
    documentViews: number;
    activeUsers: number;
    [key: string]: string | number;
}

interface AnalyticsResponse {
    kpis: KPIData;
    daily_trends: DailyUsageTrend[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ReportsOverview:React.FC<ReportsOverviewProps> = ({ userRole, timeRange }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);

    const { authFetch } = useAuthFetch();

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await authFetch(`${API_BASE_URL}/api/analytics/overview?user_role=${userRole}&time_range=${timeRange}`, {
                method: "GET",
                headers: { "Content-Type": "application/json"}
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch analytics");
            }
            
            const data: AnalyticsResponse = await response.json();
            setAnalyticsData(data);
            console.log(data)
        } catch (error) {
            console.error("Error fetch analytics:", error);
            setError("An error occured occured");
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
                <div className="text-gray-500">Loading analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 mb-2">Error loading analytics</div>
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
            title: "Total Questions",
            value: analyticsData.kpis.total_questions,
            change: calculateChangePercentage(analyticsData.kpis.total_questions, analyticsData.kpis.previous_total_questions),
            icon: faSearch
        },
        {
            title: "Documents Viewed",
            value: analyticsData.kpis.documents_viewed,
            change: calculateChangePercentage(analyticsData.kpis.documents_viewed, analyticsData.kpis.previous_documents_viewed),
            icon: faFileText
        },
        {
            title: "Users Created",
            value: analyticsData.kpis.total_users,
            change: calculateChangePercentage(analyticsData.kpis.total_users, analyticsData.kpis.previous_total_users),
            icon: faUsers
        }
    ];

    const dailyMetrics = [
        { key: 'searches', label: 'Searches', color: 'bg-blue-500', hoverColor: 'bg-blue-600' },
        { key: 'documentViews', label: 'Document Views', color: 'bg-purple-500', hoverColor: 'bg-purple-600' },
        { key: 'activeUsers', label: 'Active Users', color: 'bg-green-500', hoverColor: 'bg-green-600' }
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
                    data={analyticsData.daily_trends}
                    metrics={dailyMetrics}
                />
            </div>
        </div>
    );
};

export default ReportsOverview;