import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtext }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
      </div>
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-brand-900">
        {icon}
      </div>
    </div>
  );
};