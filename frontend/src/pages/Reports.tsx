import { useState } from "react";
import ReportsOverview from "../components/reports/ReportsOverview";
import SearchAnalytics from "../components/reports/SearchAnalytics";
import DocumentAnalytics from "../components/reports/DocumentAnalytics";
import UserActivity from "../components/reports/UserActivity";
import StyledSelect from "../components/StyledSelect";

const Reports:React.FC = () => {
    const [userRole, setUserRole] = useState("all");
    const [timeRange, setTimeRange] = useState("30");
    const [activeTab, setActiveTab] = useState<"overview" | "search-analytics" | "document-analytics" | "user-activity">("overview");
    
    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <ReportsOverview userRole={userRole} timeRange={timeRange} />;
            case "search-analytics":
                return <SearchAnalytics userRole={userRole} timeRange={timeRange} />;
            case "document-analytics":
                return <DocumentAnalytics userRole={userRole} timeRange={timeRange} />;
            case "user-activity":
                return <UserActivity userRole={userRole} timeRange={timeRange} />;
            default:
                return <ReportsOverview userRole={userRole} timeRange={timeRange} />;
        }
    };

    return (
        <div className="pb-5">
            {/* Header */}
            <h1 className="text-2xl font-bold">
                System Reports
            </h1>
            <p className="text-sm font-semibold text-gray-400 mb-3">View system usage analytics and generate reports</p>

            {/* Report filters */}
            <div className="flex flex-col w-full border rounded-lg bg-els-mainpanelbackground mb-4 p-4">
                <h2 className="text-xl font-semibold text-gray-900">Report Filters</h2>
                <p className="text-sm text-gray-500 mb-3">Filter reports by user role and time range</p>

                <div className="flex space-x-4">
                    {/* Filter user role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">User Role</label>
                        <StyledSelect
                            value={userRole}
                            onChange={(e) => setUserRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="internal-employee">Internal Employee</option>
                            <option value="partner">Partner</option>
                        </StyledSelect>
                    </div>

                    {/* Filter time range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Time Range</label>
                        <StyledSelect
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </StyledSelect>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex mb-4 w-full py-1 px-1 bg-els-mutedbackground rounded-lg text-sm gap-1">
                {/* Overview */}
                <button
                    className={`flex-1 text-center py-2 px-1 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'overview' ? 'bg-els-selectedtab hover:text-gray-600 shadow-sm' : 'text-gray-400'
                    }`}
                    onClick={() => {
                        setActiveTab('overview');
                    }}
                >
                    Overview
                </button>

                {/* Search analytics */}
                <button
                    className={`flex-1 text-center py-2 px-1 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'search-analytics' ? 'bg-els-selectedtab hover:text-gray-600 shadow-sm' : 'text-gray-400'
                    }`}
                    onClick={() => {
                        setActiveTab('search-analytics');
                    }}
                >
                    Search Analytics
                </button>

                {/* Document analytics */}
                <button
                    className={`flex-1 text-center py-2 px-1 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'document-analytics' ? 'bg-els-selectedtab hover:text-gray-600 shadow-sm' : 'text-gray-400'
                    }`}
                    onClick={() => {
                        setActiveTab('document-analytics');
                    }}
                >
                    Document Analytics
                </button>

                {/* User activity */}
                <button
                    className={`flex-1 text-center py-2 px-1 font-semibold rounded-md hover:text-gray-500 ${
                        activeTab === 'user-activity' ? 'bg-els-selectedtab hover:text-gray-600 shadow-sm' : 'text-gray-400'
                    }`}
                    onClick={() => {
                        setActiveTab('user-activity');
                    }}
                >
                    User activity
                </button>
            </div>

            {/* Main panel */}
            <div>
                {/* Tab content */}
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Reports;