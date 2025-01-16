import React, { useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { MdOutlineSearch } from "react-icons/md";
import { useAuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { HiUser, HiArrowLeftStartOnRectangle } from "react-icons/hi2";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ toggleSidebar, themeClasses }) => {
  // Lấy thông tin người dùng và hàm logout từ AuthContext
  const { authUser, logout } = useAuthContext();
  // Quản lý trạng thái hiển thị menu profile
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div
      className={`flex justify-between items-center ${themeClasses.navbar} px-4 py-4 shadow-sm sticky top-0 z-20 md:px-6 h-16 flex-shrink-0`}
    >
      {/* Phần bên trái - Nút toggle menu cho mobile */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className={`md:hidden text-2xl hover:text-gray-500 focus:outline-none ${themeClasses.navbar}`}
          aria-label="Toggle menu"
        >
          <HiOutlineMenu />
        </button>
      </div>

      {/* Phần giữa - Thanh tìm kiếm */}
      <div className="flex-1 max-w-xl px-4">
        <div
          className={`flex items-center py-2 px-4 gap-2 rounded-full w-full ${
            themeClasses.navbar === "bg-gray-900 text-white"
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          {/* Icon tìm kiếm */}
          <MdOutlineSearch
            className={`text-xl ${
              themeClasses.navbar === "bg-gray-900 text-white"
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          />
          {/* Input tìm kiếm */}
          <input
            type="text"
            placeholder="Search..."
            className={`w-full bg-transparent focus:outline-none text-sm ${
              themeClasses.navbar === "bg-gray-900 text-white"
                ? "placeholder-gray-500 text-gray-300"
                : "placeholder-gray-500 text-gray-900"
            }`}
          />
        </div>
      </div>

      {/* Phần bên phải - Theme toggle, thông báo và menu profile */}
      <div className="flex items-center gap-3">
        {/* Component chuyển đổi theme sáng/tối */}
        <ThemeToggle />

        {/* Nút thông báo */}
        <button className={`p-2 focus:outline-none ${themeClasses.navbar}`}>
          <BellIcon className="h-6 w-6" />
        </button>

        {/* Menu Profile */}
        <div className="relative">
          {/* Nút hiển thị menu profile */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            {/* Hiển thị avatar nếu có, nếu không hiển thị icon mặc định */}
            {authUser?.avatarUrl ? (
              <img
                src={authUser.avatarUrl}
                alt={authUser.username}
                className={`h-8 w-8 rounded-full border-2 ${themeClasses.borders}`}
              />
            ) : (
              <UserCircleIcon className={`h-8 w-8 ${themeClasses.navbar}`} />
            )}
            {/* Hiển thị tên người dùng trên desktop */}
            <span className={`hidden md:block ${themeClasses.navbar}`}>
              {authUser?.username}
            </span>
          </button>

          {/* Dropdown Menu Profile */}
          {showProfileMenu && (
            <div
              className={`absolute right-0 mt-2 w-48 py-2 rounded-md shadow-xl border ${themeClasses.navbar} ${themeClasses.borders}`}
            >
              {/* Hiển thị thông tin người dùng trên mobile */}
              <div
                className={`px-4 py-2 border-b md:hidden ${themeClasses.borders}`}
              >
                <p className={`text-sm font-medium ${themeClasses.navbar}`}>
                  {authUser?.username}
                </p>
                <p className="text-sm text-gray-500">{authUser?.email}</p>
              </div>

              {/* Link đến trang profile */}
              <Link
                to="/profile"
                className={`px-4 py-2 text-sm flex items-center ${themeClasses.menuItem.inactive}`}
                onClick={() => setShowProfileMenu(false)}
              >
                <HiUser className="mr-2" />
                Profile
              </Link>

              {/* Nút đăng xuất */}
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center`}
              >
                <HiArrowLeftStartOnRectangle className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
