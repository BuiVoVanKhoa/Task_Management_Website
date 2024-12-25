import React from 'react';

const UserAvatar = ({ user }) => {

    if (!user) return null;

    const getAvatarUrl = (userId, email) => {
        // Sử dụng email hoặc userId làm seed để tạo avatar
        const seed = email || userId || 'default';
        return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`;
    };

    return (
        <img
            src={getAvatarUrl(user._id, user.email)}
            alt={user.email || 'User'}
            className="w-full h-full object-cover"
            title={user.email || 'User'}
        />
    );
};

export default UserAvatar;
