
import React, { useState, useRef } from 'react';

interface AggressiveHeaderProps {
  simDate: string;
  onSimDateChange: (date: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AggressiveHeader: React.FC<AggressiveHeaderProps> = ({ simDate, onSimDateChange }) => {
  const [showRules, setShowRules] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

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
            <p className="hidden md:block text-gray-400 font-bold uppercase tracking-widest text-[10px]">Protocol v3.5</p>
          </div>
          <div className="w-full md:max-w-md lg:max-w-xl">
            <button 
              onClick={() => setShowRules(true)}
              className="w-full bg-gray-900 group hover:bg-black transition-all p-4 rounded-2xl border border-gray-100 relative flex items-center justify-between overflow-hidden h-24 shadow-lg active:scale-[0.98]"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
              <div className="pl-5 text-left">
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-1">Mission Protocol</p>
                <p className="text-xl font-black text-white leading-tight uppercase italic group-hover:text-red-500 transition-colors">Rules you little bitch</p>
              </div>
              <div className="pr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/20 group-hover:text-red-600/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </button>
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

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowRules(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in p-6 md:p-10 border border-gray-100 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">THE 2026 CHALLENGE</h2>
                <p className="text-red-600 font-black uppercase tracking-[0.2em] text-[10px]">Standard Operating Protocol</p>
              </div>
              <button onClick={() => setShowRules(false)} className="bg-gray-50 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              <section className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <h3 className="font-black text-gray-900 uppercase text-xs mb-3 flex items-center gap-2">
                  <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">01</span>
                  Capped Leaderboard
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-semibold">
                  The rankings only show the distance required to be on target. Surplus miles are hidden from the leaderboard to keep everyone hungry. 
                </p>
              </section>

              <section className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <h3 className="font-black text-gray-900 uppercase text-xs mb-3 flex items-center gap-2">
                  <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">02</span>
                  Debt Catch-Up
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-semibold">
                  You CAN run long to wipe out existing debt. Once your lifetime total distance exceeds the cumulative target, your status returns to "ON TARGET".
                </p>
              </section>

              <section className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <h3 className="font-black text-gray-900 uppercase text-xs mb-3 flex items-center gap-2">
                  <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">03</span>
                  No Banking (The "Goggins" Rule)
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-semibold">
                  While surplus is tracked in your personal view, you cannot use it to 'skip' future targets. If the cumulative benchmark overtakes your total, you fall back into debt.
                </p>
              </section>

              <div className="border-t border-gray-100 pt-8 mt-4">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Quick Example:</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-emerald-600 p-3 rounded-2xl text-white">
                    <p className="text-[8px] opacity-60 font-bold uppercase mb-1">ON TARGET</p>
                    <p className="text-xs font-black">Benchmark: 11.6 KM</p>
                  </div>
                  <div className="bg-red-600 p-3 rounded-2xl text-white">
                    <p className="text-[8px] opacity-60 font-bold uppercase mb-1">DEBT: 3.6 KM</p>
                    <p className="text-xs font-black">Actual: 8.0 KM</p>
                  </div>
                </div>
                <p className="mt-8 text-center text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em]">STAY HARD.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowRules(false)}
              className="w-full mt-10 bg-gray-900 text-white font-black py-5 rounded-3xl uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
            >
              Back to the Grind
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AggressiveHeader;
