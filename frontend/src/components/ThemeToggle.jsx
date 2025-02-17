import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// Hàm thêm styles cho react-select để đồng bộ với theme
const injectSelectStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        // Loại bỏ hiệu ứng transition mặc định
        .react-select-container .react-select__option {
            transition: none !important;
        }
        // Style cho trạng thái hover của option
        .react-select-container .react-select__option:hover {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
        }
        // Style cho option đang focus
        .react-select-container .react-select__option--is-focused {
            background-color: transparent !important;
        }
        // Style cho option đang focus trong dark mode
        .react-select-container .dark .react-select__option--is-focused {
            background-color: #1e293b !important;
        }
        // Style cho option đã được chọn
        .react-select-container .react-select__option--is-selected {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
        }
    `;
    document.head.appendChild(styleElement);
};

// Component nút chuyển đổi theme sáng/tối
const ThemeToggle = () => {
    // Lấy trạng thái theme và hàm toggle từ context
    const { darkMode, toggleTheme } = useTheme();

    // Thêm styles cho react-select khi component được mount
    React.useEffect(() => {
        injectSelectStyles();
    }, []);

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Hiển thị icon mặt trời hoặc mặt trăng tùy theo theme */}
            {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
                <MoonIcon className="h-5 w-5 text-gray-500" />
            )}
        </button>
    );
};

export default ThemeToggle;
