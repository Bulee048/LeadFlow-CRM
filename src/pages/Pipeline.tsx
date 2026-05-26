import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Building, Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function Pipeline() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<number | null>(null);

  const COLUMNS = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedLead(id);
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadIdStr = e.dataTransfer.getData('text/plain');
    if (!leadIdStr) return;
    const leadId = parseInt(leadIdStr, 10);
    
    setDraggedLead(null);
    
    // Optimistic UI update
    const leadToMove = leads.find(l => l.id === leadId);
    if (leadToMove && leadToMove.status !== newStatus) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      
      try {
        await api.patch(`/leads/${leadId}/status`, { status: newStatus });
        toast.success(`Moved to ${newStatus}`);
      } catch (err) {
        toast.error('Failed to update status');
        fetchLeads(); // Revert on failure
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Pipeline">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  const getAgeColor = (date: string) => {
    const days = differenceInDays(new Date(), new Date(date));
    if (days < 7) return 'text-green-600 bg-green-50';
    if (days <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Layout title="Pipeline Board">
      <div className="flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-8rem)]">
        {COLUMNS.map(status => {
          const columnLeads = leads.filter(l => l.status === status);
          const totalValue = columnLeads.reduce((sum, l) => sum + (l.deal_value || 0), 0);
          
          return (
            <div 
              key={status}
              className="flex-shrink-0 w-80 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">{status}</h3>
                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>
                <p className="text-sm font-bold text-indigo-600">${totalValue.toLocaleString()}</p>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {columnLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab hover:border-indigo-300 transition-all ${draggedLead === lead.id ? 'opacity-50' : ''}`}
                  >
                    <Link to={`/leads/${lead.id}`} className="font-bold text-slate-900 hover:text-indigo-600 mb-1 block">
                      {lead.lead_name}
                    </Link>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                      <Building size={12} />
                      {lead.company_name}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-sm text-slate-900">${lead.deal_value.toLocaleString()}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${getAgeColor(lead.created_at)}`}>
                        <Clock size={10} />
                        {differenceInDays(new Date(), new Date(lead.created_at))}d
                      </span>
                    </div>
                  </div>
                ))}
                
                {columnLeads.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                    Drop Here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
