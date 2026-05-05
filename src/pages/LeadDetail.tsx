import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LeadStatusBadge from '../components/LeadStatusBadge';
import api from '../api/axios';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Mail, 
  Phone, 
  Building,
  User,
  Calendar,
  History,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function LeadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');

  const fetchLead = async () => {
    try {
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
    } catch (err) {
      toast.error('Failed to fetch lead details');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    try {
      await api.patch(`/leads/${id}/status`, { status });
      toast.success('Status updated');
      fetchLead();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await api.post('/notes', {
        lead_id: id,
        content: noteContent,
        created_by: user?.name
      });
      toast.success('Note added');
      setNoteContent('');
      fetchLead();
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.delete(`/notes/${noteId}`);
      toast.success('Note deleted');
      fetchLead();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <Layout title="Lead Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Combine notes for timeline
  const timelineEvents = [
    ...(lead.notes || []).map((n: any) => ({ ...n, type: 'note' })),
    // Basic status change placeholder (since real activity log isn't in DB yet, we just show creation)
    { id: 'created', content: 'Lead created in system', created_by: 'System', created_at: lead.created_at, type: 'system' }
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Layout title={lead.lead_name}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link to="/leads" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} />
          Back to Leads
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDeleteLead}
            className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <Link 
            to={`/leads/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Edit2 size={16} />
            Edit Lead
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
              <div className="flex gap-4">
                <div className="h-14 w-14 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  {lead.lead_name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">{lead.lead_name}</h1>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                    <Building size={14} />
                    {lead.company_name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Status:</span>
                  <select 
                    value={lead.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="bg-gray-50 border-transparent px-3 py-1.5 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Contact Details</h3>
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-gray-900 font-medium hover:text-indigo-600">{lead.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Phone</p>
                    <p className="text-gray-900 font-medium">{lead.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Deal Info</h3>
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <History size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Lead Source</p>
                    <p className="text-gray-900 font-medium">{lead.lead_source || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Assigned To</p>
                    <p className="text-gray-900 font-medium">{lead.assigned_to || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Pipeline Value</p>
                  <p className="text-xs text-gray-500">Estimated deal value</p>
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">${lead.deal_value.toLocaleString()}</p>
            </div>
          </div>

          {/* Activity Logs / Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" />
              Activity & Notes
            </h2>

            {/* Note Form */}
            <form onSubmit={handleAddNote} className="mb-8">
              <div className="relative">
                <textarea 
                  rows={3}
                  value={noteContent}
                   onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm"
                  placeholder="Share an update or note about this lead..."
                />
                <button 
                  type="submit"
                  disabled={!noteContent.trim()}
                  className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>

            {/* Timeline */}
            <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
              {timelineEvents.map((event: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={event.id + i} 
                  className="relative pl-12"
                >
                  <div className={`absolute left-0 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center z-10 ${
                    event.type === 'note' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {event.type === 'note' ? <MessageSquare size={14} /> : <History size={14} />}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {event.created_by} • {format(new Date(event.created_at), 'MMM dd, h:mm a')}
                      </span>
                      {event.type === 'note' && (
                        <button 
                          onClick={() => handleDeleteNote(event.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{event.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info - Quick Actions / Contact Card */}
        <div className="space-y-8">
           <div className="bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 p-8 text-white">
              <h3 className="font-bold mb-4">Quick Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-100">Lead Age</span>
                  <span className="font-bold">{format(new Date(lead.created_at), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-100">Last Active</span>
                  <span className="font-bold">{format(new Date(lead.updated_at), 'dd MMM yyyy')}</span>
                </div>
                <div className="pt-4 border-t border-indigo-500/30">
                  <p className="text-xs text-indigo-200 mb-2 font-medium">Next Recommended Action</p>
                  <div className="bg-white/10 p-3 rounded-lg text-sm italic">
                    Reach out via email about the proposal sent last week.
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
