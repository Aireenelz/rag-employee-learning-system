import React from "react";

interface AvatarProps {
    initials: string;
}

const UserAvatar: React.FC<AvatarProps> = ({ initials }) => {
    return (
        <div className="h-12 w-12 rounded-full bg-els-teal flex items-center justify-center text-lg font-semibold text-white">
            {initials}
        </div>
    );
};

export default UserAvatar;