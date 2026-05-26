import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LeadStatusBadge from '../components/LeadStatusBadge';
import api from '../api/axios';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Eye, 
  Edit2, 
  Trash2,
  Download,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    lead_source: '',
    assigned_to: '',
    search: ''
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { status, lead_source, assigned_to, search } = filters;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (lead_source) params.append('lead_source', lead_source);
      if (assigned_to) params.append('assigned_to', assigned_to);
      if (search) params.append('search', search);

      const response = await api.get(`/leads?${params.toString()}`);
      setLeads(response.data);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/leads/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchLeads();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Assigned To', 'Value', 'Created'];
    const rows = leads.map(l => [
      l.lead_name, l.company_name, l.email, l.phone || '', l.status, l.lead_source || '', l.assigned_to || '', l.deal_value, l.created_at
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAgeColor = (date: string) => {
    const days = differenceInDays(new Date(), new Date(date));
    if (days < 7) return 'text-green-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);

  return (
    <Layout title="Leads">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Lead Database</h2>
          <p className="text-gray-900 font-bold mt-1">{leads.length} leads in current view</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          <Link 
            to="/leads/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-8 flex flex-wrap gap-4 shadow-sm">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search name, company, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <select
          className="bg-gray-50 border-transparent px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          className="bg-gray-50 border-transparent px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.lead_source}
          onChange={(e) => setFilters({ ...filters, lead_source: e.target.value })}
        >
          <option value="">Source</option>
          <option value="Website">Website</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Referral">Referral</option>
          <option value="Cold Email">Cold Email</option>
          <option value="Event">Event</option>
          <option value="Other">Other</option>
        </select>

        <button 
          onClick={() => setFilters({ status: '', lead_source: '', assigned_to: '', search: '' })}
          className="text-indigo-600 font-bold text-sm px-4 py-2 lg:ml-auto"
        >
          Reset Filters
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">Leads Activity</h2>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                  </td>
                </tr>
              ) : leads.length > 0 ? leads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link to={`/leads/${lead.id}`} className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {lead.lead_name}
                      </Link>
                      <span className="text-sm text-gray-500">{lead.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="text-xs bg-transparent border-none p-0 focus:ring-0 cursor-pointer font-medium"
                      value={lead.status}
                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                    <div className="mt-1">
                      <LeadStatusBadge status={lead.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 text-sm">{lead.lead_source || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium text-sm">{lead.assigned_to || 'Unassigned'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-bold">
                      ${lead.deal_value.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-semibold text-sm ${getAgeColor(lead.created_at)}`}>
                      <Clock size={14} />
                      {differenceInDays(new Date(), new Date(lead.created_at))}d
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/leads/${lead.id}`} className="inline-flex p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <Eye size={18} />
                    </Link>
                    <Link to={`/leads/${lead.id}/edit`} className="inline-flex p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                      <Edit2 size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(lead.id)}
                      className="inline-flex p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={32} className="text-gray-300" />
                      <p>No leads found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {leads.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={4} className="px-6 py-4 font-bold text-gray-900">Total Pipeline Value</td>
                  <td className="px-6 py-4 font-bold text-indigo-700 text-lg" colSpan={3}>
                    ${totalValue.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </Layout>
  );
}
