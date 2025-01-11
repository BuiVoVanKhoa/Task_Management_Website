import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// Inject react-select styles into the document
const injectSelectStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .react-select-container .react-select__option {
            transition: none !important;
        }
        .react-select-container .react-select__option:hover {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
        }
        .react-select-container .react-select__option--is-focused {
            background-color: transparent !important;
        }
        .react-select-container .dark .react-select__option--is-focused {
            background-color: #1e293b !important;
        }
        .react-select-container .react-select__option--is-selected {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
        }
    `;
    document.head.appendChild(styleElement);
};

const ThemeToggle = () => {
    const { darkMode, toggleTheme } = useTheme();

    React.useEffect(() => {
        injectSelectStyles();
    }, []);

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
                <MoonIcon className="h-5 w-5 text-gray-500" />
            )}
        </button>
    );
};

export default ThemeToggle;
