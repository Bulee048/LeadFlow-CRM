import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (!loading && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, loading, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-110"
        style={{ 
          backgroundImage: `url('/bg-login.png')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-surface-900/60 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden m-4">
        {/* Left Info Section */}
        <div className="hidden md:flex flex-1 flex-col justify-between p-12 text-white bg-brand-600/20">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Zap size={22} className="text-brand-600 fill-brand-600" />
              </div>
              <div>
                <span className="font-bold text-xl text-white tracking-tight">LeadFlow</span>
                <span className="block text-[10px] text-brand-100 font-bold uppercase tracking-widest opacity-80">Enterprise CRM</span>
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
              Elevate your <br />
              <span className="text-brand-300">sales intelligence.</span>
            </h2>
            <p className="text-brand-50 text-lg leading-relaxed opacity-90 max-w-sm">
              The world's most intuitive platform for high-performance sales teams.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-1 w-12 bg-white rounded-full" />
              <div className="h-1 w-4 bg-white/30 rounded-full" />
              <div className="h-1 w-4 bg-white/30 rounded-full" />
            </div>
            <p className="text-xs text-brand-100/60 font-medium">© 2026 LeadFlow Inc. All rights reserved.</p>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="w-full md:w-[480px] bg-white p-8 lg:p-14">
          <div className="mb-10">
            <div className="md:hidden flex items-center gap-2 mb-8">
               <Zap size={24} className="text-brand-600 fill-brand-600" />
               <span className="font-bold text-xl">LeadFlow</span>
            </div>
            <h1 className="text-2xl font-black text-surface-900 mb-2">Welcome Back</h1>
            <p className="text-sm text-surface-500">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="label">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 group-focus-within:text-brand-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className={`input-field pl-11 bg-surface-50 border-transparent focus:bg-white ${errors.email ? 'border-danger-500 ring-danger-500/10' : ''}`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-danger-600 text-[11px] font-bold mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label">Password</label>
                <button type="button" className="text-[11px] font-bold text-brand-600 hover:text-brand-700">Forgot password?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 group-focus-within:text-brand-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: 'Password is required' })}
                  className={`input-field pl-11 pr-12 bg-surface-50 border-transparent focus:bg-white ${errors.password ? 'border-danger-500 ring-danger-500/10' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-danger-600 text-[11px] font-bold mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 mt-4 text-sm font-bold shadow-xl shadow-brand-600/20 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign in to Platform</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
