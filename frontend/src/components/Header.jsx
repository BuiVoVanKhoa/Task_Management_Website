import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { MdLogin, MdLogout } from "react-icons/md";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-64 right-0 bg-gray-900 text-white p-4 flex justify-end items-center z-50">
      {/* Avatar with border and shadow */}
      <div 
        className="cursor-pointer relative" 
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img
          src="https://tse1.mm.bing.net/th?id=OIP.HQvsROprsTEvdKZc6ibkXwHaHa&pid=Api&P=0&h=220"
          alt="User Avatar"
          className="w-12 h-12 rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all duration-200"
        />
        
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-16 w-48 bg-white text-black rounded-lg shadow-lg transition-all duration-200 transform scale-95 opacity-100">
            <ul className="p-2">
              
              {/* Logout Option with Icon */}
              <li className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                <MdLogout className="text-red-500 mr-2" />
                <Link to="/Logout">Logout</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
