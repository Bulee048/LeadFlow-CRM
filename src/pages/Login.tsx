import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-600 rounded-2xl text-white mb-4 shadow-lg shadow-indigo-200">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">LeadFlow CRM</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your pipeline</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Email address</label>
              <input
                type="email"
                defaultValue="admin@example.com"
                {...register('email', { required: 'Email is required' })}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm ${errors.email ? 'border-red-500 bg-red-50/50' : ''}`}
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{String(errors.email.message)}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Password</label>
              <input
                type="password"
                defaultValue="password123"
                {...register('password', { required: 'Password is required' })}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm ${errors.password ? 'border-red-500 bg-red-50/50' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{String(errors.password.message)}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">
              Try with <span className="font-semibold text-indigo-500">admin@example.com</span> / <span className="font-semibold text-indigo-500">password123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
