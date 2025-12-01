interface DocumentAnalyticsProps {
    userRole: string;
    timeRange: string;
}

const DocumentAnalytics:React.FC<DocumentAnalyticsProps> = ({ userRole, timeRange }) => {
    return (
        <div>
            🚧 DocumentAnalytics 🚧<br/>
            Filtering by: {userRole} | Last {timeRange} days
        </div>
    );
};

export default DocumentAnalytics;