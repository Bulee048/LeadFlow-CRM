import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Save, 
  X, 
  Info,
  AlertCircle
} from 'lucide-react';

export default function CreateLead() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const watchEmail = watch('email');

  const checkDuplicateEmail = async () => {
    if (!watchEmail || !watchEmail.includes('@')) return;
    try {
      const response = await api.get(`/leads?search=${watchEmail}`);
      const matches = response.data.filter((l: any) => l.email.toLowerCase() === watchEmail.toLowerCase());
      if (matches.length > 0) {
        setDuplicateWarning(`Warning: A lead with this email (${matches[0].lead_name} from ${matches[0].company_name}) already exists.`);
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.error('Error checking duplicate', err);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post('/leads', data);
      toast.success('Lead created successfully!');
      navigate('/leads');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    }
  };

  return (
    <Layout title="Create New Lead">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Info size={18} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900 tracking-tight text-sm uppercase">Basic Information</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Lead Name *</label>
              <input 
                {...register('lead_name', { required: 'Lead name is required' })}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                placeholder="John Doe"
              />
              {errors.lead_name && <p className="text-red-500 text-xs font-medium">{String(errors.lead_name.message)}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Company Name *</label>
              <input 
                {...register('company_name', { required: 'Company is required' })}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                placeholder="Acme Corp"
              />
              {errors.company_name && <p className="text-red-500 text-xs font-medium">{String(errors.company_name.message)}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Email Address *</label>
              <input 
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  onBlur: checkDuplicateEmail
                })}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs font-medium">{String(errors.email.message)}</p>}
              {duplicateWarning && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2 text-amber-800 text-[10px] font-bold uppercase tracking-tight">
                  <AlertCircle size={14} className="shrink-0" />
                  {duplicateWarning}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Phone Number</label>
              <input 
                {...register('phone')}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Save size={18} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900 tracking-tight text-sm uppercase">Deal Details</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Lead Source</label>
              <select 
                {...register('lead_source')}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm appearance-none"
              >
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Cold Email">Cold Email</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Assigned To</label>
              <input 
                {...register('assigned_to')}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                placeholder="Salesperson name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Initial Status</label>
              <select 
                {...register('status')}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm appearance-none"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Deal Value (USD)</label>
              <input 
                type="number"
                step="0.01"
                {...register('deal_value')}
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-bold"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate('/leads')}
            className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            {isSubmitting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
            Create Lead
          </button>
        </div>
      </form>
    </Layout>
  );
}
