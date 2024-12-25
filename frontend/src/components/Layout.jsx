import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { darkMode } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Theme classes
  const themeClasses = {
    navbar: `${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`,
    sidebar: `${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`,
    mainContent: `${darkMode ? 'bg-gray-200' : 'bg-gray-100'}`,
    borders: `${darkMode ? 'border-gray-700' : 'border-gray-200'}`,
    menuItem: {
      active: 'bg-blue-600 text-white',
      inactive: darkMode
        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        themeClasses={themeClasses}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          toggleSidebar={toggleSidebar}
          themeClasses={themeClasses}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 ${themeClasses.mainContent} transition-colors duration-200`}
        >
          <div className="container mx-auto">
            <Outlet />
          </div>
          {React.Children.map(children, child =>
            React.cloneElement(child, { themeClasses })
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
