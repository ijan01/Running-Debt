
import React, { useState, useEffect, useRef } from 'react';
import { GOGGINS_QUOTES } from '../logic.ts';

interface AggressiveHeaderProps {
  simDate: string;
  onSimDateChange: (date: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AggressiveHeader: React.FC<AggressiveHeaderProps> = ({ simDate, onSimDateChange }) => {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % GOGGINS_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerPicker = () => {
    if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
      dateInputRef.current.showPicker();
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    onSimDateChange(`${year}-${month}-${day}`);
  };

  const [year, month, day] = simDate.split('-').map(Number);
  const simDateObj = new Date(year, month - 1, day);
  const currentMonthIdx = month - 1;

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonthIdx = parseInt(e.target.value);
    const lastDayInTargetMonth = new Date(year, newMonthIdx + 1, 0).getDate();
    const finalDay = Math.min(day, lastDayInTargetMonth);
    const newDateStr = `${year}-${String(newMonthIdx + 1).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;
    onSimDateChange(newDateStr);
  };

  const formattedDisplayDate = simDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start shrink-0">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900">
              Compounding <span className="text-red-600 italic">Running</span> Debt
            </h1>
            <p className="hidden md:block text-gray-400 font-bold uppercase tracking-widest text-[10px]">Protocol v2.5</p>
          </div>
          <div className="w-full md:max-w-md lg:max-w-xl">
            <div className="bg-gray-50 h-24 p-4 rounded-2xl border border-gray-100 italic relative flex items-center">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 opacity-60"></div>
              <p className="text-lg font-black text-gray-800 leading-tight pl-5 line-clamp-3">"{GOGGINS_QUOTES[quoteIdx]}"</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1 border border-gray-100">
            <select value={currentMonthIdx} onChange={handleMonthChange} className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest pl-4 pr-8 py-3 rounded-xl cursor-pointer">
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <div onClick={handleTriggerPicker} className="px-3 py-1.5 cursor-pointer relative group">
              <span className="text-xs font-black text-gray-900">{formattedDisplayDate}</span>
              <input ref={dateInputRef} type="date" value={simDate} onChange={e => onSimDateChange(e.target.value)} className="absolute opacity-0 inset-0 cursor-pointer" />
            </div>
          </div>
          <button onClick={handleGoToToday} className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-600">Go Today</button>
        </div>
      </div>
    </header>
  );
};

export default AggressiveHeader;
