import React from 'react';

const statusConfig = {
  'New':           { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500',   ring: 'ring-blue-200' },
  'Contacted':     { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500',  ring: 'ring-amber-200' },
  'Qualified':     { bg: 'bg-violet-50',  text: 'text-violet-700', dot: 'bg-violet-500', ring: 'ring-violet-200' },
  'Proposal Sent': { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-500', ring: 'ring-orange-200' },
  'Won':           { bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-500',ring: 'ring-emerald-200' },
  'Lost':          { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500',    ring: 'ring-red-200' },
};

const LeadStatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { bg: 'bg-surface-100', text: 'text-surface-600', dot: 'bg-surface-400', ring: 'ring-surface-200' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
};

export default LeadStatusBadge;
