import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, isCurrency }) => {
  const colorMap = {
    blue: 'border-blue-500 text-blue-600 bg-blue-50',
    green: 'border-green-500 text-green-600 bg-green-50',
    red: 'border-red-500 text-red-600 bg-red-50',
    yellow: 'border-yellow-500 text-yellow-600 bg-yellow-50',
    purple: 'border-purple-500 text-purple-600 bg-purple-50',
    orange: 'border-orange-500 text-orange-600 bg-orange-50',
    indigo: 'border-indigo-500 text-indigo-600 bg-indigo-50',
  };

  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(value)
    : value;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-100 flex items-center gap-4 transition-all hover:shadow-md" style={{ borderLeftColor: color }}>
      <div className={`p-3 rounded-lg ${colorMap[color] || 'bg-gray-50'}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
      </div>
    </div>
  );
};

export default StatCard;
