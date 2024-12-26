import { useState } from 'react';

const AvatarPicker = ({ selectedAvatar, onSelect }) => {
    const [showPicker, setShowPicker] = useState(false);
    const avatarCount = 24; // Số lượng avatar có sẵn (từ avt-0 đến avt-23)

    return (
        <div className="relative">
            <div 
                onClick={() => setShowPicker(!showPicker)}
                className="cursor-pointer relative group"
            >
                <img 
                    src={`/avt_group/${selectedAvatar}.jpg`}
                    alt="Selected Avatar"
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-400"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100">Change</span>
                </div>
            </div>

            {showPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-2 z-50 max-h-[300px] overflow-y-auto">
                    {[...Array(avatarCount)].map((_, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                onSelect(`avt-${index}`);
                                setShowPicker(false);
                            }}
                            className={`cursor-pointer relative group ${
                                selectedAvatar === `avt-${index}` ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            <img
                                src={`/avt_group/avt-${index}.jpg`}
                                alt={`Avatar ${index}`}
                                className="w-12 h-12 rounded-lg object-cover hover:opacity-80 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvatarPicker;
