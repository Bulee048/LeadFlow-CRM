import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../api/axios';

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching analytics stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const winRate = stats?.total_leads > 0 
    ? ((stats.won_leads / stats.total_leads) * 100).toFixed(1) 
    : '0.0';

  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value={formatCurrency(stats?.won_deal_value || 0)} icon={DollarSign} color="green" />
          <StatCard title="Conversion Rate" value={`${winRate}%`} icon={TrendingUp} color="indigo" />
          <StatCard title="Active Leads" value={stats?.total_leads - stats?.won_leads - stats?.lost_leads} icon={Users} color="blue" />
          <StatCard title="Win Rate" value={`${winRate}%`} icon={BarChart3} color="orange" />
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
              {(stats?.sources || []).sort((a: any, b: any) => b.count - a.count).map((source: any, i: number) => {
                const percentage = stats.total_leads > 0 ? (source.count / stats.total_leads) * 100 : 0;
                const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{source.lead_source || 'Unknown'}</span>
                      <span className="font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[i % colors.length]}`} 
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {(stats?.sources || []).length === 0 && (
                <p className="text-center py-8 text-gray-400">No lead source data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
