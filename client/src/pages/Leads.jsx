import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Eye, Pencil, Trash2, ChevronRight, X, LayoutGrid, List
} from 'lucide-react';
import api from '../api/axios';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import LeadStatusBadge from '../components/LeadStatusBadge';
import { io } from 'socket.io-client';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [filters, setFilters] = useState({
    status: '',
    lead_source: '',
    assigned_to: '',
    search: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  // Socket.io Real-time connection
  useEffect(() => {
    // Connect to the backend server's socket
    const socket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5050');

    socket.on('connect', () => {
      console.log('Connected to real-time updates');
    });

    socket.on('leadUpdated', (updatedLead) => {
      setLeads(currentLeads => 
        currentLeads.map(l => l.id === updatedLead.id ? updatedLead : l)
      );
    });

    socket.on('leadCreated', (newLead) => {
      setLeads(currentLeads => [newLead, ...currentLeads]);
    });

    socket.on('leadDeleted', (deletedId) => {
      setLeads(currentLeads => currentLeads.filter(l => l.id != deletedId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Failed to fetch leads', err);
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
      // Optimistic Update
      setLeads(prev => prev.map(l => l.id == id ? { ...l, status: newStatus } : l));
      await api.patch(`/leads/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
      fetchLeads(); // Revert on fail
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Source', 'Assigned To', 'Status', 'Value', 'Created'];
    const rows = leads.map(l => [
      l.lead_name, l.company_name, l.email, l.phone, l.lead_source, l.assigned_to, l.status, l.deal_value, l.created_at
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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
  const salesPeople = [...new Set(leads.map(l => l.assigned_to).filter(Boolean))];

  // Drag and Drop Handlers
  const onDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      handleStatusChange(leadId, newStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Leads Pipeline</h2>
          <p className="text-sm text-surface-400">Manage and track your sales opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-surface-500 transition-all ${viewMode === 'list' ? 'bg-white shadow text-brand-600' : 'hover:text-surface-700'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-surface-500 transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-brand-600' : 'hover:text-surface-700'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button onClick={exportCSV} className="btn-secondary">
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
          <select className="input-field" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field" value={filters.lead_source} onChange={(e) => setFilters(prev => ({ ...prev, lead_source: e.target.value }))}>
            <option value="">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field" value={filters.assigned_to} onChange={(e) => setFilters(prev => ({ ...prev, assigned_to: e.target.value }))}>
            <option value="">All Assignees</option>
            {salesPeople.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={() => { setFilters({ status: '', lead_source: '', assigned_to: '', search: '' }); setDebouncedSearch(''); }}
            className="btn-secondary text-danger-600 border-danger-100 hover:bg-danger-50"
          >
            <X size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex gap-4 overflow-x-auto pb-4">
           {[1,2,3,4].map(i => <div key={i} className="min-w-[280px] h-[500px] bg-surface-100 rounded-xl" />)}
        </div>
      ) : viewMode === 'kanban' ? (
        // Kanban Board View
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start h-[calc(100vh-280px)]">
          {statuses.map(status => (
            <div 
              key={status} 
              className="w-[300px] min-w-[300px] flex-shrink-0 bg-surface-50/50 border border-surface-200 rounded-xl flex flex-col max-h-full"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status)}
            >
              <div className="p-3 border-b border-surface-200 bg-surface-100/50 rounded-t-xl flex justify-between items-center sticky top-0 z-10">
                <h3 className="font-bold text-surface-700 text-sm">{status}</h3>
                <span className="text-xs font-bold text-surface-400 bg-surface-200 px-2 py-0.5 rounded-full">
                  {leads.filter(l => l.status === status).length}
                </span>
              </div>
              <div className="p-3 overflow-y-auto flex-1 space-y-3">
                {leads.filter(l => l.status === status).map(lead => (
                  <div 
                    key={lead.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-grab active:cursor-grabbing relative group"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-surface-900 text-sm line-clamp-1 pr-6">{lead.lead_name}</h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}/edit`); }}
                          className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-brand-600 transition-opacity absolute right-3 top-3"
                        >
                          <Pencil size={14} />
                        </button>
                     </div>
                     <p className="text-xs text-surface-500 mb-3">{lead.company_name}</p>
                     
                     <div className="flex justify-between items-end">
                       <span className="font-bold text-brand-700 text-sm">
                         {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(lead.deal_value)}
                       </span>
                       <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px] uppercase" title={lead.assigned_to}>
                          {lead.assigned_to ? lead.assigned_to.charAt(0) : '?'}
                       </div>
                     </div>
                  </div>
                ))}
                {leads.filter(l => l.status === status).length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed border-surface-200 rounded-xl">
                    <p className="text-xs text-surface-400 font-medium">Drop leads here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
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
                  <th className="table-header text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {leads.length > 0 ? (
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
                        <div className="flex justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }} className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Eye size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}/edit`); }} className="p-1.5 text-surface-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-all"><Pencil size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-surface-100 rounded-xl text-surface-400">
                          <Search size={32} />
                        </div>
                        <p className="text-surface-500 font-medium text-sm">No leads found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
