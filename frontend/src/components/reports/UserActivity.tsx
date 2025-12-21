import React, { useEffect, useState } from "react";
import KPICard from "./KPICard";
import DataTable from "./DataTable";
import PieChart from "./PieChart";
import { useAuthFetch } from "../../utils/useAuthFetch";
import { calculateChange, calculateChangeWholeNumber } from "../../utils/kpiDataUtils";

interface UserActivityProps {
    userRole: string;
    timeRange: string;
}

interface KPIData {
    daily_active_users: number;
    average_badges_per_user: number;
    user_retention_rate: number;
    previous_daily_active_users: number;
    previous_user_retention_rate: number;
}

interface MostActiveUser {
    user_id: string;
    name: string;
    role: string;
    total_exp: number;
}

interface RoleDistribution {
    role: string;
    count: number;
}

interface UserActivityResponse {
    kpis: KPIData;
    most_active_users: MostActiveUser[];
    role_distribution: RoleDistribution[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserActivity:React.FC<UserActivityProps> = ({ userRole, timeRange }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analyticsData, setAnalyticsData] = useState<UserActivityResponse | null>(null);

    const { authFetch } = useAuthFetch();

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await authFetch(`${API_BASE_URL}/api/analytics/user-activity?user_role=${userRole}&time_range=${timeRange}`, {
                method: "GET",
                headers: { "Content-Type": "application/json"}
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch analytics");
            }
            
            const data: UserActivityResponse = await response.json();
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

    const formatRoleLabel = (role: string): string => {
        switch (role) {
            case "admin":
                return "Admin";
            case "internal-employee":
                return "Internal Staff";
            case "partner":
                return "Partner";
            default:
                return role;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading user activity analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 mb-2">Error loading user activity</div>
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
            title: "Average Badges Per User",
            value: analyticsData.kpis.average_badges_per_user,
            change: "out of 15 badges"
        },
        {
            title: "Average Daily Active Users",
            value: analyticsData.kpis.daily_active_users,
            change: `${calculateChange(analyticsData.kpis.daily_active_users, analyticsData.kpis.previous_daily_active_users)} users compared to last period`
        },
        {
            title: "User Retention",
            value: analyticsData.kpis.user_retention_rate + "%",
            change: `${calculateChangeWholeNumber(analyticsData.kpis.user_retention_rate, analyticsData.kpis.previous_user_retention_rate)}% compared to last period`
        }
    ];

    const usersColumns = [
        { key: 'name', label: 'User', align: 'left' as const, width: 'col-span-6' },
        { key: 'role', label: 'Role', align: 'left' as const, width: 'col-span-4' },
        { key: 'total_exp', label: 'XP', align: 'right' as const, width: 'col-span-2' }
    ];

    const usersData = analyticsData.most_active_users.map(user => ({
        name: user.name,
        role: formatRoleLabel(user.role),
        total_exp: user.total_exp
    }));

    const pieChartColors = {
        admin: "#f6573bff",
        "internal-employee": "#f6e75cff",
        partner: "#3B82F6"
    };

    const userData = analyticsData.role_distribution.map(dist => ({
        label: formatRoleLabel(dist.role),
        value: dist.count,
        color: pieChartColors[dist.role as keyof typeof pieChartColors]
    }));

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Active Users */}
                <div className="mb-4">
                    <DataTable 
                        title="Most Active Users"
                        description="Top users with highest XP"
                        columns={usersColumns}
                        data={usersData}
                    />
                </div>

                {/* User Types */}
                <div className="mb-4">
                    <PieChart 
                        title="User Distribution by Role"
                        description={`Total users: ${analyticsData.role_distribution.reduce((sum, d) => sum + d.count, 0)}`}
                        data={userData}
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
                    />
                ))}
            </div>
        </div>
    );
};

export default UserActivity;