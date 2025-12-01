interface UserActivityProps {
    userRole: string;
    timeRange: string;
}

const UserActivity:React.FC<UserActivityProps> = ({ userRole, timeRange }) => {
    return (
        <div>
            🚧 UserActivity 🚧<br/>
            Filtering by: {userRole} | Last {timeRange} days
        </div>
    );
};

export default UserActivity;