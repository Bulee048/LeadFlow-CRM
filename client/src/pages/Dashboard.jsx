import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Target, CheckCircle2, XCircle, TrendingUp, DollarSign, Clock, Send, ArrowUpRight, Plus
} from 'lucide-react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LeadStatusBadge from '../components/LeadStatusBadge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const [statsRes, leadsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/leads')
      ]);
      return {
        stats: statsRes.data,
        recentLeads: Array.isArray(leadsRes.data) ? leadsRes.data.slice(0, 5) : []
      };
    },
    refetchInterval: 10000 // Polling every 10s
  });

  const stats = data?.stats;
  const recentLeads = data?.recentLeads || [];

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

  if (!stats) return null;

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

  const pipelineData = [
    { name: 'New', count: stats.new_leads || 0, color: '#3b82f6' },
    { name: 'Contacted', count: stats.contacted_leads || 0, color: '#0ea5e9' },
    { name: 'Qualified', count: stats.qualified_leads || 0, color: '#8b5cf6' },
    { name: 'Proposal', count: stats.proposal_sent_leads || 0, color: '#f97316' },
    { name: 'Won', count: stats.won_leads || 0, color: '#22c55e' },
    { name: 'Lost', count: stats.lost_leads || 0, color: '#ef4444' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ef4444'];
  const sourcesData = (stats.sources || []).map(s => ({ name: s.lead_source || 'Unknown', value: s.count }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex justify-between items-end mb-2">
        <div>
           <motion.h1 variants={item} className="text-3xl font-black text-surface-900 tracking-tight">Executive Dashboard</motion.h1>
           <motion.p variants={item} className="text-surface-500 text-sm mt-1">Real-time overview of your sales pipeline and performance metrics.</motion.p>
        </div>
        <motion.button 
           variants={item}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => window.print()}
           className="btn-secondary bg-white shadow-sm border-surface-200"
        >
           Export Report
        </motion.button>
      </div>

      {/* Stats Grid */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts Section */}
        <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2 p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
           <h3 className="text-xl font-bold text-surface-900 mb-8 flex items-center gap-2">
             <TrendingUp className="text-brand-500" /> Pipeline Analytics
           </h3>
           <div className="h-[320px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Lead Sources Pie Chart */}
        <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <h3 className="text-xl font-bold text-surface-900 mb-2 flex items-center gap-2">
             <Target className="text-brand-500" /> Acquisition Sources
          </h3>
          <p className="text-xs text-surface-400 mb-6">Where your leads are coming from.</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourcesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pipeline Health */}
        <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <h3 className="text-xl font-bold text-surface-900 mb-2">Pipeline Velocity</h3>
          <p className="text-xs text-surface-400 mb-8">Overall health of your sales process.</p>

          <div className="space-y-6">
            <div className="rounded-2xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2 opacity-80">Total Pipeline Value</p>
              <p className="text-4xl font-black tracking-tight">
                {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(stats?.total_deal_value || 0)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-success-50/50 border border-success-100 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-success-600 font-bold uppercase tracking-widest mb-1">Won Revenue</p>
                <p className="text-2xl font-black text-success-700">
                  {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(stats?.won_deal_value || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-success-500">
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-surface-100">
              <div className="flex justify-between items-end">
                <span className="text-surface-500 font-bold text-xs uppercase tracking-widest">Win Rate</span>
                <span className="font-black text-brand-600 text-xl">{conversionRate}%</span>
              </div>
              <div className="w-full bg-surface-100 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${conversionRate}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-brand-500 h-full rounded-full" 
                />
              </div>
            </div>

            <Link to="/leads/new" className="btn-primary w-full py-3.5 shadow-xl shadow-brand-500/20 mt-4 rounded-xl text-sm">
              <Plus size={18} />
              Capture New Lead
            </Link>
          </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div variants={item} className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-8 py-6 border-b border-surface-100/50 flex items-center justify-between bg-surface-50/30">
            <div>
              <h3 className="text-lg font-bold text-surface-900">Recent Opportunities</h3>
              <p className="text-xs text-surface-400 mt-1">Latest leads added to your CRM.</p>
            </div>
            <Link to="/leads" className="btn-secondary text-xs px-4 py-2 bg-white hover:bg-surface-50">
              View All Pipeline
            </Link>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest pb-4 pl-4">Lead Info</th>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest pb-4">Company</th>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest pb-4">Status</th>
                  <th className="text-right text-[10px] font-bold text-surface-400 uppercase tracking-widest pb-4 pr-4">Value</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {recentLeads.map((lead, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={lead.id} 
                    className="group cursor-pointer" 
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <td className="p-2">
                      <div className="flex items-center gap-4 p-2 rounded-xl group-hover:bg-brand-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-md flex-shrink-0">
                          {lead.lead_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 text-sm group-hover:text-brand-700 transition-colors">{lead.lead_name}</p>
                          <p className="text-[11px] font-medium text-surface-400">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-surface-600 text-sm font-medium">{lead.company_name}</td>
                    <td className="p-2">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="p-2 font-black text-surface-900 text-right pr-4">
                      {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(lead.deal_value)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
