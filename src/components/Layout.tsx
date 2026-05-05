import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings as SettingsIcon,
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Search,
  PieChart,
  Kanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'Pipeline', icon: Kanban, path: '/pipeline' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans text-gray-900">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={20} />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold text-white tracking-tight">LeadFlow Pro</span>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border
                  ${isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20 font-medium' 
                    : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 mt-auto border-t border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600 font-bold text-xs">
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              )}
              {isSidebarOpen && (
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-white p-1 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
            {!isSidebarOpen && (
               <button
               onClick={logout}
               className="mt-2 flex items-center justify-center p-3 text-slate-400 hover:text-white w-full"
             >
               <LogOut size={20} />
             </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
               <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search leads..." 
                 className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 w-64 outline-none transition-all" 
               />
             </div>
             <NavLink 
               to="/leads/new" 
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
             >
               + New Lead
             </NavLink>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
