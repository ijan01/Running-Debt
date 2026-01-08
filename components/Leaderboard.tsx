
import React from 'react';
import { UserStatsSummary } from '../types.ts';
import { calculateDailyTarget } from '../logic.ts';

interface LeaderboardProps {
  users: UserStatsSummary[];
  simDate: string;
  onAddUserClick: () => void;
  handleDelete: (userId: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, simDate, onAddUserClick, handleDelete }) => {
  const sorted = [...users].sort((a, b) => b.totalRun - a.totalRun);

  // Helper to get tomorrow's target
  const getTomorrowTarget = (currentDateStr: string) => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    return calculateDailyTarget(date.getMonth() + 1, date.getDate());
  };

  const tomorrowDist = getTomorrowTarget(simDate);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-gray-900 leading-none mb-1 text-center sm:text-left">Chain of Command</h2>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            {new Date(simDate).toLocaleString('default', { month: 'long' })} Protocol
          </span>
        </div>
        
        <button 
          type="button"
          onClick={onAddUserClick}
          className="group flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Recruit Agent</span>
        </button>
      </div>
      
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">
            <tr>
              <th className="p-6 w-12 md:w-16 text-center">Pos</th>
              <th className="p-6">Operative</th>
              <th className="p-6 text-center">Mission Status</th>
              <th className="p-6 text-center">Distance</th>
              <th className="p-6 text-center">Consistency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <p className="text-gray-300 font-black uppercase text-xs tracking-[0.2em] italic">Zero Active Deployments</p>
                </td>
              </tr>
            ) : (
              sorted.map((u, i) => {
                const inDebt = u.currentDebt > 0.05;
                const [activeDays, totalDays] = u.consistency.split('/');
                
                // Get cumulative target for this user up to today
                const reportToday = u.reports.find(r => r.date === simDate);
                const targetBenchmark = reportToday ? reportToday.cumulativeTarget : 0;

                return (
                  <tr key={u.id} className={`transition-all duration-300 ${inDebt ? 'bg-red-50/10' : 'bg-white hover:bg-gray-50/30'}`}>
                    <td className="p-6 text-center text-base md:text-xl font-black italic text-gray-300">#{i + 1}</td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm md:text-lg font-black text-gray-900 leading-none">{u.name}</span>
                        <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                          Tomorrow: <span className="text-gray-900">{tomorrowDist.toFixed(1)} KM</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center">
                        {inDebt ? (
                          <>
                            <span className="text-sm md:text-lg font-black text-red-600 uppercase italic">Debt: {u.currentDebt.toFixed(1)} KM</span>
                            <span className="text-[8px] text-red-400 font-bold uppercase">Behind Target</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm md:text-lg font-black text-emerald-500 uppercase italic">On Target</span>
                            <span className="text-[8px] text-emerald-400 font-bold uppercase">Protocol Cleared</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-base md:text-xl font-black text-gray-900">
                          {inDebt ? u.totalRun.toFixed(1) : targetBenchmark.toFixed(1)} KM
                        </span>
                        <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-tighter">
                          {inDebt ? 'Done' : 'Required'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-base md:text-xl font-black text-gray-900">{activeDays}</span>
                          <span className="text-[10px] font-bold text-gray-300">/</span>
                          <span className="text-xs md:text-sm font-bold text-gray-400">{totalDays}</span>
                        </div>
                        <span className="text-[7px] text-gray-300 font-black uppercase tracking-widest">Logs</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
