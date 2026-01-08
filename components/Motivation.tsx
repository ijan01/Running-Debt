
import React, { useState, useEffect } from 'react';
import { GOGGINS_QUOTES } from '../logic.ts';

interface SufferMeterProps {
  highestDebtor?: { name: string; currentDebt: number };
  totalDebt: number;
}

const Motivation: React.FC<SufferMeterProps> = ({ highestDebtor, totalDebt }) => {
  const [quote, setQuote] = useState(GOGGINS_QUOTES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const baseQuote = GOGGINS_QUOTES[Math.floor(Math.random() * GOGGINS_QUOTES.length)];
      if (highestDebtor && highestDebtor.currentDebt > 0.5) {
        setQuote(`${highestDebtor.name}, ${baseQuote}`);
      } else {
        setQuote(baseQuote);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [highestDebtor]);

  const intensity = Math.min(100, (totalDebt / 50) * 100);

  return (
    <div className={`p-6 md:p-8 rounded-3xl soft-elevation relative overflow-hidden h-56 md:h-64 flex flex-col justify-between transition-all duration-500 ${totalDebt > 0 ? 'bg-red-600' : 'bg-emerald-600'}`}>
      <div>
        <h3 className="text-white/60 font-bold uppercase text-[10px] tracking-widest border-b border-white/20 pb-2 mb-4">Suffer-Meter</h3>
        <p className="text-lg md:text-2xl font-extrabold italic text-white leading-tight relative z-10 line-clamp-3">"{quote}"</p>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-white font-black uppercase tracking-widest">Team Intensity</span>
          <span className="text-[10px] text-white/70 font-bold">{totalDebt.toFixed(1)} KM Debt</span>
        </div>
        <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${intensity}%` }} />
        </div>
      </div>
    </div>
  );
};

export default Motivation;
