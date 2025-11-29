import React from "react";

interface AvatarProps {
    initials: string;
}

const UserAvatar: React.FC<AvatarProps> = ({ initials }) => {
    return (
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shadow-md">
            {initials}
        </div>
    );
};

export default UserAvatar;