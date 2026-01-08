
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserStatsSummary } from './types.ts';
import { generateUserReports, calculateDailyTarget } from './logic.ts';
import AggressiveHeader from './components/AggressiveHeader.tsx';
import Motivation from './components/Motivation.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import ComparisonChart from './components/ComparisonChart.tsx';
import StatCard from './components/StatCard.tsx';
import ExecutionHistory from './components/ExecutionHistory.tsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INITIAL_DATE = '2026-01-08';
const INITIAL_USERS: User[] = [];
const MONTHLY_TARGETS = [
  { name: 'Jan', value: 80.6 }, { name: 'Feb', value: 96.6 }, { name: 'Mar', value: 142.6 },
  { name: 'Apr', value: 166.5 }, { name: 'May', value: 204.6 }, { name: 'Jun', value: 226.5 },
  { name: 'Jul', value: 266.6 }, { name: 'Aug', value: 297.6 }, { name: 'Sep', value: 316.5 },
  { name: 'Oct', value: 359.6 }, { name: 'Nov', value: 376.5 }, { name: 'Dec', value: 421.6 }
];

const STORAGE_KEY = 'STAY_HARD_V35_PROTOCOL';
const DATE_KEY = 'STAY_HARD_V35_DATE';

const parseLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

const App: React.FC = () => {
  const [simDate, setSimDate] = useState(() => localStorage.getItem(DATE_KEY) || INITIAL_DATE);
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_USERS;
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [addRunUser, setAddRunUser] = useState<string>('');
  const [addRunDist, setAddRunDist] = useState<string>('');
  const [addRunDate, setAddRunDate] = useState<string>(simDate);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserJoinDate, setNewUserJoinDate] = useState(simDate);

  const logDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); 
  }, [users]);

  useEffect(() => { 
    localStorage.setItem(DATE_KEY, simDate); 
  }, [simDate]);

  const allSummaries = useMemo<UserStatsSummary[]>(() => {
    return users.map(u => {
      const reports = generateUserReports(u, simDate);
      const reportToday = reports.find(r => r.date === simDate);
      
      const totalRun = reportToday ? reportToday.cumulativeRun : 0;
      const currentDebt = reportToday ? reportToday.cumulativeDebt : 0;
      
      const joinDateObj = parseLocalDate(u.joinDate || "2026-01-01");
      const simDateObj = parseLocalDate(simDate);
      const totalDaysElapsed = Math.max(1, Math.floor((simDateObj.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      const distinctRunDays = new Set(
        u.logs.filter(log => {
          const d = parseLocalDate(log.date);
          return d <= simDateObj && log.distance > 0;
        }).map(log => log.date)
      ).size;

      return {
        id: u.id,
        name: u.name,
        totalRun: totalRun,
        currentDebt: currentDebt,
        consistency: `${distinctRunDays}/${totalDaysElapsed}`,
        status: currentDebt > 0.05 ? 'DEBT' : 'CLEAR',
        reports
      };
    });
  }, [users, simDate]);

  const tomorrowTarget = useMemo(() => {
    const d = parseLocalDate(simDate);
    d.setDate(d.getDate() + 1);
    return calculateDailyTarget(d.getMonth() + 1, d.getDate());
  }, [simDate]);

  useEffect(() => {
    if (users.length > 0) {
      const userExists = users.find(u => u.id === addRunUser);
      if (!addRunUser || !userExists) {
        setAddRunUser(users[0].id);
      }
    } else {
      setAddRunUser('');
    }
    if (selectedUserId !== 'all' && !users.find(u => u.id === selectedUserId)) {
      setSelectedUserId('all');
    }
  }, [users, addRunUser, selectedUserId]);

  const teamTotalDebt = allSummaries.reduce((acc, u) => acc + u.currentDebt, 0);
  const highestDebtor = useMemo(() => allSummaries.length > 0 ? [...allSummaries].sort((a, b) => b.currentDebt - a.currentDebt)[0] : undefined, [allSummaries]);

  const handleAddOrUpdateRun = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(addRunDist.replace(',', '.'));
    if (isNaN(d) || d < 0 || !addRunUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === addRunUser) {
        if (editingLogId) {
          return { ...u, logs: u.logs.map(log => log.id === editingLogId ? { ...log, distance: d, date: addRunDate } : log) };
        } else {
          return { ...u, logs: [...u.logs, { id: `log-${Date.now()}-${Math.random()}`, date: addRunDate, distance: d }] };
        }
      }
      return u;
    }));
    setAddRunDist('');
    setEditingLogId(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const newUser: User = { id: `user-${Date.now()}`, name: newUserName.trim(), joinDate: newUserJoinDate, logs: [] };
    setUsers(prev => [...prev, newUser]);
    setNewUserName('');
    setShowAddUserModal(false);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("ARE YOU SURE YOU WANT TO REMOVE THIS OPERATIVE? NO ROOM FOR WEAKNESS, BUT THIS ACTION IS PERMANENT.")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const selectedSummary = useMemo(() => allSummaries.find(u => u.id === selectedUserId), [allSummaries, selectedUserId]);
  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
  
  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <AggressiveHeader simDate={simDate} onSimDateChange={setSimDate} />
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 pb-32">
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <Motivation highestDebtor={highestDebtor} totalDebt={teamTotalDebt} />
          
          <div className={`p-6 md:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all ${editingLogId ? 'ring-2 ring-red-500 shadow-xl' : ''}`}>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              {editingLogId ? 'Update Mission' : 'Log Daily Miles'}
              <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase ${editingLogId ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                {editingLogId ? 'Protocol Edit' : 'New Deployment'}
              </span>
            </h2>
            <form onSubmit={handleAddOrUpdateRun} className="space-y-4 md:space-y-5">
              {users.length > 0 ? (
                <>
                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[9px] tracking-widest mb-2">Operative</label>
                    <select value={addRunUser} onChange={e => setAddRunUser(e.target.value)} disabled={!!editingLogId} className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold text-gray-900 rounded-2xl appearance-none focus:bg-white focus:border-red-500 transition-all outline-none">
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div onClick={() => logDateInputRef.current?.showPicker()} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl cursor-pointer hover:bg-white transition-all group">
                      <label className="block text-gray-400 font-bold uppercase text-[9px] mb-1 group-hover:text-red-500 transition-colors">Mission Date</label>
                      <input ref={logDateInputRef} type="date" value={addRunDate} onChange={e => setAddRunDate(e.target.value)} className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none" required />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl focus-within:bg-white transition-all">
                      <label className="block text-gray-400 font-bold uppercase text-[9px] mb-1">Distance (KM)</label>
                      <input type="number" step="0.01" value={addRunDist} onChange={e => setAddRunDist(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none" required />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-sm hover:bg-black shadow-lg active:scale-[0.98] transition-all">
                    {editingLogId ? 'Re-confirm Stats' : 'Confirm Mission'}
                  </button>
                </>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-4 tracking-widest">No operatives recruited.</p>
                  <button type="button" onClick={() => setShowAddUserModal(true)} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Recruit New Agent</button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Protocol Progression</h3>
            <div className="h-40 md:h-48 min-h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_TARGETS}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} fontWeight={800} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {MONTHLY_TARGETS.map((entry, index) => <Cell key={index} fill={entry.name === new Date(simDate).toLocaleString('default', { month: 'short' }) ? '#dc2626' : '#e5e7eb'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <Leaderboard 
            users={allSummaries} 
            simDate={simDate} 
            onAddUserClick={() => { setNewUserJoinDate(simDate); setShowAddUserModal(true); }}
            handleDelete={handleDelete} 
          />
          
          {users.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in">
              <div className="p-1.5 bg-gray-50/50 flex gap-1 overflow-x-auto no-scrollbar border-b border-gray-100">
                <button onClick={() => setSelectedUserId('all')} className={`flex-none px-5 py-3 text-[10px] md:text-[11px] font-bold uppercase rounded-xl transition-all whitespace-nowrap ${selectedUserId === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Squad Overview</button>
                {users.map(u => <button key={u.id} onClick={() => setSelectedUserId(u.id)} className={`flex-none px-5 py-3 text-[10px] md:text-[11px] font-bold uppercase rounded-xl transition-all whitespace-nowrap ${selectedUserId === u.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{u.name}</button>)}
              </div>
              
              <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                 <StatCard label="LIFETIME STATS" value={(selectedSummary ? selectedSummary.totalRun : allSummaries.reduce((acc,s)=>acc+s.totalRun,0)).toFixed(1)} subLabel="KM" />
                 <StatCard label="MISSION DEBT" value={(selectedSummary ? selectedSummary.currentDebt : teamTotalDebt).toFixed(1)} subLabel="KM" isAlert={(selectedSummary ? selectedSummary.currentDebt : teamTotalDebt) > 0.05} />
                 <StatCard label="NEXT MISSION" value={tomorrowTarget.toFixed(1)} subLabel="KM TARGET" />
              </div>

              <div className="p-1 md:p-2 border-t border-gray-50">
                <ComparisonChart summaries={selectedUserId === 'all' ? allSummaries : (selectedSummary ? [selectedSummary] : [])} isTeamView={selectedUserId === 'all'} simDate={simDate} />
              </div>

              {selectedUser && (
                <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-100">
                  <ExecutionHistory logs={selectedUser.logs} userName={selectedUser.name} onEdit={(log) => { setAddRunUser(selectedUser.id); setAddRunDist(log.distance.toString()); setAddRunDate(log.date); setEditingLogId(log.id); window.scrollTo({top:0, behavior:'smooth'}); }} onDelete={(id) => setUsers(prev => prev.map(u => u.id === selectedUser.id ? {...u, logs: u.logs.filter(l=>l.id!==id)} : u))} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center text-center shadow-sm animate-in">
              <h2 className="text-3xl font-black text-gray-900 uppercase mb-4 tracking-tight">Zero Squad Readiness</h2>
              <button onClick={() => setShowAddUserModal(true)} className="px-12 py-5 bg-red-600 text-white font-black rounded-3xl uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Start Deployment</button>
            </div>
          )}
        </div>
      </main>

      {showAddUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowAddUserModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in p-8 md:p-10 border border-gray-100">
            <h2 className="text-3xl font-black uppercase mb-8 tracking-tight text-gray-900 text-center">Recruit Operative</h2>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] mb-3 tracking-widest">Operative Name</label>
                <input autoFocus type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="AGENT NAME" className="w-full bg-gray-50 border border-gray-100 p-5 text-lg font-black text-gray-900 rounded-3xl outline-none focus:bg-white focus:border-red-600 transition-all uppercase placeholder:text-gray-200" required />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] mb-3 tracking-widest">Deployment Start</label>
                <input type="date" value={newUserJoinDate} onChange={e => setNewUserJoinDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-5 text-sm font-bold text-gray-900 rounded-3xl outline-none focus:bg-white focus:border-red-600 transition-all" required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 bg-gray-100 text-gray-400 font-bold py-5 rounded-3xl uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors">Abort</button>
                <button type="submit" className="flex-[2] bg-red-600 text-white font-black py-5 rounded-3xl uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all">Activate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
