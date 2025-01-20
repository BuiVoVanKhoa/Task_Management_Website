import React, { useState, useEffect } from 'react';

const AvatarSelector = ({ currentAvatar, onSelect, onClose }) => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  useEffect(() => {
    // Tạo mảng chứa 33 avatar từ avt_0 đến avt_32
    const avatarList = Array.from({ length: 41 }, (_, i) => `/avt_profile/avt_${i}.jpg`);
    setAvatars(avatarList);
  }, []);

  const handleSelect = (avatar) => {
    setSelectedAvatar(avatar);
    onSelect(avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Select Avatar</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className={`relative cursor-pointer rounded-lg overflow-hidden ${
                selectedAvatar === avatar ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleSelect(avatar)}
            >
              <img
                src={avatar}
                alt={`Avatar ${index}`}
                className="w-16 h-16 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
