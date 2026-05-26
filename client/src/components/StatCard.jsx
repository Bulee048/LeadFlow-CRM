import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, isCurrency }) => {
  const colorStyles = {
    '#2563eb': { icon: 'bg-brand-50 text-brand-600', border: '#2563eb' },
    '#4f46e5': { icon: 'bg-indigo-50 text-indigo-600', border: '#4f46e5' },
    '#3b82f6': { icon: 'bg-blue-50 text-blue-600', border: '#3b82f6' },
    '#a855f7': { icon: 'bg-purple-50 text-purple-600', border: '#a855f7' },
    '#22c55e': { icon: 'bg-success-50 text-success-600', border: '#22c55e' },
    '#ef4444': { icon: 'bg-danger-50 text-danger-600', border: '#ef4444' },
    '#eab308': { icon: 'bg-warning-50 text-warning-600', border: '#eab308' },
    '#f97316': { icon: 'bg-orange-50 text-orange-600', border: '#f97316' },
    '#6366f1': { icon: 'bg-indigo-50 text-indigo-600', border: '#6366f1' },
  };

  const style = colorStyles[color] || { icon: 'bg-surface-100 text-surface-500', border: '#94a3b8' };

  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(value)
    : value;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
    >
      <div className="h-1 w-full" style={{ backgroundColor: style.border }} />
      <div className="p-6 flex items-center gap-5">
        <div className={`p-3.5 rounded-xl shadow-sm flex-shrink-0 ${style.icon}`}>
          {Icon && <Icon size={24} strokeWidth={2.5} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">{title}</p>
          <motion.p 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-3xl font-black text-surface-900 leading-tight truncate"
          >
            {formattedValue}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
