import React from "react";
import KPICard from "./KPICard";
import DataTable from "./DataTable";
import PieChart from "./PieChart";

interface UserActivityProps {
    userRole: string;
    timeRange: string;
}

const UserActivity:React.FC<UserActivityProps> = ({ userRole, timeRange }) => {
    console.log("UserActivity\nuserRole:", userRole, "timeRange:", timeRange)
    const kpiData = [
        {
            title: "Daily Active Users",
            value: "68",
            change: "+5 from last period"
        },
        {
            title: "Avg Session Duration",
            value: "12.5 min",
            change: "+1.2 from last period"
        },
        {
            title: "Peak Usage Hour",
            value: "2:00 PM",
            change: "52 active users"
        },
        {
            title: "User Retention",
            value: "78.5%",
            change: "-2.3% from last period"
        }
    ];

    const usersColumns = [
        { key: 'user', label: 'User', align: 'left' as const, width: 'col-span-5' },
        { key: 'role', label: 'Role', align: 'left' as const, width: 'col-span-4' },
        { key: 'xp', label: 'XP', align: 'right' as const, width: 'col-span-3' }
    ];

    const usersData = [
        { user: 'Sarah Johnson', role: 'Manager', xp: 542 },
        { user: 'Mike Chen', role: 'Employee', xp: 387 },
        { user: 'Emily Davis', role: 'Admin', xp: 298 },
        { user: 'James Wilson', role: 'Employee', xp: 256 },
        { user: 'Lisa Brown', role: 'Manager', xp: 189 }
    ];

    const userData = [
        { label: "Admin", value: 3, color: '#3B82F6' },
        { label: "Internal Employee", value: 100, color: '#8B5CF6' },
        { label: "Partner", value: 24, color: '#10B981' }
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Active Users */}
                <div className="mb-4">
                    <DataTable 
                        title="Most Active Users"
                        description="Users with highest XP"
                        columns={usersColumns}
                        data={usersData}
                    />
                </div>

                {/* User Types */}
                <div className="mb-4">
                    <PieChart 
                        title="User Types"
                        description="Distribution of users"
                        data={userData}
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

export default UserActivity;