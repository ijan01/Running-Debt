
import React, { useState, useEffect, useRef } from 'react';
import { GOGGINS_QUOTES } from '../logic';

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
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      } catch (err) {
        dateInputRef.current.focus();
      }
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    // Note: The system is designed for 2026 as per requirements, 
    // but we allow jumping to actual today for simulation flexibility
    onSimDateChange(`${year}-${month}-${day}`);
  };

  const [year, month, day] = simDate.split('-').map(Number);
  const simDateObj = new Date(year, month - 1, day);
  const currentMonthIdx = month - 1;
  const currentYear = year;

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonthIdx = parseInt(e.target.value);
    const now = new Date();
    let targetDayNum = now.getDate();
    const lastDayInTargetMonth = new Date(currentYear, newMonthIdx + 1, 0).getDate();
    const finalDay = Math.min(targetDayNum, lastDayInTargetMonth);
    const newDateStr = `${currentYear}-${String(newMonthIdx + 1).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;
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
          <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Compounding <span className="text-red-600 italic">Running</span> Debt
            </h1>
            <p className="hidden md:block text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
              Mission Control Protocol v2.5
            </p>
          </div>

          <div className="w-full md:max-w-md lg:max-w-2xl">
            <div className="bg-gray-50 p-3 md:p-5 lg:p-6 rounded-2xl border border-gray-100 italic relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 opacity-60"></div>
              <p className="text-[10px] sm:text-xs md:text-base lg:text-2xl font-black text-gray-800 leading-tight pl-3 md:pl-5">
                "{GOGGINS_QUOTES[quoteIdx]}"
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm flex-1 sm:flex-none overflow-hidden">
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={currentMonthIdx}
                onChange={handleMonthChange}
                className="w-full appearance-none bg-gray-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] pl-4 pr-8 py-3 rounded-xl cursor-pointer hover:bg-black transition-all outline-none"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <div 
              onClick={handleTriggerPicker}
              className="flex items-center gap-2 md:gap-3 px-3 py-1.5 cursor-pointer hover:bg-white rounded-xl transition-all group relative border border-transparent hover:border-gray-200"
            >
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Target</span>
                <span className="text-xs font-black text-gray-900 leading-none truncate">{formattedDisplayDate}</span>
              </div>
              <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-red-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                ref={dateInputRef}
                type="date"
                value={simDate}
                onChange={(e) => onSimDateChange(e.target.value)}
                className="absolute opacity-0 inset-0 cursor-pointer"
              />
            </div>
          </div>

          <button 
            onClick={handleGoToToday}
            className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-red-600 hover:border-red-100 hover:shadow-md transition-all active:scale-95"
          >
            Go Today
          </button>
        </div>
      </div>
    </header>
  );
};

export default AggressiveHeader;
