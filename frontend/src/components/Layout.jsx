import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const getDatePickerStyles = (darkMode) => `
  .react-datepicker {
    font-family: inherit;
    background-color: ${darkMode ? '#1e293b' : '#ffffff'};
    border: 1px solid ${darkMode ? '#374151' : '#e5e7eb'};
    border-radius: 0.375rem;
  }
  .react-datepicker__header {
    background-color: ${darkMode ? '#1e293b' : '#ffffff'};
    border-bottom: 1px solid ${darkMode ? '#374151' : '#e5e7eb'};
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__day {
    color: ${darkMode ? '#ffffff' : '#000000'};
  }
  .react-datepicker__day:hover {
    background-color: ${darkMode ? '#374151' : '#f3f4f6'};
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #3b82f6;
    color: #ffffff;
  }
  .react-datepicker__day--outside-month {
    color: ${darkMode ? '#6b7280' : '#9ca3af'};
  }
  .react-datepicker__navigation-icon::before {
    border-color: ${darkMode ? '#ffffff' : '#000000'};
  }
  .react-datepicker__today-button {
    background-color: ${darkMode ? '#374151' : '#f3f4f6'};
    color: ${darkMode ? '#ffffff' : '#000000'};
    border-top: 1px solid ${darkMode ? '#4b5563' : '#e5e7eb'};
  }
`;

const Layout = () => {
  const { darkMode } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const styleElement = document.getElementById('datepicker-styles');
    if (styleElement) {
      styleElement.textContent = getDatePickerStyles(darkMode);
    } else {
      const newStyleElement = document.createElement('style');
      newStyleElement.id = 'datepicker-styles';
      newStyleElement.textContent = getDatePickerStyles(darkMode);
      document.head.appendChild(newStyleElement);
    }
  }, [darkMode]);

  const themeClasses = {
    navbar: darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
    sidebar: darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
    mainContent: darkMode ? 'bg-gray-700' : 'bg-gray-100',
    borders: darkMode ? 'border-gray-700' : 'border-gray-200',
    menuItem: {
      active: 'bg-blue-600 text-white',
      inactive: darkMode
        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        themeClasses={themeClasses}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          themeClasses={themeClasses}
        />

        <main className={`flex-1 overflow-auto p-4 ${themeClasses.mainContent}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
