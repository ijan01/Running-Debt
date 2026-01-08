
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  isAlert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subLabel, isAlert }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 md:p-6 border border-gray-100 transition-all hover:bg-white hover:shadow-lg flex flex-col justify-center">
      <h3 className="text-gray-400 uppercase font-bold text-[9px] md:text-[10px] tracking-widest mb-1 md:mb-2">{label}</h3>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl md:text-4xl font-extrabold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
        {subLabel && <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">{subLabel}</span>}
      </div>
    </div>
  );
};

export default StatCard;
