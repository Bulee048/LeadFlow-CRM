import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import LeadStatusBadge from '../components/LeadStatusBadge';
import api from '../api/axios';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  TrendingUp,
  Clock,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/leads?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentLeads(leadsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </Layout>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={stats.total_leads} icon={Users} color="blue" />
        <StatCard title="New Leads" value={stats.new_leads} icon={Clock} color="indigo" />
        <StatCard title="Won Leads" value={stats.won_leads} icon={CheckCircle2} color="green" />
        <StatCard title="Lost Leads" value={stats.lost_leads} icon={XCircle} color="red" />
        <StatCard title="Total Pipeline" value={formatCurrency(stats.total_deal_value)} icon={TrendingUp} color="purple" />
        <StatCard title="Won Value" value={formatCurrency(stats.won_deal_value)} icon={DollarSign} color="emerald" />
        <StatCard title="Qualified" value={stats.qualified_leads} icon={Target} color="amber" />
        <StatCard title="Proposals" value={stats.proposal_sent_leads} icon={Send} color="orange" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Leads Activity</h2>
          <Link to="/leads" className="text-indigo-600 text-sm font-semibold hover:underline">View All Leads</Link>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-nowrap">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-nowrap">Company</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-nowrap">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-nowrap">Deal Value</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-nowrap">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentLeads.length > 0 ? recentLeads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/leads/${lead.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                      {lead.lead_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{lead.company_name}</td>
                  <td className="px-6 py-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(lead.deal_value)}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No leads found. Start by adding one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
