
import React from 'react';
import { UserStatsSummary } from '../types';

interface LeaderboardProps {
  users: UserStatsSummary[];
  simDate: string;
  onAddUserClick: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, simDate, onAddUserClick }) => {
  const sorted = [...users].sort((a, b) => b.totalRun - a.totalRun);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-gray-900 leading-none mb-1">Chain of Command</h2>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            {new Date(simDate).toLocaleString('default', { month: 'long' })} Protocol
          </span>
        </div>
        
        <button 
          onClick={onAddUserClick}
          className="group flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">New Operative</span>
        </button>
      </div>
      
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">
            <tr>
              <th className="p-4 w-12 md:w-16 text-center">Pos</th>
              <th className="p-4">Operative</th>
              <th className="p-4 text-center">Volume</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((u, i) => {
              const inDebt = u.currentDebt > 0.05;
              
              return (
                <tr 
                  key={u.id} 
                  className={`transition-all duration-300 ${inDebt ? 'bg-red-50/30' : 'bg-white hover:bg-gray-50/50'}`}
                >
                  <td className="p-4 text-center text-base md:text-lg font-black italic text-gray-300">#{i + 1}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm md:text-base font-extrabold text-gray-900 leading-none">{u.name}</span>
                      <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Active Duty</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xl md:text-2xl font-black text-gray-900">{u.totalRun.toFixed(1)}</span>
                    <span className="text-[9px] md:text-[10px] text-gray-300 ml-1 font-black">KM</span>
                  </td>
                  <td className="p-4 text-right">
                    {inDebt ? (
                      <div className="flex flex-col items-end animate-pulse">
                        <span className="bg-red-600 text-white px-2 md:px-3 py-1 text-[8px] md:text-[9px] font-black rounded-full shadow-lg mb-1 tracking-widest uppercase">Debt Found</span>
                        <span className="text-[10px] md:text-xs text-red-600 font-black tracking-tighter">-{u.currentDebt.toFixed(1)} KM</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="bg-emerald-600 text-white px-2 md:px-3 py-1 text-[8px] md:text-[9px] font-black rounded-full shadow-lg mb-1 tracking-widest uppercase">STAY HARD</span>
                        <span className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase tracking-widest">Clear</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
