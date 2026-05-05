import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Bell, 
  Lock, 
  ExternalLink,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="card flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-3xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-4xl font-bold border-4 border-white shadow-xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={24} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500 font-medium">Sales Administrator</p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 w-full flex justify-around">
               <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">124</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Leads</p>
               </div>
               <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">12</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Won</p>
               </div>
               <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">89%</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Score</p>
               </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Security</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <Lock size={18} className="text-gray-400 group-hover:text-indigo-600" />
                  Change Password
                </div>
                <ExternalLink size={14} className="text-gray-300" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <Shield size={18} className="text-gray-400 group-hover:text-indigo-600" />
                  Two-Factor Auth
                </div>
                <div className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">OFF</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Full Name</p>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <User size={16} className="text-indigo-500" />
                  {user?.name}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Mail size={16} className="text-indigo-500" />
                  {user?.email}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Role</p>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Shield size={16} className="text-indigo-500" />
                  Administrator
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Joined Date</p>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Calendar size={16} className="text-indigo-500" />
                  {user?.created_at ? format(new Date(user.created_at), 'MMMM dd, yyyy') : 'October 12, 2024'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-6">Notifications</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-1">
                  <div>
                    <p className="font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive daily summaries of your lead activities.</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
               </div>
               <div className="border-t border-gray-100 pt-4"></div>
               <div className="flex items-center justify-between p-1">
                  <div>
                    <p className="font-semibold text-gray-900">New Lead Alerts</p>
                    <p className="text-xs text-gray-500">Get notified instantly when a lead is assigned to you.</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <button className="btn-secondary px-8">Reset Changes</button>
             <button className="btn-primary px-8">Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
