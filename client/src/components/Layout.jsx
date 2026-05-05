import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => item.path === location.pathname);
    if (current) return current.name;
    if (location.pathname.includes('/leads/')) {
      if (location.pathname.endsWith('/edit')) return 'Edit Lead';
      if (location.pathname.endsWith('/new')) return 'Create Lead';
      return 'Lead Details';
    }
    return 'LeadFlow CRM';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
              LF
            </div>
            <span className="font-bold text-xl tracking-tight">LeadFlow</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
                {location.pathname === item.path && (
                   <ChevronRight size={16} className="ml-auto" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Optional search or notifications */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
