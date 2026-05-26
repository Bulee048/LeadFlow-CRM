import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Building2, User, Mail, Phone, Globe, DollarSign } from 'lucide-react';
import api from '../api/axios';

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await api.get(`/leads/${id}`);
        reset(res.data);
      } catch (err) {
        toast.error('Failed to load lead');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.put(`/leads/${id}`, data);
      toast.success('Lead updated successfully!');
      navigate(`/leads/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-64 bg-gray-200 rounded-xl"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/leads/${id}`} className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Lead</h2>
          <p className="text-sm text-gray-500">Update details for this opportunity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Core Information</h3>
          </div>
          
          <div>
            <label className="label">Lead Name*</label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="text"
                 {...register('lead_name', { required: 'Lead name is required' })}
                 className={`input-field pl-10 ${errors.lead_name ? 'border-red-500' : ''}`}
               />
            </div>
            {errors.lead_name && <p className="text-red-500 text-xs mt-1">{errors.lead_name.message}</p>}
          </div>

          <div>
            <label className="label">Company Name*</label>
            <div className="relative">
               <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="text"
                 {...register('company_name', { required: 'Company name is required' })}
                 className={`input-field pl-10 ${errors.company_name ? 'border-red-500' : ''}`}
               />
            </div>
            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
          </div>

          <div>
            <label className="label">Email Address*</label>
            <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="email"
                 {...register('email', { required: 'Email is required' })}
                 className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
               />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="text"
                 {...register('phone')}
                 className="input-field pl-10"
               />
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Pipeline Details</h3>
          </div>

          <div>
            <label className="label">Lead Source</label>
            <select {...register('lead_source')} className="input-field">
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Cold Email">Cold Email</option>
              <option value="Event">Event</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Assigned To</label>
            <input
              type="text"
              {...register('assigned_to')}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input-field">
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="label">Deal Value (LKR)</label>
            <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="number"
                 step="0.01"
                 {...register('deal_value', { valueAsNumber: true })}
                 onFocus={(e) => e.target.select()}
                 className="input-field pl-10 font-mono"
               />
            </div>
          </div>

          <div className="md:col-span-2 pt-6 flex justify-end gap-3">
             <Link to={`/leads/${id}`} className="btn-secondary px-8">Cancel</Link>
             <button
               type="submit"
               disabled={isSubmitting}
               className="btn-primary px-12 flex items-center gap-2 shadow-lg shadow-indigo-200"
             >
               {isSubmitting ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <>
                   <Save size={18} />
                   <span>Save Changes</span>
                 </>
               )}
             </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditLead;
