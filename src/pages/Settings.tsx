import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Key } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900 tracking-tight text-sm uppercase">Profile Settings</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Full Name</label>
              <input 
                type="text"
                defaultValue={user?.name}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Email Address</label>
              <input 
                type="email"
                defaultValue={user?.email}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900 tracking-tight text-sm uppercase">Notification Preferences</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Email Notifications</p>
                <p className="text-xs text-gray-500 mt-1">Receive daily summaries and alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">New Lead Alerts</p>
                <p className="text-xs text-gray-500 mt-1">Get notified immediately when a lead is assigned to you</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
