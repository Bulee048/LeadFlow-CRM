import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  DollarSign,
  Clock,
  Send,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LeadStatusBadge from '../components/LeadStatusBadge';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 bg-surface-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-surface-200 shadow-card">
        <p className="text-surface-500 font-medium">Failed to load dashboard statistics.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-brand-600 font-semibold hover:text-brand-700 text-sm"
        >
          Try Refreshing
        </button>
      </div>
    );
  }

  const statConfig = [
    { title: 'Total Leads',    value: stats.total_leads || 0,         icon: Users,        color: '#2563eb' },
    { title: 'New Leads',      value: stats.new_leads || 0,           icon: Target,       color: '#3b82f6' },
    { title: 'Qualified',      value: stats.qualified_leads || 0,     icon: CheckCircle2, color: '#a855f7' },
    { title: 'Won',            value: stats.won_leads || 0,           icon: TrendingUp,   color: '#22c55e' },
    { title: 'Lost',           value: stats.lost_leads || 0,          icon: XCircle,      color: '#ef4444' },
    { title: 'Contacted',      value: stats.contacted_leads || 0,     icon: Clock,        color: '#eab308' },
    { title: 'Proposal Sent',  value: stats.proposal_sent_leads || 0, icon: Send,         color: '#f97316' },
    { title: 'Total Pipeline', value: stats.total_deal_value || 0,    icon: DollarSign,   color: '#6366f1', isCurrency: true },
  ];

  const conversionRate = stats?.total_leads > 0 
    ? Math.round((stats.won_leads / stats.total_leads) * 100) 
    : 0;

  return (
    <div className="space-y-7">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-surface-900">Recent Leads</h3>
              <p className="text-xs text-surface-400 mt-0.5">Latest 5 opportunities</p>
            </div>
            <Link 
              to="/leads" 
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View All <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="table-header">Lead</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {recentLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-surface-50 transition-colors cursor-pointer" 
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {lead.lead_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 text-sm">{lead.lead_name}</p>
                          <p className="text-xs text-surface-400">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-surface-600">{lead.company_name}</td>
                    <td className="table-cell">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="table-cell font-bold text-surface-900">
                      {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(lead.deal_value)}
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-surface-400 text-sm">
                      No leads yet. Start by adding your first lead!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-card">
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="text-sm font-bold text-surface-900">Pipeline Health</h3>
            <p className="text-xs text-surface-400 mt-0.5">Revenue breakdown</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Total Pipeline */}
            <div 
              className="rounded-xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' }}
            >
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Total Pipeline</p>
              <p className="text-2xl font-black">
                {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(stats?.total_deal_value || 0)}
              </p>
            </div>

            {/* Won Revenue */}
            <div className="p-4 rounded-xl bg-success-50 border border-success-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-success-700 font-bold uppercase tracking-wider">Won Revenue</p>
                <p className="text-lg font-bold text-success-900">
                  {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(stats?.won_deal_value || 0)}
                </p>
              </div>
              <div className="w-9 h-9 bg-success-100 rounded-lg flex items-center justify-center text-success-600">
                <TrendingUp size={18} />
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500 font-medium text-xs">Conversion Rate</span>
                <span className="font-bold text-brand-600 text-xs">{conversionRate}%</span>
              </div>
              <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-brand-600 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
            </div>

            {/* CTA */}
            <Link to="/leads/new" className="btn-primary w-full py-2.5 shadow-brand mt-2">
              <Plus size={16} />
              Add New Lead
            </Link>
          </div>
        </div>

        {/* Sales Pipeline Funnel */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-card lg:col-span-3">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-surface-900">Sales Pipeline Funnel</h3>
              <p className="text-xs text-surface-400 mt-0.5">Live stage breakdown</p>
            </div>
            <span className="text-[10px] font-bold bg-surface-100 px-2.5 py-1 rounded-full text-surface-500 uppercase tracking-wider">
              Live
            </span>
          </div>
          
          <div className="p-6">
            <div className="relative space-y-2.5 max-w-2xl mx-auto">
              {[
                { label: 'Total Leads',   count: stats?.total_leads,          color: '#2563eb', width: '100%' },
                { label: 'Contacted',     count: stats?.contacted_leads,      color: '#3b82f6', width: '80%' },
                { label: 'Qualified',     count: stats?.qualified_leads,      color: '#8b5cf6', width: '62%' },
                { label: 'Proposal Sent', count: stats?.proposal_sent_leads,  color: '#f97316', width: '46%' },
                { label: 'Won',           count: stats?.won_leads,            color: '#22c55e', width: '32%' },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-4">
                  <div className="w-28 text-[11px] font-bold text-surface-400 uppercase tracking-wider text-right flex-shrink-0">{stage.label}</div>
                  <div className="flex-1 h-9 relative">
                    <div 
                      className="h-full rounded-lg flex items-center justify-end px-4 text-white text-sm font-bold transition-all duration-700 hover:brightness-110"
                      style={{ 
                        width: stage.width, 
                        backgroundColor: stage.color,
                        opacity: 1 - (i * 0.08)
                      }}
                    >
                      {stage.count ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-10 pt-7 border-t border-surface-100">
              {['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'].map(source => {
                const count = recentLeads.filter(l => l.lead_source === source).length;
                const percentage = recentLeads.length > 0 ? (count / recentLeads.length) * 100 : 0;
                return (
                  <div key={source} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{source}</span>
                      <span className="text-xs font-bold text-surface-700">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-500 rounded-full transition-all duration-700" 
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
