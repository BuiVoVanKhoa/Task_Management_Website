import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
    const { darkMode, toggleTheme } = useTheme();

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
