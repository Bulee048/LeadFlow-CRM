import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, isCurrency }) => {
  // Map hex colors to Tailwind icon bg/text combos
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

  return (
    <div 
      className="group bg-white rounded-xl border border-surface-200 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ backgroundColor: style.border }} />
      
      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${style.icon}`}>
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-surface-900 leading-tight truncate">{formattedValue}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
