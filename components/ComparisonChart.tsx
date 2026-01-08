
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { UserStatsSummary } from '../types.ts';

interface ComparisonChartProps {
  summaries: UserStatsSummary[];
  isTeamView?: boolean;
  simDate?: string;
}

const COLORS = {
  'user-ijan': '#dc2626',
  'user-will': '#1d4ed8',
  'user-duchess': '#10b981',
};

const ComparisonChart: React.FC<ComparisonChartProps> = ({ summaries, isTeamView, simDate }) => {
  if (!summaries || summaries.length === 0 || !summaries[0].reports) return null;

  const dates = summaries[0].reports.map(r => r.date);
  const chartData = dates.map((date, idx) => {
    const dataPoint: any = {
      date: date.split('-').slice(2).join('/'),
      math: summaries[0].reports[idx].cumulativeTarget,
      isFuture: simDate ? date > simDate : false,
    };
    summaries.forEach(summary => {
      if (!dataPoint.isFuture && summary.reports[idx]) {
        dataPoint[summary.name] = summary.reports[idx].cumulativeRun;
      }
    });
    return dataPoint;
  });

  const simDayFormatted = simDate ? simDate.split('-').slice(2).join('/') : null;

  return (
    <div className="bg-white p-4 md:p-8">
      <h2 className="text-xs md:text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className={`w-1.5 h-6 rounded-full ${isTeamView ? 'bg-black' : 'bg-red-600'}`}></span>
        {isTeamView ? 'Debt Matrix' : 'Trajectory'}
      </h2>
      <div className="h-64 md:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" stroke="#d1d5db" fontSize={9} fontWeight={800} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#d1d5db" fontSize={9} fontWeight={800} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', fontSize: '10px' }} />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 800, paddingTop: '20px' }} />
            {simDayFormatted && <ReferenceLine x={simDayFormatted} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" />}
            <Line type="stepAfter" dataKey="math" stroke="#e5e7eb" strokeWidth={2} dot={false} name="Target" strokeDasharray="4 4" />
            {summaries.map(summary => (
              <Line key={summary.id} type="monotone" dataKey={summary.name} stroke={(COLORS as any)[summary.id] || '#111'} strokeWidth={3} dot={false} name={summary.name} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;
