import React from 'react';
import { MdDashboard, MdOutlineAddTask, MdClose } from 'react-icons/md';
import { FaTasks, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar, themeClasses }) => {
  // Định nghĩa các mục điều hướng trong sidebar
  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: <MdDashboard /> },
    { name: 'Tasks', to: '/tasks', icon: <FaTasks /> },
    { name: 'Team', to: '/teams', icon: <FaUser /> },
  ];

  return (
    <>
      {/* Lớp overlay cho mobile khi sidebar mở */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Component Sidebar chính */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-[280px] shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-60 md:flex-shrink-0
          ${themeClasses.sidebar}`}
      >
        {/* Phần header chứa logo và nút đóng */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${themeClasses.borders}`}>
          {/* Logo và tên ứng dụng */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-full">
              <MdOutlineAddTask className="text-white text-2xl" />
            </div>
            <span className="text-xl font-bold">TaskMe</span>
          </Link>
          
          {/* Nút đóng sidebar - Chỉ hiển thị trên mobile */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-md md:hidden ${themeClasses.menuItem.inactive}`}
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Phần điều hướng chính */}
        <nav className="mt-4 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* Render các mục điều hướng */}
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive ? themeClasses.menuItem.active : themeClasses.menuItem.inactive}`
              }
              onClick={() => {
                // Đóng sidebar trên mobile khi click vào link
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={`absolute bottom-0 w-full p-4 border-t ${themeClasses.borders}`}>
          <p className="text-sm text-gray-500 text-center">
            &copy; 2024 TaskMe
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
