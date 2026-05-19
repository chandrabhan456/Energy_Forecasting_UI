// components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

// =============================
// USER MENU ITEMS
// =============================
const userMenuItems = [
  {
    label: "Profile",
    path: "/userprofile",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    label: "Jobs",
    path: "/jobs",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183
             0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2
             2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2
             2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Learning Hub",
    path: "/learning-hub",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168
             5.477 3 6.253v13C4.168 18.477 5.754 18 7.5
             18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754
             5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832
             18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
];

// =============================
// ADMIN MENU ITEMS
// =============================
const adminMenuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0
             001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1
             1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1
             1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: "Manage Users",
    path: "/admin/users",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6
             6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13
             7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    label: "Manage Jobs",
    path: "/admin/jobs",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183
             0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2
             2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2
             2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Learning Hub",
    path: "/admin/learning-hub",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5
             5S4.168 5.477 3 6.253v13C4.168 18.477 5.754
             18 7.5 18s3.332.477 4.5 1.253m0-13C13.168
             5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5
             1.253v13C19.832 18.477 18.247 18 16.5
                       18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724
             1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37
             2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756
             2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94
             1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572
             1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724
             0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724
             1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924
             0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826
             -3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

// =============================
// SIDEBAR COMPONENT
// =============================
const Sidebar = ({ isOpen, onClose }) => {
  const { user,role } = useStateContext();

  // Pick menu based on role
  const menuItems = role === "admin" ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* ── Overlay for mobile ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar Panel ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-80  shadow-xl z-30
          flex flex-col
          transform transition-transform duration-300 ease-in-out


          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
          lg:border-r lg:border-gray-200
        `}
      >
        {/* ── Logo / Brand ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-lg font-bold text-gray-800">JobPortal</span>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── User Info ── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm uppercase shadow">
            {user?.avatar || user?.name?.charAt(0)}
          </div>

          {/* Name & Role */}
          <div>
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                user?.role === "admin"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {user?.role === "admin" ? "Admin" : "User"}
            </span>
          </div>
        </div>

        {/* ── Navigation Menu ── */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
       
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     transition-all duration-150 group
                     ${
                       isActive
                         ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                         : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                     }`
                  }
                >
                  {/* Icon */}
                  <span className="flex-shrink-0">{item.icon}</span>

                  {/* Label */}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Footer / Logout ── */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={() => console.log("Logout")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                       text-sm font-medium text-red-500 hover:bg-red-50
                       transition-all duration-150"
          >
            {/* Logout Icon */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0
                   01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3
                   3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
