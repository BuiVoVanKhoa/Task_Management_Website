import React from 'react';
import { MdDashboard, MdAssignment, MdSettings, MdGroup, MdLogin } from "react-icons/md";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-4 flex flex-col">
      <div className="text-3xl font-extrabold mb-8 flex items-center justify-center">
        <span className="bg-gradient-to-r from-green-400 via-blue-500 to-green-500 text-transparent bg-clip-text">
          Task Me
        </span>
      </div>

      <ul className="flex-1">
        <li className="mb-4 hover:bg-gray-700 p-2 rounded flex items-center">
          <MdDashboard className="mr-3" />
          <Link to="./Dashboard">Dashboard</Link>
        </li>
        <li className="mb-4 hover:bg-gray-700 p-2 rounded flex items-center">
          <MdAssignment className="mr-3" />
          <Link to="./TaskList">Tasks</Link>
        </li>
        <li className="mb-4 hover:bg-gray-700 p-2 rounded flex items-center">
          <MdGroup className="mr-3" />
          <Link to="/Team">Team</Link>
        </li>
      </ul>

      <div className="mt-auto text-sm text-gray-400">
        <p>© 2024 Task Manager</p>
      </div>
    </div>
  );
};

export default Sidebar;
