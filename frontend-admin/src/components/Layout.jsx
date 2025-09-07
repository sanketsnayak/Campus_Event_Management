import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Menu, 
  X 
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-orange-50 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block border-r border-orange-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-orange-200">
          <h1 className="text-xl font-semibold text-gray-800">
            Campus Events
          </h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors
                  ${isCurrentPath(item.href)
                    ? 'bg-gradient-to-r from-orange-200 to-amber-200 text-orange-800 border border-orange-300'
                    : 'text-gray-700 hover:bg-orange-100 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon 
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isCurrentPath(item.href) ? 'text-orange-600' : 'text-gray-500'}
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-orange-200 bg-gradient-to-r from-white to-orange-50 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
            <div className="text-sm text-gray-700 bg-orange-100 px-3 py-1 rounded-lg border border-orange-200">
              Campus Event Management System
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
