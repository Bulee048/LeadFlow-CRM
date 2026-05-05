import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Pencil, 
  Trash2, 
  MoreVertical,
  ChevronDown,
  X
} from 'lucide-react';
import api from '../api/axios';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import LeadStatusBadge from '../components/LeadStatusBadge';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    lead_source: '',
    assigned_to: '',
    search: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: debouncedSearch }));
    }, 400);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.lead_source) params.append('lead_source', filters.lead_source);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/leads?${params.toString()}`);
      if (Array.isArray(res.data)) {
        setLeads(res.data);
      } else {
        console.error('API returned non-array data:', res.data);
        setLeads([]);
      }
    } catch (err) {
      // Only show error if it's not a cancelled request
      if (err.name !== 'CanceledError') {
        console.error('Failed to fetch leads', err);
        toast.error('Failed to fetch leads. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (err) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
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
    
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Source', 'Assigned To', 'Status', 'Value', 'Created'];
    const rows = leads.map(l => [
      l.lead_name,
      l.company_name,
      l.email,
      l.phone,
      l.lead_source,
      l.assigned_to,
      l.status,
      l.deal_value,
      l.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAgeColor = (date) => {
    const days = differenceInDays(new Date(), new Date(date));
    if (days < 7) return 'text-green-600';
    if (days < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalValue = leads.reduce((sum, l) => sum + (l.deal_value || 0), 0);

  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  const sources = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'];
  
  // Get unique sales people from leads
  const salesPeople = [...new Set(leads.map(l => l.assigned_to).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-sm text-gray-500">Manage and track your sales opportunities</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <Link to="/leads/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Add Lead</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="input-field pl-10"
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
            />
          </div>

          <select 
            className="input-field"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="input-field"
            value={filters.lead_source}
            onChange={(e) => setFilters(prev => ({ ...prev, lead_source: e.target.value }))}
          >
            <option value="">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="input-field"
            value={filters.assigned_to}
            onChange={(e) => setFilters(prev => ({ ...prev, assigned_to: e.target.value }))}
          >
            <option value="">All Assignees</option>
            {salesPeople.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={() => {
              setFilters({ status: '', lead_source: '', assigned_to: '', search: '' });
              setDebouncedSearch('');
            }}
            className="btn-secondary flex items-center justify-center gap-2 text-red-600 border-red-100 hover:bg-red-50"
          >
            <X size={18} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Lead Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Deal Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status History</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Engagement</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="8" className="px-6 py-4 bg-gray-50/50"></td>
                  </tr>
                ))
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{lead.lead_name}</span>
                        <span className="text-xs text-gray-500">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.company_name}</td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer p-0"
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="mt-1">
                        <LeadStatusBadge status={lead.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(lead.deal_value)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.assigned_to || '-'}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                         <span className={`text-sm font-medium ${getAgeColor(lead.created_at)}`}>
                           {differenceInDays(new Date(), new Date(lead.created_at))} days age
                         </span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase">
                           Updated {format(new Date(lead.updated_at), 'MMM dd')}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                             const score = Math.min(Math.floor((lead.notes?.length || 0) / 2) + 1, 5);
                             return (
                               <div 
                                 key={star} 
                                 className={`w-1.5 h-3 rounded-full ${star <= score ? 'bg-indigo-500' : 'bg-gray-100'}`}
                               ></div>
                             );
                          })}
                          <span className="text-[10px] font-black text-gray-400 ml-1 uppercase">Engage</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/leads/${lead.id}`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/leads/${lead.id}/edit`} className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all">
                          <Pencil size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                     <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-400">
                           <Search size={40} />
                        </div>
                        <p className="text-gray-500 font-medium">No leads found matching your filters.</p>
                        <button 
                          onClick={() => setFilters({ status: '', lead_source: '', assigned_to: '', search: '' })}
                          className="text-indigo-600 text-sm font-bold mt-2"
                        >
                          Clear all filters
                        </button>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
            {leads.length > 0 && (
              <tfoot className="bg-gray-50 font-bold border-t border-gray-100">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right text-gray-500">Total Pipeline Value:</td>
                  <td className="px-6 py-4 text-indigo-700 text-lg">
                    {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(totalValue)}
                  </td>
                  <td colSpan="4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;
