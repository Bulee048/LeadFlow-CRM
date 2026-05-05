import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  DollarSign,
  Clock,
  Send
} from 'lucide-react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LeadStatusBadge from '../components/LeadStatusBadge';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/leads')
        ]);
        setStats(statsRes.data);
        const leads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
        setRecentLeads(leads.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 font-medium">Failed to load dashboard statistics.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700"
        >
          Try Refreshing
        </button>
      </div>
    );
  }

  const statConfig = [
    { title: 'Total Leads', value: stats.total_leads || 0, icon: Users, color: '#4f46e5' },
    { title: 'New Leads', value: stats.new_leads || 0, icon: Target, color: '#3b82f6' },
    { title: 'Qualified', value: stats.qualified_leads || 0, icon: CheckCircle2, color: '#a855f7' },
    { title: 'Won', value: stats.won_leads || 0, icon: TrendingUp, color: '#22c55e' },
    { title: 'Lost', value: stats.lost_leads || 0, icon: XCircle, color: '#ef4444' },
    { title: 'Contacted', value: stats.contacted_leads || 0, icon: Clock, color: '#eab308' },
    { title: 'Proposal Sent', value: stats.proposal_sent_leads || 0, icon: Send, color: '#f97316' },
    { title: 'Total Pipeline', value: stats.total_deal_value || 0, icon: DollarSign, color: '#6366f1', isCurrency: true },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Leads</h3>
            <Link to="/leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href=`/leads/${lead.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                          {lead.lead_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{lead.lead_name}</p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.company_name}</td>
                    <td className="px-6 py-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(lead.deal_value)}
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No leads found. Start by adding your first lead!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Pipeline Health */}
        <div className="card space-y-6">
           <h3 className="text-lg font-bold">Pipeline Health</h3>
           <div className="space-y-4">
              <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-lg shadow-indigo-100">
                 <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Pipeline Value</p>
                 <p className="text-3xl font-black">
                    {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(stats?.total_deal_value || 0)}
                 </p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                 <div>
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Won Revenue</p>
                    <p className="text-xl font-bold text-green-900">
                        {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(stats?.won_deal_value || 0)}
                    </p>
                 </div>
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <TrendingUp size={20} />
                 </div>
              </div>
              
              <div className="space-y-2 pt-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Conversion Rate</span>
                    <span className="font-bold text-indigo-600">
                      {stats?.total_leads > 0 ? Math.round((stats.won_leads / stats.total_leads) * 100) : 0}%
                    </span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${stats?.total_leads > 0 ? (stats.won_leads / stats.total_leads) * 100 : 0}%` }}
                    ></div>
                 </div>
              </div>

              <div className="pt-4 space-y-3">
                 <Link to="/leads/new" className="w-full btn-primary block text-center py-3 shadow-md">
                    + Add New Lead
                 </Link>
              </div>
           </div>
        </div>

        {/* Sales Funnel Visual (Bonus) */}
        <div className="card lg:col-span-3">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Sales Pipeline Funnel</h3>
              <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">Live Breakdown</span>
           </div>
           
           <div className="relative space-y-2 max-w-2xl mx-auto">
              {[
                { label: 'Total Leads', count: stats?.total_leads, color: 'bg-indigo-600', width: '100%' },
                { label: 'Contacted', count: stats?.contacted_leads, color: 'bg-indigo-500', width: '85%' },
                { label: 'Qualified', count: stats?.qualified_leads, color: 'bg-indigo-400', width: '70%' },
                { label: 'Proposal Sent', count: stats?.proposal_sent_leads, color: 'bg-indigo-300', width: '55%' },
                { label: 'Won', count: stats?.won_leads, color: 'bg-green-500', width: '40%' },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center group">
                  <div className="w-32 text-xs font-bold text-gray-500 uppercase">{stage.label}</div>
                  <div className="flex-1 h-12 relative">
                    <div 
                      className={`${stage.color} h-full rounded-lg flex items-center justify-end px-4 text-white font-bold transition-all duration-1000 ease-in-out hover:brightness-110 shadow-sm`}
                      style={{ width: stage.width, opacity: 1 - (i * 0.1) }}
                    >
                      {stage.count}
                    </div>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-12 pt-8 border-t border-gray-100">
              {['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'].map(source => {
                 const count = recentLeads.filter(l => l.lead_source === source).length;
                 const percentage = recentLeads.length > 0 ? (count / recentLeads.length) * 100 : 0;
                 return (
                    <div key={source} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{source}</span>
                          <span className="text-xs font-bold text-gray-900">{count}</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                             style={{ width: `${Math.max(percentage, 2)}%` }}
                          ></div>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
