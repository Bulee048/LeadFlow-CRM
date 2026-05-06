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
  ChevronLeft,
  ChevronRight,
  Calendar,
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
          <h2 className="text-xl font-bold text-surface-900">Leads Management</h2>
          <p className="text-sm text-surface-400">Manage and track your sales opportunities</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="btn-secondary"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <Link to="/leads/new" className="btn-primary">
            <Plus size={16} />
            <span>Add Lead</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="input-field pl-9"
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
            className="btn-secondary text-danger-600 border-danger-100 hover:bg-danger-50 hover:border-danger-200"
          >
            <X size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="table-header">Lead</th>
                <th className="table-header">Company</th>
                <th className="table-header">Status</th>
                <th className="table-header">Deal Value</th>
                <th className="table-header">Assigned To</th>
                <th className="table-header">Age</th>
                <th className="table-header">Engagement</th>
                <th className="table-header text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    {[1,2,3,4,5,6,7,8].map(j => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-surface-100 rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-surface-50 transition-colors group cursor-pointer"
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
                      <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <LeadStatusBadge status={lead.status} />
                        <div className="relative group/select">
                          <select 
                            className="appearance-none block w-full pl-2 pr-8 py-1.5 text-[11px] font-bold text-surface-600 bg-surface-50 border border-surface-200 rounded-md cursor-pointer hover:bg-white hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-surface-400 group-hover/select:text-brand-500">
                             <ChevronRight size={12} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-bold text-surface-900">
                      {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(lead.deal_value)}
                    </td>
                    <td className="table-cell text-surface-600">
                      {lead.assigned_to || <span className="text-surface-300">—</span>}
                    </td>
                    <td className="table-cell">
                      <div>
                        <span className={`text-xs font-semibold ${getAgeColor(lead.created_at)}`}>
                          {differenceInDays(new Date(), new Date(lead.created_at))}d
                        </span>
                        <p className="text-[11px] text-surface-400 mt-0.5">
                          {format(new Date(lead.updated_at), 'MMM dd')}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const score = Math.min(Math.floor((lead.notes?.length || 0) / 2) + 1, 5);
                          return (
                            <div 
                              key={star} 
                              className={`w-1.5 h-4 rounded-full ${star <= score ? 'bg-brand-500' : 'bg-surface-100'}`}
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.id}`);
                          }}
                          className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.id}/edit`);
                          }}
                          className="p-1.5 text-surface-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lead.id);
                          }}
                          className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-surface-100 rounded-xl text-surface-400">
                        <Search size={32} />
                      </div>
                      <p className="text-surface-500 font-medium text-sm">No leads found matching your filters.</p>
                      <button 
                        onClick={() => setFilters({ status: '', lead_source: '', assigned_to: '', search: '' })}
                        className="text-brand-600 text-sm font-semibold hover:text-brand-700"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {leads.length > 0 && (
              <tfoot className="bg-surface-50 border-t border-surface-100">
                <tr>
                  <td colSpan="3" className="px-5 py-4 text-right text-xs font-bold text-surface-500 uppercase tracking-wider">Total Pipeline Value:</td>
                  <td className="px-5 py-4 text-brand-700 font-bold text-sm">
                    {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(totalValue)}
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
