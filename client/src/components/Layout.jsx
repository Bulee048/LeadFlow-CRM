import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Menu, 
  X,
  ChevronRight,
  User,
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
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

  const getPageSubtitle = () => {
    if (location.pathname === '/dashboard') return 'Your sales overview';
    if (location.pathname === '/leads') return 'Manage your pipeline';
    if (location.pathname === '/profile') return 'Account settings';
    if (location.pathname.endsWith('/edit')) return 'Update lead information';
    if (location.pathname.endsWith('/new')) return 'Add a new opportunity';
    return 'Lead details & activity';
  };

  return (
    <div className="h-screen bg-surface-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex-shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo */}
          <div className="px-5 py-6 flex items-center gap-3 shrink-0 border-b border-white/5">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand flex-shrink-0">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">LeadFlow</span>
              <span className="block text-[10px] text-surface-500 font-medium uppercase tracking-widest">CRM</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-0.5">
            <p className="px-3 mb-3 text-[10px] font-bold text-surface-600 uppercase tracking-widest">Main Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                  ${isActive 
                    ? 'bg-brand-600 text-white font-semibold shadow-brand' 
                    : 'text-surface-400 hover:bg-white/5 hover:text-white font-medium'}
                `}
              >
                <item.icon size={17} />
                <span>{item.name}</span>
                {location.pathname === item.path && (
                   <ChevronRight size={14} className="ml-auto opacity-60" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-surface-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-surface-500 hover:text-red-400 hover:bg-white/5 font-medium rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-surface-500 hover:bg-surface-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-base font-bold text-surface-900 leading-tight">{getPageTitle()}</h1>
              <p className="text-[11px] text-surface-400 font-medium hidden sm:block">{getPageSubtitle()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* User avatar in topbar */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-surface-200">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-semibold text-surface-700">{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50 p-4 lg:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
