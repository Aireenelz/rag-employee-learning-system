import React, { useEffect, useState } from "react";
import KPICard from "./KPICard";
import DataTable from "./DataTable";
import PieChart from "./PieChart";
import { useAuthFetch } from "../../utils/useAuthFetch";
import { calculateChangeWholeNumber } from "../../utils/kpiDataUtils";

interface DocumentAnalyticsProps {
    userRole: string;
    timeRange: string;
}

interface KPIData {
    total_documents: number;
    // documents_accessed_percentage: number;
    storage_used_mb: number;
    storage_limit_mb: number;
    previous_total_documents: number;
    // previous_documents_accessed_percentage: number;
}

interface MostViewedDocument {
    filename: string;
    total_views: number;
}

interface CategoryDistribution {
    category: string;
    count: number;
}

interface DocumentAnalyticsResponse {
    kpis: KPIData;
    most_viewed_documents: MostViewedDocument[];
    category_distribution: CategoryDistribution[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DocumentAnalytics:React.FC<DocumentAnalyticsProps> = ({ userRole, timeRange }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analyticsData, setAnalyticsData] = useState<DocumentAnalyticsResponse | null>(null);

    const { authFetch } = useAuthFetch();

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await authFetch(`${API_BASE_URL}/api/analytics/document-analytics?user_role=${userRole}&time_range=${timeRange}`, {
                method: "GET",
                headers: { "Content-Type": "application/json"}
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch analytics");
            }
            
            const data: DocumentAnalyticsResponse = await response.json();
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
                <div className="text-gray-500">Loading document analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 mb-2">Error loading document analytics</div>
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

    const storageUsagePercentage = Math.round((analyticsData.kpis.storage_used_mb / analyticsData.kpis.storage_limit_mb) * 100);

    const kpiData = [
        {
            title: "Total Documents",
            value: analyticsData.kpis.total_documents,
            change: `${calculateChangeWholeNumber(analyticsData.kpis.total_documents, analyticsData.kpis.previous_total_documents)} documents compared to last period`
        },
        // {
        //     title: "% Documents Accessed",
        //     value: analyticsData.kpis.documents_accessed_percentage,
        //     change: calculateChangeWholeNumber(analyticsData.kpis.documents_accessed_percentage, analyticsData.kpis.previous_documents_accessed_percentage)
        // },
        {
            title: "Storage Used",
            value: `${analyticsData.kpis.storage_used_mb.toFixed(2)} MB`,
            change: `out of ${analyticsData.kpis.storage_limit_mb.toFixed(2)} MB (${storageUsagePercentage}%)`
        }
    ];

    const documentsColumns = [
        { key: 'filename', label: 'Document', align: 'left' as const, width: 'col-span-10' },
        { key: 'total_views', label: 'Views', align: 'right' as const, width: 'col-span-2' }
    ];

    const documentsData = analyticsData.most_viewed_documents.map(doc => ({
        filename: doc.filename,
        total_views: doc.total_views
    }));

    const pieChartColors = [
        '#3B82F6',
        '#8B5CF6',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#06B6D4',
        '#EC4899',
        '#8B5CF6',
        '#14B8A6',
        '#F97316'
    ];

    const categoryData = analyticsData.category_distribution.map((cat, index) => ({
        label: cat.category,
        value: cat.count,
        color: pieChartColors[index % pieChartColors.length]
    }));

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Viewed Documents */}
                <div className="mb-4">
                    <DataTable 
                        title="Most Viewed Documents"
                        description={`Top ${analyticsData.most_viewed_documents.length} documents in the selected period`}
                        columns={documentsColumns}
                        data={documentsData}
                    />
                </div>

                {/* Documents by Category */}
                <div className="mb-4">
                    <PieChart 
                        title="Documents by Category"
                        description={`Distribution across ${analyticsData.category_distribution.length} categories`}
                        data={categoryData}
                    />
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                {kpiData.map((kpi, index) => (
                    <KPICard 
                        key={index}
                        title={kpi.title}
                        value={kpi.value}
                        change={kpi.change}
                    />
                ))}
            </div>
        </div>
    );
};

export default DocumentAnalytics;