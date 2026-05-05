import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  Calendar,
  MessageSquare,
  History,
  Send,
  Plus
} from 'lucide-react';
import api from '../api/axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import LeadStatusBadge from '../components/LeadStatusBadge';
import { useAuth } from '../context/AuthContext';

const LeadDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await api.get(`/leads/${id}`);
      setLead(res.data);
    } catch (err) {
      toast.error('Failed to load lead details');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/leads/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchLead();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.post('/notes', {
        lead_id: id,
        content: newNote,
        created_by: user.name
      });
      setNewNote('');
      toast.success('Note added');
      fetchLead();
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this note?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        toast.success('Note deleted');
        fetchLead();
      } catch (err) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleDeleteLead = async () => {
    if (window.confirm('Are you sure you want to delete this lead? This cannot be undone.')) {
      try {
        await api.delete(`/leads/${id}`);
        toast.success('Lead deleted');
        navigate('/leads');
      } catch (err) {
        toast.error('Failed to delete lead');
      }
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-8 w-48 bg-gray-200 rounded"></div>
    <div className="h-64 bg-gray-200 rounded-xl"></div>
  </div>;

  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/leads" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
             <h2 className="text-2xl font-bold text-gray-900">{lead.lead_name}</h2>
             <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 size={14} />
                <span>{lead.company_name}</span>
             </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/leads/${id}/edit`} className="btn-secondary flex items-center gap-2">
            <Pencil size={18} />
            <span>Edit</span>
          </Link>
          <button onClick={handleDeleteLead} className="btn-danger flex items-center gap-2">
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Lead Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contact Information</h3>
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Mail size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Phone size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium">{lead.phone || 'Not provided'}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Sales Context</h3>
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="font-medium">{lead.assigned_to || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Send size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Lead Source</p>
                      <p className="font-medium">{lead.lead_source}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="md:col-span-2 pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Status</p>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deal Value</p>
                    <p className="text-xl font-bold text-gray-900">{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(lead.deal_value)}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 pl-2">Update Status:</span>
                  <select 
                    className="bg-white border border-gray-200 rounded-lg text-sm font-semibold px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={lead.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            {/* Pipeline Stepper */}
            <div className="md:col-span-2 pt-4">
               <div className="relative flex justify-between">
                  {statuses.map((s, idx) => {
                    const isCompleted = statuses.indexOf(lead.status) >= idx;
                    const isCurrent = lead.status === s;
                    return (
                      <div key={s} className="flex flex-col items-center flex-1 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 
                          isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'
                        }`}>
                          {isCompleted && !isCurrent ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] mt-2 font-bold uppercase tracking-tighter text-center ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {s.split(' ')[0]}
                        </span>
                        {idx < statuses.length - 1 && (
                          <div className={`absolute left-1/2 top-4 -z-10 w-full h-0.5 ${
                            statuses.indexOf(lead.status) > idx ? 'bg-green-500' : 'bg-gray-100'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
               </div>
            </div>

          </div>

          {/* Activity Timeline (Notes list is part of this) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
               <History size={20} className="text-indigo-600" />
               <h3 className="text-lg font-bold">Activity Timeline</h3>
            </div>
            
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
               {/* Lead Created Event */}
               <div className="relative pl-12">
                  <div className="absolute left-0 top-0 w-10 h-10 bg-green-50 text-green-600 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                     <Plus size={16} />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                     <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-gray-900 text-sm">Lead Created</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{format(new Date(lead.created_at), 'MMM dd, HH:mm')}</span>
                     </div>
                     <p className="text-sm text-gray-600">The lead was imported/added to the system.</p>
                  </div>
               </div>

               {/* Notes from Lead */}
               {lead.notes.map((note) => (
                  <div key={note.id} className="relative pl-12 group">
                    <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                       <MessageSquare size={16} />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group-hover:border-indigo-200 transition-all">
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <p className="font-bold text-gray-900 text-sm">{note.created_by}</p>
                             <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase tracking-tighter">Note</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{format(new Date(note.created_at), 'MMM dd, HH:mm')}</span>
                            <button onClick={() => handleDeleteNote(note.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 size={14} />
                            </button>
                          </div>
                       </div>
                       <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                    </div>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Right Column: Add Note & Stats */}
        <div className="space-y-6">
           <div className="card space-y-4 sticky top-24">
              <div className="flex items-center gap-2 mb-2">
                 <MessageSquare size={18} className="text-indigo-600" />
                 <h3 className="font-bold">Add Note</h3>
              </div>
              <form onSubmit={handleAddNote} className="space-y-4">
                 <textarea 
                    className="input-field min-h-[120px] resize-none text-sm"
                    placeholder="Write an internal note about this lead..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                 ></textarea>
                 <button 
                    type="submit" 
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                 >
                    {isSubmittingNote ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Plus size={18} /><span>Save Note</span></>}
                 </button>
              </form>
              
              <div className="pt-6 border-t border-gray-100 mt-6">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Insights</h4>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-500">Days in pipeline:</span>
                       <span className="font-bold">{Math.floor((new Date() - new Date(lead.created_at)) / (1000 * 60 * 60 * 24))} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-500">Total Activities:</span>
                       <span className="font-bold">{lead.notes.length + 1}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-500">Last update:</span>
                       <span className="font-bold">{format(new Date(lead.updated_at), 'MMM dd')}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
