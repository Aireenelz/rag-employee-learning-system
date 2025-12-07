import React from "react";
import KPICard from "./KPICard";
import ClusteredColumnChart from "./ClusteredColumnChart";
import DataTable from "./DataTable";
import PieChart from "./PieChart";

interface DocumentAnalyticsProps {
    userRole: string;
    timeRange: string;
}

const DocumentAnalytics:React.FC<DocumentAnalyticsProps> = ({ userRole, timeRange }) => {
    const kpiData = [
        {
            title: "Total Documents",
            value: "2847",
            change: "+43 from last period"
        },
        {
            title: "Average Views per Doc",
            value: "67",
            change: "+12 from last period"
        },
        {
            title: "Storage Used",
            value: "24.7 GB",
            change: "of 100 GB limit"
        },
        {
            title: "Download Rate",
            value: "14.2%",
            change: "+1.3% from last period"
        }
    ];

    const documentsColumns = [
        { key: 'document', label: 'Document', align: 'left' as const, width: 'col-span-6' },
        { key: 'category', label: 'Category', align: 'left' as const, width: 'col-span-3' },
        { key: 'views', label: 'Views', align: 'right' as const, width: 'col-span-3' }
    ];

    const documentsData = [
        { document: 'Employee Handbook 2024 Longer Name', category: 'HR', views: 542 },
        { document: 'Q4 Budget Report', category: 'Finance', views: 387 },
        { document: 'Project Guidelines', category: 'Operations', views: 298 },
        { document: 'Safety Protocols', category: 'Compliance', views: 256 },
        { document: 'Marketing Strategy', category: 'Marketing', views: 189 }
    ];

    const categoryData = [
        { label: 'HR', value: 687, color: '#3B82F6' },
        { label: 'Finance', value: 512, color: '#8B5CF6' },
        { label: 'Operations', value: 465, color: '#10B981' },
        { label: 'Compliance', value: 356, color: '#F59E0B' },
        { label: 'Marketing', value: 289, color: '#EF4444' }
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Viewed Documents */}
                <div className="mb-4">
                    <DataTable 
                        title="Most Viewed Documents"
                        description="Popular documents"
                        columns={documentsColumns}
                        data={documentsData}
                    />
                </div>

                {/* Documents by Category */}
                <div className="mb-4">
                    <PieChart 
                        title="Documents by Category"
                        description="Distribution of document types"
                        data={categoryData}
                    />
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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