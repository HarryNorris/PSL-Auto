import React from 'react';

interface StatusBadgeProps {
  status: 'Completed' | 'Processing' | 'Indexed' | 'Pending';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let styles = '';
  
  switch (status) {
    case 'Completed':
    case 'Indexed':
      styles = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      break;
    case 'Processing':
      styles = 'bg-amber-50 text-amber-700 border border-amber-200';
      break;
    default:
      styles = 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Processing' ? 'animate-pulse bg-amber-500' : (status === 'Completed' || status === 'Indexed') ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
      {status}
    </span>
  );
};