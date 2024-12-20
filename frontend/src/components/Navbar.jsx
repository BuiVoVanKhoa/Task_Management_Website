import React from 'react';
import { MdOutlineSearch } from 'react-icons/md';
import { HiOutlineMenu } from 'react-icons/hi';

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className='flex justify-between items-center bg-gray-900 px-4 py-4 shadow-sm sticky top-0 z-20 md:px-6'>
      {/* Hamburger menu for mobile */}
      <button className='md:hidden text-2xl text-white mr-3' onClick={toggleSidebar}>
        <HiOutlineMenu />
      </button>

      {/* Search bar */}
      <div className='flex items-center py-2 px-4 gap-2 bg-gray-100 rounded-full flex-1 max-w-sm'>
        <MdOutlineSearch className='text-gray-500' />
        <input
          type="text"
          placeholder='Search...'
          className='w-full bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none'
        />
      </div>

      {/* Avatar and Notification */}
      <div className="flex items-center gap-4">
        <div className='relative'>
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">2</span>
          <button className='text-gray-600 text-2xl'>🔔</button>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold">
          CA
        </div>
      </div>
    </div>
  );
};

export default Navbar;
