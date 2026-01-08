import React from 'react';
import { LogEntry } from '../types.ts';

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
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-base font-bold text-gray-900">Mission History: {userName}</h3>
        <span className="text-[10px] bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-bold uppercase">{logs.length} Missions</span>
      </div>
      {logs.length === 0 ? (
        <div className="py-10 text-center text-gray-300 font-bold uppercase text-[10px] italic">Zero missions deployed.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[400px]">
            <thead className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">
              <tr><th className="py-3 px-4">Date</th><th className="py-3 px-4">Distance</th><th className="py-3 px-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/50 transition-colors">
                  <td className="py-4 px-4 text-xs font-semibold">{log.date}</td>
                  <td className="py-4 px-4 text-gray-900 font-extrabold">{log.distance.toFixed(1)} KM</td>
                  <td className="py-4 px-4 text-right flex justify-end gap-3">
                    <button type="button" onClick={() => onEdit(log)} className="text-[10px] font-bold underline hover:text-gray-600 transition-colors">Edit</button>
                    <button type="button" onClick={() => onDelete(log.id)} className="text-[10px] font-bold text-gray-300 hover:text-red-600 transition-colors">Delete</button>
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