interface SearchAnalyticsProps {
    userRole: string;
    timeRange: string;
}

const SearchAnalytics:React.FC<SearchAnalyticsProps> = ({ userRole, timeRange }) => {
    return (
        <div>
            🚧 SearchAnalytics 🚧<br/>
            Filtering by: {userRole} | Last {timeRange} days
        </div>
    );
};

export default SearchAnalytics;