
import React, { useState, useEffect } from 'react';
import { GOGGINS_QUOTES } from '../logic';

interface SufferMeterProps {
  // Fix: renamed 'debt' to 'currentDebt' to correctly match the property name in UserStatsSummary
  highestDebtor?: { name: string; currentDebt: number };
  totalDebt: number;
}

const Motivation: React.FC<SufferMeterProps> = ({ highestDebtor, totalDebt }) => {
  const [quote, setQuote] = useState(GOGGINS_QUOTES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const baseQuote = GOGGINS_QUOTES[Math.floor(Math.random() * GOGGINS_QUOTES.length)];
      // Fix: accessed 'currentDebt' instead of 'debt'
      if (highestDebtor && highestDebtor.currentDebt > 0.5) {
        setQuote(`${highestDebtor.name}, ${baseQuote}`);
      } else {
        setQuote(baseQuote);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [highestDebtor]);

  // Suffer intensity calculation (cap at 50km team debt for full bar)
  const intensity = Math.min(100, (totalDebt / 50) * 100);

  return (
    <div className={`p-6 md:p-8 rounded-3xl soft-elevation relative overflow-hidden h-56 md:h-64 flex flex-col justify-between transition-all duration-500 ${totalDebt > 0 ? 'bg-red-600' : 'bg-emerald-600'}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-white/60 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] border-b border-white/20 pb-2 flex-1">
            Suffer-Meter
          </h3>
        </div>
        <p className="text-lg md:text-2xl font-extrabold italic text-white leading-tight relative z-10 drop-shadow-sm line-clamp-3">
          "{quote}"
        </p>
      </div>

      <div className="space-y-2 md:space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-[9px] md:text-[10px] text-white font-black uppercase tracking-widest">Team Intensity</span>
          <span className="text-[9px] md:text-[10px] text-white/70 font-bold">{totalDebt.toFixed(1)} KM Debt</span>
        </div>
        <div className="w-full h-2 md:h-3 bg-black/20 rounded-full overflow-hidden border border-white/10">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
            style={{ width: `${intensity}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] md:text-[9px] text-white/50 font-bold uppercase tracking-widest">Goggins Protocol</span>
          <div className="px-2 md:px-3 py-1 bg-white/10 rounded-full backdrop-blur-md">
            <span className="text-[8px] md:text-[9px] text-white font-black uppercase tracking-widest">
              {totalDebt > 0 ? 'UNDER PRESSURE' : 'STAY HARD'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Motivation;
