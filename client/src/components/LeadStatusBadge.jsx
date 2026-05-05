import React from 'react';

const LeadStatusBadge = ({ status }) => {
  const styles = {
    'New': 'bg-blue-100 text-blue-700 border-blue-200',
    'Contacted': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Qualified': 'bg-purple-100 text-purple-700 border-purple-200',
    'Proposal Sent': 'bg-orange-100 text-orange-700 border-orange-200',
    'Won': 'bg-green-100 text-green-700 border-green-200',
    'Lost': 'bg-red-100 text-red-700 border-red-200',
  };

  const currentStyle = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status}
    </span>
  );
};

export default LeadStatusBadge;
