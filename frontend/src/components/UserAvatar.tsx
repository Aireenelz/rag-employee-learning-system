import React from "react";

interface AvatarProps {
    initials: string;
}

const UserAvatar: React.FC<AvatarProps> = ({ initials }) => {
    return (
        <div className="h-7 w-7 rounded-full bg-els-teal flex items-center justify-center text-xs font-semibold text-white">
            {initials}
        </div>
    );
};

export default UserAvatar;