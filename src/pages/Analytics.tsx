import React from 'react';
import Layout from '../components/Layout';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Analytics() {
  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value="$45,231.89" icon={DollarSign} color="green" />
          <StatCard title="Conversion Rate" value="12.5%" icon={TrendingUp} color="indigo" />
          <StatCard title="Active Leads" value="1,234" icon={Users} color="blue" />
          <StatCard title="Win Rate" value="34.2%" icon={BarChart3} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-64 flex items-end gap-2 justify-between">
              {[40, 70, 45, 90, 65, 85, 120].map((height, i) => (
                <div key={i} className="w-full bg-indigo-100 rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600"
                    style={{ height: `${(height / 120) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-bold text-gray-500 uppercase">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Lead Sources</h3>
            <div className="space-y-4">
              {[
                { label: 'Website Traffic', value: 45, color: 'bg-indigo-500' },
                { label: 'Referrals', value: 25, color: 'bg-blue-500' },
                { label: 'Social Media', value: 20, color: 'bg-orange-500' },
                { label: 'Direct Sales', value: 10, color: 'bg-green-500' },
              ].map((source, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{source.label}</span>
                    <span className="font-bold text-gray-900">{source.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${source.color}`} style={{ width: `${source.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
