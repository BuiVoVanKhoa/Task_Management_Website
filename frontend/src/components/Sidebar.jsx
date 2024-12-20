import React from 'react';
import { MdDashboard, MdOutlineAddTask } from 'react-icons/md';
import { FaTasks, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-60 h-screen bg-gray-900 shadow-md transform transition-transform duration-300 z-20 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative`}
      >
        <h1 className='flex gap-2 items-center p-4 shadow-sm'>
          <div className='bg-blue-600 p-2 rounded-full'>
            <MdOutlineAddTask className='text-white text-2xl font-black' />
          </div>
          <span className='text-2xl font-bold text-white'>TaskMe</span>
        </h1>

        <div className='flex-1 flex flex-col py-6'>
          <ul className='space-y-4'>
            <li className="hover:bg-blue-700 p-2 rounded flex items-center">
              <MdDashboard className="mr-3 text-white ms-1" />
              <Link to="/dashboard" className="text-white" onClick={toggleSidebar}>Dashboard</Link>
            </li>
            <li className="hover:bg-blue-700 p-2 rounded flex items-center">
              <FaTasks className="mr-3 text-white ms-1" />
              <Link to="/tasks" className="text-white" onClick={toggleSidebar}>Tasks</Link>
            </li>
            <li className="hover:bg-blue-700 p-2 rounded flex items-center">
              <FaUser className="mr-3 text-white ms-1" />
              <Link to="/teams" className="text-white" onClick={toggleSidebar}>Teams</Link>
            </li>
          </ul>
        </div>

        <div className="text-sm text-gray-400 mt-auto p-4 border-t">
          <p>© 2024 Task Manager</p>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden z-10"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
