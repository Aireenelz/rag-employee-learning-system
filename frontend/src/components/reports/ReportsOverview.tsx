interface ReportsOverviewProps {
    userRole: string;
    timeRange: string;
}

const ReportsOverview:React.FC<ReportsOverviewProps> = ({ userRole, timeRange }) => {
    return (
        <div>
            🚧 Overview 🚧<br/>
            Filtering by: {userRole} | Last {timeRange} days
        </div>
    );
};

export default ReportsOverview;