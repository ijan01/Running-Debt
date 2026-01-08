
import React from 'react';
import { LogEntry } from '../types';

interface ExecutionHistoryProps {
  logs: LogEntry[];
  userName: string;
  onEdit: (log: LogEntry) => void;
  onDelete: (logId: string) => void;
}

const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({ logs, userName, onEdit, onDelete }) => {
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">
          Recent Missions: {userName}
        </h3>
        <span className="inline-block text-[9px] md:text-[10px] bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider w-fit">{logs.length} Logged</span>
      </div>

      {logs.length === 0 ? (
        <div className="py-10 md:py-12 text-center text-gray-300 font-bold uppercase text-[10px] md:text-xs italic bg-white/50 border border-dashed border-gray-100 rounded-2xl">
          Zero logs found. Start the work.
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[400px]">
            <thead className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest bg-gray-50/50">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Date</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-gray-50 transition-all rounded-xl">
                  <td className="py-4 px-4 text-xs md:text-sm text-gray-600 font-semibold">{log.date}</td>
                  <td className="py-4 px-4 text-gray-900 text-base md:text-lg font-extrabold">{log.distance.toFixed(1)} <span className="text-[9px] md:text-[10px] text-gray-300">KM</span></td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 md:gap-4">
                      <button 
                        onClick={() => onEdit(log)}
                        className="text-gray-900 hover:text-red-600 transition-colors font-bold text-[10px] md:text-xs underline underline-offset-4 decoration-gray-200 hover:decoration-red-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(log.id)}
                        className="text-gray-300 hover:text-red-600 transition-colors font-bold text-[10px] md:text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExecutionHistory;
